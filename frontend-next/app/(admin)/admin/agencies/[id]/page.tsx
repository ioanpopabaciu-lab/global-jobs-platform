"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

// ─── Auth helper ────────────────────────────────────────────────────────────
const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface Agency {
  id: string;
  agency_name: string;
  agency_type: string;
  country: string;
  city: string;
  contact_person_name: string;
  commission_rate: number;
  license_number: string;
  license_expiry: string;
  status: string;
  validated_at?: string;
  rejection_reason?: string;
  total_candidates_uploaded: number;
  total_placements: number;
  success_rate: number;
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  candidate_type: string;
  origin_country: string;
  target_position_name: string;
  status: string;
  created_at: string;
}

interface AgencyDocument {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
}

interface AgencyDetailData {
  agency: Agency;
  candidates: Candidate[];
  documents: AgencyDocument[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ro-RO");
}

function SuccessRateBadge({ rate }: { rate: number }) {
  const pct = Math.round(rate);
  const cls =
    pct >= 60
      ? "bg-green-100 text-green-700"
      : pct >= 30
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {pct}%
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<AgencyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // action panel state
  const [actionStatus, setActionStatus] = useState<
    "validated" | "rejected" | "suspended"
  >("validated");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/agencies/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Eroare ${res.status}`);
      }
      const json: AgencyDetailData = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/agencies/${id}/validate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: actionStatus, notes: notes || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Eroare ${res.status}`);
      }
      setSaveMsg("Salvat cu succes.");
      await load();
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#E8553E]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/agencies")}
          className="text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Înapoi la Agenții
        </Button>
        <p className="text-red-600 font-medium">{error ?? "Date indisponibile."}</p>
      </div>
    );
  }

  const { agency, candidates, documents } = data;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/agencies")}
        className="text-gray-600 hover:text-gray-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Înapoi la Agenții
      </Button>

      {/* Title */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-[#0a1628]">{agency.agency_name}</h1>
        <StatusBadge status={agency.status} />
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agenție */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Agenție
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Nume" value={agency.agency_name} />
            <Row label="Tip" value={agency.agency_type} />
            <Row label="Nr. licență" value={agency.license_number} />
            <Row label="Exp. licență" value={fmt(agency.license_expiry)} />
            <Row
              label="Comision"
              value={`${agency.commission_rate != null ? agency.commission_rate : "—"}%`}
            />
          </CardContent>
        </Card>

        {/* Locație & Contact */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Locație & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Țară" value={agency.country} />
            <Row label="Oraș" value={agency.city} />
            <Row label="Persoană contact" value={agency.contact_person_name} />
          </CardContent>
        </Card>

        {/* Performanță */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Performanță
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Candidați încărcați"
              value={String(agency.total_candidates_uploaded ?? 0)}
            />
            <Row
              label="Plasamente"
              value={String(agency.total_placements ?? 0)}
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Rată succes</span>
              <SuccessRateBadge rate={agency.success_rate ?? 0} />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status curent</span>
              <StatusBadge status={agency.status} />
            </div>
            {agency.validated_at && (
              <Row label="Validat la" value={fmt(agency.validated_at)} />
            )}
            {agency.rejection_reason && (
              <div className="space-y-0.5">
                <span className="text-gray-500 block">Motiv respingere</span>
                <p className="text-gray-800">{agency.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidați */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#0a1628]">
            Candidați ({candidates.length})
          </CardTitle>
          <CardDescription>Click pe un rând pentru detalii candidat</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {candidates.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Niciun candidat înregistrat.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 pr-4 font-medium">Nume</th>
                  <th className="text-left py-2 pr-4 font-medium">Tip</th>
                  <th className="text-left py-2 pr-4 font-medium">Țară origine</th>
                  <th className="text-left py-2 pr-4 font-medium">Poziție</th>
                  <th className="text-left py-2 pr-4 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Adăugat</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/candidates/${c.id}`)}
                  >
                    <td className="py-2 pr-4 font-medium text-[#0a1628]">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">{c.candidate_type}</td>
                    <td className="py-2 pr-4 text-gray-700">{c.origin_country}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      {c.target_position_name || "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2 text-gray-500">{fmt(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Documente */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#0a1628]">
            Documente ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Niciun document încărcat.</p>
          ) : (
            <ul className="divide-y">
              {documents.map((doc) => (
                <li key={doc.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-800">{doc.document_type}</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status} />
                    <span className="text-gray-400">{fmt(doc.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Action panel */}
      <Card className="border-[#E8553E]/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#0a1628]">
            Acțiuni
          </CardTitle>
          <CardDescription>Schimbă statusul agenției și adaugă note</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status buttons */}
          <div className="flex gap-2 flex-wrap">
            {(
              [
                { value: "validated", label: "Validează", cls: "bg-green-600 hover:bg-green-700" },
                { value: "rejected", label: "Respinge", cls: "bg-red-600 hover:bg-red-700" },
                { value: "suspended", label: "Suspendă", cls: "bg-orange-500 hover:bg-orange-600" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActionStatus(opt.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${opt.cls} ${
                  actionStatus === opt.value
                    ? "ring-2 ring-offset-2 ring-gray-400"
                    : "opacity-70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="agency-notes">
              Note (opțional)
            </label>
            <textarea
              id="agency-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adaugă o notă internă..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E] resize-none"
            />
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#E8553E] hover:bg-[#d44a34] text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvează
            </Button>
            {saveMsg && (
              <span
                className={`text-sm ${
                  saveMsg.startsWith("Salvat") ? "text-green-600" : "text-red-600"
                }`}
              >
                {saveMsg}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 text-right">{value ?? "—"}</span>
    </div>
  );
}
