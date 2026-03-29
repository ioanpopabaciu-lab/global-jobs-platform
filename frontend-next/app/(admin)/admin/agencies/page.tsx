"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Loader2, Globe } from "lucide-react";

interface Agency {
  id: string;
  agency_name: string;
  contact_email: string;
  country?: string;
  city?: string;
  profile_status: string;
  is_active: boolean;
  total_candidates_uploaded?: number;
  created_at: string;
}

interface Detail extends Agency {
  legal_form?: string;
  contact_person?: string;
  phone?: string;
  registration_number?: string;
  validation_notes?: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
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
      const data = await adminApi.agencies(params);
      setAgencies(data.items || data.agencies || []);
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
      const d = await adminApi.agency(id);
      setSelected(d);
    } finally { setDetailLoading(false); }
  };

  const validate = async (status: "validated" | "rejected") => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.validateAgency(selected.id, status, notes || undefined);
      setSelected(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Agenții Partenere</h1>
        <p className="text-gray-500 text-sm">{total} agenții înregistrate</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută agenție, email..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toate statusurile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            <SelectItem value="pending_validation">În Așteptare</SelectItem>
            <SelectItem value="validated">Validat</SelectItem>
            <SelectItem value="rejected">Respins</SelectItem>
            <SelectItem value="suspended">Suspendat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Nicio agenție găsită.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Agenție</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Țară</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Candidați</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agencies.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-navy-900 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />{a.agency_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.contact_email}</td>
                    <td className="px-4 py-3 text-gray-600">{[a.city, a.country].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.total_candidates_uploaded ?? 0}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.profile_status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(a.id)}>
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

      {(detailLoading || selected) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
            ) : selected ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{selected.agency_name}</h2>
                    <p className="text-gray-500 text-sm">{selected.contact_email}</p>
                  </div>
                  <StatusBadge status={selected.profile_status} />
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                  {[
                    ["Formă juridică", selected.legal_form],
                    ["Persoană contact", selected.contact_person],
                    ["Telefon", selected.phone],
                    ["Țară / Oraș", [selected.city, selected.country].filter(Boolean).join(", ")],
                    ["Nr. înregistrare", selected.registration_number],
                    ["Candidați încărcați", selected.total_candidates_uploaded],
                  ].map(([label, value]) => value !== undefined && value !== null ? (
                    <div key={String(label)}>
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-medium text-navy-900">{String(value)}</dd>
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
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={actionLoading} onClick={() => validate("validated")}>
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}Validează
                      </Button>
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={actionLoading} onClick={() => validate("rejected")}>
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}Respinge
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-right">
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
