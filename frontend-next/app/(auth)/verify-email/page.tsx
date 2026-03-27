"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Token lipsă din URL.");
      return;
    }

    const baseUrl = "https://global-jobs-platform-production.up.railway.app/api";
    
    fetch(`${baseUrl}/auth/verify-email?token=${token}`, { redirect: "manual" })
      .then((res) => {
        if (res.ok || res.status === 0 || res.type === "opaqueredirect") {
          setStatus("success");
        } else {
          return res.json().then((data) => {
            throw new Error(data?.detail || "Verificare eșuată.");
          });
        }
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.message || "A apărut o eroare.");
      });
  }, [token]);

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        {status === "loading" && <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />}
        {status === "success" && <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />}
        {status === "error" && <XCircle className="mx-auto h-12 w-12 text-red-500" />}
        <CardTitle className="mt-4 text-2xl font-bold text-navy-900">
          {status === "loading" && "Se verifică emailul..."}
          {status === "success" && "Email confirmat cu succes!"}
          {status === "error" && "Verificare eșuată"}
        </CardTitle>
        {status === "error" && (
          <CardDescription className="text-red-500 mt-2">{errorMsg}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <Button asChild className="bg-navy-900 hover:bg-navy-800">
            <Link href="/login">Mergi la Login</Link>
          </Button>
        )}
        {status === "error" && (
          <Button asChild variant="outline">
            <Link href="/register">Încearcă din nou</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4">
      <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-blue-500" />}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
