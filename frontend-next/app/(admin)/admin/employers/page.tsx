"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Loader2, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Employer {
  id: string;
  company_name: string;
  cui: string;
  email: string;
  city?: string;
  county?: string;
  employer_category: string;
  profile_status: string;
  igi_registered?: boolean;
  igi_quota_approved?: boolean;
  created_at: string;
}

interface Detail extends Employer {
  legal_form?: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  domain?: string;
  total_employees?: number;
  validation_notes?: string;
}

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
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
      const data = await adminApi.employers(params);
      setEmployers(data.items || data.employers || []);
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
      const d = await adminApi.employer(id);
      setSelected(d);
    } finally { setDetailLoading(false); }
  };

  const validate = async (status: "validated" | "rejected") => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await adminApi.validateEmployer(selected.id, status, notes || undefined);
      setSelected(null);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  const toggleIGI = async (field: "igi_registered" | "igi_quota_approved") => {
    if (!selected) return;
    const newVal = !selected[field];
    try {
      await adminApi.updateIGI(selected.id, { [field]: newVal });
      setSelected(prev => prev ? { ...prev, [field]: newVal } : null);
    } catch (e: any) { alert(e.message); }
  };

  const catLabel: Record<string, string> = {
    A: "Cat. A – Extern", B: "Cat. B – România", AB: "Cat. AB – Ambele",
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Angajatori</h1>
        <p className="text-gray-500 text-sm">{total} angajatori înregistrați</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută companie, CUI..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : employers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Niciun angajator găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Companie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">CUI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Categorie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Localitate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">IGI</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employers.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-navy-900">{e.company_name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{e.cui}</td>
                    <td className="px-4 py-3 text-gray-600">{catLabel[e.employer_category] || e.employer_category}</td>
                    <td className="px-4 py-3 text-gray-600">{[e.city, e.county].filter(Boolean).join(", ") || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={e.profile_status} /></td>
                    <td className="px-4 py-3">
                      {(e.igi_registered || e.igi_quota_approved) && (
                        <span title="IGI" className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                          <Shield className="h-3.5 w-3.5" />
                          {e.igi_registered && "Reg."} {e.igi_quota_approved && "Cotă"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetail(e.id)}>
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
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{selected.company_name}</h2>
                    <p className="text-gray-500 text-sm">CUI: {selected.cui} · {selected.email}</p>
                  </div>
                  <StatusBadge status={selected.profile_status} />
                </div>

                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                  {[
                    ["Categorie", catLabel[selected.employer_category] || selected.employer_category],
                    ["Formă juridică", selected.legal_form],
                    ["Adresă", selected.address],
                    ["Localitate", [selected.city, selected.county].filter(Boolean).join(", ")],
                    ["Persoană contact", selected.contact_person],
                    ["Telefon", selected.phone],
                    ["Domeniu", selected.domain],
                    ["Nr. angajați", selected.total_employees],
                  ].map(([label, value]) => value ? (
                    <div key={String(label)}>
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-medium text-navy-900">{value}</dd>
                    </div>
                  ) : null)}
                </dl>

                {/* IGI */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-semibold text-blue-800 mb-3">Eligibilitate IGI</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selected.igi_registered}
                        onChange={() => toggleIGI("igi_registered")}
                        className="rounded"
                      />
                      <span className="text-sm text-blue-700">Înregistrat IGI</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!selected.igi_quota_approved}
                        onChange={() => toggleIGI("igi_quota_approved")}
                        className="rounded"
                      />
                      <span className="text-sm text-blue-700">Cotă aprobată</span>
                    </label>
                  </div>
                </div>

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
                  <Link href={`/admin/employers/${selected.id}`} className="inline-flex items-center gap-1 text-sm text-[#E8553E] hover:underline font-medium">
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
