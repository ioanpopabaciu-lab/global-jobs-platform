export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    let authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader) {
      const sessionToken = request.cookies.get("session_token")?.value;
      if (sessionToken) authHeader = `Bearer ${sessionToken}`;
    }

    const body = await request.json();
    const response = await fetch(`${API_URL}/portal/candidate/documents/upload-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
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
    console.error("upload-session proxy error:", error);
    return NextResponse.json(
      { detail: "PROXY ERROR: " + String(error) },
      { status: 500 }
    );
  }
}
