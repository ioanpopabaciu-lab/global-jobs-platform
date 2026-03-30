"use client";

import { useState, useEffect } from "react";
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
  Mail,
  Loader2,
} from "lucide-react";

const API_URL = "/api";

interface DashboardData {
  has_profile: boolean;
  profile_status: string | null;
  active_projects: number;
  unread_notifications: number;
  documents_count: number;
  profile_summary?: {
    full_name: string;
    nationality: string;
    profession: string;
    profile_photo: string | null;
  };
}

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/portal/candidate/dashboard`, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate profile completion percentage
  const calculateCompletion = (): number => {
    if (!dashboardData?.has_profile) return 10; // Just account created
    
    const status = dashboardData.profile_status;
    if (status === "validated") return 100;
    if (status === "pending_validation") return 85;
    
    // Calculate based on documents
    const docsUploaded = dashboardData.documents_count || 0;
    const baseCompletion = 20; // Profile started
    const docCompletion = Math.min(docsUploaded * 15, 60); // Max 60% for docs
    
    return Math.min(baseCompletion + docCompletion, 80);
  };

  const getStatusSteps = () => {
    const status = dashboardData?.profile_status;
    const hasProfile = dashboardData?.has_profile;
    const docsCount = dashboardData?.documents_count || 0;
    
    return [
      {
        title: "Cont creat",
        description: "Contul tău a fost creat cu succes",
        completed: true,
      },
      {
        title: "Completare profil",
        description: hasProfile 
          ? status === "validated" || status === "pending_validation" 
            ? "Profil complet" 
            : "În curs de completare"
          : "Începe completarea profilului",
        completed: hasProfile && (status === "validated" || status === "pending_validation"),
        inProgress: hasProfile && status !== "validated" && status !== "pending_validation",
      },
      {
        title: "Încărcare documente",
        description: docsCount > 0 ? `${docsCount} documente încărcate` : "În așteptare",
        completed: docsCount >= 4, // Min 4 required docs
        inProgress: docsCount > 0 && docsCount < 4,
      },
      {
        title: "Validare dosar",
        description: status === "validated" 
          ? "Dosar validat" 
          : status === "pending_validation" 
            ? "În curs de verificare" 
            : "În așteptare",
        completed: status === "validated",
        inProgress: status === "pending_validation",
      },
    ];
  };

  const quickActions = [
    {
      title: "Completează Profilul",
      description: "Finalizează informațiile personale și profesionale cu AI OCR",
      icon: User,
      href: "/portal/candidate/profile",
      color: "bg-coral",
    },
    {
      title: "Gestionează Documente",
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
    {
      title: "Mesaje GJC",
      description: "Verifică inbox-ul pentru notificări importante",
      icon: Mail,
      href: "/portal/candidate/messages",
      color: "bg-blue-500",
    },
    {
      title: "Plasamentele Mele",
      description: "Urmărește statusul și etapele procesului de angajare",
      icon: Briefcase,
      href: "/portal/candidate/placements",
      color: "bg-navy-900",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" data-testid="loading-spinner" />
      </div>
    );
  }

  const profileCompletion = calculateCompletion();
  const statusSteps = getStatusSteps();

  return (
    <div className="container mx-auto px-4 py-8" data-testid="candidate-dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Bună, {dashboardData?.profile_summary?.full_name?.split(" ")[0] || user?.name?.split(" ")[0] || "Candidat"}!
        </h1>
        <p className="text-gray-600">
          Bine ai venit în portalul tău de candidat. Iată ce trebuie să faci pentru a-ți completa
          dosarul.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="profile-completion-card">
          <CardHeader className="pb-2">
            <CardDescription>Completare Profil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-navy-900">{profileCompletion}%</span>
              {profileCompletion < 100 && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              {profileCompletion === 100 && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </CardContent>
        </Card>

        <Card data-testid="documents-card">
          <CardHeader className="pb-2">
            <CardDescription>Documente Încărcate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">
                {dashboardData?.documents_count || 0}/6
              </span>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {6 - (dashboardData?.documents_count || 0)} documente rămase
            </p>
          </CardContent>
        </Card>

        <Card data-testid="applications-card">
          <CardHeader className="pb-2">
            <CardDescription>Aplicații Trimise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{dashboardData?.active_projects || 0}</span>
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(dashboardData?.active_projects || 0) === 0 ? "Nicio aplicație încă" : "În procesare"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="notifications-card">
          <CardHeader className="pb-2">
            <CardDescription>Notificări</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{dashboardData?.unread_notifications || 0}</span>
              <Bell className="h-5 w-5 text-coral" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(dashboardData?.unread_notifications || 0) === 0 ? "Nicio notificare nouă" : `${dashboardData?.unread_notifications} mesaje noi`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Acțiuni Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`quick-action-${index}`}>
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
      <Card data-testid="status-section">
        <CardHeader>
          <CardTitle>Statusul Dosarului</CardTitle>
          <CardDescription>
            Urmărește progresul dosarului tău de candidatură
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? "bg-green-100" 
                    : step.inProgress 
                      ? "bg-amber-100" 
                      : "bg-gray-100"
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : step.inProgress ? (
                    <Clock className="h-5 w-5 text-amber-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${!step.completed && !step.inProgress ? "text-gray-400" : ""}`}>
                    {step.title}
                  </p>
                  <p className={`text-sm ${!step.completed && !step.inProgress ? "text-gray-400" : "text-gray-500"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
