"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  User,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  FileText,
  Building2,
  MapPin,
  Star,
  ChevronDown,
} from "lucide-react";
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

type CandidateStatus = "pending" | "validated" | "rejected" | "suspended";

interface Candidate {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  nationality?: string;
  origin_country?: string;
  residence_country?: string;
  target_position_name?: string;
  cor_code?: string;
  qualification_level?: string;
  education_level?: string;
  candidate_type?: string;
  experience_years?: number;
  experience_summary?: string;
  status: CandidateStatus;
  submitted_at?: string;
  validated_at?: string;
  profile_completion_pct?: number;
}

interface Document {
  id: string;
  document_type?: string;
  type?: string;
  status?: string;
  created_at?: string;
}

interface Placement {
  id: string;
  company?: string;
  position?: string;
  stage?: string;
  match_score?: number;
}

interface Agency {
  name?: string;
  country?: string;
  contact?: string;
  email?: string;
  phone?: string;
}

interface CandidateDetail {
  candidate: Candidate;
  documents: Document[];
  placements: Placement[];
  agency: Agency | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const STATUS_LABELS: Record<CandidateStatus, string> = {
  pending: "În așteptare",
  validated: "Validat",
  rejected: "Respins",
  suspended: "Suspendat",
};

const STATUS_BADGE_CLASS: Record<CandidateStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  validated: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: CandidateStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium ${STATUS_BADGE_CLASS[status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 py-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

function ProgressBar({ pct }: { pct?: number }) {
  const value = Math.min(100, Math.max(0, pct ?? 0));
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Completare profil</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${value}%`,
            backgroundColor: value >= 80 ? "#22c55e" : value >= 50 ? "#f59e0b" : "#E8553E",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [data, setData] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action panel state
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "">("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ------------------------------------------------------------------
  // Load candidate on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/candidates/${id}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail ?? `Eroare ${res.status}`);
        }
        const json: CandidateDetail = await res.json();
        setData(json);
        setSelectedStatus(json.candidate?.status ?? "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Eroare necunoscută");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  // ------------------------------------------------------------------
  // Save decision
  // ------------------------------------------------------------------
  const handleSave = async () => {
    if (!id || !selectedStatus) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch(`/api/admin/candidates/${id}/validate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status: selectedStatus,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Eroare ${res.status}`);
      }
      const updated = await res.json();
      // Refresh local data with new status
      if (data) {
        setData({
          ...data,
          candidate: {
            ...data.candidate,
            status: updated?.candidate?.status ?? (selectedStatus as CandidateStatus),
          },
        });
      }
      setSaveResult({ ok: true, message: "Decizia a fost salvată cu succes." });
    } catch (err: unknown) {
      setSaveResult({
        ok: false,
        message: err instanceof Error ? err.message : "Eroare la salvare.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // Render states
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#E8553E]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Link
          href="/admin/candidates"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Candidați
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error ?? "Candidatul nu a fost găsit."}
        </div>
      </div>
    );
  }

  const { candidate, documents, placements, agency } = data;
  const candidateName =
    candidate.full_name ??
    [candidate.first_name, candidate.last_name].filter(Boolean).join(" ") ??
    `Candidat #${id}`;

  // ------------------------------------------------------------------
  // Full render
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back link */}
      <Link
        href="/admin/candidates"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Înapoi la Candidați
      </Link>

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-900 text-gray-900">{candidateName}</h1>
          <StatusBadge status={candidate.status} />
        </div>
        <span className="text-sm text-gray-400">ID: {id}</span>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left / main column */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* Info cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Personal info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-[#E8553E]" />
                  Informații personale
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 divide-y divide-gray-100">
                <InfoRow label="Nume complet" value={candidateName} />
                <InfoRow label="Naționalitate" value={candidate.nationality} />
                <InfoRow label="Țara de origine" value={candidate.origin_country} />
                <InfoRow label="Țara de reședință" value={candidate.residence_country} />
              </CardContent>
            </Card>

            {/* Professional */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#E8553E]" />
                  Informații profesionale
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 divide-y divide-gray-100">
                <InfoRow label="Poziție dorită" value={candidate.target_position_name} />
                <InfoRow label="Cod COR" value={candidate.cor_code} />
                <InfoRow label="Nivel calificare" value={candidate.qualification_level} />
                <InfoRow label="Nivel educație" value={candidate.education_level} />
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#E8553E]" />
                  Experiență
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 divide-y divide-gray-100">
                <InfoRow label="Tip candidat" value={candidate.candidate_type} />
                <InfoRow
                  label="Ani experiență"
                  value={
                    candidate.experience_years != null
                      ? `${candidate.experience_years} ani`
                      : undefined
                  }
                />
                {candidate.experience_summary && (
                  <div className="py-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Rezumat experiență
                    </span>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                      {candidate.experience_summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#E8553E]" />
                  Status & completare
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 divide-y divide-gray-100">
                <div className="py-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={candidate.status} />
                  </div>
                </div>
                <InfoRow label="Trimis la" value={formatDate(candidate.submitted_at)} />
                <InfoRow label="Validat la" value={formatDate(candidate.validated_at)} />
                <div className="py-1">
                  <ProgressBar pct={candidate.profile_completion_pct} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#E8553E]" />
                Documente
              </CardTitle>
              <CardDescription>
                {documents?.length
                  ? `${documents.length} document${documents.length !== 1 ? "e" : ""} încărcate`
                  : "Niciun document încărcat"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!documents?.length ? (
                <p className="text-sm text-gray-400 italic">Niciun document disponibil.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left">
                        <th className="pb-2 pr-4 font-medium text-gray-500">Tip document</th>
                        <th className="pb-2 pr-4 font-medium text-gray-500">Status</th>
                        <th className="pb-2 font-medium text-gray-500">Data adăugare</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 pr-4 font-medium text-gray-800">
                            {doc.document_type ?? doc.type ?? "—"}
                          </td>
                          <td className="py-2 pr-4">
                            {doc.status ? (
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${
                                  doc.status === "verified" || doc.status === "approved"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : doc.status === "rejected"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                }`}
                              >
                                {doc.status}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-2 text-gray-500">{formatDate(doc.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#E8553E]" />
                Plasamente
              </CardTitle>
              <CardDescription>
                {placements?.length
                  ? `${placements.length} plasament${placements.length !== 1 ? "e" : ""}`
                  : "Niciun plasament"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!placements?.length ? (
                <p className="text-sm text-gray-400 italic">Niciun plasament disponibil.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left">
                        <th className="pb-2 pr-4 font-medium text-gray-500">Companie</th>
                        <th className="pb-2 pr-4 font-medium text-gray-500">Poziție</th>
                        <th className="pb-2 pr-4 font-medium text-gray-500">Etapă</th>
                        <th className="pb-2 font-medium text-gray-500">Potrivire</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {placements.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-2 pr-4 font-medium text-gray-800">
                            {p.company ?? "—"}
                          </td>
                          <td className="py-2 pr-4 text-gray-700">{p.position ?? "—"}</td>
                          <td className="py-2 pr-4">
                            {p.stage ? (
                              <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {p.stage}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-2">
                            {p.match_score != null ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {p.match_score}%
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agency */}
          {agency && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E8553E]" />
                  Agenție
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 divide-y divide-gray-100">
                <InfoRow label="Nume agenție" value={agency.name} />
                <InfoRow label="Țară" value={agency.country} />
                <InfoRow label="Contact" value={agency.contact ?? agency.email ?? agency.phone} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right / action column */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <Card className="border-gray-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Decizie administrator</CardTitle>
                <CardDescription>
                  Schimbați statusul candidatului și adăugați note.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                    Status nou
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((v) => !v)}
                      className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-[#E8553E] transition-colors"
                    >
                      <span className={selectedStatus ? "text-gray-900" : "text-gray-400"}>
                        {selectedStatus ? STATUS_LABELS[selectedStatus] : "Selectați statusul"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
                        {(
                          [
                            { value: "validated", label: "Validează", icon: CheckCircle, color: "text-green-600" },
                            { value: "rejected", label: "Respinge", icon: XCircle, color: "text-red-600" },
                            { value: "suspended", label: "Suspendă", icon: PauseCircle, color: "text-gray-500" },
                            { value: "pending", label: "În așteptare", icon: Clock, color: "text-yellow-600" },
                          ] as const
                        ).map(({ value, label, icon: Icon, color }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setSelectedStatus(value);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              selectedStatus === value ? "bg-gray-50 font-semibold" : ""
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick status buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("validated")}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      selectedStatus === "validated"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Validează
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("rejected")}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      selectedStatus === "rejected"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Respinge
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("suspended")}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      selectedStatus === "suspended"
                        ? "border-gray-500 bg-gray-100 text-gray-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <PauseCircle className="h-4 w-4" />
                    Suspendă
                  </button>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="admin-notes"
                    className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide"
                  >
                    Note (opțional)
                  </label>
                  <textarea
                    id="admin-notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adăugați observații sau motivul deciziei..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8553E] focus:border-[#E8553E] resize-none transition-colors"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSave}
                  disabled={saving || !selectedStatus}
                  className="w-full bg-[#E8553E] hover:bg-[#d14a35] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Se salvează...
                    </>
                  ) : (
                    "Salvează decizia"
                  )}
                </Button>

                {/* Inline feedback */}
                {saveResult && (
                  <div
                    className={`rounded-md px-3 py-2 text-sm font-medium border ${
                      saveResult.ok
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {saveResult.ok ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {saveResult.message}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {saveResult.message}
                      </span>
                    )}
                  </div>
                )}

                {/* Current status reminder */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Status curent</p>
                  <StatusBadge status={candidate.status} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
