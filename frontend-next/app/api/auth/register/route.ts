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

    // Parse the response from the backend
    const data = await response.json();
    
    // Return the EXACT same status and data to the Next.js client
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error("Register proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Eroare internă de server (Proxy)", error: String(error) },
      { status: 500 }
    );
  }
}
