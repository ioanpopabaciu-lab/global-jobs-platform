"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/f53cvkek_logo%20transparent.png";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de securitate lipsă sau invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolele nu se potrivesc.");
      return;
    }

    if (password.length < 8) {
      setError("Parola trebuie să conțină minim 8 caractere.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Nu am putut reseta parola. Link-ul a expirat sau este invalid.");
      }

      setSuccess(true);
      toast.success("Parolă resetată cu succes!");
      
      // Redirect entirely to login after a few seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "Eroare la resetarea parolei.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src={LOGO_URL} alt="GJC Logo" width={160} height={64} className="h-16 mx-auto" />
          </Link>
          <CardTitle className="text-2xl font-bold text-red-600">Link Invalid</CardTitle>
          <CardDescription>
            Acest link de recuperare este incomplet sau token-ul de securitate lipsește.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center border-t pt-6">
          <Link href="/forgot-password" className="flex items-center text-sm text-navy-600 hover:text-coral font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cere alt link de resetare
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="inline-block mb-4">
          <Image src={LOGO_URL} alt="GJC Logo" width={160} height={64} className="h-16 mx-auto" />
        </Link>
        <CardTitle className="text-2xl font-bold text-navy-900">Noua Parolă</CardTitle>
        <CardDescription>
          Contul tău a fost autorizat pentru resetarea parolei de acces.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900">Parola a fost actualizată!</h3>
            <p className="text-sm text-gray-600">
              Securitatea contului tău a fost restabilită. Acum te poți autentifica cu noua parolă. Vei fi redirectat...
            </p>
            <Button className="mt-4 w-full bg-navy-900 hover:bg-navy-800" onClick={() => router.push("/login")}>
              Mergi la Autentificare
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Noua parolă</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmă noua parolă</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  "Schimbă Parola"
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>

      {!success && (
        <CardFooter className="flex justify-center border-t pt-6">
          <Link href="/login" className="flex items-center text-sm text-navy-600 hover:text-coral transition-colors font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anulează și întoarce-te la Autentificare
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-navy-900" />
          <p className="mt-4 text-gray-500">Se încarcă modulul de resetare...</p>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
