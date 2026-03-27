import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const API_URL = "https://global-jobs-platform-production.up.railway.app/api";
    
    // Extract token correctly
    let authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader) {
      const sessionToken = request.cookies.get("session_token")?.value;
      if (sessionToken) {
        authHeader = `Bearer ${sessionToken}`;
      }
    }

    // Reconstruct FormData for clean boundary forwarding to Railway
    const formData = await request.formData();

    const response = await fetch(`${API_URL}/portal/candidate/documents/upload`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      console.error("!!! RAW NON-JSON RESPONSE FROM BACKEND UPLOAD !!!", rawText);
      data = { detail: "RAW ERROR: " + rawText.substring(0, 300) };
    }

    if (!response.ok) {
      console.error("!!! BACKEND UPLOAD ERROR !!! :", JSON.stringify(data, null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Candidate document upload proxy error:", error);
    return NextResponse.json({ detail: "PROXY ERROR: " + String(error) }, { status: 500 });
  }
}
