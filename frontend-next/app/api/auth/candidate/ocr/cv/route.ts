import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const API_URL = "https://global-jobs-platform-production.up.railway.app/api";
    
    // Extract token correctly
    let authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader) {
      const sessionToken = request.cookies.get("session_token")?.value;
      if (sessionToken) {
        authHeader = `Bearer ${sessionToken}`;
      }
    }

    const response = await fetch(`${API_URL}/auth/candidate/ocr/cv`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      console.error("!!! RAW NON-JSON RESPONSE FROM BACKEND OCR (CV) !!!", rawText);
      data = { detail: "RAW ERROR: " + rawText.substring(0, 300) };
    }

    if (!response.ok) {
      console.error("!!! BACKEND OCR ERROR (CV) !!! :", JSON.stringify(data, null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("OCR cv proxy error:", error);
    return NextResponse.json({ detail: "PROXY ERROR: " + String(error) }, { status: 500 });
  }
}
