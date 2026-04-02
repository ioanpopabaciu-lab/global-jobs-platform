"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, RefreshCw, ChevronRight } from "lucide-react";
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

interface Job {
  id: string;
  position_title: string;
  cor_code: string;
  category: string; // "A" | "B"
  positions_count: number;
  positions_filled: number;
  salary_gross: number;
  currency: string;
  contract_type: string;
  company_name: string;
  city: string;
  county: string;
  status: string;
  works_in_shifts: boolean;
  works_at_height: boolean;
  works_low_temp: boolean;
  works_high_temp: boolean;
  preferred_nationalities: string[];
  required_driving_licenses: string[];
  min_experience_years_total: number;
  notes?: string;
}

interface Placement {
  id: string;
  candidate_name: string;
  stage: string;
  match_score: number;
  created_at: string;
}

interface MatchCandidate {
  id: string;
  first_name: string;
  last_name: string;
  origin_country: string;
  target_position_name: string;
  match_score: number;
  candidate_type: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STATUS_LABELS: Record<string, string> = {
  draft: "Schiță",
  open: "Deschis",
  in_progress: "În progres",
  filled: "Completat",
  cancelled: "Anulat",
  paused: "Pauză",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  filled: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
  paused: "bg-amber-100 text-amber-700",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-amber-400";
  return "bg-red-500";
}

function BoolChip({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        value
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${value ? "bg-green-500" : "bg-gray-400"}`} />
      {label}: {value ? "Da" : "Nu"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminJobDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Matching state
  const [matchCandidates, setMatchCandidates] = useState<MatchCandidate[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Status change state
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Load job details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/admin/jobs/${id}`, {
      headers: getAuthHeaders(),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setJob(data.job);
        setPlacements(data.placements ?? []);
        setNewStatus(data.job.status);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Calculate matching
  const handleMatch = () => {
    setMatchLoading(true);
    setMatchError(null);
    fetch(`${API_BASE}/api/admin/matching/${id}`, {
      headers: getAuthHeaders(),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const sorted = [...(data.candidates ?? [])].sort(
          (a, b) => b.match_score - a.match_score
        );
        setMatchCandidates(sorted);
      })
      .catch((e) => setMatchError(e.message))
      .finally(() => setMatchLoading(false));
  };

  // Save status
  const handleStatusSave = () => {
    setStatusSaving(true);
    setStatusMsg(null);
    fetch(`${API_BASE}/api/admin/jobs/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status: newStatus, notes: statusNotes || undefined }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(() => {
        setStatusMsg("Status actualizat cu succes.");
        setJob((prev) => prev ? { ...prev, status: newStatus } : prev);
      })
      .catch((e) => setStatusMsg(`Eroare: ${e.message}`))
      .finally(() => setStatusSaving(false));
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

  if (error || !job) {
    return (
      <div className="p-6">
        <p className="text-red-500">Eroare la încărcare: {error ?? "Job negăsit"}</p>
        <Link href="/admin/jobs">
          <Button variant="outline" className="mt-4">
            Înapoi la lista de cereri
          </Button>
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div>
        <Link
          href="/admin/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Cereri Recrutare
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900">{job.position_title}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_LABELS[job.status] ?? job.status}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {job.company_name} · {job.city}, {job.county}
        </p>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Details */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy-900">
              Detalii cerere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Cod COR</dt>
                <dd className="font-medium text-navy-900">{job.cor_code || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Categorie</dt>
                <dd>
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold text-xs">
                    Tip {job.category}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Posturi</dt>
                <dd className="font-medium text-navy-900">
                  {job.positions_filled} / {job.positions_count} ocupate
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Salariu brut</dt>
                <dd className="font-medium text-navy-900">
                  {job.salary_gross ? `${job.salary_gross.toLocaleString("ro-RO")} ${job.currency}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Tip contract</dt>
                <dd className="font-medium text-navy-900">{job.contract_type || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Companie</dt>
                <dd className="font-medium text-navy-900">{job.company_name}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Locație</dt>
                <dd className="font-medium text-navy-900">
                  {job.city}, {job.county}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-navy-900">
              Cerințe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditions chips */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Condiții de lucru</p>
              <div className="flex flex-wrap gap-2">
                <BoolChip label="Schimburi" value={job.works_in_shifts} />
                <BoolChip label="La înălțime" value={job.works_at_height} />
                <BoolChip label="Frig" value={job.works_low_temp} />
                <BoolChip label="Căldură" value={job.works_high_temp} />
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Naționalități preferate</dt>
                <dd className="font-medium text-navy-900">
                  {job.preferred_nationalities?.length
                    ? job.preferred_nationalities.join(", ")
                    : "Orice"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Permis de conducere</dt>
                <dd className="font-medium text-navy-900">
                  {job.required_driving_licenses?.length
                    ? job.required_driving_licenses.join(", ")
                    : "Nu este necesar"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Experiență minimă</dt>
                <dd className="font-medium text-navy-900">
                  {job.min_experience_years_total
                    ? `${job.min_experience_years_total} ani`
                    : "Fără cerință"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Active Placements */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy-900">
            Plasamente active ({placements.length})
          </CardTitle>
          <CardDescription>Candidați deja asignați acestei cereri</CardDescription>
        </CardHeader>
        <CardContent>
          {placements.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Niciun plasament activ momentan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">Candidat</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">Etapă</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500 whitespace-nowrap">Score</th>
                    <th className="text-left py-2 font-medium text-gray-500 whitespace-nowrap">Dată creare</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4 font-medium text-navy-900">{p.candidate_name}</td>
                      <td className="py-2.5 pr-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {p.stage}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${scoreColor(p.match_score)}`}
                              style={{ width: `${Math.min(p.match_score, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{p.match_score}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-500">{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matching */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-navy-900">
                Candidați potriviți
              </CardTitle>
              <CardDescription>
                Calculează compatibilitatea cu candidații disponibili
              </CardDescription>
            </div>
            <Button
              onClick={handleMatch}
              disabled={matchLoading}
              className="bg-[#E8553E] hover:bg-[#d44b35] text-white"
            >
              {matchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Se calculează…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Calculează matching
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {matchError && (
            <p className="text-sm text-red-500 mb-3">Eroare: {matchError}</p>
          )}
          {matchCandidates.length === 0 && !matchLoading && !matchError && (
            <p className="text-sm text-gray-400 italic">
              Apasă butonul pentru a calcula compatibilitatea cu candidații.
            </p>
          )}
          {matchCandidates.length > 0 && (
            <div className="space-y-3">
              {matchCandidates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Score bar */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <span
                      className={`text-sm font-bold ${
                        c.match_score >= 70
                          ? "text-green-600"
                          : c.match_score >= 40
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}
                    >
                      {c.match_score}%
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreColor(c.match_score)}`}
                        style={{ width: `${Math.min(c.match_score, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-900 text-sm">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.origin_country} · {c.target_position_name} · Tip {c.candidate_type}
                    </p>
                  </div>

                  {/* Action */}
                  <Link href="/admin/placements">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 border-[#E8553E] text-[#E8553E] hover:bg-[#E8553E] hover:text-white"
                    >
                      Creează plasament
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Panel */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy-900">
            Schimbă status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Status nou
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-transparent"
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Note (opțional)
              </label>
              <input
                type="text"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Motiv schimbare status…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleStatusSave}
              disabled={statusSaving || newStatus === job.status}
              className="bg-[#E8553E] hover:bg-[#d44b35] text-white"
            >
              {statusSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Se salvează…
                </>
              ) : (
                "Salvează status"
              )}
            </Button>
            {statusMsg && (
              <p
                className={`text-sm ${
                  statusMsg.startsWith("Eroare") ? "text-red-500" : "text-green-600"
                }`}
              >
                {statusMsg}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
