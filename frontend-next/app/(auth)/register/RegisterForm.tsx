"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, getRedirectPath } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, Chrome, Building2, UserCircle, GraduationCap, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/f53cvkek_logo%20transparent.png";

const accountTypeConfig: Record<string, {
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}> = {
  employer: {
    title: "Creare Cont Angajator",
    description: "Recrutați muncitori pentru compania dvs.",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  candidate: {
    title: "Creare Profil Candidat",
    description: "Aplicați pentru joburi în România",
    icon: UserCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  student: {
    title: "Aplicație Student",
    description: "Aplicați pentru a studia în România",
    icon: GraduationCap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  immigration_client: {
    title: "Servicii Imigrare",
    description: "Asistență pentru vize, permise de ședere, reîntregirea familiei",
    icon: FileText,
    color: "text-coral",
    bgColor: "bg-red-50",
  },
};

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const accountType = searchParams.get("type") || "candidate";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, loginWithGoogle } = useAuth();

  const config = accountTypeConfig[accountType] || accountTypeConfig.candidate;
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Parolele nu coincid");
      return;
    }

    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere");
      return;
    }

    setLoading(true);

    try {
      const data = await register(name, email, password, accountType);
      toast.success("Cont creat cu succes!");

      // Redirect based on account type
      const redirectPath = getRedirectPath(data.user.account_type);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Înregistrarea a eșuat");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Store intended account type in sessionStorage for after OAuth
    if (typeof window !== "undefined") {
      sessionStorage.setItem("intended_account_type", accountType);
    }
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-12">
      <Card className="w-full max-w-md" data-testid="register-card">
        <CardHeader className="text-center">
          <Link
            href="/my-account"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la selecția serviciului
          </Link>

          <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>

          <CardTitle className="text-2xl font-bold text-navy-900">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Login Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            data-testid="google-register-btn"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continuă cu Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">sau</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ion Popescu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="register-name"
                />
              </div>
            </div>

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
                  data-testid="register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
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
                  minLength={6}
                  data-testid="register-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmă parola</Label>
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
                  data-testid="register-confirm-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-navy-900 hover:bg-navy-800"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se creează contul...
                </>
              ) : (
                "Creează cont"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center text-sm">
          <p className="text-gray-500 w-full">
            Ai deja cont?{" "}
            <Link href="/login" className="text-navy-600 hover:underline font-medium">
              Autentifică-te
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
