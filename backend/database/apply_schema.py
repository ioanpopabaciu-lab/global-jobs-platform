#!/usr/bin/env python3
"""
apply_schema.py — GJC PostgreSQL Schema v3.0 Safe Apply
Runs each statement individually, skipping errors on existing objects.
"""

import asyncio
import asyncpg
import os
import re
import sys
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL", None)
SCHEMA_FILE  = Path(__file__).parent / "apply_schema_safe.sql"


def split_statements(sql: str):
    """Split SQL into individual statements, handling $$ blocks."""
    statements = []
    current = []
    in_dollar_quote = False

    for line in sql.splitlines():
        stripped = line.strip()
        # Toggle dollar-quote state
        if "$$" in stripped:
            count = stripped.count("$$")
            if count % 2 != 0:
                in_dollar_quote = not in_dollar_quote
        current.append(line)
        # Statement ends at semicolon outside dollar-quote
        if not in_dollar_quote and stripped.endswith(";"):
            stmt = "\n".join(current).strip()
            if stmt and not stmt.startswith("--"):
                statements.append(stmt)
            current = []

    # Flush remaining
    if current:
        stmt = "\n".join(current).strip()
        if stmt:
            statements.append(stmt)

    return statements


async def apply_schema(dsn: str) -> None:
    print("\n[INFO] Connecting to Supabase...")
    conn = await asyncpg.connect(dsn, statement_cache_size=0)
    print("[OK]   Connected.")

    sql = SCHEMA_FILE.read_text(encoding="utf-8")
    statements = split_statements(sql)
    print(f"[INFO] {len(statements)} statements to apply...")

    ok = 0
    skipped = 0
    errors = []

    for i, stmt in enumerate(statements, 1):
        # Skip comments-only
        if all(l.strip().startswith("--") or not l.strip() for l in stmt.splitlines()):
            continue
        try:
            await conn.execute(stmt)
            ok += 1
        except Exception as e:
            err_msg = str(e)
            # Ignore "already exists" type errors
            ignorable = any(x in err_msg.lower() for x in [
                "already exists", "duplicate", "does not exist",
                "multiple primary keys", "constraint already",
            ])
            if ignorable:
                skipped += 1
            else:
                errors.append((i, stmt[:80].replace("\n", " "), err_msg[:120]))
                print(f"[WARN] Statement {i}: {err_msg[:100]}")

    print(f"\n[OK]   Applied: {ok} | Skipped (already exist): {skipped} | Errors: {len(errors)}")

    if errors:
        print("\n[ERRORS]:")
        for idx, stmt_preview, msg in errors:
            print(f"  #{idx}: {stmt_preview}")
            print(f"       → {msg}")

    # Show final table list
    tables = await conn.fetch(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
    )
    print(f"\n[INFO] Tables in DB ({len(tables)}):")
    for r in tables:
        print(f"       ✓ {r['table_name']}")

    await conn.close()
    print("\n[DONE] Schema v3.0 applied.")


if __name__ == "__main__":
    if not DATABASE_URL:
        print("[ERROR] Set DATABASE_URL environment variable.")
        sys.exit(1)
    asyncio.run(apply_schema(DATABASE_URL))
