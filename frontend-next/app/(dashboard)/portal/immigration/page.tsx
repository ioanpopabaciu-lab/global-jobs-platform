"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Bell, Clock, Globe, Plus, X, CheckCircle2,
  AlertCircle, Loader2, ChevronDown, ChevronUp, Calendar,
} from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

const SERVICES = [
  { value: "M1_family_reunion", label: "M1 – Reîntregirea Familiei", icon: "👨‍👩‍👧" },
  { value: "M2_visa_d_vf", label: "M2 – Viză D/VF (Scurtă ședere)", icon: "🛂" },
  { value: "M3_employer_change", label: "M3 – Schimbare Angajator", icon: "🔄" },
  { value: "M4_permanent_residence", label: "M4 – Reședința Permanentă", icon: "🏠" },
  { value: "M5_citizenship", label: "M5 – Cetățenie Română", icon: "🇷🇴" },
  { value: "M6_civil_documents", label: "M6 – Documente Civile", icon: "📄" },
  { value: "M7_diploma_recognition", label: "M7 – Recunoaștere Diplomă", icon: "🎓" },
  { value: "M8_driving_license", label: "M8 – Permis Auto (Preschimbare)", icon: "🚗" },
  { value: "M9_legal_defense", label: "M9 – Apărare Juridică", icon: "⚖️" },
  { value: "M10_health_card", label: "M10 – Card European Sănătate", icon: "🏥" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  intake: { label: "Înregistrat", color: "bg-gray-100 text-gray-700" },
  analysis: { label: "Analiză", color: "bg-blue-100 text-blue-700" },
  docs_requested: { label: "Documente Solicitate", color: "bg-amber-100 text-amber-700" },
  docs_received: { label: "Documente Primite", color: "bg-purple-100 text-purple-700" },
  submitted: { label: "Depus la Autorități", color: "bg-indigo-100 text-indigo-700" },
  pending_answer: { label: "Așteptăm Răspuns", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Aprobat ✓", color: "bg-green-100 text-green-700" },
  rejected: { label: "Respins", color: "bg-red-100 text-red-700" },
  closed: { label: "Finalizat", color: "bg-gray-100 text-gray-700" },
};

export default function ImmigrationDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const [form, setForm] = useState({
    service_type: "",
    full_name: "",
    email: "",
    phone: "",
    urgency: "normal",
    notes: "",
  });

  useEffect(() => {
    loadCases();
  }, []);

  // Pre-completează formularul cu datele utilizatorului logat
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        full_name: f.full_name || user.name || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  const loadCases = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/migration/cases`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!form.service_type) {
      setMessage({ type: "error", text: "Selectați tipul de serviciu." });
      return;
    }
    if (!form.full_name.trim()) {
      setMessage({ type: "error", text: "Completați numele complet." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      // Split full_name în first_name + last_name pentru backend
      const nameParts = form.full_name.trim().split(/\s+/);
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || nameParts[0] || "";

      const payload = {
        service_type: form.service_type,
        first_name,
        last_name,
        email: form.email || user?.email || "",
        phone: form.phone,
        urgency: form.urgency,
        description: form.notes,
      };

      const res = await fetch(`${API_URL}/portal/migration/request`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Cererea dvs. a fost înregistrată cu succes! Veți primi o confirmare pe email la ${payload.email}. Vă vom contacta în 24-48 ore.`,
        });
        setShowForm(false);
        setForm(f => ({ ...f, service_type: "", phone: "", urgency: "normal", notes: "" }));
        loadCases();
      } else {
        setMessage({ type: "error", text: data.detail || "Eroare la trimitere." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Eroare de conexiune." });
    } finally {
      setSubmitting(false);
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Bine ați venit, {user?.name?.split(" ")[0] || "Client"}!
        </h1>
        <p className="text-gray-600">
          Portalul dvs. pentru serviciile de imigrare și asistență documentară GJC.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dosare Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">
                {cases.filter(c => !["closed", "approved", "rejected"].includes(c.status)).length}
              </span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Dosare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">{cases.length}</span>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dosare Aprobate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">
                {cases.filter(c => c.status === "approved").length}
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
          <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>{message.text}</p>
        </div>
      )}

      {/* Buton cerere nouă */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-navy-900">Dosarele Mele</h2>
        <Button onClick={() => setShowForm(true)} className="bg-coral hover:bg-coral/90">
          <Plus className="h-4 w-4 mr-2" />
          Cerere Nouă
        </Button>
      </div>

      {/* Formular cerere */}
      {showForm && (
        <Card className="mb-6 border-2 border-coral">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cerere Nouă Serviciu Imigrare</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardDescription>Completați formularul și un consultant vă va contacta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tip Serviciu *</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {SERVICES.map(s => (
                  <label
                    key={s.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.service_type === s.value
                        ? "border-coral bg-coral/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input type="radio" name="service_type" value={s.value}
                      checked={form.service_type === s.value}
                      onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                      className="h-4 w-4 text-coral" />
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Nume Complet</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder={user?.name || "Ion Popescu"} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={user?.email || "email@exemplu.com"} />
              </div>
              <div>
                <Label>Telefon / WhatsApp</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+40712345678" />
              </div>
              <div>
                <Label>Urgență</Label>
                <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                  <option value="normal">Normal (5-10 zile lucrătoare)</option>
                  <option value="urgent">Urgent (2-3 zile lucrătoare)</option>
                  <option value="critical">Critic (24 ore)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Detalii / Note</Label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Descrieți pe scurt situația dvs. și ce documente aveți deja..."
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmitRequest} disabled={submitting} className="bg-coral hover:bg-coral/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                Trimite Cererea
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Anulează</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista dosare */}
      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nu aveți dosare de imigrare momentan.</p>
            <p className="text-sm text-gray-400 mb-6">Contactați-ne pentru a iniția un dosar.</p>
            <Button onClick={() => setShowForm(true)} className="bg-coral hover:bg-coral/90">
              <Plus className="h-4 w-4 mr-2" />
              Creează Primul Dosar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map(c => {
            const svc = SERVICES.find(s => s.value === c.service_type);
            const st = STATUS_LABELS[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };
            const isExpanded = expandedCase === c.id;

            return (
              <Card key={c.id} className="overflow-hidden">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {svc && <span className="text-lg">{svc.icon}</span>}
                        <h3 className="font-semibold text-navy-900">{svc?.label || c.service_type}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                        {c.urgency === "urgent" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Urgent</span>
                        )}
                        {c.urgency === "critical" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Critic</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Deschis la {new Date(c.created_at).toLocaleDateString("ro-RO")}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t pt-4 space-y-3">
                      {c.estimated_cost && (
                        <div>
                          <p className="text-xs text-gray-500">Cost Estimat</p>
                          <p className="text-sm font-medium">{c.estimated_cost} RON</p>
                        </div>
                      )}
                      {c.payment_status && (
                        <div>
                          <p className="text-xs text-gray-500">Status Plată</p>
                          <p className="text-sm font-medium capitalize">{c.payment_status.replace("_", " ")}</p>
                        </div>
                      )}
                      {c.next_deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Termen Următor</p>
                            <p className="text-sm font-medium">{new Date(c.next_deadline).toLocaleDateString("ro-RO")}</p>
                          </div>
                        </div>
                      )}
                      {c.documents_requested && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Documente Solicitate</p>
                          <p className="text-sm text-gray-700 bg-amber-50 p-2 rounded">{c.documents_requested}</p>
                        </div>
                      )}
                      {c.final_answer && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Răspuns Final</p>
                          <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">{c.final_answer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info servicii */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-coral" />
            </div>
            <div>
              <CardTitle>Asistență GJC</CardTitle>
              <CardDescription>Contact direct cu echipa noastră</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium mb-1">Email</p>
              <p>office@gjc.ro</p>
            </div>
            <div>
              <p className="font-medium mb-1">Program</p>
              <p>Luni–Vineri: 09:00–18:00</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
