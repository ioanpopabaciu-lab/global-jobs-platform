"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Users,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Info,
  TrendingUp,
  Plane,
} from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// ─── Stage labels ────────────────────────────────────────────────────────────

const STAGE_LABELS_A: Record<string, string> = {
  registered: "Înregistrat",
  profile_validated: "Profil validat",
  matched: "Potrivit",
  stage1_visible: "Vizibil etapa 1",
  interview_scheduled: "Interviu programat",
  selected: "Selectat",
  stage2_visible: "Vizibil etapa 2",
  igi_submitted: "IGI depus",
  igi_approved: "IGI aprobat",
  visa_submitted: "Viză depusă",
  visa_approved: "Viză aprobată",
  flight_scheduled: "Zbor programat",
  arrived: "Sosit",
  employed: "Angajat",
  completed: "Finalizat",
  cancelled: "Anulat",
};

const STAGE_LABELS_B: Record<string, string> = {
  registered: "Înregistrat",
  profile_validated: "Profil validat",
  matched: "Potrivit",
  stage1_visible: "Vizibil etapa 1",
  interview_scheduled: "Interviu programat",
  selected: "Selectat",
  stage2_visible: "Vizibil etapa 2",
  start_date_set: "Data start setată",
  employed: "Angajat",
  completed: "Finalizat",
  cancelled: "Anulat",
};

const PLACEMENT_TYPE_LABELS: Record<string, string> = {
  type1_abroad: "Recrutare Internațională (Cat. A)",
  type2_local: "Recrutare Locală (Cat. B)",
};

// ─── Helper components ────────────────────────────────────────────────────────

function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 40
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-semibold ${color}`}>
      <TrendingUp className="h-3.5 w-3.5" />
      {score}% potrivire
    </div>
  );
}

function InfoPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200 ${className}`}>
      {children}
    </span>
  );
}

function DateRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-600">
      <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
      <span className="text-gray-400 text-xs">{label}:</span>
      <span className="font-medium">{new Date(value).toLocaleDateString("ro-RO")}</span>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Placement {
  id: string;
  placement_type: string;
  visibility_stage: number;
  current_stage_a: string | null;
  current_stage_b: string | null;
  match_score: number;
  contract_signed: boolean;
  payment_confirmed: boolean;
  interview_date: string | null;
  selection_date: string | null;
  flight_date: string | null;
  candidate_name: string;
  origin_country: string;
  candidate_type: string;
  target_position_name: string;
  qualification_level: string;
  experience_years: number;
  position_title: string;
  cor_code: string;
  salary_gross: number;
  salary_currency: string;
  created_at: string;
}

// ─── Stage progress bar ───────────────────────────────────────────────────────

function StageProgressBar({
  currentStage,
  placementType,
}: {
  currentStage: string | null;
  placementType: string;
}) {
  const isTypeA = placementType === "type1_abroad";
  const labels = isTypeA ? STAGE_LABELS_A : STAGE_LABELS_B;
  const stageKeys = Object.keys(labels);
  const currentIndex = currentStage ? stageKeys.indexOf(currentStage) : -1;
  const currentLabel = currentStage ? (labels[currentStage] ?? currentStage) : "Necunoscut";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Etapă curentă</span>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: "#E8553E", color: "#fff" }}
        >
          {currentLabel}
        </span>
      </div>
      <div className="flex gap-0.5">
        {stageKeys.map((key, idx) => (
          <div
            key={key}
            className="flex-1 h-1.5 rounded-full"
            style={{
              backgroundColor:
                idx < currentIndex
                  ? "#22c55e"
                  : idx === currentIndex
                  ? "#E8553E"
                  : "#e5e7eb",
            }}
            title={labels[key]}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{stageKeys[0] ? labels[stageKeys[0]] : ""}</span>
        <span className="text-[10px] text-gray-400">
          {stageKeys.length > 0 ? labels[stageKeys[stageKeys.length - 1]] : ""}
        </span>
      </div>
    </div>
  );
}

// ─── Placement card ───────────────────────────────────────────────────────────

function PlacementCard({ placement }: { placement: Placement }) {
  const isTypeA = placement.placement_type === "type1_abroad";
  const currentStage = isTypeA ? placement.current_stage_a : placement.current_stage_b;
  const isConfidential = placement.candidate_name === "*** Confidențial ***";

  return (
    <Card className="hover:shadow-md transition-shadow">
      {/* Low-visibility banner */}
      {placement.visibility_stage < 2 && (
        <div className="flex items-start gap-2 bg-blue-50 border-b border-blue-100 px-4 py-2.5 rounded-t-lg">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Datele candidatului devin vizibile după etapa de selecție. Informațiile afișate sunt confidențiale până la confirmarea selecției.
          </p>
        </div>
      )}

      <CardContent className="pt-5 pb-4">
        {/* Top section: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Left: candidate info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {isConfidential ? (
                <>
                  <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-semibold text-gray-400 italic">Date confidențiale</span>
                </>
              ) : (
                <span className="font-semibold text-[#0f1f3d]">{placement.candidate_name}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span>{placement.origin_country}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Briefcase className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="font-medium">{placement.position_title}</span>
            </div>
            {placement.cor_code && (
              <div className="text-xs text-gray-400">COR: {placement.cor_code}</div>
            )}
            {placement.experience_years > 0 && (
              <div className="text-xs text-gray-500">
                {placement.experience_years} ani experiență
              </div>
            )}
          </div>

          {/* Center: stage + match */}
          <div className="space-y-3">
            <StageProgressBar currentStage={currentStage} placementType={placement.placement_type} />
            <MatchScoreBadge score={placement.match_score} />
          </div>

          {/* Right: key dates */}
          <div className="space-y-1.5">
            <DateRow label="Interviu" value={placement.interview_date} />
            <DateRow label="Selecție" value={placement.selection_date} />
            {placement.flight_date && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Plane className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span className="text-gray-400 text-xs">Zbor:</span>
                <span className="font-medium">
                  {new Date(placement.flight_date).toLocaleDateString("ro-RO")}
                </span>
              </div>
            )}
            <DateRow label="Înregistrat" value={placement.created_at} />
          </div>
        </div>

        {/* Bottom: info pills */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {placement.salary_gross > 0 && (
            <InfoPill>
              {placement.salary_gross.toLocaleString("ro-RO")} {placement.salary_currency}/lună
            </InfoPill>
          )}

          <InfoPill>
            {PLACEMENT_TYPE_LABELS[placement.placement_type] ?? placement.placement_type}
          </InfoPill>

          <InfoPill
            className={
              placement.contract_signed
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }
          >
            {placement.contract_signed ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            Contract semnat
          </InfoPill>

          <InfoPill
            className={
              placement.payment_confirmed
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-500 border-gray-200"
            }
          >
            {placement.payment_confirmed ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            Plată confirmată
          </InfoPill>

          {placement.qualification_level && (
            <InfoPill className="capitalize">{placement.qualification_level}</InfoPill>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlacements();
  }, []);

  const loadPlacements = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/employer/placements`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
      } else {
        setError("Nu s-au putut încărca plasamentele. Încercați din nou.");
      }
    } catch {
      setError("Eroare de conexiune. Verificați conexiunea la internet.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#E8553E" }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/portal/employer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0f1f3d]">Plasamentele Mele</h1>
              <Badge
                className="text-white font-semibold"
                style={{ backgroundColor: "#E8553E" }}
              >
                {placements.length}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Candidații în curs de procesare pentru compania dvs.
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
          <Info className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => { setError(null); setLoading(true); loadPlacements(); }}
          >
            Reîncearcă
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!error && placements.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Niciun plasament momentan
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Echipa GJC va propune candidați după validarea cererii dvs. de recrutare.
              Vă vom notifica prin email când există candidați disponibili.
            </p>
            <Link href="/portal/employer/jobs">
              <Button className="mt-6" style={{ backgroundColor: "#E8553E" }}>
                <Briefcase className="h-4 w-4 mr-2" />
                Vezi Cererile de Recrutare
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Placements list */}
      {placements.length > 0 && (
        <div className="space-y-4">
          {placements.map((placement) => (
            <PlacementCard key={placement.id} placement={placement} />
          ))}
        </div>
      )}
    </div>
  );
}
