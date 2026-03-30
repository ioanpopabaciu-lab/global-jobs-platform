"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Users, Loader2, X, CheckCircle2, AlertCircle, Filter } from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Ciornă", color: "bg-gray-100 text-gray-700" },
  pending_validation: { label: "În Verificare", color: "bg-amber-100 text-amber-700" },
  validated: { label: "Validat", color: "bg-green-100 text-green-700" },
  rejected: { label: "Respins", color: "bg-red-100 text-red-700" },
};

const CANDIDATE_TYPES: Record<string, string> = {
  type1_abroad: "Tip 1 – Aflat în Străinătate",
  type2_in_romania: "Tip 2 – Deja în România",
  type3_part_time: "Tip 3 – Part Time",
};

export default function AgencyCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    candidate_type: "type1_abroad",
    origin_country: "",
    nationality: "",
    date_of_birth: "",
    gender: "male",
    phone: "",
    email: "",
    target_position_name: "",
    cor_code: "",
    qualification_level: "skilled",
    experience_years_origin: "0",
    experience_years_other: "0",
    preferred_salary_fulltime: "",
    has_driving_license: false,
    languages: "",
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/agency/candidates`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = { ...form };
      payload.experience_years_origin = parseInt(payload.experience_years_origin) || 0;
      payload.experience_years_other = parseInt(payload.experience_years_other) || 0;
      if (payload.preferred_salary_fulltime) payload.preferred_salary_fulltime = parseFloat(payload.preferred_salary_fulltime);
      if (payload.languages) payload.languages = payload.languages.split(",").map((l: string) => l.trim()).filter(Boolean);
      else payload.languages = [];

      const res = await fetch(`${API_URL}/portal/agency/candidates`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Candidatul a fost adăugat cu succes!" });
        setShowForm(false);
        resetForm();
        loadCandidates();
      } else {
        setMessage({ type: "error", text: data.detail || "Eroare la adăugare." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Eroare de conexiune." });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "", last_name: "", candidate_type: "type1_abroad",
      origin_country: "", nationality: "", date_of_birth: "",
      gender: "male", phone: "", email: "",
      target_position_name: "", cor_code: "",
      qualification_level: "skilled",
      experience_years_origin: "0", experience_years_other: "0",
      preferred_salary_fulltime: "",
      has_driving_license: false, languages: "",
    });
  };

  const filtered = filter === "all" ? candidates : candidates.filter(c => c.status === filter);

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
          <Link href="/portal/agency">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Candidații Agenției</h1>
            <p className="text-gray-500 text-sm">{candidates.length} candidați înregistrați</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-coral hover:bg-coral/90">
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Candidat
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
          <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
        </div>
      )}

      {/* Formular Adăugare Candidat */}
      {showForm && (
        <Card className="mb-6 border-2 border-coral">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Candidat Nou</CardTitle>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardDescription>Completați datele candidatului. Adminul va valida profilul separat.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Prenume *</Label>
              <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="John" />
            </div>
            <div>
              <Label>Nume *</Label>
              <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Smith" />
            </div>
            <div>
              <Label>Tip Candidat</Label>
              <select value={form.candidate_type} onChange={e => setForm(f => ({ ...f, candidate_type: e.target.value }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="type1_abroad">Tip 1 – Aflat în Străinătate</option>
                <option value="type2_in_romania">Tip 2 – Deja în România</option>
                <option value="type3_part_time">Tip 3 – Part Time</option>
              </select>
            </div>
            <div>
              <Label>Gen</Label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="male">Masculin</option>
                <option value="female">Feminin</option>
              </select>
            </div>
            <div>
              <Label>Țara de Origine *</Label>
              <Input value={form.origin_country} onChange={e => setForm(f => ({ ...f, origin_country: e.target.value }))}
                placeholder="Nepal" />
            </div>
            <div>
              <Label>Naționalitate</Label>
              <Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                placeholder="Nepaleză" />
            </div>
            <div>
              <Label>Data Nașterii</Label>
              <Input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
            </div>
            <div>
              <Label>Telefon / WhatsApp</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+97712345678" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="candidat@email.com" />
            </div>
            <div>
              <Label>Poziție Dorită *</Label>
              <Input value={form.target_position_name} onChange={e => setForm(f => ({ ...f, target_position_name: e.target.value }))}
                placeholder="Sudor, Bucătar..." />
            </div>
            <div>
              <Label>Cod COR</Label>
              <Input value={form.cor_code} onChange={e => setForm(f => ({ ...f, cor_code: e.target.value }))}
                placeholder="722101" />
            </div>
            <div>
              <Label>Nivel Calificare</Label>
              <select value={form.qualification_level} onChange={e => setForm(f => ({ ...f, qualification_level: e.target.value }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="unskilled">Necalificat</option>
                <option value="semi_skilled">Semicalificat</option>
                <option value="skilled">Calificat</option>
                <option value="highly_skilled">Înalt Calificat</option>
              </select>
            </div>
            <div>
              <Label>Ani Experiență (Origine)</Label>
              <Input type="number" min="0" value={form.experience_years_origin}
                onChange={e => setForm(f => ({ ...f, experience_years_origin: e.target.value }))} />
            </div>
            <div>
              <Label>Ani Experiență (Alte Țări)</Label>
              <Input type="number" min="0" value={form.experience_years_other}
                onChange={e => setForm(f => ({ ...f, experience_years_other: e.target.value }))} />
            </div>
            <div>
              <Label>Salariu Dorit (RON/lună)</Label>
              <Input type="number" value={form.preferred_salary_fulltime}
                onChange={e => setForm(f => ({ ...f, preferred_salary_fulltime: e.target.value }))}
                placeholder="3500" />
            </div>
            <div>
              <Label>Limbi Vorbite (separate prin virgulă)</Label>
              <Input value={form.languages} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))}
                placeholder="Engleză, Română, Hindi..." />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.has_driving_license}
                  onChange={e => setForm(f => ({ ...f, has_driving_license: e.target.checked }))}
                  className="h-4 w-4" />
                <span className="text-sm">Deține permis de conducere</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <Button onClick={handleAddCandidate} disabled={saving} className="bg-coral hover:bg-coral/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Adaugă Candidatul
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Anulează</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtre */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-400" />
        {["all", "draft", "pending_validation", "validated", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === f ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {f === "all" ? "Toți" : STATUS_LABELS[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Lista candidați */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {filter === "all" ? "Nu ați adăugat candidați încă." : `Niciun candidat cu statusul "${STATUS_LABELS[filter]?.label}".`}
            </p>
            {filter === "all" && (
              <Button onClick={() => setShowForm(true)} className="mt-4 bg-coral hover:bg-coral/90">
                <Plus className="h-4 w-4 mr-2" />
                Adaugă Primul Candidat
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const st = STATUS_LABELS[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-navy-900">{c.first_name} {c.last_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>{c.origin_country}</span>
                        {c.target_position_name && <span>• {c.target_position_name}</span>}
                        {c.candidate_type && <span>• {CANDIDATE_TYPES[c.candidate_type] || c.candidate_type}</span>}
                        {c.qualification_level && <span>• {c.qualification_level.replace("_", " ")}</span>}
                        {c.profile_completion_pct != null && (
                          <span className="text-coral">• {c.profile_completion_pct}% complet</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {new Date(c.created_at).toLocaleDateString("ro-RO")}
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
