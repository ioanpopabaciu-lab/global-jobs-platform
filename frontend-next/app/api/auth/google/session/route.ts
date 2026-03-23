import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.session_id;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    const API_URL = "https://global-jobs-platform-production.up.railway.app/api";

    const response = await fetch(`${API_URL}/auth/google/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId })
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Google session proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Eroare internă de server (Proxy OAuth)", error: String(error) },
      { status: 500 }
    );
  }
}
