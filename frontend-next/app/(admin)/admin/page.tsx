"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { Loader2, Users, Building2, Globe, Briefcase, GitMerge, FileText, Plane, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

interface Stats {
  total_candidates: number;
  pending_candidates: number;
  total_employers: number;
  pending_employers: number;
  total_agencies: number;
  active_jobs: number;
  active_placements: number;
  pending_documents: number;
  open_migration_cases: number;
  expiring_documents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard()
      .then(d => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const cards = [
    {
      label: "Candidați",
      value: stats?.total_candidates ?? 0,
      sub: `${stats?.pending_candidates ?? 0} în așteptare`,
      icon: Users,
      href: "/admin/candidates",
      color: "bg-blue-500",
      alert: (stats?.pending_candidates ?? 0) > 0,
    },
    {
      label: "Angajatori",
      value: stats?.total_employers ?? 0,
      sub: `${stats?.pending_employers ?? 0} în așteptare`,
      icon: Building2,
      href: "/admin/employers",
      color: "bg-teal-500",
      alert: (stats?.pending_employers ?? 0) > 0,
    },
    {
      label: "Agenții",
      value: stats?.total_agencies ?? 0,
      sub: "partenere active",
      icon: Globe,
      href: "/admin/agencies",
      color: "bg-indigo-500",
      alert: false,
    },
    {
      label: "Cereri Recrutare",
      value: stats?.active_jobs ?? 0,
      sub: "cereri active",
      icon: Briefcase,
      href: "/admin/jobs",
      color: "bg-purple-500",
      alert: false,
    },
    {
      label: "Plasamente",
      value: stats?.active_placements ?? 0,
      sub: "în derulare",
      icon: GitMerge,
      href: "/admin/placements",
      color: "bg-coral",
      alert: false,
    },
    {
      label: "Documente",
      value: stats?.pending_documents ?? 0,
      sub: "în verificare",
      icon: FileText,
      href: "/admin/documents",
      color: "bg-amber-500",
      alert: (stats?.pending_documents ?? 0) > 0,
    },
    {
      label: "Dosare Migrație",
      value: stats?.open_migration_cases ?? 0,
      sub: "dosare deschise",
      icon: Plane,
      href: "/admin/migration",
      color: "bg-sky-500",
      alert: false,
    },
    {
      label: "Documente Expirând",
      value: stats?.expiring_documents ?? 0,
      sub: "în 30 de zile",
      icon: AlertTriangle,
      href: "/admin/documents",
      color: "bg-red-500",
      alert: (stats?.expiring_documents ?? 0) > 0,
    },
  ];

  const pending = (stats?.pending_candidates ?? 0) + (stats?.pending_employers ?? 0) + (stats?.pending_documents ?? 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">Vizualizare generală platformă GJC</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy-900">{pending}</p>
            <p className="text-sm text-gray-500">Acțiuni necesare</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy-900">{stats?.active_placements ?? 0}</p>
            <p className="text-sm text-gray-500">Plasamente active</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy-900">{stats?.active_jobs ?? 0}</p>
            <p className="text-sm text-gray-500">Cereri active</p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Link key={card.href + card.label} href={card.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                {card.alert && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-3xl font-bold text-navy-900 mb-1">{card.value}</p>
              <p className="text-sm font-medium text-navy-900">{card.label}</p>
              <p className="text-xs text-gray-500">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
