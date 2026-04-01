import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://global-jobs-platform-production.up.railway.app/api";

    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    const response = await fetch(`${API_URL}/auth/me`, {
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
      data = { detail: "Error: " + rawText.substring(0, 300) };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ detail: "PROXY ERROR: " + String(error) }, { status: 500 });
  }
}
