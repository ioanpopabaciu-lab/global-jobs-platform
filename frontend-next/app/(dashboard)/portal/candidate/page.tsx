"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  FileText,
  Briefcase,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Upload,
} from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useAuth();

  // Mock data - în producție ar veni de la API
  const stats = {
    profileCompletion: 40,
    documentsUploaded: 2,
    documentsRequired: 6,
    applicationsCount: 0,
    notificationsCount: 3,
  };

  const quickActions = [
    {
      title: "Completează Profilul",
      description: "Finalizează informațiile personale și profesionale",
      icon: User,
      href: "/portal/candidate/profile",
      color: "bg-blue-500",
    },
    {
      title: "Încarcă Documente",
      description: "Adaugă pașaport, CV și alte documente necesare",
      icon: Upload,
      href: "/portal/candidate/documents",
      color: "bg-green-500",
    },
    {
      title: "Vezi Joburi Disponibile",
      description: "Explorează oportunitățile de muncă în România",
      icon: Briefcase,
      href: "/portal/candidate/jobs",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Bună, {user?.name?.split(" ")[0] || "Candidat"}!
        </h1>
        <p className="text-gray-600">
          Bine ai venit în portalul tău de candidat. Iată ce trebuie să faci pentru a-ți completa
          dosarul.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completare Profil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-navy-900">{stats.profileCompletion}%</span>
              {stats.profileCompletion < 100 && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <Progress value={stats.profileCompletion} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documente Încărcate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">
                {stats.documentsUploaded}/{stats.documentsRequired}
              </span>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.documentsRequired - stats.documentsUploaded} documente rămase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aplicații Trimise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{stats.applicationsCount}</span>
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.applicationsCount === 0 ? "Nicio aplicație încă" : "În procesare"}
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

      {/* Status Section */}
      <Card>
        <CardHeader>
          <CardTitle>Statusul Dosarului</CardTitle>
          <CardDescription>
            Urmărește progresul dosarului tău de candidatură
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
                <p className="text-sm text-gray-500">Contul tău a fost creat cu succes</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Completare profil</p>
                <p className="text-sm text-gray-500">În curs - {stats.profileCompletion}% completat</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-400">Încărcare documente</p>
                <p className="text-sm text-gray-400">În așteptare</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-400">Validare dosar</p>
                <p className="text-sm text-gray-400">În așteptare</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
