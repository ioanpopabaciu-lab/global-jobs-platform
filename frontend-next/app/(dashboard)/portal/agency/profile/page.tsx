"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CheckCircle2, Loader2, AlertCircle, Globe } from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
};

export default function AgencyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    agency_name: "",
    agency_type: "intermediary",
    country: "",
    city: "",
    address: "",
    contact_person_name: "",
    phone: "",
    website: "",
    license_number: "",
    commission_rate: "",
    specialization: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/portal/agency/profile`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setForm({
            agency_name: data.profile.agency_name || "",
            agency_type: data.profile.agency_type || "intermediary",
            country: data.profile.country || "",
            city: data.profile.city || "",
            address: data.profile.address || "",
            contact_person_name: data.profile.contact_person_name || "",
            phone: data.profile.phone || "",
            website: data.profile.website || "",
            license_number: data.profile.license_number || "",
            commission_rate: data.profile.commission_rate?.toString() || "",
            specialization: data.profile.specialization || "",
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
      if (payload.commission_rate) payload.commission_rate = parseFloat(payload.commission_rate);

      const res = await fetch(`${API_URL}/portal/agency/profile`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Profilul agenției a fost salvat. Un admin va verifica și valida agenția." });
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
        <Link href="/portal/agency">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Profilul Agenției</h1>
          <p className="text-gray-500 text-sm">
            {isValidated ? "Agenție validată ✓" : isPending ? "În curs de verificare..." : "Înregistrați agenția dvs."}
          </p>
        </div>
      </div>

      {(isValidated || isPending) && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isValidated ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
          <CheckCircle2 className={`h-5 w-5 ${isValidated ? "text-green-600" : "text-amber-600"}`} />
          <p className={`text-sm font-medium ${isValidated ? "text-green-700" : "text-amber-700"}`}>
            {isValidated
              ? "Agenția dvs. este validată. Puteți încărca candidați."
              : "Agenția este în curs de verificare. Veți fi notificat prin email."}
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
        {/* Date Agenție */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-coral" />
              Date Agenție
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Denumire Agenție *</Label>
              <Input value={form.agency_name} onChange={e => setForm(f => ({ ...f, agency_name: e.target.value }))}
                placeholder="Agenția Exemplu SRL" />
            </div>
            <div>
              <Label>Tip Agenție</Label>
              <select value={form.agency_type} onChange={e => setForm(f => ({ ...f, agency_type: e.target.value }))}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="intermediary">Intermediar (Licențiat)</option>
                <option value="partner">Partener GJC</option>
                <option value="recruiter">Recrutor Independent</option>
              </select>
            </div>
            <div>
              <Label>Număr Licență / Autorizație</Label>
              <Input value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))}
                placeholder="LIC-2024-001" />
            </div>
            <div>
              <Label>Comision (%)</Label>
              <Input type="number" step="0.5" min="0" max="100" value={form.commission_rate}
                onChange={e => setForm(f => ({ ...f, commission_rate: e.target.value }))}
                placeholder="10" />
            </div>
            <div>
              <Label>Specializare / Domenii</Label>
              <Input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                placeholder="Construcții, IT, HoReCa..." />
            </div>
          </CardContent>
        </Card>

        {/* Localizare */}
        <Card>
          <CardHeader>
            <CardTitle>Localizare</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Țară *</Label>
              <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="Nepal, India, Kenya..." />
            </div>
            <div>
              <Label>Oraș</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Kathmandu" />
            </div>
            <div className="md:col-span-2">
              <Label>Adresă</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Str. Principală, Nr. 1" />
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
                placeholder="John Smith" />
            </div>
            <div>
              <Label>Telefon / WhatsApp *</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+97712345678" />
            </div>
            <div>
              <Label>Website / LinkedIn</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://agency.com" />
            </div>
          </CardContent>
        </Card>

        {/* Acțiuni */}
        <Button onClick={handleSave} disabled={saving} className="bg-coral hover:bg-coral/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {profile ? "Actualizează Profilul" : "Înregistrează Agenția"}
        </Button>
      </div>
    </div>
  );
}
