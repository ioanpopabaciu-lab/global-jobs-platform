"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRedirectPath } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://immigration-saas-2.preview.emergentagent.com/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Extract session_id from URL fragment
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", ""));
      const sessionId = params.get("session_id");

      if (!sessionId) {
        console.error("No session_id in callback");
        router.push("/login");
        return;
      }

      try {
        // Exchange session_id for our session token
        const response = await fetch(`${API_URL}/auth/google/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange session");
        }

        const data = await response.json();

        // Redirect based on user account_type
        const redirectPath = getRedirectPath(data.user.account_type || data.user.role);

        // Clear the hash and navigate
        window.history.replaceState(null, "", window.location.pathname);
        router.push(redirectPath);
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/login");
      }
    };

    processCallback();
  }, [router, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-navy-600 mx-auto mb-4" />
        <p className="text-gray-600">Se procesează autentificarea...</p>
      </div>
    </div>
  );
}
