"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  nationality?: string;
  candidate_type: string;
  profile_status: string;
  current_employer_name?: string;
  months_with_current_employer?: number;
  employer_change_warning?: boolean;
  created_at: string;
}

interface Detail extends Candidate {
  date_of_birth?: string;
  residence_country?: string;
  city?: string;
  qualification_level?: string;
  desired_job_title?: string;
  desired_salary?: number;
  experience_years?: number;
  cor_code?: string;
  validation_notes?: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await adminApi.candidates(params);
      setCandidates(data.items || data.candidates || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    setNotes("");
    try {
      const d = await adminApi.candidate(id);
      setSelected(d);
    } finally {
      setDetailLoading(false);
    }
  };

  const validate = async (status: "validated" | "rejected") => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.validateCandidate(selected.id, status, notes || undefined);
      setSelected(null);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const typeLabel: Record<string, string> = {
    type_1: "Tip 1 – Extern",
    type_2: "Tip 2 – RO full",
    type_3: "Tip 3 – RO part",
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Candidați</h1>
        <p className="text-gray-500 text-sm">{total} candidați înregistrați</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Caută după nume, email..."
            className="pl-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toate statusurile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            <SelectItem value="draft">Schiță</SelectItem>
            <SelectItem value="pending_validation">În Așteptare</SelectItem>
            <SelectItem value="validated">Validat</SelectItem>
            <SelectItem value="rejected">Respins</SelectItem>
            <SelectItem value="suspended">Suspendat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Niciun candidat găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nume</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Naționalitate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Alertă</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-navy-900">{c.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{typeLabel[c.candidate_type] || c.candidate_type}</td>
                    <td className="px-4 py-3 text-gray-600">{c.nationality || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.profile_status} /></td>
                    <td className="px-4 py-3">
                      {c.employer_change_warning && (
                        <span title="Angajator <1 an" className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                          <AlertTriangle className="h-4 w-4" /> &lt;1 an
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(c.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Pagina {page} din {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {(detailLoading || selected) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : selected ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{selected.full_name}</h2>
                    <p className="text-gray-500 text-sm">{selected.email}</p>
                  </div>
                  <StatusBadge status={selected.profile_status} />
                </div>

                {selected.employer_change_warning && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Atenție: schimbare angajator</p>
                      <p className="text-xs text-orange-700">
                        Candidatul are doar {selected.months_with_current_employer} luni la {selected.current_employer_name}. Sub 12 luni — verificați acordul angajatorului.
                      </p>
                    </div>
                  </div>
                )}

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                  {[
                    ["Tip", typeLabel[selected.candidate_type] || selected.candidate_type],
                    ["Naționalitate", selected.nationality],
                    ["Țara de reședință", selected.residence_country],
                    ["Oraș", selected.city],
                    ["Data nașterii", selected.date_of_birth],
                    ["Calificare", selected.qualification_level],
                    ["Job dorit", selected.desired_job_title],
                    ["Cod COR", selected.cor_code],
                    ["Experiență (ani)", selected.experience_years],
                    ["Salariu dorit", selected.desired_salary ? `${selected.desired_salary} EUR` : null],
                  ].map(([label, value]) => value ? (
                    <div key={String(label)}>
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-medium text-navy-900">{value}</dd>
                    </div>
                  ) : null)}
                </dl>

                {selected.validation_notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    <strong>Note anterioare:</strong> {selected.validation_notes}
                  </div>
                )}

                {selected.profile_status === "pending_validation" && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note (opțional)</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Motivul validării / respingerii..."
                    />
                    <div className="flex gap-3 mt-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={actionLoading}
                        onClick={() => validate("validated")}
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Validează
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        disabled={actionLoading}
                        onClick={() => validate("rejected")}
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                        Respinge
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/admin/candidates/${selected.id}`} className="inline-flex items-center gap-1 text-sm text-[#E8553E] hover:underline font-medium">
                    <ExternalLink className="h-4 w-4" /> Detalii complete
                  </Link>
                  <Button variant="outline" onClick={() => setSelected(null)}>Închide</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
