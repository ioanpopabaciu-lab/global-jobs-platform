"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, ArrowRight, Loader2, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Placement {
  id: string;
  candidate_name: string;
  employer_name: string;
  job_title: string;
  flux_type: string;
  current_stage: string;
  stage_date?: string;
  match_score?: number;
  created_at: string;
}

interface Detail extends Placement {
  candidate_id: string;
  job_request_id: string;
  notes?: string;
  stage_history?: { stage: string; changed_at: string; notes?: string }[];
}

const STAGES_A = [
  "new_match", "employer_review", "employer_approved", "contract_signed",
  "payment_received", "igi_submitted", "igi_approved", "visa_submitted",
  "visa_approved", "flight_booked", "arrived_ro", "onboarding",
  "active", "completed",
];

const STAGES_B = [
  "new_match", "employer_review", "employer_approved", "interview_scheduled",
  "interview_passed", "contract_signed", "payment_received", "onboarding",
  "active", "completed",
];

const STAGE_LABELS: Record<string, string> = {
  new_match: "Match Nou", employer_review: "Revizuit Angajator",
  employer_approved: "Aprobat Angajator", contract_signed: "Contract Semnat",
  payment_received: "Plată Primită", igi_submitted: "IGI Depus",
  igi_approved: "IGI Aprobat", visa_submitted: "Viză Depusă",
  visa_approved: "Viză Aprobată", flight_booked: "Zbor Rezervat",
  arrived_ro: "Sosit RO", onboarding: "Onboarding",
  interview_scheduled: "Interviu Planificat", interview_passed: "Interviu Trecut",
  active: "Activ", completed: "Finalizat",
};

export default function PlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fluxFilter, setFluxFilter] = useState("all");
  const [selected, setSelected] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stageUpdating, setStageUpdating] = useState(false);
  const [stageDate, setStageDate] = useState("");
  const [stageNotes, setStageNotes] = useState("");
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (fluxFilter !== "all") params.flux = fluxFilter;
      const data = await adminApi.placements(params);
      setPlacements(data.items || data.placements || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, fluxFilter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    setStageDate("");
    setStageNotes("");
    try {
      const d = await adminApi.placement(id);
      setSelected(d);
    } finally { setDetailLoading(false); }
  };

  const advanceStage = async (stage: string) => {
    if (!selected) return;
    setStageUpdating(true);
    try {
      await adminApi.updateStage(selected.id, stage, stageDate || undefined, stageNotes || undefined);
      const updated = await adminApi.placement(selected.id);
      setSelected(updated);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setStageUpdating(false); }
  };

  const totalPages = Math.ceil(total / limit);

  const getNextStage = (detail: Detail) => {
    const stages = detail.flux_type === "A" ? STAGES_A : STAGES_B;
    const idx = stages.indexOf(detail.current_stage);
    return idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : null;
  };

  const getProgress = (detail: Detail) => {
    const stages = detail.flux_type === "A" ? STAGES_A : STAGES_B;
    const idx = stages.indexOf(detail.current_stage);
    return idx >= 0 ? Math.round(((idx + 1) / stages.length) * 100) : 0;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Plasamente</h1>
        <p className="text-gray-500 text-sm">{total} plasamente active</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută candidat, angajator..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={fluxFilter} onValueChange={v => { setFluxFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Flux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate fluxurile</SelectItem>
            <SelectItem value="A">Flux A (Extern)</SelectItem>
            <SelectItem value="B">Flux B (România)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : placements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Niciun plasament găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Candidat</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Angajator</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Job</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Flux</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Etapă</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Progres</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {placements.map(p => {
                  const fakeDetail = { ...p, candidate_id: "", job_request_id: "" } as Detail;
                  const prog = getProgress(fakeDetail);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-navy-900">{p.candidate_name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.employer_name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.job_title}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.flux_type}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-navy-900">
                          {STAGE_LABELS[p.current_stage] || p.current_stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-24">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${prog}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{prog}%</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(p.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
            ) : selected ? (
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-navy-900">{selected.candidate_name}</h2>
                  <p className="text-gray-500 text-sm">{selected.employer_name} · {selected.job_title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Flux {selected.flux_type}</span>
                    {selected.match_score && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Match {Math.round(selected.match_score)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progres</span>
                    <span>{getProgress(selected)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${getProgress(selected)}%` }} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-navy-900">
                    Etapă curentă: {STAGE_LABELS[selected.current_stage] || selected.current_stage}
                    {selected.stage_date && <span className="text-gray-400 font-normal"> · {selected.stage_date}</span>}
                  </p>
                </div>

                {/* Advance stage */}
                {(() => {
                  const next = getNextStage(selected);
                  if (!next) return (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
                      Plasamentul este finalizat.
                    </div>
                  );
                  return (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-green-600" />
                        Avansare la: {STAGE_LABELS[next] || next}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Data etapei (opțional)</label>
                          <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                            value={stageDate}
                            onChange={e => setStageDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Note (opțional)</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                            value={stageNotes}
                            onChange={e => setStageNotes(e.target.value)}
                            placeholder="Observații..."
                          />
                        </div>
                      </div>
                      <Button
                        className="bg-navy-900 hover:bg-navy-800 text-white"
                        size="sm"
                        disabled={stageUpdating}
                        onClick={() => advanceStage(next)}
                      >
                        {stageUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        Avansează la {STAGE_LABELS[next] || next}
                      </Button>
                    </div>
                  );
                })()}

                {/* Stage history */}
                {selected.stage_history && selected.stage_history.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-navy-900 mb-2">Istoricul etapelor</p>
                    <div className="space-y-2">
                      {selected.stage_history.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="font-medium text-navy-900 w-40 flex-shrink-0">{STAGE_LABELS[h.stage] || h.stage}</span>
                          <span className="text-gray-400 text-xs">{new Date(h.changed_at).toLocaleDateString("ro-RO")}</span>
                          {h.notes && <span className="text-gray-500 text-xs">{h.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 text-right">
                  <Link href={`/admin/placements/${selected.id}`} className="inline-flex items-center gap-1 text-sm text-[#E8553E] hover:underline font-medium">
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
