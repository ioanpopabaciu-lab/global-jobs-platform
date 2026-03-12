"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  FileText,
  Briefcase,
  Bell,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function EmployerDashboard() {
  const { user } = useAuth();

  // Mock data
  const stats = {
    activeJobs: 0,
    candidatesInProcess: 0,
    documentsStatus: "pending",
    notificationsCount: 2,
  };

  const quickActions = [
    {
      title: "Completează Profilul Companiei",
      description: "Adaugă informațiile companiei și documentele necesare",
      icon: Building2,
      href: "/portal/employer/profile",
      color: "bg-blue-500",
    },
    {
      title: "Solicită Muncitori",
      description: "Creează o cerere nouă pentru recrutare",
      icon: Plus,
      href: "/portal/employer/jobs/new",
      color: "bg-green-500",
    },
    {
      title: "Vezi Candidați",
      description: "Consultă candidații disponibili pentru proiectele tale",
      icon: Users,
      href: "/portal/employer/candidates",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Bine ați venit, {user?.name?.split(" ")[0] || "Angajator"}!
        </h1>
        <p className="text-gray-600">
          Gestionați recrutarea și documentația companiei dvs. din acest portal.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cereri Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{stats.activeJobs}</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.activeJobs === 0 ? "Nicio cerere activă" : "În procesare"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Candidați în Proces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{stats.candidatesInProcess}</span>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.candidatesInProcess === 0 ? "Niciun candidat" : "În procesare"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status Documente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900 capitalize">
                {stats.documentsStatus === "pending" ? "În așteptare" : "Validat"}
              </span>
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Completați profilul companiei
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Notificări</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{stats.notificationsCount}</span>
              <Bell className="h-5 w-5 text-coral" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.notificationsCount} mesaje noi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Acțiuni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
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
                    Începe
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Status */}
      <Card>
        <CardHeader>
          <CardTitle>Procesul de Recrutare</CardTitle>
          <CardDescription>
            Pașii pentru a începe recrutarea de personal din Asia și Africa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Cont creat</p>
                <p className="text-sm text-gray-500">Contul companiei a fost creat</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Completare profil companie</p>
                <p className="text-sm text-gray-500">
                  Adăugați datele companiei și documentele (CUI, certificat, etc.)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-400">Validare eligibilitate IGI</p>
                <p className="text-sm text-gray-400">
                  Verificăm eligibilitatea pentru permise de muncă
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-400">Selectare candidați</p>
                <p className="text-sm text-gray-400">
                  Alegeți candidații potriviți din baza noastră de date
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
