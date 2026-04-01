export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getAuth(request: NextRequest): string | null {
  let authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader) {
    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) authHeader = `Bearer ${sessionToken}`;
  }
  return authHeader;
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = getAuth(request);
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get("doc_id");

    if (!docId) {
      return NextResponse.json({ detail: "doc_id is required" }, { status: 400 });
    }

    const response = await fetch(`${API_URL}/portal/candidate/documents/${docId}`, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      data = { detail: rawText.substring(0, 300) };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("document delete proxy error:", error);
    return NextResponse.json({ detail: "PROXY ERROR: " + String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("include_archived");

    const url = new URL(`${API_URL}/portal/candidate/documents`);
    if (includeArchived !== null) {
      url.searchParams.set("include_archived", includeArchived);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      console.error("!!! RAW NON-JSON RESPONSE FROM BACKEND !!!", rawText);
      data = { detail: "Eroare server: răspuns invalid de la backend.", documents: [] };
    }

    if (!response.ok) {
      console.error("!!! BACKEND ERROR !!! :", JSON.stringify(data, null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Candidate documents GET proxy error:", error);
    return NextResponse.json({ detail: "PROXY ERROR: " + String(error) }, { status: 500 });
  }
}
