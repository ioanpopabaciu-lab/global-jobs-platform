"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Briefcase, Loader2, X, CheckCircle2, AlertCircle, Users } from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Ciornă", color: "bg-gray-100 text-gray-700" },
  open: { label: "Activă", color: "bg-green-100 text-green-700" },
  filled: { label: "Completată", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Anulată", color: "bg-red-100 text-red-700" },
  on_hold: { label: "Suspendată", color: "bg-amber-100 text-amber-700" },
};

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    position_title: "",
    cor_code: "",
    positions_count: "1",
    category: "A",
    min_experience_years_total: "0",
    salary_gross: "",
    salary_currency: "RON",
    contract_type: "full_time",
    contract_duration_months: "",
    accommodation_provided: false,
    meals_provided: false,
    transport_provided: false,
    works_in_shifts: false,
    works_at_height: false,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/employer/jobs`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = { ...form };
      payload.positions_count = parseInt(payload.positions_count) || 1;
      payload.min_experience_years_total = parseInt(payload.min_experience_years_total) || 0;
      if (payload.salary_gross) payload.salary_gross = parseFloat(payload.salary_gross);
      if (payload.contract_duration_months) payload.contract_duration_months = parseInt(payload.contract_duration_months);

      const res = await fetch(`${API_URL}/portal/employer/jobs`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Cererea de recrutare a fost creată!" });
        setShowForm(false);
        setForm({
          position_title: "", cor_code: "", positions_count: "1", category: "A",
          min_experience_years_total: "0", salary_gross: "", salary_currency: "RON",
          contract_type: "full_time", contract_duration_months: "",
          accommodation_provided: false, meals_provided: false, transport_provided: false,
          works_in_shifts: false, works_at_height: false,
        });
        loadJobs();
      } else {
        setMessage({ type: "error", text: data.detail || "Eroare la creare." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Eroare de conexiune." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/portal/employer">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Cereri de Recrutare</h1>
            <p className="text-gray-500 text-sm">{jobs.length} cereri total</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-coral hover:bg-coral/90">
          <Plus className="h-4 w-4 mr-2" />
          Cerere Nouă
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
        </div>
      )}

      {/* Form creare cerere */}
      {showForm && (
        <Card className="mb-6 border-2 border-coral">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cerere Nouă de Recrutare</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Titlu Poziție *</Label>
              <Input value={form.position_title} onChange={e => setForm(f => ({ ...f, position_title: e.target.value }))}
                placeholder="ex: Sudor, Operator CNC, Bucătar..." />
            </div>
            <div>
              <Label>Cod COR</Label>
              <Input value={form.cor_code} onChange={e => setForm(f => ({ ...f, cor_code: e.target.value }))}
                placeholder="722101" />
            </div>
            <div>
              <Label>Nr. Posturi *</Label>
              <Input type="number" min="1" value={form.positions_count}
                onChange={e => setForm(f => ({ ...f, positions_count: e.target.value }))} />
            </div>
            <div>
              <Label>Categorie *</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="A">A – Recrutare Internațională</option>
                <option value="B">B – Recrutare Locală</option>
              </select>
            </div>
            <div>
              <Label>Ani Experiență Minimă</Label>
              <Input type="number" min="0" value={form.min_experience_years_total}
                onChange={e => setForm(f => ({ ...f, min_experience_years_total: e.target.value }))} />
            </div>
            <div>
              <Label>Salariu Brut (RON)</Label>
              <Input type="number" value={form.salary_gross}
                onChange={e => setForm(f => ({ ...f, salary_gross: e.target.value }))}
                placeholder="4000" />
            </div>
            <div>
              <Label>Tip Contract</Label>
              <select value={form.contract_type} onChange={e => setForm(f => ({ ...f, contract_type: e.target.value }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="seasonal">Sezonier</option>
                <option value="project">Proiect</option>
              </select>
            </div>
            <div>
              <Label>Durată Contract (luni)</Label>
              <Input type="number" value={form.contract_duration_months}
                onChange={e => setForm(f => ({ ...f, contract_duration_months: e.target.value }))}
                placeholder="12" />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Facilități Oferite</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: "accommodation_provided", label: "Cazare" },
                  { key: "meals_provided", label: "Masă" },
                  { key: "transport_provided", label: "Transport" },
                  { key: "works_in_shifts", label: "Schimburi" },
                  { key: "works_at_height", label: "La înălțime" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <Button onClick={handleCreate} disabled={saving} className="bg-coral hover:bg-coral/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Creează Cererea
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Anulează</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista cereri */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nu aveți cereri de recrutare încă.</p>
            <p className="text-sm text-gray-400">Profilul companiei trebuie validat înainte de a posta cereri.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-coral hover:bg-coral/90">
              <Plus className="h-4 w-4 mr-2" />
              Adaugă Prima Cerere
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const st = STATUS_LABELS[job.status] || { label: job.status, color: "bg-gray-100 text-gray-700" };
            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-navy-900">{job.position_title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Cat. {job.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {job.cor_code && <span>COR: {job.cor_code}</span>}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.positions_filled || 0}/{job.positions_count} posturi
                        </span>
                        {job.salary_gross && (
                          <span>{job.salary_gross} {job.salary_currency || "RON"}/lună</span>
                        )}
                        {job.contract_type && <span>{job.contract_type.replace("_", " ")}</span>}
                        {job.placements_count > 0 && (
                          <span className="text-coral font-medium">{job.placements_count} plasamente</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(job.created_at).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
