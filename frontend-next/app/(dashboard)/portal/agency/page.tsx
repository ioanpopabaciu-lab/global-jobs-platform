"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, Globe, Briefcase, ArrowRight, CheckCircle2, Clock,
  AlertTriangle, Loader2, UserPlus, FileText,
} from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/agency/dashboard`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  const agency = data?.agency;
  const stats = data?.stats || {};
  const candidates = data?.candidates || [];
  const openJobs = data?.open_jobs || [];

  // Nu există profil agenție
  if (!data?.profile_exists) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Portal Agenție</h1>
          <p className="text-gray-600">Bine ați venit, {user?.name?.split(" ")[0] || "Partener"}!</p>
        </div>
        <Card className="border-2 border-dashed border-coral">
          <CardContent className="py-12 text-center">
            <Globe className="h-16 w-16 text-coral/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Înregistrați Agenția</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Pentru a putea încărca candidați și accesa joburile disponibile, completați profilul agenției dvs.
            </p>
            <Link href="/portal/agency/profile">
              <Button className="bg-coral hover:bg-coral/90">
                <ArrowRight className="h-4 w-4 mr-2" />
                Completează Profilul Agenției
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isValidated = agency?.status === "validated";
  const isPending = agency?.status === "pending_validation";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-1">
          {agency?.agency_name || "Portalul Agenției"}
        </h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isValidated ? "bg-green-100 text-green-700" : isPending ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
            {isValidated ? "Validată" : isPending ? "În Verificare" : "Ciornă"}
          </span>
          {agency?.country && <span className="text-sm text-gray-500">{agency.country}</span>}
        </div>
      </div>

      {/* Status banner */}
      {!isValidated && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${isPending ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"}`}>
          {isPending ? (
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${isPending ? "text-amber-700" : "text-blue-700"}`}>
              {isPending
                ? "Profilul agenției este în curs de verificare. Veți fi notificat prin email."
                : "Completați și trimiteți profilul agenției pentru a putea încărca candidați."}
            </p>
            {!isPending && (
              <Link href="/portal/agency/profile">
                <Button size="sm" className="mt-2 bg-coral hover:bg-coral/90">
                  Completează Profilul
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Candidați Validați</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{stats.validated_count || 0}</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>În Așteptare Validare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{stats.pending_count || 0}</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Joburi Disponibile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{openJobs.length}</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acțiuni rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-coral rounded-xl flex items-center justify-center mb-3">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">Adaugă Candidat</CardTitle>
            <CardDescription>Înregistrați un candidat nou din portofoliul agenției</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/portal/agency/candidates">
              <Button variant="outline" className="w-full group" disabled={!isValidated}>
                {isValidated ? "Adaugă" : "Necesită Validare"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">Lista Candidați</CardTitle>
            <CardDescription>Gestionați candidații încărcați de agenția dvs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/portal/agency/candidates">
              <Button variant="outline" className="w-full group">
                Vezi Lista
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">Profilul Agenției</CardTitle>
            <CardDescription>Actualizați informațiile și documentele agenției</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/portal/agency/profile">
              <Button variant="outline" className="w-full group">
                Editează
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Ultimii candidați */}
      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Candidați Recenți</CardTitle>
              <Link href="/portal/agency/candidates">
                <Button variant="ghost" size="sm">Vezi toți <ArrowRight className="h-4 w-4 ml-1" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-500">{c.origin_country} • {c.target_position_name || "—"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "validated" ? "bg-green-100 text-green-700" :
                    c.status === "pending_validation" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {c.status === "validated" ? "Validat" : c.status === "pending_validation" ? "În verificare" : "Ciornă"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Joburi disponibile */}
      {isValidated && openJobs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Joburi Disponibile</CardTitle>
            <CardDescription>Oferte de muncă pentru care puteți propune candidați</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openJobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{job.position_title}</p>
                    <p className="text-xs text-gray-500">
                      {job.employer_city}, {job.employer_county} •
                      {job.positions_available} posturi disponibile
                      {job.salary_gross ? ` • ${job.salary_gross} ${job.salary_currency || "RON"}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {job.accommodation_provided && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Cazare</span>
                    )}
                    {job.meals_provided && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Masă</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
