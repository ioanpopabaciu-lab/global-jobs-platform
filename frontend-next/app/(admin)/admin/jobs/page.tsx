"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, Loader2, Zap, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  employer_name: string;
  city?: string;
  county?: string;
  workers_needed: number;
  contract_type: string;
  job_status: string;
  flux_type: string;
  created_at: string;
}

interface Detail extends Job {
  cor_code?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  required_experience_years?: number;
  nationality_preference?: string[];
  driving_license_required?: boolean;
  accommodation_provided?: boolean;
  meal_provided?: boolean;
}

interface MatchCandidate {
  candidate_id: string;
  full_name: string;
  nationality: string;
  experience_years: number;
  match_score: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await adminApi.jobs(params);
      setJobs(data.items || data.jobs || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    setMatches([]);
    try {
      const d = await adminApi.job(id);
      setSelected(d);
    } finally { setDetailLoading(false); }
  };

  const runMatching = async () => {
    if (!selected) return;
    setMatchLoading(true);
    try {
      const data = await adminApi.matchingCandidates(selected.id);
      setMatches(data.candidates || data.matches || []);
    } catch (e: any) { alert(e.message); }
    finally { setMatchLoading(false); }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setStatusUpdating(true);
    try {
      await adminApi.updateJobStatus(selected.id, status);
      setSelected(prev => prev ? { ...prev, job_status: status } : null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setStatusUpdating(false); }
  };

  const totalPages = Math.ceil(total / limit);

  const fluxLabel: Record<string, string> = { A: "Flux A (14 etape)", B: "Flux B (10 etape)" };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Cereri de Recrutare</h1>
        <p className="text-gray-500 text-sm">{total} cereri înregistrate</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută job, angajator..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="open">Deschis</SelectItem>
            <SelectItem value="in_progress">În Lucru</SelectItem>
            <SelectItem value="filled">Ocupat</SelectItem>
            <SelectItem value="paused">Pauză</SelectItem>
            <SelectItem value="cancelled">Anulat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nicio cerere găsită.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Titlu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Angajator</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Localitate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Flux</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Necesari</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-navy-900">{j.title}</td>
                    <td className="px-4 py-3 text-gray-600">{j.employer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{[j.city, j.county].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{j.flux_type}</td>
                    <td className="px-4 py-3 text-gray-600">{j.workers_needed}</td>
                    <td className="px-4 py-3"><StatusBadge status={j.job_status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(j.id)}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Pagina {page} din {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {(detailLoading || selected) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setSelected(null); setMatches([]); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
            ) : selected ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{selected.title}</h2>
                    <p className="text-gray-500 text-sm">{selected.employer_name} · {fluxLabel[selected.flux_type] || selected.flux_type}</p>
                  </div>
                  <StatusBadge status={selected.job_status} />
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                  {[
                    ["Cod COR", selected.cor_code],
                    ["Muncitori necesari", selected.workers_needed],
                    ["Tip contract", selected.contract_type],
                    ["Localitate", [selected.city, selected.county].filter(Boolean).join(", ")],
                    ["Salariu", selected.salary_min && selected.salary_max ? `${selected.salary_min}–${selected.salary_max} EUR` : null],
                    ["Experiență (ani)", selected.required_experience_years],
                    ["Permis auto", selected.driving_license_required ? "Da" : null],
                    ["Cazare", selected.accommodation_provided ? "Asigurată" : null],
                    ["Masă", selected.meal_provided ? "Asigurată" : null],
                    ["Naționalități preferate", selected.nationality_preference?.join(", ")],
                  ].map(([label, value]) => value ? (
                    <div key={String(label)}>
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-medium text-navy-900">{value}</dd>
                    </div>
                  ) : null)}
                </dl>

                {selected.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">{selected.description}</div>
                )}

                {/* Status control */}
                <div className="flex flex-wrap gap-2 mb-4 border-t pt-4">
                  {["open", "in_progress", "paused", "filled", "cancelled"].map(s => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.job_status === s ? "default" : "outline"}
                      disabled={statusUpdating}
                      onClick={() => updateStatus(s)}
                      className={selected.job_status === s ? "bg-navy-900 text-white" : ""}
                    >
                      {s === "open" ? "Deschis" : s === "in_progress" ? "În Lucru" : s === "paused" ? "Pauză" : s === "filled" ? "Ocupat" : "Anulat"}
                    </Button>
                  ))}
                </div>

                {/* AI Matching */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-navy-900 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" /> Matching Automat AI
                    </p>
                    <Button size="sm" onClick={runMatching} disabled={matchLoading}>
                      {matchLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                      Găsește Candidați
                    </Button>
                  </div>
                  {matches.length > 0 && (
                    <div className="space-y-2">
                      {matches.map(m => (
                        <div key={m.candidate_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                          <div>
                            <p className="font-medium text-navy-900">{m.full_name}</p>
                            <p className="text-gray-500 text-xs">{m.nationality} · {m.experience_years} ani exp.</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {Math.round(m.match_score)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-right">
                  <Link href={`/admin/jobs/${selected.id}`} className="inline-flex items-center gap-1 text-sm text-[#E8553E] hover:underline font-medium">
                    <ExternalLink className="h-4 w-4" /> Detalii complete
                  </Link>
                  <Button variant="outline" onClick={() => { setSelected(null); setMatches([]); }}>Închide</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
