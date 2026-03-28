import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Password reset request proxying to:", `${API_URL}/auth/password/reset-request`);

    const backendResponse = await fetch(`${API_URL}/auth/password/reset-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => ({}));
    
    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: data.detail || data.message || "Failed to process request" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Password reset proxy error:", error);
    return NextResponse.json(
      { detail: "Eroare la conexiunea cu serverul" },
      { status: 500 }
    );
  }
}
