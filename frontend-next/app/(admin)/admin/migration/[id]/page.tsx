"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Clock } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

// ─── Auth helper ─────────────────────────────────────────────────────────────
const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface MigrationCase {
  id: string;
  service_type: string;
  status: string;
  result?: string;
  urgency: "standard" | "urgent" | "critical";
  estimated_cost?: number;
  payment_status?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  nationality: string;
  current_location: string;
  requestor_name?: string;
  requestor_phone?: string;
  requestor_relationship?: string;
  admin_notes?: string;
  next_deadline?: string;
  documents_requested?: string;
  final_answer?: string;
  answer_received_at?: string;
  created_at?: string;
}

interface HistoryEntry {
  id: string;
  old_status: string;
  new_status: string;
  notes?: string;
  changed_by_name?: string;
  created_at: string;
}

interface MigrationDocument {
  id: string;
  document_type: string;
  status: string;
  created_at: string;
}

interface MigrationDetailData {
  case: MigrationCase;
  history: HistoryEntry[];
  documents: MigrationDocument[];
}

// ─── Status options ───────────────────────────────────────────────────────────
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "received", label: "Primit" },
  { value: "analyzing", label: "Analizat" },
  { value: "validated", label: "Validat" },
  { value: "documents_requested", label: "Documente solicitate" },
  { value: "documents_received", label: "Documente primite" },
  { value: "in_progress", label: "În lucru" },
  { value: "resolving", label: "Rezolvare" },
  { value: "answer_received", label: "Răspuns primit" },
  { value: "closed", label: "Închis" },
];

// ─── Urgency badge ────────────────────────────────────────────────────────────
const URGENCY_CONFIG: Record<string, { label: string; cls: string }> = {
  standard: { label: "Standard", cls: "bg-gray-100 text-gray-600" },
  urgent:   { label: "Urgent",   cls: "bg-yellow-100 text-yellow-700" },
  critical: { label: "Critic",   cls: "bg-red-100 text-red-700" },
};

function UrgencyBadge({ urgency }: { urgency: string }) {
  const cfg = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.standard;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ro-RO");
}

function fmtFull(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("ro-RO");
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 text-right">{value ?? "—"}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MigrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<MigrationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update panel state
  const [updStatus, setUpdStatus] = useState<string>("");
  const [updNotes, setUpdNotes] = useState("");
  const [updResult, setUpdResult] = useState("");
  const [updDeadline, setUpdDeadline] = useState("");
  const [updDocsReq, setUpdDocsReq] = useState("");
  const [updCost, setUpdCost] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/migration/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Eroare ${res.status}`);
      }
      const json: MigrationDetailData = await res.json();
      setData(json);
      // Pre-fill update panel from loaded data
      setUpdStatus(json.case.status ?? "");
      setUpdNotes(json.case.admin_notes ?? "");
      setUpdResult(json.case.result ?? "");
      setUpdDeadline(
        json.case.next_deadline ? json.case.next_deadline.slice(0, 10) : ""
      );
      setUpdDocsReq(json.case.documents_requested ?? "");
      setUpdCost(
        json.case.estimated_cost != null ? String(json.case.estimated_cost) : ""
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdate = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const body: Record<string, unknown> = { status: updStatus };
      if (updNotes) body.notes = updNotes;
      if (updResult) body.result = updResult;
      if (updDeadline) body.next_deadline = updDeadline;
      if (updDocsReq) body.documents_requested = updDocsReq;
      if (updCost !== "") body.estimated_cost = parseFloat(updCost);

      const res = await fetch(`/api/admin/migration/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.detail || `Eroare ${res.status}`);
      }
      setSaveMsg("Dosar actualizat cu succes.");
      await load();
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────
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
          onClick={() => router.push("/admin/migration")}
          className="text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Înapoi la Dosare Migrație
        </Button>
        <p className="text-red-600 font-medium">{error ?? "Date indisponibile."}</p>
      </div>
    );
  }

  const { case: mc, history, documents } = data;

  // Documents requested as chips
  const docsChips = mc.documents_requested
    ? mc.documents_requested
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/migration")}
        className="text-gray-600 hover:text-gray-900 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Înapoi la Dosare Migrație
      </Button>

      {/* Title */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-[#0a1628]">
          Dosar: {mc.first_name} {mc.last_name}
        </h1>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {mc.service_type}
        </span>
        <UrgencyBadge urgency={mc.urgency} />
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Persoana vizată */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Persoana vizată
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Nume" value={`${mc.first_name} ${mc.last_name}`} />
            <Row label="Telefon" value={mc.phone} />
            <Row label="Email" value={mc.email} />
            <Row label="Naționalitate" value={mc.nationality} />
            <Row label="Locație curentă" value={mc.current_location} />
          </CardContent>
        </Card>

        {/* Solicitant */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Solicitant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {mc.requestor_name ? (
              <>
                <Row label="Nume" value={mc.requestor_name} />
                <Row label="Telefon" value={mc.requestor_phone} />
                <Row label="Relație" value={mc.requestor_relationship} />
              </>
            ) : (
              <p className="text-gray-400 italic">Aceeași persoană</p>
            )}
          </CardContent>
        </Card>

        {/* Serviciu */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Serviciu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Tip serviciu" value={mc.service_type} />
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status</span>
              <StatusBadge status={mc.status} />
            </div>
            {mc.estimated_cost != null && (
              <Row label="Cost estimat" value={`€${mc.estimated_cost}`} />
            )}
            {mc.payment_status && (
              <Row label="Status plată" value={mc.payment_status} />
            )}
            {mc.next_deadline && (
              <Row label="Termen următor" value={fmt(mc.next_deadline)} />
            )}
          </CardContent>
        </Card>

        {/* Răspuns final */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Răspuns final
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {mc.final_answer ? (
              <>
                <p className="text-gray-800 whitespace-pre-wrap">{mc.final_answer}</p>
                {mc.answer_received_at && (
                  <p className="text-gray-400 text-xs">
                    Primit la: {fmtFull(mc.answer_received_at)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400 italic">Niciun răspuns înregistrat.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documente solicitate (chips) */}
      {docsChips.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0a1628]">
              Documente solicitate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {docsChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"
                >
                  {chip}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#0a1628]">
            Istoric modificări
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Niciun istoric disponibil.</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-3 space-y-4">
              {history.map((h) => (
                <li key={h.id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#E8553E]" />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusBadge status={h.old_status} />
                    <span className="text-gray-400">→</span>
                    <StatusBadge status={h.new_status} />
                    <span className="text-gray-400 text-xs ml-auto">
                      {fmtFull(h.created_at)}
                    </span>
                  </div>
                  {h.changed_by_name && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      de: {h.changed_by_name}
                    </p>
                  )}
                  {h.notes && (
                    <p className="text-xs text-gray-700 mt-1 bg-gray-50 rounded p-2">
                      {h.notes}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#0a1628]">
            Documente încărcate ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">Niciun document încărcat.</p>
          ) : (
            <ul className="divide-y">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="py-2 flex items-center justify-between text-sm"
                >
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

      {/* ── Update panel ── */}
      <Card className="border-[#E8553E]/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-[#0a1628]">
            Actualizare dosar
          </CardTitle>
          <CardDescription>
            Modifică statusul, adaugă note și setează termenele
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="mig-status">
              Status
            </label>
            <select
              id="mig-status"
              value={updStatus}
              onChange={(e) => setUpdStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E] bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note interne */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="mig-notes">
              Note interne
            </label>
            <textarea
              id="mig-notes"
              rows={3}
              value={updNotes}
              onChange={(e) => setUpdNotes(e.target.value)}
              placeholder="Note vizibile doar pentru admin..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E] resize-none"
            />
          </div>

          {/* Rezultat / Răspuns final */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="mig-result">
              Rezultat / Răspuns final
            </label>
            <textarea
              id="mig-result"
              rows={3}
              value={updResult}
              onChange={(e) => setUpdResult(e.target.value)}
              placeholder="Descrie rezultatul sau răspunsul oficial..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E] resize-none"
            />
          </div>

          {/* Two-column row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Next deadline */}
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="mig-deadline"
              >
                Termen următor
              </label>
              <input
                id="mig-deadline"
                type="date"
                value={updDeadline}
                onChange={(e) => setUpdDeadline(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E]"
              />
            </div>

            {/* Estimated cost */}
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="mig-cost"
              >
                Cost estimat (€)
              </label>
              <input
                id="mig-cost"
                type="number"
                min="0"
                step="0.01"
                value={updCost}
                onChange={(e) => setUpdCost(e.target.value)}
                placeholder="ex: 250"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E]"
              />
            </div>
          </div>

          {/* Documents requested */}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="mig-docs-req"
            >
              Documente solicitate{" "}
              <span className="text-gray-400 font-normal">(separate prin virgulă)</span>
            </label>
            <textarea
              id="mig-docs-req"
              rows={2}
              value={updDocsReq}
              onChange={(e) => setUpdDocsReq(e.target.value)}
              placeholder="ex: Pașaport, Certificat naștere, Contract muncă"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8553E] resize-none"
            />
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-[#E8553E] hover:bg-[#d44a34] text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Actualizează dosarul
            </Button>
            {saveMsg && (
              <span
                className={`text-sm ${
                  saveMsg.startsWith("Dosar") ? "text-green-600" : "text-red-600"
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
