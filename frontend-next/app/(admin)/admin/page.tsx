"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  FileText,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  // Mock stats - în producție ar veni de la API
  const stats = {
    pendingCandidates: 5,
    pendingEmployers: 3,
    activeJobs: 12,
    totalDocuments: 45,
    validatedProfiles: 28,
    rejectedProfiles: 2,
  };

  const adminActions = [
    {
      title: "Candidați în Așteptare",
      description: "Validați profilurile candidaților noi",
      icon: Users,
      href: "/admin/candidates",
      count: stats.pendingCandidates,
      color: "bg-blue-500",
    },
    {
      title: "Angajatori în Așteptare",
      description: "Verificați documentele companiilor",
      icon: Building2,
      href: "/admin/employers",
      count: stats.pendingEmployers,
      color: "bg-green-500",
    },
    {
      title: "Cereri de Recrutare",
      description: "Gestionați cererile de muncitori",
      icon: Briefcase,
      href: "/admin/jobs",
      count: stats.activeJobs,
      color: "bg-purple-500",
    },
    {
      title: "Documente",
      description: "Verificați și validați documentele",
      icon: FileText,
      href: "/admin/documents",
      count: stats.totalDocuments,
      color: "bg-coral",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-navy-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Bine ai venit, {user?.name || "Administrator"}. Gestionează platforma GJC.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>În Așteptare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-navy-900">
                {stats.pendingCandidates + stats.pendingEmployers}
              </span>
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Profile de validat</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Validate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-navy-900">{stats.validatedProfiles}</span>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Profile active</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription>Respinse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-navy-900">{stats.rejectedProfiles}</span>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Necesită atenție</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Cereri Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-navy-900">{stats.activeJobs}</span>
              <Briefcase className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Joburi în procesare</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Acțiuni Administrative</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  {action.count > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                      {action.count}
                    </span>
                  )}
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-sm">{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" size="sm" className="w-full group">
                    Deschide
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activitate Recentă</CardTitle>
          <CardDescription>Ultimele acțiuni pe platformă</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Candidat nou înregistrat</p>
                <p className="text-xs text-gray-500">Ion Popescu - acum 5 minute</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Companie nouă înregistrată</p>
                <p className="text-xs text-gray-500">SC Example SRL - acum 15 minute</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Document încărcat</p>
                <p className="text-xs text-gray-500">Pașaport - Maria Ionescu - acum 30 minute</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
