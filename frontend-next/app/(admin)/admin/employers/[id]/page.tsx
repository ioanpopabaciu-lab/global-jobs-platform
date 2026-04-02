"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  Briefcase,
  FileText,
  CheckSquare,
  Save,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------
const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Employer {
  id: string;
  company_name: string;
  cui?: string;
  legal_form?: string;
  category?: "A" | "B" | string;
  activity_domain?: string;
  city?: string;
  county?: string;
  country?: string;
  total_employees?: number;
  has_non_eu_workers?: boolean;
  status: string;
  submitted_at?: string;
  validated_at?: string;
  // IGI criteria
  igi_no_debts?: boolean;
  igi_no_sanctions?: boolean;
  igi_min_2_employees?: boolean;
  igi_over_1_year?: boolean;
  // nested user
  user?: { email?: string };
}

interface Job {
  id: string;
  position_title?: string;
  cor_code?: string;
  category?: string;
  positions_count?: number;
  positions_filled?: number;
  status?: string;
}

interface Document {
  id: string;
  document_type?: string;
  status?: string;
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUS_LABELS: Record<string, string> = {
  pending: "În așteptare",
  validated: "Validat",
  rejected: "Respins",
  suspended: "Suspendat",
  draft: "Ciornă",
  active: "Activ",
  filled: "Completat",
  approved: "Aprobat",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  validated: "bg-green-100 text-green-800 border-green-200",
  active: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  filled: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusLabel = (s?: string) =>
  s ? (STATUS_LABELS[s] ?? s) : "—";

const statusColor = (s?: string) =>
  s ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600 border-gray-200") : "";

const formatDate = (iso?: string) => {
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
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AdminEmployerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Data
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // IGI state
  const [igiNoDebts, setIgiNoDebts] = useState(false);
  const [igiNoSanctions, setIgiNoSanctions] = useState(false);
  const [igiMin2Employees, setIgiMin2Employees] = useState(false);
  const [igiOver1Year, setIgiOver1Year] = useState(false);
  const [igiSaving, setIgiSaving] = useState(false);
  const [igiSuccess, setIgiSuccess] = useState(false);
  const [igiError, setIgiError] = useState<string | null>(null);

  // Validate action state
  const [actionStatus, setActionStatus] = useState<
    "validated" | "rejected" | "suspended" | ""
  >("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Load data
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/employers/${id}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail ?? `Eroare ${res.status}`);
        }
        const data = await res.json();
        const emp: Employer = data.employer ?? data;
        setEmployer(emp);
        setJobs(data.jobs ?? []);
        setDocuments(data.documents ?? []);
        // Seed IGI checkboxes
        setIgiNoDebts(!!emp.igi_no_debts);
        setIgiNoSanctions(!!emp.igi_no_sanctions);
        setIgiMin2Employees(!!emp.igi_min_2_employees);
        setIgiOver1Year(!!emp.igi_over_1_year);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Eroare la încărcare");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // -------------------------------------------------------------------------
  // Save IGI
  // -------------------------------------------------------------------------
  const saveIgi = async () => {
    setIgiSaving(true);
    setIgiSuccess(false);
    setIgiError(null);
    try {
      const res = await fetch(`/api/admin/employers/${id}/igi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          no_debts: igiNoDebts,
          no_sanctions: igiNoSanctions,
          min_2_employees: igiMin2Employees,
          over_1_year: igiOver1Year,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Eroare ${res.status}`);
      }
      setIgiSuccess(true);
      setTimeout(() => setIgiSuccess(false), 3000);
    } catch (err: unknown) {
      setIgiError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setIgiSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Save validation action
  // -------------------------------------------------------------------------
  const saveAction = async () => {
    if (!actionStatus) {
      setActionError("Selectează o acțiune mai întâi.");
      return;
    }
    setActionSaving(true);
    setActionSuccess(false);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/employers/${id}/validate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status: actionStatus,
          notes: actionNotes || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Eroare ${res.status}`);
      }
      // Update local employer status
      setEmployer((prev) =>
        prev ? { ...prev, status: actionStatus } : prev
      );
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 3000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Eroare la salvare");
    } finally {
      setActionSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-[#E8553E]" />
          <span className="text-sm font-medium">Se încarcă datele angajatorului…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-slate-700 font-medium">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/employers")}
          >
            ← Înapoi la Angajatori
          </Button>
        </div>
      </div>
    );
  }

  if (!employer) return null;

  // -------------------------------------------------------------------------
  // Full render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ── Top bar ── */}
      <div className="bg-[#0f1f3d] text-white px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-[#E8553E] hover:bg-white/10 gap-1.5 -ml-2"
          onClick={() => router.push("/admin/employers")}
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Angajatori
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Title row ── */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0f1f3d]">
            {employer.company_name || "—"}
          </h1>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${statusColor(
              employer.status
            )}`}
          >
            {statusLabel(employer.status)}
          </span>
        </div>

        {/* ── Info grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Companie */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#0f1f3d] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#E8553E]" />
                Companie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-slate-700">
              <Row label="Denumire" value={employer.company_name} />
              <Row label="CUI" value={employer.cui} />
              <Row label="Formă juridică" value={employer.legal_form} />
              <Row label="Categorie" value={employer.category} />
              <Row label="Domeniu activitate" value={employer.activity_domain} />
            </CardContent>
          </Card>

          {/* Card 2: Locație */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#0f1f3d] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#E8553E]" />
                Locație
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-slate-700">
              <Row label="Oraș" value={employer.city} />
              <Row label="Județ" value={employer.county} />
              <Row label="Țară" value={employer.country} />
            </CardContent>
          </Card>

          {/* Card 3: Contact */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#0f1f3d] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#E8553E]" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-slate-700">
              <Row label="Email" value={employer.user?.email} />
              <Row
                label="Nr. angajați"
                value={
                  employer.total_employees != null
                    ? String(employer.total_employees)
                    : undefined
                }
              />
              <Row
                label="Angajați non-UE"
                value={
                  employer.has_non_eu_workers != null
                    ? employer.has_non_eu_workers
                      ? "Da"
                      : "Nu"
                    : undefined
                }
              />
            </CardContent>
          </Card>

          {/* Card 4: Status */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#0f1f3d] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#E8553E]" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-slate-700">
              <Row label="Status" value={statusLabel(employer.status)} />
              <Row label="Depus la" value={formatDate(employer.submitted_at)} />
              <Row label="Validat la" value={formatDate(employer.validated_at)} />
            </CardContent>
          </Card>
        </div>

        {/* ── IGI criteria ── */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0f1f3d] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#E8553E]" />
              Criterii IGI
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Bifează criteriile îndeplinite de angajator, apoi salvează.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CheckboxRow
                id="igi_no_debts"
                label="Fără datorii la stat"
                checked={igiNoDebts}
                onChange={setIgiNoDebts}
              />
              <CheckboxRow
                id="igi_no_sanctions"
                label="Fără sancțiuni"
                checked={igiNoSanctions}
                onChange={setIgiNoSanctions}
              />
              <CheckboxRow
                id="igi_min_2"
                label="Minim 2 angajați"
                checked={igiMin2Employees}
                onChange={setIgiMin2Employees}
              />
              <CheckboxRow
                id="igi_over_1"
                label="Activitate peste 1 an"
                checked={igiOver1Year}
                onChange={setIgiOver1Year}
              />
            </div>

            {igiError && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {igiError}
              </p>
            )}
            {igiSuccess && (
              <p className="text-sm text-green-600 font-medium">
                Criterii IGI salvate cu succes.
              </p>
            )}

            <Button
              onClick={saveIgi}
              disabled={igiSaving}
              className="bg-[#E8553E] hover:bg-[#d44a34] text-white gap-2"
            >
              {igiSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvează criterii IGI
            </Button>
          </CardContent>
        </Card>

        {/* ── Jobs ── */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0f1f3d] flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#E8553E]" />
              Locuri de muncă ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                Nu există locuri de muncă înregistrate.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wide">
                      <Th>Poziție</Th>
                      <Th>Cod COR</Th>
                      <Th>Categorie</Th>
                      <Th>Posturi</Th>
                      <Th>Ocupate</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <Td>{job.position_title ?? "—"}</Td>
                        <Td>{job.cor_code ?? "—"}</Td>
                        <Td>{job.category ?? "—"}</Td>
                        <Td>{job.positions_count ?? "—"}</Td>
                        <Td>{job.positions_filled ?? "—"}</Td>
                        <Td>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(
                              job.status
                            )}`}
                          >
                            {statusLabel(job.status)}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Documents ── */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0f1f3d] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#E8553E]" />
              Documente ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-400 italic">
                Nu există documente încărcate.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between py-2.5 gap-4"
                  >
                    <span className="text-sm text-slate-700 flex-1">
                      {doc.document_type ?? "—"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(
                        doc.status
                      )}`}
                    >
                      {statusLabel(doc.status)}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(doc.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Action panel ── */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0f1f3d] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#E8553E]" />
              Acțiuni de validare
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Selectează o acțiune, adaugă note opționale și salvează.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <ActionButton
                label="Validează"
                value="validated"
                active={actionStatus === "validated"}
                activeClass="bg-green-600 hover:bg-green-700 text-white border-green-600"
                inactiveClass="border-green-600 text-green-700 hover:bg-green-50"
                onClick={() =>
                  setActionStatus((prev) =>
                    prev === "validated" ? "" : "validated"
                  )
                }
              />
              <ActionButton
                label="Respinge"
                value="rejected"
                active={actionStatus === "rejected"}
                activeClass="bg-red-600 hover:bg-red-700 text-white border-red-600"
                inactiveClass="border-red-600 text-red-700 hover:bg-red-50"
                onClick={() =>
                  setActionStatus((prev) =>
                    prev === "rejected" ? "" : "rejected"
                  )
                }
              />
              <ActionButton
                label="Suspendă"
                value="suspended"
                active={actionStatus === "suspended"}
                activeClass="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                inactiveClass="border-orange-500 text-orange-600 hover:bg-orange-50"
                onClick={() =>
                  setActionStatus((prev) =>
                    prev === "suspended" ? "" : "suspended"
                  )
                }
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="action_notes"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Note (opțional)
              </label>
              <Textarea
                id="action_notes"
                placeholder="Adaugă o notă sau motiv pentru această acțiune…"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {actionError && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                {actionError}
              </p>
            )}
            {actionSuccess && (
              <p className="text-sm text-green-600 font-medium">
                Acțiunea a fost salvată cu succes.
              </p>
            )}

            <Button
              onClick={saveAction}
              disabled={actionSaving || !actionStatus}
              className="bg-[#0f1f3d] hover:bg-[#1a2f57] text-white gap-2"
            >
              {actionSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvează acțiunea
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-1">
      <span className="text-slate-400 text-xs font-medium shrink-0 w-28 leading-5">
        {label}:
      </span>
      <span className="text-slate-700 leading-5 break-all">{value ?? "—"}</span>
    </div>
  );
}

function CheckboxRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#E8553E] focus:ring-[#E8553E] accent-[#E8553E]"
      />
      {label}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 font-semibold text-left whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2.5 text-slate-700">{children}</td>;
}

function ActionButton({
  label,
  active,
  activeClass,
  inactiveClass,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  activeClass: string;
  inactiveClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#E8553E] ${
        active ? activeClass : inactiveClass
      }`}
    >
      {label}
    </button>
  );
}
