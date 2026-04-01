export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    // Forward the logout to the backend server
    const token = request.cookies.get("session_token")?.value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: headers,
        });
    } catch (e) {
        console.error("Logout fetch to backend failed, proceeding to clear cookie locally", e);
    }
    
    // Create the response and wipe the Next.js cookie intentionally using the reliable headers api
    const nextResponse = NextResponse.json({ success: true, message: "Te-ai delogat cu succes" }, { status: 200 });
    
    cookies().set({
        name: "session_token",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0 // Instantly expire the cookie
    });
    
    return nextResponse;
    
  } catch (error) {
    console.error("Logout proxy error:", error);
    return NextResponse.json(
      { detail: "PROXY ERROR: " + String(error) },
      { status: 500 }
    );
  }
}
