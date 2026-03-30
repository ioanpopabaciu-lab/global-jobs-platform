"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, FileText, Briefcase, Bell,
  Plus, ArrowRight, CheckCircle2, Clock, Loader2,
  AlertTriangle, GitMerge,
} from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/employer/dashboard`, {
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

  const employer = data?.employer;
  const jobs = data?.jobs || [];
  const placements = data?.placements || [];
  const unreadCount = data?.unread_count || 0;

  // Profilul nu există
  if (!data?.profile_exists) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Bine ați venit, {user?.name?.split(" ")[0] || "Angajator"}!
          </h1>
          <p className="text-gray-600">Înregistrați compania pentru a accesa serviciile GJC.</p>
        </div>
        <Card className="border-2 border-dashed border-coral">
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 text-coral/50 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Creați Profilul Companiei</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Pentru a putea solicita muncitori și accesa candidații disponibili, completați datele companiei dvs.
            </p>
            <Link href="/portal/employer/profile">
              <Button className="bg-coral hover:bg-coral/90">
                <Building2 className="h-4 w-4 mr-2" />
                Completează Profilul Companiei
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isValidated = employer?.status === "validated";
  const isPending = employer?.status === "pending_validation";
  const activeJobs = jobs.filter((j: any) => j.status === "open").length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-1">
          {employer?.company_name || user?.name}
        </h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${isValidated ? "bg-green-100 text-green-700" : isPending ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
            {isValidated ? "Companie Validată" : isPending ? "În Verificare" : "Profil Incomplet"}
          </span>
          {employer?.city && <span className="text-sm text-gray-500">{employer.city}, {employer.county}</span>}
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
                ? "Profilul companiei este în curs de verificare. Veți fi notificat prin email."
                : "Completați și trimiteți profilul companiei pentru a putea posta cereri de recrutare."}
            </p>
            {!isPending && (
              <Link href="/portal/employer/profile">
                <Button size="sm" className="mt-2 bg-coral hover:bg-coral/90">Completează Profilul</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cereri Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{activeJobs}</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {jobs.length} total cereri
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Candidați în Proces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{placements.length}</span>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {placements.length === 0 ? "Niciun plasament" : "În procesare"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status Companie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${isValidated ? "text-green-600" : isPending ? "text-amber-600" : "text-gray-500"}`}>
                {isValidated ? "Validată" : isPending ? "În verificare" : "Incomplet"}
              </span>
              <FileText className={`h-5 w-5 ${isValidated ? "text-green-500" : "text-amber-500"}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Notificări</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{unreadCount}</span>
              <Bell className="h-5 w-5 text-coral" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount === 0 ? "Nicio notificare nouă" : `${unreadCount} mesaje noi`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Acțiuni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Completează Profilul",
              description: "Adaugă datele companiei și documentele necesare",
              icon: Building2,
              href: "/portal/employer/profile",
              color: "bg-blue-500",
            },
            {
              title: "Cereri de Recrutare",
              description: isValidated ? "Creează o cerere nouă pentru personal" : "Necesită validarea profilului",
              icon: Plus,
              href: "/portal/employer/jobs",
              color: isValidated ? "bg-green-500" : "bg-gray-400",
            },
            {
              title: "Candidați Propuși",
              description: `${placements.length} candidați în procesare`,
              icon: GitMerge,
              href: "/portal/employer/jobs",
              color: "bg-purple-500",
            },
          ].map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full group">
                    Deschide
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cereri recente */}
      {jobs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cereri Recente</CardTitle>
              <Link href="/portal/employer/jobs">
                <Button variant="ghost" size="sm">
                  Toate cererile <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.slice(0, 4).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{job.position_title}</p>
                    <p className="text-xs text-gray-500">
                      {job.positions_filled || 0}/{job.positions_count} posturi • Cat. {job.category}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    job.status === "open" ? "bg-green-100 text-green-700" :
                    job.status === "draft" ? "bg-gray-100 text-gray-700" :
                    job.status === "filled" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {job.status === "open" ? "Activă" :
                     job.status === "draft" ? "Ciornă" :
                     job.status === "filled" ? "Completată" : job.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proces recrutare */}
      <Card>
        <CardHeader>
          <CardTitle>Procesul de Recrutare GJC</CardTitle>
          <CardDescription>Pașii pentru a angaja personal internațional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { done: true, title: "Cont creat", desc: "Contul companiei a fost creat" },
              { done: isValidated, inProgress: isPending, title: "Validare profil companie", desc: "Adăugați datele companiei și documentele" },
              { done: activeJobs > 0, title: "Cereri de recrutare", desc: "Postați pozițiile dorite" },
              { done: placements.length > 0, title: "Potrivire candidați", desc: "GJC identifică cei mai potriviți candidați" },
              { done: false, title: "Contract & Angajare", desc: "Finalizarea contractelor și sosirea angajaților" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? "bg-green-100" : step.inProgress ? "bg-amber-100" : "bg-gray-100"
                }`}>
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : step.inProgress ? (
                    <Clock className="h-5 w-5 text-amber-600" />
                  ) : (
                    <span className="text-xs text-gray-400 font-bold">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${!step.done && !step.inProgress ? "text-gray-400" : ""}`}>{step.title}</p>
                  <p className={`text-sm ${!step.done && !step.inProgress ? "text-gray-400" : "text-gray-500"}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
