import { NextResponse } from "next/server";

/** @deprecated Folosiți /upload-session + PUT la Supabase + /register */
export async function POST() {
  return NextResponse.json(
    {
      detail:
        "Încărcarea multipart prin backend este înlocuită: POST /api/portal/candidate/documents/upload-session, apoi PUT la URL-ul semnat, apoi POST .../register.",
    },
    { status: 410 }
  );
}
