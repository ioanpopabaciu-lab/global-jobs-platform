"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/f53cvkek_logo%20transparent.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Nu am putut trimite cererea. Încearcă din nou.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Eroare la trimiterea cererii de resetare.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Image src={LOGO_URL} alt="GJC Logo" width={160} height={64} className="h-16 mx-auto" />
          </Link>
          <CardTitle className="text-2xl font-bold text-navy-900">Recuperare Parolă</CardTitle>
          <CardDescription>
            Introdu adresa de email și îți vom trimite un link pentru resetarea parolei.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900">Email trimis cu succes!</h3>
              <p className="text-sm text-gray-600">
                Dacă adresa <strong>{email}</strong> există în sistemul nostru, vei primi un email cu instrucțiunile de resetare.
              </p>
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
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplu.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-navy-900 hover:bg-navy-800"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    "Trimite Link de Resetare"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-6">
          <Link href="/login" className="flex items-center text-sm text-navy-600 hover:text-coral transition-colors font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Înapoi la Autentificare
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
