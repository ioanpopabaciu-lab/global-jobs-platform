export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    const response = await fetch(`${API_URL}/portal/candidate/profile/submit`, {
      method: "POST",
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
      data = { detail: "RAW ERROR: " + rawText.substring(0, 300) };
    }

    if (!response.ok) {
      console.error("!!! BACKEND ERROR !!! :", JSON.stringify(data, null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Candidate profile submit proxy error:", error);
    return NextResponse.json({ detail: "PROXY ERROR: " + String(error) }, { status: 500 });
  }
}
