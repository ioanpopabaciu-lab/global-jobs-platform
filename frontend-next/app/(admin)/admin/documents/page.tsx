"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Loader2, AlertTriangle, ExternalLink } from "lucide-react";

interface Document {
  id: string;
  owner_name: string;
  owner_type: string;
  document_type: string;
  file_name?: string;
  file_url?: string;
  status: string;
  expiry_date?: string;
  uploaded_at: string;
  is_expiring_soon?: boolean;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: "Pașaport",
  id_card: "Carte de identitate",
  work_permit: "Permis muncă",
  residence_permit: "Permis reședință",
  diploma: "Diplomă",
  certificate: "Certificat",
  contract: "Contract",
  medical: "Medical",
  other: "Altele",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Document | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await adminApi.documents(params);
      setDocs(data.items || data.documents || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const verify = async (status: "verified" | "rejected") => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.verifyDocument(selected.id, status, notes || undefined);
      setSelected(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const totalPages = Math.ceil(total / limit);

  const isExpired = (date?: string) => date && new Date(date) < new Date();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Documente</h1>
        <p className="text-gray-500 text-sm">{total} documente înregistrate</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută după nume, tip..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="uploaded">Încărcat</SelectItem>
            <SelectItem value="pending">În Verificare</SelectItem>
            <SelectItem value="verified">Verificat</SelectItem>
            <SelectItem value="rejected">Respins</SelectItem>
            <SelectItem value="expired">Expirat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Niciun document găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Proprietar</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fișier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Expirare</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {docs.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{d.owner_name}</p>
                      <p className="text-xs text-gray-400">{d.owner_type}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{DOC_TYPE_LABELS[d.document_type] || d.document_type}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[140px]">{d.file_name || "—"}</td>
                    <td className="px-4 py-3">
                      {d.expiry_date ? (
                        <span className={`text-xs font-medium ${isExpired(d.expiry_date) ? "text-red-600" : d.is_expiring_soon ? "text-orange-600" : "text-gray-600"}`}>
                          {d.is_expiring_soon && !isExpired(d.expiry_date) && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                          {new Date(d.expiry_date).toLocaleDateString("ro-RO")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(d); setNotes(""); }}>
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
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-navy-900">{DOC_TYPE_LABELS[selected.document_type] || selected.document_type}</h2>
                  <p className="text-gray-500 text-sm">{selected.owner_name} · {selected.owner_type}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                {[
                  ["Fișier", selected.file_name],
                  ["Încărcat la", selected.uploaded_at ? new Date(selected.uploaded_at).toLocaleDateString("ro-RO") : null],
                  ["Expiră la", selected.expiry_date ? new Date(selected.expiry_date).toLocaleDateString("ro-RO") : null],
                ].map(([label, value]) => value ? (
                  <div key={String(label)}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-navy-900">{value}</dd>
                  </div>
                ) : null)}
              </dl>

              {selected.file_url && (
                <div className="mb-4">
                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" /> Deschide fișierul
                  </a>
                </div>
              )}

              {(selected.status === "pending" || selected.status === "uploaded") && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (opțional)</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Motivul verificării / respingerii..."
                  />
                  <div className="flex gap-3 mt-3">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={actionLoading} onClick={() => verify("verified")}>
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}Verifică
                    </Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={actionLoading} onClick={() => verify("rejected")}>
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}Respinge
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-right">
                <Button variant="outline" onClick={() => setSelected(null)}>Închide</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
