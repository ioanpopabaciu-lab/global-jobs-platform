"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitMerge, Loader2, MapPin, Briefcase, Calendar, Building2, Lock } from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const STAGE_A_LABELS: Record<string, string> = {
  A1_profiling: "A1 – Profilare",
  A2_matching: "A2 – Potrivire",
  A3_presentation: "A3 – Prezentare Angajator",
  A4_interview: "A4 – Interviu",
  A5_selection: "A5 – Selectat",
  A6_igi_submission: "A6 – Depus IGI",
  A7_igi_approved: "A7 – Aprobat IGI",
  A8_visa: "A8 – Viză",
  A9_flight: "A9 – Zbor Rezervat",
  A10_arrived: "A10 – Sosit în România",
};

const STAGE_B_LABELS: Record<string, string> = {
  B1_profiling: "B1 – Profilare",
  B2_matching: "B2 – Potrivire",
  B3_presentation: "B3 – Prezentare Angajator",
  B4_interview: "B4 – Interviu",
  B5_selection: "B5 – Selectat",
  B6_started: "B6 – Angajat",
};

export default function CandidatePlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlacements();
  }, []);

  const loadPlacements = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/candidate/dashboard`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (p: any): string => {
    if (p.placement_type === "type_a") {
      return STAGE_A_LABELS[p.current_stage_a] || p.current_stage_a || "—";
    }
    return STAGE_B_LABELS[p.current_stage_b] || p.current_stage_b || "—";
  };

  const getStageProgress = (p: any): number => {
    if (p.placement_type === "type_a") {
      const stages = Object.keys(STAGE_A_LABELS);
      const idx = stages.indexOf(p.current_stage_a);
      return idx >= 0 ? Math.round(((idx + 1) / stages.length) * 100) : 0;
    }
    const stages = Object.keys(STAGE_B_LABELS);
    const idx = stages.indexOf(p.current_stage_b);
    return idx >= 0 ? Math.round(((idx + 1) / stages.length) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal/candidate">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Plasamentele Mele</h1>
          <p className="text-gray-500 text-sm">{placements.length} plasamente</p>
        </div>
      </div>

      {placements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GitMerge className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nu aveți plasamente active momentan.</p>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              Completați profilul și documentele pentru a fi inclus în procesul de potrivire cu angajatorii.
            </p>
            <Link href="/portal/candidate/profile">
              <Button className="bg-coral hover:bg-coral/90">
                Completează Profilul
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {placements.map(p => {
            const stageLabel = getStageLabel(p);
            const progress = getStageProgress(p);
            const isConfidential = p.visibility_stage < 2;

            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="h-1.5 bg-gray-100">
                  <div
                    className="h-full bg-coral transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-coral" />
                        {p.position_title || "Poziție"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {isConfidential ? (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Lock className="h-3 w-3" />
                              Angajator Confidențial
                            </span>
                          ) : (
                            <span>{p.employer_name}, {p.employer_city}</span>
                          )}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {p.placement_type === "type_a" ? "Tip A" : "Tip B"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{progress}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Etapă curentă */}
                  <div className="bg-coral/5 border border-coral/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Etapă Curentă</p>
                    <p className="font-semibold text-coral">{stageLabel}</p>
                  </div>

                  {/* Date cheie */}
                  <div className="grid grid-cols-2 gap-3">
                    {p.interview_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Data Interviu</p>
                          <p className="text-sm font-medium">{new Date(p.interview_date).toLocaleDateString("ro-RO")}</p>
                        </div>
                      </div>
                    )}
                    {p.flight_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Data Zbor</p>
                          <p className="text-sm font-medium">{new Date(p.flight_date).toLocaleDateString("ro-RO")}</p>
                        </div>
                      </div>
                    )}
                    {p.igi_submitted_at && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Depus IGI</p>
                          <p className="text-sm font-medium">{new Date(p.igi_submitted_at).toLocaleDateString("ro-RO")}</p>
                        </div>
                      </div>
                    )}
                    {p.igi_approved_at && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Aprobat IGI</p>
                          <p className="text-sm font-medium">{new Date(p.igi_approved_at).toLocaleDateString("ro-RO")}</p>
                        </div>
                      </div>
                    )}
                    {p.employment_start_date && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Începe Munca</p>
                          <p className="text-sm font-medium">{new Date(p.employment_start_date).toLocaleDateString("ro-RO")}</p>
                        </div>
                      </div>
                    )}
                    {p.salary_gross && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Salariu</p>
                          <p className="text-sm font-medium">{p.salary_gross} {p.salary_currency || "RON"}/lună</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contract type */}
                  {p.contract_type && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span>{p.contract_type.replace("_", " ")} • {p.employer_city || ""}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">
                    Plasament creat la {new Date(p.created_at).toLocaleDateString("ro-RO")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
