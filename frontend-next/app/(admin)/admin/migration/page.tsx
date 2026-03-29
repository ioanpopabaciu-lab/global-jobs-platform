"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, ArrowRight, Loader2 } from "lucide-react";

interface MigrationCase {
  id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  case_status: string;
  assigned_to?: string;
  created_at: string;
}

interface Detail extends MigrationCase {
  client_phone?: string;
  client_type?: string;
  description?: string;
  notes?: string;
  result?: string;
  history?: { status: string; changed_at: string; notes?: string }[];
}

const SERVICE_LABELS: Record<string, string> = {
  M1: "M1 – Viză muncă", M2: "M2 – Permis ședere", M3: "M3 – Reînnoire permis",
  M4: "M4 – Reunificare familie", M5: "M5 – Azil / Protecție", M6: "M6 – Cetățenie",
  M7: "M7 – Viză Schengen", M8: "M8 – Apostilă", M9: "M9 – Traduceri", M10: "M10 – Consultanță",
};

const STATUS_FLOW = [
  "received", "analyzing", "validated", "documents_requested",
  "documents_received", "in_progress", "resolving", "answer_received", "closed",
];

const STATUS_LABELS: Record<string, string> = {
  received: "Primit", analyzing: "În Analiză", validated: "Validat",
  documents_requested: "Documente Solicitate", documents_received: "Documente Primite",
  in_progress: "În Procesare", resolving: "În Soluționare",
  answer_received: "Răspuns Primit", closed: "Închis",
};

export default function MigrationPage() {
  const [cases, setCases] = useState<MigrationCase[]>([]);
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
      const data = await adminApi.migrationCases(params);
      setCases(data.items || data.cases || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    setNotes("");
    try {
      const d = await adminApi.migrationCase(id);
      setSelected(d);
    } finally { setDetailLoading(false); }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.updateMigrationStatus(selected.id, status, notes || undefined);
      const updated = await adminApi.migrationCase(selected.id);
      setSelected(updated);
      setNotes("");
      load();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Dosare Migrație</h1>
        <p className="text-gray-500 text-sm">{total} dosare înregistrate</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută client, serviciu..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            {STATUS_FLOW.map(s => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Niciun dosar găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Serviciu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Responsabil</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{c.client_name}</p>
                      <p className="text-xs text-gray-400">{c.client_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{SERVICE_LABELS[c.service_type] || c.service_type}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.case_status} /></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.assigned_to || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(c.created_at).toLocaleDateString("ro-RO")}
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
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{selected.client_name}</h2>
                    <p className="text-gray-500 text-sm">{selected.client_email} {selected.client_phone ? `· ${selected.client_phone}` : ""}</p>
                    <p className="text-sm text-gray-600 mt-1">{SERVICE_LABELS[selected.service_type] || selected.service_type}</p>
                  </div>
                  <StatusBadge status={selected.case_status} />
                </div>

                {selected.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{selected.description}</div>
                )}

                {/* Status pipeline */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-navy-900 mb-3">Flux dosar</p>
                  <div className="flex flex-wrap gap-1">
                    {STATUS_FLOW.map((s, i) => {
                      const currentIdx = STATUS_FLOW.indexOf(selected.case_status);
                      const isPast = i <= currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${isPast ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {STATUS_LABELS[s]}
                          </span>
                          {i < STATUS_FLOW.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Advance */}
                {(() => {
                  const next = getNextStatus(selected.case_status);
                  if (!next) return (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
                      Dosarul este închis.
                    </div>
                  );
                  return (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-navy-900 mb-3">
                        Avansare la: <span className="text-coral">{STATUS_LABELS[next]}</span>
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none mb-3"
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Note pentru această etapă (opțional)..."
                      />
                      <Button
                        className="bg-navy-900 hover:bg-navy-800 text-white"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => updateStatus(next)}
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                        Avansează
                      </Button>
                    </div>
                  );
                })()}

                {/* History */}
                {selected.history && selected.history.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-navy-900 mb-2">Istoricul statusurilor</p>
                    <div className="space-y-2">
                      {selected.history.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                          <div>
                            <span className="font-medium text-navy-900">{STATUS_LABELS[h.status] || h.status}</span>
                            <span className="text-gray-400 text-xs ml-2">{new Date(h.changed_at).toLocaleDateString("ro-RO")}</span>
                            {h.notes && <p className="text-gray-500 text-xs mt-0.5">{h.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 text-right">
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
