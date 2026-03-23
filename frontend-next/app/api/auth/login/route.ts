import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const API_URL = "https://global-jobs-platform-production.up.railway.app/api";

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // Return original data and status code back to client
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error("Login proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Eroare internă de server (Proxy)", error: String(error) },
      { status: 500 }
    );
  }
}
