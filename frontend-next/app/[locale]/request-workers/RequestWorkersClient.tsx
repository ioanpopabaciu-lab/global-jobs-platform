"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, User, Mail, Phone, Briefcase, Users, Globe, Clock, Coins, CheckSquare, MessageSquare, Send, CheckCircle2, Loader2, Info, MapPin
} from "lucide-react";

export default function RequestWorkersClient({ dict }: { dict: any }) {
    const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    county: "",
    cui: "",
    companyStatus: "",
    contactPerson: "",
    email: "",
    phone: "",
    jobTitle: "",
    workersNeeded: "",
    preferredCountry: dict.requestWorkers.section2.countries.any,
    workSchedule: dict.requestWorkers.section2.schedules.fullTime,
    salary: "",
    specialConditions: {
      nightShifts: false,
      extremeTemps: false,
      heights: false,
      heavyLabor: false,
      driversLicense: false
    },
    message: "",
    termsAccepted: false
  });

  const [isVerifyingCui, setIsVerifyingCui] = useState(false);
  const [cuiStatus, setCuiStatus] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const countries = [
    dict.requestWorkers.section2.countries.any,
    dict.requestWorkers.section2.countries.asia,
    dict.requestWorkers.section2.countries.africa,
    dict.requestWorkers.section2.countries.nepal,
    dict.requestWorkers.section2.countries.india,
    dict.requestWorkers.section2.countries.pakistan,
    dict.requestWorkers.section2.countries.bangladesh,
    dict.requestWorkers.section2.countries.others
  ];
  
  const schedules = [
    dict.requestWorkers.section2.schedules.fullTime,
    dict.requestWorkers.section2.schedules.partTime,
    dict.requestWorkers.section2.schedules.shifts,
    dict.requestWorkers.section2.schedules.night
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      if (name === "termsAccepted") {
        setFormData(prev => ({ ...prev, termsAccepted: checked }));
      } else {
        setFormData(prev => ({
          ...prev,
          specialConditions: { ...prev.specialConditions, [name]: checked }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVerifyCui = async () => {
    if (!formData.cui || formData.cui.length < 2) return;
    
    setIsVerifyingCui(true);
    setCuiStatus(null);
    setSubmitError(null);
    
    try {
      const response = await fetch("/api/verify-cui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cui: formData.cui }),
      });

      let data: any = null;
      try { data = await response.json(); } catch { data = null; }

      // Detectează răspunsul de eroare Railway/gateway (nu vine din codul nostru)
      const isGatewayError = !data || data.status === "error" || data.message === "Application not found";

      if (!isGatewayError && data?.success && data?.company) {
        // Succes — completează câmpurile din datele ANAF
        const c = data.company;
        setFormData(prev => ({
          ...prev,
          companyName: c.company_name || c.denumire || prev.companyName,
          address: c.adresa || c.address || prev.address,
          county: c.judet || c.county || prev.county,
          companyStatus: c.stare || "VERIFICAT",
        }));
        setCuiStatus(`✅ Verificat (${data.source || 'ANAF'}) — ${c.stare || 'Activ'}`);
        setSubmitError(null);
      } else if (!isGatewayError && data?.allow_manual_entry) {
        // CUI nu a fost găsit în registre — permite introducere manuală
        setCuiStatus(null);
        setSubmitError(data.error || "CUI-ul nu a fost identificat în registre. Completați manual datele companiei.");
      } else {
        // Serviciu temporar indisponibil (downtime backend/ANAF)
        setCuiStatus(null);
        setSubmitError("Verificarea automată este temporar indisponibilă. Completați manual datele companiei — echipa GJC va verifica datele.");
      }
    } catch {
      setCuiStatus(null);
      setSubmitError("Verificarea automată este temporar indisponibilă. Completați manual datele companiei.");
    } finally {
      setIsVerifyingCui(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    const activeConditions = Object.entries(formData.specialConditions)
      .filter(([_, isChecked]) => isChecked)
      .map(([key, _]) => key);

    const payload = {
      company_name: formData.companyName,
      cui: formData.cui,
      contact_person: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      job_title: formData.jobTitle,
      workers_needed: formData.workersNeeded,
      country_preference: formData.preferredCountry,
      work_schedule: formData.workSchedule,
      salary: formData.salary,
      special_conditions: activeConditions,
      message: formData.message
    };

    try {
      const response = await fetch("https://global-jobs-platform-production.up.railway.app/api/employers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError("A apărut o eroare. Vă rugăm încercați din nou.");
      }
    } catch (error) {
      setSubmitError("A apărut o eroare. Vă rugăm încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen pt-32 pb-16 bg-navy-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-10 max-w-lg text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-4">{dict.requestWorkers.success.title}</h1>
          <p className="text-lg text-gray-600 mb-8">
            {dict.requestWorkers.success.message}
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="px-8 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-colors"
          >
            {dict.requestWorkers.success.backToHome}
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-navy-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-navy-900 mb-4"
          >
            {dict.requestWorkers.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            {dict.requestWorkers.subtitle}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Secțiunea 1: Detalii Companie */}
            <div>
              <h2 className="text-xl font-bold text-navy-900 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
                <Building2 className="text-coral w-5 h-5" />
                {dict.requestWorkers.section1.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section1.companyName}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input required type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section1.companyNamePlaceholder} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section1.cui}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input required type="text" name="cui" value={formData.cui} onChange={handleInputChange} className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section1.cuiPlaceholder} />
                    </div>
                    <button type="button" onClick={handleVerifyCui} disabled={isVerifyingCui || !formData.cui} className="px-5 py-3 bg-navy-100 text-navy-900 font-semibold rounded-xl hover:bg-navy-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {isVerifyingCui ? <Loader2 className="w-4 h-4 animate-spin" /> : dict.requestWorkers.section1.verify}
                    </button>
                  </div>
                  {cuiStatus && <p className={`mt-2 text-sm font-medium ${cuiStatus.includes('Activ') || cuiStatus.includes('Verificat') ? 'text-green-600' : 'text-red-500'}`}>{cuiStatus}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adresă companie (opțional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder="Ex: Str. Exemplului, București" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Județ (opțional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="county" value={formData.county} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder="Ex: Ilfov" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section1.contactPerson}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input required type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section1.contactPersonPlaceholder} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section1.phone}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section1.phonePlaceholder} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section1.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section1.emailPlaceholder} />
                  </div>
                </div>
              </div>
            </div>

            {/* Secțiunea 2: Detalii Job */}
            <div>
              <h2 className="text-xl font-bold text-navy-900 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2 mt-4">
                <Briefcase className="text-coral w-5 h-5" />
                {dict.requestWorkers.section2.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section2.jobTitle}</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input required type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section2.jobTitlePlaceholder} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section2.workersNeeded}</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input required type="number" min="1" name="workersNeeded" value={formData.workersNeeded} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section2.workersNeededPlaceholder} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section2.preferredCountry}</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <select name="preferredCountry" value={formData.preferredCountry} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none appearance-none cursor-pointer">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section2.workSchedule}</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <select name="workSchedule" value={formData.workSchedule} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none appearance-none cursor-pointer">
                      {schedules.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section2.salary}</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none" placeholder={dict.requestWorkers.section2.salaryPlaceholder} />
                  </div>
                </div>
              </div>
            </div>

            {/* Secțiunea 3: Condiții și Extra */}
            <div>
              <h2 className="text-xl font-bold text-navy-900 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2 mt-4">
                <CheckSquare className="text-coral w-5 h-5" />
                {dict.requestWorkers.section3.title}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" name="nightShifts" checked={formData.specialConditions.nightShifts} onChange={handleInputChange} className="w-5 h-5 text-coral rounded border-gray-300 focus:ring-coral" />
                  <span className="text-sm font-medium text-gray-700">{dict.requestWorkers.section3.conditions.nightShifts}</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" name="extremeTemps" checked={formData.specialConditions.extremeTemps} onChange={handleInputChange} className="w-5 h-5 text-coral rounded border-gray-300 focus:ring-coral" />
                  <span className="text-sm font-medium text-gray-700">{dict.requestWorkers.section3.conditions.extremeTemps}</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" name="heights" checked={formData.specialConditions.heights} onChange={handleInputChange} className="w-5 h-5 text-coral rounded border-gray-300 focus:ring-coral" />
                  <span className="text-sm font-medium text-gray-700">{dict.requestWorkers.section3.conditions.heights}</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" name="heavyLabor" checked={formData.specialConditions.heavyLabor} onChange={handleInputChange} className="w-5 h-5 text-coral rounded border-gray-300 focus:ring-coral" />
                  <span className="text-sm font-medium text-gray-700">{dict.requestWorkers.section3.conditions.heavyLabor}</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" name="driversLicense" checked={formData.specialConditions.driversLicense} onChange={handleInputChange} className="w-5 h-5 text-coral rounded border-gray-300 focus:ring-coral" />
                  <span className="text-sm font-medium text-gray-700">{dict.requestWorkers.section3.conditions.driversLicense}</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{dict.requestWorkers.section3.message}</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={4} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coral/20 focus:border-coral transition-colors outline-none resize-none" placeholder={dict.requestWorkers.section3.messagePlaceholder} />
                </div>
              </div>
            </div>

            {/* Termeni și Submit */}
            <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
              <label className="flex items-start gap-3 mb-8 cursor-pointer max-w-lg mx-auto">
                <input required type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="w-5 h-5 mt-0.5 text-coral rounded border-gray-300 focus:ring-coral" />
                <span className="text-sm text-gray-600">
                  {dict.requestWorkers.submit.terms}
                </span>
              </label>

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl w-full max-w-lg text-center font-medium">
                  {submitError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.termsAccepted}
                className="w-full md:w-auto px-10 py-4 bg-[#e63946] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {dict.requestWorkers.submit.sending}
                  </>
                ) : (
                  <>
                    {dict.requestWorkers.submit.button}
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </main>
  );
}
