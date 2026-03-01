import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const content = {
  ro: {
    meta: { title: "Pentru Angajatori | Global Jobs Consulting", description: "Solicitați forță de muncă din Asia și Africa pentru compania dumneavoastră." },
    hero: { label: "Pentru Angajatori", title: "Soluții de Recrutare Internațională", description: "Completați formularul pentru a solicita personal calificat din Asia și Africa." },
    industries: [
      { value: "horeca", label: "HoReCa (Hoteluri, Restaurante, Catering)" },
      { value: "constructii", label: "Construcții" },
      { value: "nave", label: "Nave de Croazieră" },
      { value: "agricultura", label: "Agricultură" },
      { value: "depozite", label: "Depozite & Logistică" },
      { value: "productie", label: "Producție" },
      { value: "altele", label: "Altele" }
    ],
    qualifications: [
      { value: "necalificat", label: "Personal Necalificat" },
      { value: "semicalificat", label: "Personal Semicalificat" },
      { value: "calificat", label: "Personal Calificat" },
      { value: "inalt_calificat", label: "Personal Înalt Calificat" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 România" },
      { value: "at", label: "🇦🇹 Austria" },
      { value: "rs", label: "🇷🇸 Serbia" }
    ],
    benefits: [
      { title: "Selecție Riguroasă", description: "Candidați verificați și validați prin rețeaua noastră de 11 agenții partenere." },
      { title: "Documentație Completă", description: "Gestionăm integral procesul: vize, permise de muncă, traduceri și legalizări." },
      { title: "Suport Continuu", description: "Asistență și monitorizare pe termen lung pentru integrarea cu succes a personalului." }
    ],
    form: {
      title: "Solicitare Personal",
      company: "Numele Companiei",
      contact: "Persoană de Contact",
      email: "Email",
      phone: "Telefon",
      country: "Țara Proiectului",
      selectCountry: "Selectați țara",
      industry: "Industrie",
      selectIndustry: "Selectați industria",
      workers: "Număr de Lucrători Necesari",
      qualification: "Nivel de Calificare",
      selectQualification: "Selectați nivelul",
      salary: "Salariu Oferit (€/lună)",
      accommodation: "Oferim cazare",
      meals: "Oferim masă",
      message: "Mesaj Adițional",
      messagePlaceholder: "Descrieți în detaliu cerințele...",
      privacy: "Sunt de acord cu",
      privacyLink: "Politica de Confidențialitate",
      submit: "Trimite Solicitarea",
      submitting: "Se trimite...",
      required: "Câmp obligatoriu",
      invalidEmail: "Email invalid",
      privacyRequired: "Trebuie să acceptați Politica de Confidențialitate"
    },
    success: { title: "Mulțumim pentru Solicitare!", text: "Am primit cererea dumneavoastră și un consultant va lua legătura cu dvs. în cel mai scurt timp.", newRequest: "Trimite o altă solicitare" },
    toast: { success: "Formularul a fost trimis cu succes!", error: "A apărut o eroare. Vă rugăm încercați din nou." }
  },
  en: {
    meta: { title: "For Employers | Global Jobs Consulting", description: "Request workforce from Asia and Africa for your company." },
    hero: { label: "For Employers", title: "International Recruitment Solutions", description: "Fill out the form to request qualified staff from Asia and Africa." },
    industries: [
      { value: "horeca", label: "HoReCa (Hotels, Restaurants, Catering)" },
      { value: "constructii", label: "Construction" },
      { value: "nave", label: "Cruise Ships" },
      { value: "agricultura", label: "Agriculture" },
      { value: "depozite", label: "Warehousing & Logistics" },
      { value: "productie", label: "Manufacturing" },
      { value: "altele", label: "Other" }
    ],
    qualifications: [
      { value: "necalificat", label: "Unskilled Staff" },
      { value: "semicalificat", label: "Semi-skilled Staff" },
      { value: "calificat", label: "Skilled Staff" },
      { value: "inalt_calificat", label: "Highly Skilled Staff" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 Romania" },
      { value: "at", label: "🇦🇹 Austria" },
      { value: "rs", label: "🇷🇸 Serbia" }
    ],
    benefits: [
      { title: "Rigorous Selection", description: "Candidates verified and validated through our network of 11 partner agencies." },
      { title: "Complete Documentation", description: "We fully manage the process: visas, work permits, translations and legalizations." },
      { title: "Ongoing Support", description: "Long-term assistance and monitoring for successful staff integration." }
    ],
    form: {
      title: "Staff Request",
      company: "Company Name",
      contact: "Contact Person",
      email: "Email",
      phone: "Phone",
      country: "Project Country",
      selectCountry: "Select country",
      industry: "Industry",
      selectIndustry: "Select industry",
      workers: "Number of Workers Needed",
      qualification: "Qualification Level",
      selectQualification: "Select level",
      salary: "Offered Salary (€/month)",
      accommodation: "We provide accommodation",
      meals: "We provide meals",
      message: "Additional Message",
      messagePlaceholder: "Describe your requirements in detail...",
      privacy: "I agree to the",
      privacyLink: "Privacy Policy",
      submit: "Submit Request",
      submitting: "Submitting...",
      required: "Required field",
      invalidEmail: "Invalid email",
      privacyRequired: "You must accept the Privacy Policy"
    },
    success: { title: "Thank You for Your Request!", text: "We have received your request and a consultant will contact you shortly.", newRequest: "Submit another request" },
    toast: { success: "Form submitted successfully!", error: "An error occurred. Please try again." }
  },
  de: {
    meta: { title: "Für Arbeitgeber | Global Jobs Consulting", description: "Fordern Sie Arbeitskräfte aus Asien und Afrika für Ihr Unternehmen an." },
    hero: { label: "Für Arbeitgeber", title: "Internationale Rekrutierungslösungen", description: "Füllen Sie das Formular aus, um qualifiziertes Personal aus Asien und Afrika anzufordern." },
    industries: [
      { value: "horeca", label: "HoReCa (Hotels, Restaurants, Catering)" },
      { value: "constructii", label: "Bauwesen" },
      { value: "nave", label: "Kreuzfahrtschiffe" },
      { value: "agricultura", label: "Landwirtschaft" },
      { value: "depozite", label: "Lager & Logistik" },
      { value: "productie", label: "Produktion" },
      { value: "altele", label: "Sonstiges" }
    ],
    qualifications: [
      { value: "necalificat", label: "Ungelernte Mitarbeiter" },
      { value: "semicalificat", label: "Angelernte Mitarbeiter" },
      { value: "calificat", label: "Qualifizierte Mitarbeiter" },
      { value: "inalt_calificat", label: "Hochqualifizierte Mitarbeiter" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 Rumänien" },
      { value: "at", label: "🇦🇹 Österreich" },
      { value: "rs", label: "🇷🇸 Serbien" }
    ],
    benefits: [
      { title: "Sorgfältige Auswahl", description: "Kandidaten geprüft und validiert durch unser Netzwerk von 11 Partneragenturen." },
      { title: "Vollständige Dokumentation", description: "Wir verwalten den gesamten Prozess: Visa, Arbeitserlaubnisse, Übersetzungen." },
      { title: "Kontinuierliche Unterstützung", description: "Langfristige Unterstützung für erfolgreiche Mitarbeiterintegration." }
    ],
    form: {
      title: "Personalanfrage",
      company: "Firmenname",
      contact: "Ansprechpartner",
      email: "E-Mail",
      phone: "Telefon",
      country: "Projektland",
      selectCountry: "Land wählen",
      industry: "Branche",
      selectIndustry: "Branche wählen",
      workers: "Anzahl benötigter Arbeiter",
      qualification: "Qualifikationsniveau",
      selectQualification: "Niveau wählen",
      salary: "Angebotenes Gehalt (€/Monat)",
      accommodation: "Wir bieten Unterkunft",
      meals: "Wir bieten Mahlzeiten",
      message: "Zusätzliche Nachricht",
      messagePlaceholder: "Beschreiben Sie Ihre Anforderungen im Detail...",
      privacy: "Ich stimme der",
      privacyLink: "Datenschutzrichtlinie zu",
      submit: "Anfrage senden",
      submitting: "Wird gesendet...",
      required: "Pflichtfeld",
      invalidEmail: "Ungültige E-Mail",
      privacyRequired: "Sie müssen die Datenschutzrichtlinie akzeptieren"
    },
    success: { title: "Vielen Dank für Ihre Anfrage!", text: "Wir haben Ihre Anfrage erhalten und ein Berater wird sich in Kürze mit Ihnen in Verbindung setzen.", newRequest: "Weitere Anfrage senden" },
    toast: { success: "Formular erfolgreich gesendet!", error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." }
  },
  sr: {
    meta: { title: "Za Poslodavce | Global Jobs Consulting", description: "Zatražite radnu snagu iz Azije i Afrike za vašu kompaniju." },
    hero: { label: "Za Poslodavce", title: "Međunarodna rešenja za zapošljavanje", description: "Popunite formular da zatražite kvalifikovano osoblje iz Azije i Afrike." },
    industries: [
      { value: "horeca", label: "HoReCa (Hoteli, Restorani, Ketering)" },
      { value: "constructii", label: "Građevinarstvo" },
      { value: "nave", label: "Kruzeri" },
      { value: "agricultura", label: "Poljoprivreda" },
      { value: "depozite", label: "Skladištenje i logistika" },
      { value: "productie", label: "Proizvodnja" },
      { value: "altele", label: "Ostalo" }
    ],
    qualifications: [
      { value: "necalificat", label: "Nekvalifikovano osoblje" },
      { value: "semicalificat", label: "Polukvalifikovano osoblje" },
      { value: "calificat", label: "Kvalifikovano osoblje" },
      { value: "inalt_calificat", label: "Visokokvalifikovano osoblje" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 Rumunija" },
      { value: "at", label: "🇦🇹 Austrija" },
      { value: "rs", label: "🇷🇸 Srbija" }
    ],
    benefits: [
      { title: "Rigorozna selekcija", description: "Kandidati provereni i validirani kroz našu mrežu od 11 partnerskih agencija." },
      { title: "Kompletna dokumentacija", description: "U potpunosti upravljamo procesom: vize, radne dozvole, prevodi." },
      { title: "Kontinuirana podrška", description: "Dugoročna pomoć za uspešnu integraciju osoblja." }
    ],
    form: {
      title: "Zahtev za osoblje",
      company: "Naziv kompanije",
      contact: "Kontakt osoba",
      email: "Email",
      phone: "Telefon",
      country: "Zemlja projekta",
      selectCountry: "Izaberite zemlju",
      industry: "Industrija",
      selectIndustry: "Izaberite industriju",
      workers: "Broj potrebnih radnika",
      qualification: "Nivo kvalifikacije",
      selectQualification: "Izaberite nivo",
      salary: "Ponuđena plata (€/mesec)",
      accommodation: "Obezbeđujemo smeštaj",
      meals: "Obezbeđujemo obroke",
      message: "Dodatna poruka",
      messagePlaceholder: "Opišite vaše zahteve detaljno...",
      privacy: "Slažem se sa",
      privacyLink: "Politikom privatnosti",
      submit: "Pošalji zahtev",
      submitting: "Slanje...",
      required: "Obavezno polje",
      invalidEmail: "Nevažeći email",
      privacyRequired: "Morate prihvatiti Politiku privatnosti"
    },
    success: { title: "Hvala vam na zahtevu!", text: "Primili smo vaš zahtev i konsultant će vas uskoro kontaktirati.", newRequest: "Pošalji novi zahtev" },
    toast: { success: "Formular je uspešno poslat!", error: "Došlo je do greške. Molimo pokušajte ponovo." }
  }
};

const icons = [Building2, FileCheck, Users];

export default function EmployersPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API}/employers/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error");
      toast.success(t.toast.success);
      setSubmitted(true);
      reset();
    } catch (error) {
      toast.error(t.toast.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-12 shadow-sm">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-navy-900 mb-4">{t.success.title}</h1>
              <p className="text-gray-600 mb-8">{t.success.text}</p>
              <Button onClick={() => setSubmitted(false)} className="bg-coral hover:bg-red-600" data-testid="submit-another-btn">{t.success.newRequest}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="employers-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-coral font-semibold text-sm tracking-wider">{t.hero.label}</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 mb-4">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg">{t.hero.description}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Benefits Sidebar */}
            <div className="space-y-6">
              {t.benefits.map((benefit, index) => {
                const Icon = icons[index];
                return (
                  <Card key={index} className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="p-3 bg-coral/10 rounded-xl inline-block mb-4">
                        <Icon className="h-6 w-6 text-coral" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-navy-900">{t.form.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="employer-form">
                    {/* Company Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="company_name">{t.form.company} *</Label>
                        <Input id="company_name" {...register("company_name", { required: t.form.required })} data-testid="input-company" />
                        {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="contact_person">{t.form.contact} *</Label>
                        <Input id="contact_person" {...register("contact_person", { required: t.form.required })} data-testid="input-contact" />
                        {errors.contact_person && <p className="text-red-500 text-sm mt-1">{errors.contact_person.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">{t.form.email} *</Label>
                        <Input id="email" type="email" {...register("email", { required: t.form.required, pattern: { value: /^\S+@\S+$/i, message: t.form.invalidEmail } })} data-testid="input-email" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">{t.form.phone} *</Label>
                        <Input id="phone" {...register("phone", { required: t.form.required })} data-testid="input-phone" />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>{t.form.country} *</Label>
                        <Select onValueChange={(value) => setValue("country", value)}>
                          <SelectTrigger data-testid="select-country"><SelectValue placeholder={t.form.selectCountry} /></SelectTrigger>
                          <SelectContent>
                            {t.countries.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <input type="hidden" {...register("country", { required: t.form.required })} />
                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                      </div>
                      <div>
                        <Label>{t.form.industry} *</Label>
                        <Select onValueChange={(value) => setValue("industry", value)}>
                          <SelectTrigger data-testid="select-industry"><SelectValue placeholder={t.form.selectIndustry} /></SelectTrigger>
                          <SelectContent>
                            {t.industries.map((i) => (<SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <input type="hidden" {...register("industry", { required: t.form.required })} />
                        {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="workers_needed">{t.form.workers} *</Label>
                        <Input id="workers_needed" type="number" min="1" {...register("workers_needed", { required: t.form.required })} data-testid="input-workers" />
                        {errors.workers_needed && <p className="text-red-500 text-sm mt-1">{errors.workers_needed.message}</p>}
                      </div>
                      <div>
                        <Label>{t.form.qualification} *</Label>
                        <Select onValueChange={(value) => setValue("qualification_type", value)}>
                          <SelectTrigger data-testid="select-qualification"><SelectValue placeholder={t.form.selectQualification} /></SelectTrigger>
                          <SelectContent>
                            {t.qualifications.map((q) => (<SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <input type="hidden" {...register("qualification_type", { required: t.form.required })} />
                      </div>
                      <div>
                        <Label htmlFor="salary_offered">{t.form.salary}</Label>
                        <Input id="salary_offered" type="number" min="0" {...register("salary_offered")} data-testid="input-salary" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register("accommodation_provided")} className="h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-accommodation" />
                        <span className="text-sm text-gray-700">{t.form.accommodation}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register("meals_provided")} className="h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-meals" />
                        <span className="text-sm text-gray-700">{t.form.meals}</span>
                      </label>
                    </div>

                    <div>
                      <Label htmlFor="message">{t.form.message}</Label>
                      <Textarea id="message" rows={4} placeholder={t.form.messagePlaceholder} {...register("message")} data-testid="textarea-message" />
                    </div>

                    {/* Privacy Consent */}
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="privacy_consent" {...register("privacy_consent", { required: t.form.privacyRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-privacy-employer" />
                      <div>
                        <Label htmlFor="privacy_consent" className="text-sm text-gray-600 cursor-pointer">
                          {t.form.privacy}{" "}<Link to="/politica-confidentialitate" target="_blank" className="text-coral hover:underline font-medium">{t.form.privacyLink}</Link> *
                        </Label>
                        {errors.privacy_consent && <p className="text-red-500 text-sm mt-1">{errors.privacy_consent.message}</p>}
                      </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-coral hover:bg-red-600 text-white py-6 rounded-full" data-testid="submit-employer-form">
                      {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.form.submitting}</>) : t.form.submit}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
