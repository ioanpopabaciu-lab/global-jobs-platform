"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Check, Clock, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  origin_country: string;
  candidate_type: string; // "A" | "B"
}

interface Job {
  position_title: string;
  cor_code: string;
  company_name: string;
  city: string;
  county: string;
}

interface Placement {
  id: string;
  current_stage: string;
  match_score: number;
  match_type: string;
  created_at: string;
  contract_signed: boolean;
  payment_confirmed: boolean;
}

interface StageHistoryEntry {
  id: string;
  old_stage: string;
  new_stage: string;
  stage_date: string;
  notes?: string;
  changed_by_name: string;
}

interface PlacementDetail {
  placement: Placement;
  candidate: Candidate;
  job: Job;
  stage_history: StageHistoryEntry[];
}

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

type StageKey = string;

const STAGES_A: StageKey[] = [
  "registered",
  "profile_validated",
  "matched",
  "stage1_visible",
  "interview_scheduled",
  "selected",
  "stage2_visible",
  "igi_submitted",
  "igi_approved",
  "visa_submitted",
  "visa_approved",
  "flight_scheduled",
  "arrived",
  "employed",
  "completed",
  "cancelled",
];

const STAGES_B: StageKey[] = [
  "registered",
  "profile_validated",
  "matched",
  "stage1_visible",
  "interview_scheduled",
  "selected",
  "stage2_visible",
  "start_date_set",
  "employed",
  "completed",
  "cancelled",
];

const STAGE_LABELS_A: Record<string, string> = {
  registered: "Înregistrat",
  profile_validated: "Profil validat",
  matched: "Matched",
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
  matched: "Matched",
  stage1_visible: "Vizibil etapa 1",
  interview_scheduled: "Interviu programat",
  selected: "Selectat",
  stage2_visible: "Vizibil etapa 2",
  start_date_set: "Data start setată",
  employed: "Angajat",
  completed: "Finalizat",
  cancelled: "Anulat",
};

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Return array of "next" valid stage keys (all stages after current, up to next 3, excluding cancelled unless current isn't terminal)
function getNextStages(
  currentStage: string,
  stageList: StageKey[]
): StageKey[] {
  const currentIdx = stageList.indexOf(currentStage);
  if (currentIdx === -1 || currentIdx >= stageList.length - 1) return [];
  // Offer everything after current (so admin can jump ahead), cap at next 4 for UX
  return stageList.slice(currentIdx + 1);
}

function stageLabel(stage: string, candidateType: string): string {
  const labels = candidateType === "B" ? STAGE_LABELS_B : STAGE_LABELS_A;
  return labels[stage] ?? stage;
}

// ---------------------------------------------------------------------------
// Pipeline component
// ---------------------------------------------------------------------------

interface PipelineProps {
  stages: StageKey[];
  currentStage: string;
  labels: Record<string, string>;
}

function StagePipeline({ stages, currentStage, labels }: PipelineProps) {
  const currentIdx = stages.indexOf(currentStage);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center min-w-max gap-0">
        {stages.map((stage, idx) => {
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage} className="flex items-center">
              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 72 }}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isPast
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-[#E8553E] text-white ring-4 ring-[#E8553E]/20"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isPast ? (
                    <Check className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-center text-xs leading-tight px-0.5 ${
                    isPast
                      ? "text-green-600 font-medium"
                      : isCurrent
                      ? "text-[#E8553E] font-semibold"
                      : "text-gray-400"
                  }`}
                  style={{ maxWidth: 68 }}
                >
                  {labels[stage] ?? stage}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`h-0.5 w-6 flex-shrink-0 ${
                    idx < currentIdx ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPlacementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<PlacementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Advance stage state
  const [nextStage, setNextStage] = useState("");
  const [stageDate, setStageDate] = useState(todayISO());
  const [stageNotes, setStageNotes] = useState("");
  const [stageSaving, setStageSaving] = useState(false);
  const [stageMsg, setStageMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/placements/${id}`, {
      headers: getAuthHeaders(),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: PlacementDetail) => {
        setData(d);
        // Pre-select the first available next stage
        const stageList =
          d.candidate.candidate_type === "B" ? STAGES_B : STAGES_A;
        const nexts = getNextStages(d.placement.current_stage, stageList);
        if (nexts.length > 0) setNextStage(nexts[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdvanceStage = () => {
    if (!nextStage) return;
    setStageSaving(true);
    setStageMsg(null);
    fetch(`${API_BASE}/api/admin/placements/${id}/stage`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        new_stage: nextStage,
        stage_date: stageDate || undefined,
        notes: stageNotes || undefined,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(() => {
        setStageMsg("Etapă actualizată cu succes.");
        // Refresh data
        return fetch(`${API_BASE}/api/admin/placements/${id}`, {
          headers: getAuthHeaders(),
        })
          .then((r) => r.json())
          .then((d: PlacementDetail) => {
            setData(d);
            const stageList =
              d.candidate.candidate_type === "B" ? STAGES_B : STAGES_A;
            const nexts = getNextStages(d.placement.current_stage, stageList);
            setNextStage(nexts.length > 0 ? nexts[0] : "");
            setStageNotes("");
          });
      })
      .catch((e) => setStageMsg(`Eroare: ${e.message}`))
      .finally(() => setStageSaving(false));
  };

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-500">Eroare la încărcare: {error ?? "Plasament negăsit"}</p>
        <Link href="/admin/placements">
          <Button variant="outline" className="mt-4">
            Înapoi la plasamente
          </Button>
        </Link>
      </div>
    );
  }

  const { placement, candidate, job, stage_history } = data;
  const isTypeB = candidate.candidate_type === "B";
  const stageList = isTypeB ? STAGES_B : STAGES_A;
  const stageLabels = isTypeB ? STAGE_LABELS_B : STAGE_LABELS_A;
  const nextStages = getNextStages(placement.current_stage, stageList);
  const currentStageLbl = stageLabels[placement.current_stage] ?? placement.current_stage;

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div>
        <Link
          href="/admin/placements"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Plasamente
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">
            Plasament:{" "}
            <span className="text-[#E8553E]">
              {candidate.first_name} {candidate.last_name}
            </span>{" "}
            <ChevronRight className="inline h-5 w-5 text-gray-400" />{" "}
            {job.company_name}
          </h1>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E8553E]/10 text-[#E8553E]">
            {currentStageLbl}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            Tip {candidate.candidate_type}
          </span>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Candidate */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Candidat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400 text-xs">Nume</dt>
                <dd className="font-semibold text-navy-900">
                  {candidate.first_name} {candidate.last_name}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Țară origine</dt>
                <dd className="font-medium text-navy-900">{candidate.origin_country || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Tip candidat</dt>
                <dd>
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold text-xs">
                    Tip {candidate.candidate_type}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Job */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Loc de muncă
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400 text-xs">Poziție</dt>
                <dd className="font-semibold text-navy-900">{job.position_title}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Cod COR</dt>
                <dd className="font-medium text-navy-900">{job.cor_code || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Companie</dt>
                <dd className="font-medium text-navy-900">{job.company_name}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Locație</dt>
                <dd className="font-medium text-navy-900">
                  {job.city}, {job.county}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Placement details */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Detalii plasament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400 text-xs">Score compatibilitate</dt>
                <dd>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          placement.match_score >= 70
                            ? "bg-green-500"
                            : placement.match_score >= 40
                            ? "bg-amber-400"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(placement.match_score, 100)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-navy-900 text-xs">
                      {placement.match_score}%
                    </span>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Tip matching</dt>
                <dd className="font-medium text-navy-900">{placement.match_type || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-400 text-xs">Data creării</dt>
                <dd className="font-medium text-navy-900">{formatDate(placement.created_at)}</dd>
              </div>
              <div className="flex gap-4">
                <div>
                  <dt className="text-gray-400 text-xs">Contract semnat</dt>
                  <dd>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        placement.contract_signed
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {placement.contract_signed ? "Da" : "Nu"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400 text-xs">Plată confirmată</dt>
                  <dd>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        placement.payment_confirmed
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {placement.payment_confirmed ? "Da" : "Nu"}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Progress Pipeline */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy-900">
            Progres etape
          </CardTitle>
          <CardDescription>
            Pipeline complet Tip {candidate.candidate_type} — etapă curentă în portocaliu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StagePipeline
            stages={stageList}
            currentStage={placement.current_stage}
            labels={stageLabels}
          />
        </CardContent>
      </Card>

      {/* Stage History */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy-900">
            Istoric etape ({stage_history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stage_history.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nu există istoric de etape.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">
                      Tranziție
                    </th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">
                      Dată
                    </th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">
                      Note
                    </th>
                    <th className="text-left py-2 font-medium text-gray-500 whitespace-nowrap">
                      Modificat de
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stage_history.map((h) => (
                    <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium whitespace-nowrap">
                            {stageLabels[h.old_stage] ?? h.old_stage}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="px-2 py-0.5 rounded-full bg-[#E8553E]/10 text-[#E8553E] text-xs font-medium whitespace-nowrap">
                            {stageLabels[h.new_stage] ?? h.new_stage}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">
                        {formatDate(h.stage_date)}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-500 max-w-xs truncate">
                        {h.notes || "—"}
                      </td>
                      <td className="py-2.5 text-gray-600 whitespace-nowrap">
                        {h.changed_by_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advance Stage Panel */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy-900">
            Avansează etapă
          </CardTitle>
          <CardDescription>
            Etapă curentă:{" "}
            <span className="font-semibold text-[#E8553E]">{currentStageLbl}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nextStages.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Plasamentul este în etapa finală, nu mai poate fi avansat.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Next stage select */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Etapă nouă
                  </label>
                  <select
                    value={nextStage}
                    onChange={(e) => setNextStage(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-transparent"
                  >
                    {nextStages.map((s) => (
                      <option key={s} value={s}>
                        {stageLabels[s] ?? s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Data tranziției
                  </label>
                  <input
                    type="date"
                    value={stageDate}
                    onChange={(e) => setStageDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-transparent"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Note (opțional)
                  </label>
                  <textarea
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="Detalii despre tranziție…"
                    rows={1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAdvanceStage}
                  disabled={stageSaving || !nextStage}
                  className="bg-[#E8553E] hover:bg-[#d44b35] text-white"
                >
                  {stageSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Se avansează…
                    </>
                  ) : (
                    "Avansează etapa"
                  )}
                </Button>
                {stageMsg && (
                  <p
                    className={`text-sm ${
                      stageMsg.startsWith("Eroare") ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {stageMsg}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
