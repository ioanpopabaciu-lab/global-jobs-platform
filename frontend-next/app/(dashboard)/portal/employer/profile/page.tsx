"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    cui: "",
    legal_form: "",
    registration_number: "",
    address: "",
    city: "",
    county: "",
    country: "Romania",
    postal_code: "",
    contact_person_name: "",
    contact_person_role: "",
    phone: "",
    website: "",
    category: "A",
    activity_domain: "",
    total_employees: "",
    has_non_eu_workers: false,
    non_eu_workers_count: "",
    cat_a_accommodation_provided: false,
    cat_a_meals_provided: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/employer/profile`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setForm({
            company_name: data.profile.company_name || "",
            cui: data.profile.cui || "",
            legal_form: data.profile.legal_form || "",
            registration_number: data.profile.registration_number || "",
            address: data.profile.address || "",
            city: data.profile.city || "",
            county: data.profile.county || "",
            country: data.profile.country || "Romania",
            postal_code: data.profile.postal_code || "",
            contact_person_name: data.profile.contact_person_name || "",
            contact_person_role: data.profile.contact_person_role || "",
            phone: data.profile.phone || "",
            website: data.profile.website || "",
            category: data.profile.category || "A",
            activity_domain: data.profile.activity_domain || "",
            total_employees: data.profile.total_employees?.toString() || "",
            has_non_eu_workers: data.profile.has_non_eu_workers || false,
            non_eu_workers_count: data.profile.non_eu_workers_count?.toString() || "",
            cat_a_accommodation_provided: data.profile.cat_a_accommodation_provided || false,
            cat_a_meals_provided: data.profile.cat_a_meals_provided || false,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = { ...form };
      if (payload.total_employees) payload.total_employees = parseInt(payload.total_employees);
      if (payload.non_eu_workers_count) payload.non_eu_workers_count = parseInt(payload.non_eu_workers_count);

      const res = await fetch(`${API_URL}/portal/employer/profile`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profilul a fost salvat cu succes." });
        loadProfile();
      } else {
        setMessage({ type: "error", text: data.detail || "Eroare la salvare." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Eroare de conexiune." });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/portal/employer/profile/submit`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profilul a fost trimis spre validare!" });
        loadProfile();
      } else {
        setMessage({ type: "error", text: data.detail || "Eroare la trimitere." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Eroare de conexiune." });
    } finally {
      setSubmitting(false);
    }
  };

  const isValidated = profile?.status === "validated";
  const isPending = profile?.status === "pending_validation";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal/employer">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Profilul Companiei</h1>
          <p className="text-gray-500 text-sm">
            {isValidated ? "Profil validat ✓" : isPending ? "În curs de validare..." : "Completați datele companiei"}
          </p>
        </div>
      </div>

      {(isValidated || isPending) && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isValidated ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
          <CheckCircle2 className={`h-5 w-5 ${isValidated ? "text-green-600" : "text-amber-600"}`} />
          <p className={`text-sm font-medium ${isValidated ? "text-green-700" : "text-amber-700"}`}>
            {isValidated ? "Profilul companiei dvs. a fost validat de echipa GJC." : "Profilul este în curs de verificare. Veți fi notificat prin email."}
          </p>
        </div>
      )}

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

      <div className="space-y-6">
        {/* Date Companie */}
        <Card>
          <CardHeader>
            <CardTitle>Date Companie</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Denumire Companie *</Label>
              <Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="SC Exemplu SRL" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>CUI *</Label>
              <Input value={form.cui} onChange={e => setForm(f => ({ ...f, cui: e.target.value }))}
                placeholder="RO12345678" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Formă Juridică</Label>
              <Input value={form.legal_form} onChange={e => setForm(f => ({ ...f, legal_form: e.target.value }))}
                placeholder="SRL, SA, RA..." disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Nr. Înregistrare</Label>
              <Input value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))}
                placeholder="J40/123/2020" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Domeniu Activitate</Label>
              <Input value={form.activity_domain} onChange={e => setForm(f => ({ ...f, activity_domain: e.target.value }))}
                placeholder="Construcții, IT, HoReCa..." disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Nr. Total Angajați</Label>
              <Input type="number" value={form.total_employees} onChange={e => setForm(f => ({ ...f, total_employees: e.target.value }))}
                placeholder="50" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Categorie Servicii *</Label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                disabled={isPending || isValidated}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="A">Categorie A – Recrutare Internațională (din Asia, Africa)</option>
                <option value="B">Categorie B – Recrutare Locală (România)</option>
                <option value="AB">Ambele Categorii</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Adresă */}
        <Card>
          <CardHeader>
            <CardTitle>Adresă Sediu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Adresă</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Str. Exemplu, Nr. 1" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Oraș *</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="București" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Județ</Label>
              <Input value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}
                placeholder="Ilfov" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Cod Poștal</Label>
              <Input value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                placeholder="010101" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Țară</Label>
              <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="Romania" disabled={isPending || isValidated} />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Persoană de Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nume Complet *</Label>
              <Input value={form.contact_person_name} onChange={e => setForm(f => ({ ...f, contact_person_name: e.target.value }))}
                placeholder="Ion Popescu" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Funcție</Label>
              <Input value={form.contact_person_role} onChange={e => setForm(f => ({ ...f, contact_person_role: e.target.value }))}
                placeholder="Manager HR" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+40712345678" disabled={isPending || isValidated} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://firma.ro" disabled={isPending || isValidated} />
            </div>
          </CardContent>
        </Card>

        {/* Condiții Muncă (Cat A) */}
        {(form.category === "A" || form.category === "AB") && (
          <Card>
            <CardHeader>
              <CardTitle>Condiții de Muncă (Categoria A)</CardTitle>
              <CardDescription>Facilități oferite angajaților internaționali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.cat_a_accommodation_provided}
                  onChange={e => setForm(f => ({ ...f, cat_a_accommodation_provided: e.target.checked }))}
                  disabled={isPending || isValidated} className="h-4 w-4" />
                <span className="text-sm">Cazare asigurată de firmă</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.cat_a_meals_provided}
                  onChange={e => setForm(f => ({ ...f, cat_a_meals_provided: e.target.checked }))}
                  disabled={isPending || isValidated} className="h-4 w-4" />
                <span className="text-sm">Masă asigurată de firmă</span>
              </label>
            </CardContent>
          </Card>
        )}

        {/* Acțiuni */}
        {!isPending && !isValidated && (
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-navy-900 hover:bg-navy-800">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvează
            </Button>
            {profile && (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-coral hover:bg-coral/90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Trimite spre Validare
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
