"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Loader2, ToggleLeft, ToggleRight, UserCog } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  employer: "Angajator",
  candidate: "Candidat",
  agency: "Agenție",
  migration_client: "Client Migrație",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  employer: "bg-blue-100 text-blue-700",
  candidate: "bg-green-100 text-green-700",
  agency: "bg-purple-100 text-purple-700",
  migration_client: "bg-orange-100 text-orange-700",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toggling, setToggling] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(limit) };
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      const data = await adminApi.users(params);
      setUsers(data.items || data.users || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (u: User) => {
    setToggling(u.id);
    try {
      await adminApi.toggleUserStatus(u.id, !u.is_active);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
    } catch (e: any) { alert(e.message); }
    finally { setToggling(null); }
  };

  const changeRole = async (u: User, role: string) => {
    if (u.role === role) return;
    if (!confirm(`Schimbi rolul lui ${u.name} din ${ROLE_LABELS[u.role] || u.role} în ${ROLE_LABELS[role] || role}?`)) return;
    setChangingRole(u.id);
    try {
      await adminApi.changeUserRole(u.id, role);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role } : x));
    } catch (e: any) { alert(e.message); }
    finally { setChangingRole(null); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Utilizatori</h1>
        <p className="text-gray-500 text-sm">{total} utilizatori înregistrați</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Caută după nume, email..." className="pl-9" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate rolurile</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="employer">Angajator</SelectItem>
            <SelectItem value="candidate">Candidat</SelectItem>
            <SelectItem value="agency">Agenție</SelectItem>
            <SelectItem value="migration_client">Client Migrație</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Niciun utilizator găsit.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Utilizator</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Înregistrat</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ultima autentificare</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        onValueChange={role => changeRole(u, role)}
                        disabled={changingRole === u.id || u.role === "admin"}
                      >
                        <SelectTrigger className={`h-7 text-xs w-40 ${ROLE_COLORS[u.role] || ""} border-0 font-medium`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.is_active ? "text-green-600" : "text-gray-400"}`}>
                        {u.is_active ? "Activ" : "Inactiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString("ro-RO")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString("ro-RO") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={toggling === u.id || u.role === "admin"}
                        onClick={() => toggleStatus(u)}
                        title={u.is_active ? "Dezactivează" : "Activează"}
                      >
                        {toggling === u.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : u.is_active ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
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
    </div>
  );
}
