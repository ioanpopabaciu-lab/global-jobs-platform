"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, getRedirectPath } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, UserCircle, GraduationCap, FileText, ArrowRight, User, Loader2 } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/f53cvkek_logo%20transparent.png";

const serviceCards = [
  {
    id: "employer",
    icon: Building2,
    title: "Cont Angajator",
    description: "Recrutați muncitori pentru compania dvs. din România",
    button: "Creați Cont Angajator",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    lightBg: "bg-blue-50",
    accountType: "employer",
  },
  {
    id: "candidate",
    icon: UserCircle,
    title: "Cont Candidat",
    description: "Aplicați pentru locuri de muncă în România",
    button: "Creați Profil Candidat",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    lightBg: "bg-green-50",
    accountType: "candidate",
  },
  {
    id: "student",
    icon: GraduationCap,
    title: "Aplicație Student",
    description: "Aplicați pentru a studia în România cu asistența noastră",
    button: "Aplicați ca Student",
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    lightBg: "bg-purple-50",
    accountType: "student",
  },
  {
    id: "immigration",
    icon: FileText,
    title: "Servicii Imigrare",
    description: "Asistență pentru vize, permise de ședere, reîntregirea familiei și cetățenie",
    button: "Solicitați Asistență",
    color: "bg-coral",
    hoverColor: "hover:bg-red-600",
    lightBg: "bg-red-50",
    accountType: "immigration_client",
  },
];

export default function MyAccountPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  // If user is already authenticated, redirect to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const dashboardPath = getRedirectPath(user.account_type);
      router.push(dashboardPath);
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Înapoi la pagina principală
        </Link>

        <div className="text-center mb-12">
          <Link href="/">
            <Image
              src={LOGO_URL}
              alt="Global Jobs Consulting"
              width={200}
              height={80}
              className="h-20 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Alegeți Serviciul</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Selectați tipul de cont care se potrivește cel mai bine nevoilor dvs. Fiecare serviciu oferă un
            portal dedicat cu funcții specifice.
          </p>
        </div>

        {/* Login prompt - visible first */}
        <div className="max-w-4xl mx-auto mb-10">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-6">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-white" />
                <p className="text-white font-medium text-lg">Aveți deja un cont?</p>
              </div>
              <Link href="/login">
                <Button
                  className="bg-white text-navy-900 hover:bg-gray-100 font-bold px-8 py-3 text-base"
                  data-testid="btn-login-top"
                >
                  Autentificați-vă în cont
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {serviceCards.map((service) => (
            <Card
              key={service.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
              data-testid={`service-card-${service.id}`}
            >
              <CardHeader className={`${service.lightBg} pb-4`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${service.color} rounded-xl text-white`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Link href={`/register?type=${service.accountType}`}>
                  <Button
                    className={`w-full ${service.color} ${service.hoverColor} text-white group-hover:scale-[1.02] transition-transform`}
                    data-testid={`btn-${service.id}`}
                  >
                    {service.button}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Already have account section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <User className="h-6 w-6 text-white" />
                <p className="text-white font-medium">Aveți deja un cont?</p>
              </div>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-navy-900"
                  data-testid="btn-login"
                >
                  Autentificați-vă în cont
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 text-white/50 text-sm">
          <p>
            Aveți nevoie de ajutor?{" "}
            <a href="mailto:office@gjc.ro" className="text-coral hover:underline">
              office@gjc.ro
            </a>
          </p>
          <p className="mt-2">
            sau sunați{" "}
            <a href="tel:+40732403464" className="text-coral hover:underline">
              +40 732 403 464
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
