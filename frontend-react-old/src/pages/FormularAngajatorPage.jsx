import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Users, FileCheck, CheckCircle2, Loader2, Shield, Clock, AlertCircle, FileText } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const content = {
  ro: {
    meta: { 
      title: "Formular Angajator - Recrutare Non-UE | Global Jobs Consulting", 
      description: "Completați formularul pentru analiză eligibilitate și ofertă personalizată pentru recrutarea muncitorilor Non-UE în România." 
    },
    hero: { 
      label: "Recrutare Non-UE", 
      title: "Formular de Analiză Eligibilitate", 
      description: "Completați formularul pentru a primi o analiză completă a eligibilității companiei și o ofertă personalizată conform cerințelor IGI." 
    },
    info: {
      title: "Informații Importante",
      items: [
        { icon: "clock", title: "Termen de Procesare", text: "30-45 zile pentru obținerea avizului IGI" },
        { icon: "shield", title: "Cerințe Minime", text: "Companie >1 an, min. 2 angajați activi" },
        { icon: "file", title: "Documentație Completă", text: "Gestionăm integral dosarul de imigrare" }
      ]
    },
    eligibility: {
      title: "Verificare Eligibilitate Companie",
      description: "Conform legislației IGI, compania trebuie să îndeplinească următoarele condiții:",
      companyAge: "Compania are minim 1 an de la înființare",
      minEmployees: "Compania are cel puțin 2 angajați activi",
      taxesPaid: "Obligațiile fiscale sunt plătite la zi",
      noSanctions: "Compania nu are sancțiuni active de la ANAF/ITM/AJOFM/IGI"
    },
    industries: [
      { value: "horeca", label: "HoReCa (Hoteluri, Restaurante, Catering)" },
      { value: "constructii", label: "Construcții" },
      { value: "nave", label: "Nave de Croazieră" },
      { value: "agricultura", label: "Agricultură" },
      { value: "depozite", label: "Depozite & Logistică" },
      { value: "productie", label: "Producție" },
      { value: "curatenie", label: "Curățenie" },
      { value: "auto", label: "Industria Auto" },
      { value: "altele", label: "Altele" }
    ],
    qualifications: [
      { value: "necalificat", label: "Personal Necalificat" },
      { value: "semicalificat", label: "Personal Semicalificat" },
      { value: "calificat", label: "Personal Calificat" },
      { value: "inalt_calificat", label: "Personal Înalt Calificat" }
    ],
    workerTypes: [
      { value: "permanent", label: "Angajat Permanent (Aviz ~100 EUR)" },
      { value: "sezonier", label: "Angajat Sezonier (Aviz ~25 EUR)" },
      { value: "detasat", label: "Detașat (alte condiții)" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 România" },
      { value: "at", label: "🇦🇹 Austria" },
      { value: "rs", label: "🇷🇸 Serbia" }
    ],
    sourceCountries: [
      { value: "nepal", label: "🇳🇵 Nepal" },
      { value: "sri_lanka", label: "🇱🇰 Sri Lanka" },
      { value: "india", label: "🇮🇳 India" },
      { value: "bangladesh", label: "🇧🇩 Bangladesh" },
      { value: "philippines", label: "🇵🇭 Filipine" },
      { value: "indonesia", label: "🇮🇩 Indonezia" },
      { value: "pakistan", label: "🇵🇰 Pakistan" },
      { value: "other_asia", label: "Altă țară din Asia" },
      { value: "other_africa", label: "Țară din Africa" },
      { value: "no_preference", label: "Fără preferință" }
    ],
    form: {
      sectionCompany: "Informații Companie",
      sectionNeeds: "Necesarul de Personal",
      sectionConditions: "Condiții Oferite",
      sectionEligibility: "Verificare Eligibilitate",
      company: "Numele Companiei",
      cui: "CUI (Cod Unic de Înregistrare)",
      contact: "Persoană de Contact",
      position: "Funcția în Companie",
      email: "Email",
      phone: "Telefon",
      country: "Țara unde se desfășoară activitatea",
      selectCountry: "Selectați țara",
      industry: "Domeniul de Activitate",
      selectIndustry: "Selectați domeniul",
      workerType: "Tipul de Angajare",
      selectWorkerType: "Selectați tipul",
      sourceCountry: "Țara de Origine Preferată",
      selectSourceCountry: "Selectați țara",
      workers: "Număr de Muncitori Necesari",
      positions: "Posturile Disponibile",
      positionsPlaceholder: "Ex: 5 sudori, 10 muncitori necalificați, 3 bucătari...",
      qualification: "Nivel de Calificare",
      selectQualification: "Selectați nivelul",
      salary: "Salariu Brut Oferit (€/lună)",
      accommodation: "Oferim cazare (obligatoriu conform legii)",
      accommodationType: "Tip Cazare",
      accommodationShared: "Cameră partajată",
      accommodationPrivate: "Cameră individuală",
      accommodationApartment: "Apartament",
      meals: "Oferim masă",
      transport: "Oferim transport la/de la serviciu",
      startDate: "Data Estimată de Început",
      contractLength: "Durata Contractului (luni)",
      message: "Informații Suplimentare",
      messagePlaceholder: "Descrieți orice alte detalii relevante despre cerințele dumneavoastră...",
      privacy: "Sunt de acord cu",
      privacyLink: "Politica de Confidențialitate",
      submit: "Trimite Formularul pentru Analiză",
      submitting: "Se trimite...",
      required: "Câmp obligatoriu",
      invalidEmail: "Email invalid",
      privacyRequired: "Trebuie să acceptați Politica de Confidențialitate",
      eligibilityRequired: "Trebuie să confirmați toate condițiile de eligibilitate"
    },
    success: { 
      title: "Formular Trimis cu Succes!", 
      text: "Mulțumim pentru completarea formularului. Un consultant senior va analiza eligibilitatea companiei și vă va contacta în maxim 24 de ore cu:",
      items: [
        "Verificarea eligibilității conform cerințelor IGI",
        "Estimare costuri complete (taxe IGI, servicii agenție)",
        "Lista documentelor necesare",
        "Termen estimativ pentru obținerea avizelor"
      ],
      contact: "Pentru urgențe, ne puteți contacta direct:",
      newRequest: "Trimite un alt formular" 
    },
    toast: { success: "Formularul a fost trimis cu succes!", error: "A apărut o eroare. Vă rugăm încercați din nou." }
  },
  en: {
    meta: { 
      title: "Employer Form - Non-EU Recruitment | Global Jobs Consulting", 
      description: "Complete the form for eligibility analysis and personalized offer for Non-EU worker recruitment in Romania." 
    },
    hero: { 
      label: "Non-EU Recruitment", 
      title: "Eligibility Analysis Form", 
      description: "Complete the form to receive a full eligibility analysis and personalized offer according to IGI requirements." 
    },
    info: {
      title: "Important Information",
      items: [
        { icon: "clock", title: "Processing Time", text: "30-45 days for IGI permit approval" },
        { icon: "shield", title: "Minimum Requirements", text: "Company >1 year, min. 2 active employees" },
        { icon: "file", title: "Complete Documentation", text: "We fully manage the immigration file" }
      ]
    },
    eligibility: {
      title: "Company Eligibility Verification",
      description: "According to IGI legislation, the company must meet the following conditions:",
      companyAge: "Company is at least 1 year old",
      minEmployees: "Company has at least 2 active employees",
      taxesPaid: "Tax obligations are paid up to date",
      noSanctions: "Company has no active sanctions from ANAF/ITM/AJOFM/IGI"
    },
    industries: [
      { value: "horeca", label: "HoReCa (Hotels, Restaurants, Catering)" },
      { value: "constructii", label: "Construction" },
      { value: "nave", label: "Cruise Ships" },
      { value: "agricultura", label: "Agriculture" },
      { value: "depozite", label: "Warehousing & Logistics" },
      { value: "productie", label: "Manufacturing" },
      { value: "curatenie", label: "Cleaning Services" },
      { value: "auto", label: "Automotive Industry" },
      { value: "altele", label: "Other" }
    ],
    qualifications: [
      { value: "necalificat", label: "Unskilled Staff" },
      { value: "semicalificat", label: "Semi-skilled Staff" },
      { value: "calificat", label: "Skilled Staff" },
      { value: "inalt_calificat", label: "Highly Skilled Staff" }
    ],
    workerTypes: [
      { value: "permanent", label: "Permanent Employee (Permit ~100 EUR)" },
      { value: "sezonier", label: "Seasonal Employee (Permit ~25 EUR)" },
      { value: "detasat", label: "Seconded (other conditions)" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 Romania" },
      { value: "at", label: "🇦🇹 Austria" },
      { value: "rs", label: "🇷🇸 Serbia" }
    ],
    sourceCountries: [
      { value: "nepal", label: "🇳🇵 Nepal" },
      { value: "sri_lanka", label: "🇱🇰 Sri Lanka" },
      { value: "india", label: "🇮🇳 India" },
      { value: "bangladesh", label: "🇧🇩 Bangladesh" },
      { value: "philippines", label: "🇵🇭 Philippines" },
      { value: "indonesia", label: "🇮🇩 Indonesia" },
      { value: "pakistan", label: "🇵🇰 Pakistan" },
      { value: "other_asia", label: "Other Asian country" },
      { value: "other_africa", label: "African country" },
      { value: "no_preference", label: "No preference" }
    ],
    form: {
      sectionCompany: "Company Information",
      sectionNeeds: "Staffing Needs",
      sectionConditions: "Offered Conditions",
      sectionEligibility: "Eligibility Verification",
      company: "Company Name",
      cui: "Tax ID (CUI)",
      contact: "Contact Person",
      position: "Position in Company",
      email: "Email",
      phone: "Phone",
      country: "Country where activity takes place",
      selectCountry: "Select country",
      industry: "Industry",
      selectIndustry: "Select industry",
      workerType: "Employment Type",
      selectWorkerType: "Select type",
      sourceCountry: "Preferred Source Country",
      selectSourceCountry: "Select country",
      workers: "Number of Workers Needed",
      positions: "Available Positions",
      positionsPlaceholder: "E.g.: 5 welders, 10 unskilled workers, 3 cooks...",
      qualification: "Qualification Level",
      selectQualification: "Select level",
      salary: "Gross Salary Offered (€/month)",
      accommodation: "We provide accommodation (legally required)",
      accommodationType: "Accommodation Type",
      accommodationShared: "Shared room",
      accommodationPrivate: "Private room",
      accommodationApartment: "Apartment",
      meals: "We provide meals",
      transport: "We provide transport to/from work",
      startDate: "Estimated Start Date",
      contractLength: "Contract Duration (months)",
      message: "Additional Information",
      messagePlaceholder: "Describe any other relevant details about your requirements...",
      privacy: "I agree to the",
      privacyLink: "Privacy Policy",
      submit: "Submit Form for Analysis",
      submitting: "Submitting...",
      required: "Required field",
      invalidEmail: "Invalid email",
      privacyRequired: "You must accept the Privacy Policy",
      eligibilityRequired: "You must confirm all eligibility conditions"
    },
    success: { 
      title: "Form Submitted Successfully!", 
      text: "Thank you for completing the form. A senior consultant will analyze your company's eligibility and contact you within 24 hours with:",
      items: [
        "Eligibility verification according to IGI requirements",
        "Complete cost estimate (IGI fees, agency services)",
        "Required documents list",
        "Estimated timeline for obtaining permits"
      ],
      contact: "For urgent matters, contact us directly:",
      newRequest: "Submit another form" 
    },
    toast: { success: "Form submitted successfully!", error: "An error occurred. Please try again." }
  },
  de: {
    meta: { 
      title: "Arbeitgeber-Formular - Nicht-EU-Rekrutierung | Global Jobs Consulting", 
      description: "Füllen Sie das Formular aus für Berechtigungsanalyse und persönliches Angebot für Nicht-EU-Arbeiterrekrutierung." 
    },
    hero: { 
      label: "Nicht-EU-Rekrutierung", 
      title: "Berechtigungsanalyse-Formular", 
      description: "Füllen Sie das Formular aus, um eine vollständige Berechtigungsanalyse und ein personalisiertes Angebot zu erhalten." 
    },
    info: {
      title: "Wichtige Informationen",
      items: [
        { icon: "clock", title: "Bearbeitungszeit", text: "30-45 Tage für IGI-Genehmigung" },
        { icon: "shield", title: "Mindestanforderungen", text: "Firma >1 Jahr, min. 2 aktive Mitarbeiter" },
        { icon: "file", title: "Vollständige Dokumentation", text: "Wir verwalten das Einwanderungsdossier vollständig" }
      ]
    },
    eligibility: {
      title: "Firmen-Berechtigungsprüfung",
      description: "Laut IGI-Gesetzgebung muss das Unternehmen folgende Bedingungen erfüllen:",
      companyAge: "Unternehmen ist mindestens 1 Jahr alt",
      minEmployees: "Unternehmen hat mindestens 2 aktive Mitarbeiter",
      taxesPaid: "Steuerpflichten sind auf dem neuesten Stand bezahlt",
      noSanctions: "Unternehmen hat keine aktiven Sanktionen von ANAF/ITM/AJOFM/IGI"
    },
    industries: [
      { value: "horeca", label: "HoReCa (Hotels, Restaurants, Catering)" },
      { value: "constructii", label: "Bauwesen" },
      { value: "nave", label: "Kreuzfahrtschiffe" },
      { value: "agricultura", label: "Landwirtschaft" },
      { value: "depozite", label: "Lager & Logistik" },
      { value: "productie", label: "Produktion" },
      { value: "curatenie", label: "Reinigungsdienste" },
      { value: "auto", label: "Automobilindustrie" },
      { value: "altele", label: "Sonstiges" }
    ],
    qualifications: [
      { value: "necalificat", label: "Ungelernte Mitarbeiter" },
      { value: "semicalificat", label: "Angelernte Mitarbeiter" },
      { value: "calificat", label: "Qualifizierte Mitarbeiter" },
      { value: "inalt_calificat", label: "Hochqualifizierte Mitarbeiter" }
    ],
    workerTypes: [
      { value: "permanent", label: "Festangestellter (~100 EUR Gebühr)" },
      { value: "sezonier", label: "Saisonarbeiter (~25 EUR Gebühr)" },
      { value: "detasat", label: "Entsandt (andere Bedingungen)" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 Rumänien" },
      { value: "at", label: "🇦🇹 Österreich" },
      { value: "rs", label: "🇷🇸 Serbien" }
    ],
    sourceCountries: [
      { value: "nepal", label: "🇳🇵 Nepal" },
      { value: "sri_lanka", label: "🇱🇰 Sri Lanka" },
      { value: "india", label: "🇮🇳 Indien" },
      { value: "bangladesh", label: "🇧🇩 Bangladesch" },
      { value: "philippines", label: "🇵🇭 Philippinen" },
      { value: "indonesia", label: "🇮🇩 Indonesien" },
      { value: "pakistan", label: "🇵🇰 Pakistan" },
      { value: "other_asia", label: "Anderes asiatisches Land" },
      { value: "other_africa", label: "Afrikanisches Land" },
      { value: "no_preference", label: "Keine Präferenz" }
    ],
    form: {
      sectionCompany: "Firmeninformationen",
      sectionNeeds: "Personalbedarf",
      sectionConditions: "Angebotene Bedingungen",
      sectionEligibility: "Berechtigungsprüfung",
      company: "Firmenname",
      cui: "Steuer-ID (CUI)",
      contact: "Ansprechpartner",
      position: "Position im Unternehmen",
      email: "E-Mail",
      phone: "Telefon",
      country: "Land der Tätigkeit",
      selectCountry: "Land wählen",
      industry: "Branche",
      selectIndustry: "Branche wählen",
      workerType: "Beschäftigungsart",
      selectWorkerType: "Typ wählen",
      sourceCountry: "Bevorzugtes Herkunftsland",
      selectSourceCountry: "Land wählen",
      workers: "Anzahl benötigter Arbeiter",
      positions: "Verfügbare Positionen",
      positionsPlaceholder: "Z.B.: 5 Schweißer, 10 ungelernte Arbeiter, 3 Köche...",
      qualification: "Qualifikationsniveau",
      selectQualification: "Niveau wählen",
      salary: "Angebotenes Bruttogehalt (€/Monat)",
      accommodation: "Wir bieten Unterkunft (gesetzlich erforderlich)",
      accommodationType: "Art der Unterkunft",
      accommodationShared: "Geteiltes Zimmer",
      accommodationPrivate: "Einzelzimmer",
      accommodationApartment: "Wohnung",
      meals: "Wir bieten Mahlzeiten",
      transport: "Wir bieten Transport zur/von der Arbeit",
      startDate: "Geschätztes Startdatum",
      contractLength: "Vertragsdauer (Monate)",
      message: "Zusätzliche Informationen",
      messagePlaceholder: "Beschreiben Sie weitere relevante Details...",
      privacy: "Ich stimme der",
      privacyLink: "Datenschutzrichtlinie zu",
      submit: "Formular zur Analyse senden",
      submitting: "Wird gesendet...",
      required: "Pflichtfeld",
      invalidEmail: "Ungültige E-Mail",
      privacyRequired: "Sie müssen die Datenschutzrichtlinie akzeptieren",
      eligibilityRequired: "Sie müssen alle Berechtigungsbedingungen bestätigen"
    },
    success: { 
      title: "Formular erfolgreich gesendet!", 
      text: "Vielen Dank. Ein Senior-Berater wird die Berechtigung Ihres Unternehmens analysieren und Sie innerhalb von 24 Stunden kontaktieren mit:",
      items: [
        "Berechtigungsprüfung gemäß IGI-Anforderungen",
        "Vollständige Kostenschätzung",
        "Liste der erforderlichen Dokumente",
        "Geschätzte Zeitleiste"
      ],
      contact: "Für dringende Angelegenheiten kontaktieren Sie uns direkt:",
      newRequest: "Weiteres Formular senden" 
    },
    toast: { success: "Formular erfolgreich gesendet!", error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." }
  },
  sr: {
    meta: { 
      title: "Formular za poslodavce - Non-EU regrutacija | Global Jobs Consulting", 
      description: "Popunite formular za analizu podobnosti i personalizovanu ponudu za regrutovanje Non-EU radnika." 
    },
    hero: { 
      label: "Non-EU Regrutacija", 
      title: "Formular za analizu podobnosti", 
      description: "Popunite formular da dobijete kompletnu analizu podobnosti i personalizovanu ponudu." 
    },
    info: {
      title: "Važne informacije",
      items: [
        { icon: "clock", title: "Vreme obrade", text: "30-45 dana za IGI dozvolu" },
        { icon: "shield", title: "Minimalni zahtevi", text: "Firma >1 godina, min. 2 aktivna zaposlena" },
        { icon: "file", title: "Kompletna dokumentacija", text: "U potpunosti upravljamo imigracionim dossierom" }
      ]
    },
    eligibility: {
      title: "Provera podobnosti kompanije",
      description: "Prema IGI zakonodavstvu, kompanija mora ispuniti sledeće uslove:",
      companyAge: "Kompanija postoji najmanje 1 godinu",
      minEmployees: "Kompanija ima najmanje 2 aktivna zaposlena",
      taxesPaid: "Poreske obaveze su plaćene do danas",
      noSanctions: "Kompanija nema aktivne sankcije od ANAF/ITM/AJOFM/IGI"
    },
    industries: [
      { value: "horeca", label: "HoReCa (Hoteli, Restorani, Ketering)" },
      { value: "constructii", label: "Građevinarstvo" },
      { value: "nave", label: "Kruzeri" },
      { value: "agricultura", label: "Poljoprivreda" },
      { value: "depozite", label: "Skladištenje i logistika" },
      { value: "productie", label: "Proizvodnja" },
      { value: "curatenie", label: "Usluge čišćenja" },
      { value: "auto", label: "Auto industrija" },
      { value: "altele", label: "Ostalo" }
    ],
    qualifications: [
      { value: "necalificat", label: "Nekvalifikovano osoblje" },
      { value: "semicalificat", label: "Polukvalifikovano osoblje" },
      { value: "calificat", label: "Kvalifikovano osoblje" },
      { value: "inalt_calificat", label: "Visokokvalifikovano osoblje" }
    ],
    workerTypes: [
      { value: "permanent", label: "Stalni zaposleni (~100 EUR taksa)" },
      { value: "sezonier", label: "Sezonski radnik (~25 EUR taksa)" },
      { value: "detasat", label: "Upućeni (drugi uslovi)" }
    ],
    countries: [
      { value: "ro", label: "🇷🇴 Rumunija" },
      { value: "at", label: "🇦🇹 Austrija" },
      { value: "rs", label: "🇷🇸 Srbija" }
    ],
    sourceCountries: [
      { value: "nepal", label: "🇳🇵 Nepal" },
      { value: "sri_lanka", label: "🇱🇰 Šri Lanka" },
      { value: "india", label: "🇮🇳 Indija" },
      { value: "bangladesh", label: "🇧🇩 Bangladeš" },
      { value: "philippines", label: "🇵🇭 Filipini" },
      { value: "indonesia", label: "🇮🇩 Indonezija" },
      { value: "pakistan", label: "🇵🇰 Pakistan" },
      { value: "other_asia", label: "Druga azijska zemlja" },
      { value: "other_africa", label: "Afrička zemlja" },
      { value: "no_preference", label: "Bez preferencije" }
    ],
    form: {
      sectionCompany: "Informacije o kompaniji",
      sectionNeeds: "Potrebe za osobljem",
      sectionConditions: "Ponuđeni uslovi",
      sectionEligibility: "Provera podobnosti",
      company: "Naziv kompanije",
      cui: "Poreski ID (CUI)",
      contact: "Kontakt osoba",
      position: "Pozicija u kompaniji",
      email: "Email",
      phone: "Telefon",
      country: "Zemlja gde se obavlja aktivnost",
      selectCountry: "Izaberite zemlju",
      industry: "Industrija",
      selectIndustry: "Izaberite industriju",
      workerType: "Tip zaposlenja",
      selectWorkerType: "Izaberite tip",
      sourceCountry: "Preferirana zemlja porekla",
      selectSourceCountry: "Izaberite zemlju",
      workers: "Broj potrebnih radnika",
      positions: "Dostupne pozicije",
      positionsPlaceholder: "Npr.: 5 zavarivača, 10 nekvalifikovanih radnika, 3 kuvara...",
      qualification: "Nivo kvalifikacije",
      selectQualification: "Izaberite nivo",
      salary: "Ponuđena bruto plata (€/mesec)",
      accommodation: "Obezbeđujemo smeštaj (zakonski obavezno)",
      accommodationType: "Tip smeštaja",
      accommodationShared: "Deljena soba",
      accommodationPrivate: "Privatna soba",
      accommodationApartment: "Stan",
      meals: "Obezbeđujemo obroke",
      transport: "Obezbeđujemo prevoz do/sa posla",
      startDate: "Procenjeni datum početka",
      contractLength: "Trajanje ugovora (meseci)",
      message: "Dodatne informacije",
      messagePlaceholder: "Opišite druge relevantne detalje...",
      privacy: "Slažem se sa",
      privacyLink: "Politikom privatnosti",
      submit: "Pošalji formular na analizu",
      submitting: "Slanje...",
      required: "Obavezno polje",
      invalidEmail: "Nevažeći email",
      privacyRequired: "Morate prihvatiti Politiku privatnosti",
      eligibilityRequired: "Morate potvrditi sve uslove podobnosti"
    },
    success: { 
      title: "Formular uspešno poslat!", 
      text: "Hvala vam. Viši konsultant će analizirati podobnost vaše kompanije i kontaktirati vas u roku od 24 sata sa:",
      items: [
        "Provera podobnosti prema IGI zahtevima",
        "Kompletna procena troškova",
        "Lista potrebnih dokumenata",
        "Procenjena vremenska linija"
      ],
      contact: "Za hitne stvari kontaktirajte nas direktno:",
      newRequest: "Pošalji drugi formular" 
    },
    toast: { success: "Formular je uspešno poslat!", error: "Došlo je do greške. Molimo pokušajte ponovo." }
  }
};

export default function FormularAngajatorPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  const watchAccommodation = watch("accommodation_provided");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API}/employers/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          workers_needed: parseInt(data.workers_needed) || 1,
          source_form: "formular-angajator-non-eu"
        }),
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
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="font-heading text-3xl font-bold text-navy-900 mb-4">{t.success.title}</h1>
                <p className="text-gray-600 mb-6">{t.success.text}</p>
                <ul className="text-left bg-navy-50 rounded-lg p-6 mb-6 space-y-3">
                  {t.success.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-navy-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-600 mb-2">{t.success.contact}</p>
                <p className="text-navy-900 font-semibold mb-8">office@gjc.ro | +40 732 403 464</p>
                <Button onClick={() => setSubmitted(false)} className="bg-coral hover:bg-red-600" data-testid="submit-another-btn">
                  {t.success.newRequest}
                </Button>
              </CardContent>
            </Card>
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

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="formular-angajator-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-coral font-semibold text-sm tracking-wider uppercase">{t.hero.label}</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 mb-4">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg">{t.hero.description}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {t.info.items.map((item, index) => {
              const Icon = item.icon === "clock" ? Clock : item.icon === "shield" ? Shield : FileText;
              return (
                <Card key={index} className="shadow-sm border-l-4 border-l-coral">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-coral/10 rounded-xl">
                        <Icon className="h-6 w-6 text-coral" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-navy-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Form */}
          <Card className="shadow-lg max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" data-testid="employer-form-noneu">
                
                {/* Section: Company Info */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy-900 mb-6 pb-2 border-b flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-coral" />
                    {t.form.sectionCompany}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company_name">{t.form.company} *</Label>
                      <Input id="company_name" {...register("company_name", { required: t.form.required })} data-testid="input-company" />
                      {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cui">{t.form.cui}</Label>
                      <Input id="cui" {...register("cui")} placeholder="RO12345678" data-testid="input-cui" />
                    </div>
                    <div>
                      <Label htmlFor="contact_person">{t.form.contact} *</Label>
                      <Input id="contact_person" {...register("contact_person", { required: t.form.required })} data-testid="input-contact" />
                      {errors.contact_person && <p className="text-red-500 text-sm mt-1">{errors.contact_person.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="position">{t.form.position}</Label>
                      <Input id="position" {...register("position")} data-testid="input-position" />
                    </div>
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
                    <div className="md:col-span-2">
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
                  </div>
                </div>

                {/* Section: Staffing Needs */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy-900 mb-6 pb-2 border-b flex items-center gap-2">
                    <Users className="h-5 w-5 text-coral" />
                    {t.form.sectionNeeds}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div>
                      <Label>{t.form.workerType} *</Label>
                      <Select onValueChange={(value) => setValue("worker_type", value)}>
                        <SelectTrigger data-testid="select-worker-type"><SelectValue placeholder={t.form.selectWorkerType} /></SelectTrigger>
                        <SelectContent>
                          {t.workerTypes.map((w) => (<SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" {...register("worker_type", { required: t.form.required })} />
                    </div>
                    <div>
                      <Label>{t.form.sourceCountry}</Label>
                      <Select onValueChange={(value) => setValue("source_country", value)}>
                        <SelectTrigger data-testid="select-source-country"><SelectValue placeholder={t.form.selectSourceCountry} /></SelectTrigger>
                        <SelectContent>
                          {t.sourceCountries.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" {...register("source_country")} />
                    </div>
                    <div>
                      <Label htmlFor="workers_needed">{t.form.workers} *</Label>
                      <Input id="workers_needed" type="number" min="1" {...register("workers_needed", { required: t.form.required })} data-testid="input-workers" />
                      {errors.workers_needed && <p className="text-red-500 text-sm mt-1">{errors.workers_needed.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="positions">{t.form.positions}</Label>
                      <Textarea id="positions" rows={2} placeholder={t.form.positionsPlaceholder} {...register("positions")} data-testid="textarea-positions" />
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
                      <Label htmlFor="salary_offered">{t.form.salary} *</Label>
                      <Input id="salary_offered" type="number" min="0" {...register("salary_offered", { required: t.form.required })} data-testid="input-salary" />
                      {errors.salary_offered && <p className="text-red-500 text-sm mt-1">{errors.salary_offered.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Section: Conditions */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy-900 mb-6 pb-2 border-b flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-coral" />
                    {t.form.sectionConditions}
                  </h2>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register("accommodation_provided")} className="h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-accommodation" />
                        <span className="text-sm text-gray-700">{t.form.accommodation}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register("meals_provided")} className="h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-meals" />
                        <span className="text-sm text-gray-700">{t.form.meals}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register("transport_provided")} className="h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-transport" />
                        <span className="text-sm text-gray-700">{t.form.transport}</span>
                      </label>
                    </div>
                    
                    {watchAccommodation && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <Label>{t.form.accommodationType}</Label>
                          <Select onValueChange={(value) => setValue("accommodation_type", value)}>
                            <SelectTrigger data-testid="select-accommodation-type"><SelectValue placeholder={t.form.accommodationShared} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shared">{t.form.accommodationShared}</SelectItem>
                              <SelectItem value="private">{t.form.accommodationPrivate}</SelectItem>
                              <SelectItem value="apartment">{t.form.accommodationApartment}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="start_date">{t.form.startDate}</Label>
                        <Input id="start_date" type="date" {...register("start_date")} data-testid="input-start-date" />
                      </div>
                      <div>
                        <Label htmlFor="contract_length">{t.form.contractLength}</Label>
                        <Input id="contract_length" type="number" min="1" placeholder="12" {...register("contract_length")} data-testid="input-contract-length" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Eligibility */}
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy-900 mb-4 pb-2 border-b flex items-center gap-2">
                    <Shield className="h-5 w-5 text-coral" />
                    {t.form.sectionEligibility}
                  </h2>
                  <Card className="bg-amber-50 border-amber-200 mb-6">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-800">{t.eligibility.title}</p>
                          <p className="text-amber-700 text-sm mt-1">{t.eligibility.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-3 bg-gray-50 p-6 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register("elig_company_age", { required: t.form.eligibilityRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-elig-age" />
                      <span className="text-sm text-gray-700">{t.eligibility.companyAge} *</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register("elig_min_employees", { required: t.form.eligibilityRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-elig-employees" />
                      <span className="text-sm text-gray-700">{t.eligibility.minEmployees} *</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register("elig_taxes_paid", { required: t.form.eligibilityRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-elig-taxes" />
                      <span className="text-sm text-gray-700">{t.eligibility.taxesPaid} *</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" {...register("elig_no_sanctions", { required: t.form.eligibilityRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-elig-sanctions" />
                      <span className="text-sm text-gray-700">{t.eligibility.noSanctions} *</span>
                    </label>
                    {(errors.elig_company_age || errors.elig_min_employees || errors.elig_taxes_paid || errors.elig_no_sanctions) && (
                      <p className="text-red-500 text-sm mt-2">{t.form.eligibilityRequired}</p>
                    )}
                  </div>
                </div>

                {/* Additional Message */}
                <div>
                  <Label htmlFor="message">{t.form.message}</Label>
                  <Textarea id="message" rows={4} placeholder={t.form.messagePlaceholder} {...register("message")} data-testid="textarea-message" />
                </div>

                {/* Privacy Consent */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="privacy_consent" {...register("privacy_consent", { required: t.form.privacyRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-privacy" />
                  <div>
                    <Label htmlFor="privacy_consent" className="text-sm text-gray-600 cursor-pointer">
                      {t.form.privacy}{" "}<Link to={getLocalizedPath("/politica-confidentialitate")} target="_blank" className="text-coral hover:underline font-medium">{t.form.privacyLink}</Link> *
                    </Label>
                    {errors.privacy_consent && <p className="text-red-500 text-sm mt-1">{errors.privacy_consent.message}</p>}
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-coral hover:bg-red-600 text-white py-6 rounded-full text-lg font-semibold" data-testid="submit-form-btn">
                  {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.form.submitting}</>) : t.form.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
