import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Explicit API URL referencing backend on Railway
    const API_URL = "https://global-jobs-platform-production.up.railway.app/api";

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Check content type before parsing
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        // Railway might have returned an HTML 500 page or raw text!
        const rawText = await response.text();
        console.error("!!! RAW NON-JSON RESPONSE FROM BACKEND !!!", rawText);
        data = { detail: "RAW ERROR: " + rawText.substring(0, 300) };
    }
    
    // Explicitly log backend errors so they are visible in Node console or Browser
    if (!response.ok) {
        console.error("!!! SUPABASE/BACKEND ERROR !!! :", JSON.stringify(data, null, 2));
    }
    
    // Return the EXACT same status and data to the Next.js client
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error("Register proxy error:", error);
    return NextResponse.json(
      { detail: "PROXY ERROR: " + String(error) },
      { status: 500 }
    );
  }
}
