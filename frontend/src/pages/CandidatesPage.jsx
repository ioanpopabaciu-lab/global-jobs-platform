import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Upload, CheckCircle2, Loader2, FileText, Video } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const content = {
  ro: {
    meta: { title: "Portal Candidați | Global Jobs Consulting", description: "Înscrie-te în baza noastră de candidați și găsește oportunități de muncă în România, Austria sau Serbia." },
    hero: { label: "Portal Candidați", title: "APLICĂ PENTRU UN JOB ÎN EUROPA", description: "Completați formularul și încărcați CV-ul pentru a fi inclus în baza noastră de candidați. Vă vom contacta când apare o oportunitate potrivită." },
    citizenships: [
      { value: "bangladesh", label: "Bangladesh" }, { value: "nepal", label: "Nepal" }, { value: "india", label: "India" },
      { value: "pakistan", label: "Pakistan" }, { value: "sri_lanka", label: "Sri Lanka" }, { value: "philippines", label: "Filipine" },
      { value: "vietnam", label: "Vietnam" }, { value: "indonesia", label: "Indonezia" }, { value: "kenya", label: "Kenya" },
      { value: "ethiopia", label: "Etiopia" }, { value: "nigeria", label: "Nigeria" }, { value: "ghana", label: "Ghana" },
      { value: "morocco", label: "Maroc" }, { value: "egypt", label: "Egipt" }, { value: "tunisia", label: "Tunisia" },
      { value: "altele", label: "Altă țară" }
    ],
    englishLevels: [{ value: "incepator", label: "Începător" }, { value: "mediu", label: "Mediu" }, { value: "avansat", label: "Avansat" }],
    industries: [
      { value: "horeca", label: "HoReCa" }, { value: "constructii", label: "Construcții" }, { value: "agricultura", label: "Agricultură" },
      { value: "depozite", label: "Depozite & Logistică" }, { value: "productie", label: "Producție" }, { value: "servicii", label: "Servicii" },
      { value: "oricare", label: "Orice domeniu" }
    ],
    form: {
      title: "Formular de Aplicare",
      personalInfo: "Informații Personale",
      fullName: "Nume Complet",
      citizenship: "Cetățenie",
      selectCountry: "Selectați țara",
      email: "Email",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      experience: "Experiență Profesională",
      experienceYears: "Ani de Experiență",
      englishLevel: "Nivel Limba Engleză",
      selectLevel: "Selectați nivelul",
      industryPreference: "Domeniu Preferat",
      selectIndustry: "Selectați domeniul",
      documents: "Documente",
      uploadCv: "Upload CV (PDF, DOC, DOCX - max 10MB)",
      clickUpload: "Click pentru a încărca CV-ul",
      dragDrop: "sau drag & drop",
      videoCv: "Link Video CV (opțional)",
      videoCvHint: "Adăugați un link către un video scurt de prezentare (YouTube, Vimeo, etc.)",
      message: "Mesaj Adițional",
      messagePlaceholder: "Descrieți experiența și motivația dumneavoastră...",
      privacy: "Sunt de acord cu",
      privacyLink: "Politica de Confidențialitate",
      submit: "Trimite Aplicația",
      submitting: "Se trimite...",
      required: "Câmp obligatoriu",
      invalidEmail: "Email invalid",
      invalidValue: "Valoare invalidă",
      fileTooLarge: "Fișierul este prea mare. Dimensiunea maximă este 10MB.",
      privacyRequired: "Trebuie să acceptați Politica de Confidențialitate"
    },
    sidebar: {
      destinations: "Țări de Destinație",
      romania: "România", romaniaDesc: "Oportunități în toate domeniile",
      austria: "Austria", austriaDesc: "Salarii competitive în EUR",
      serbia: "Serbia", serbiaDesc: "Piață în creștere",
      nextSteps: "Ce urmează?",
      step1: "Primim și analizăm aplicația ta",
      step2: "Te contactăm pentru un interviu video",
      step3: "Te prezentăm angajatorilor potriviți",
      step4: "Te ajutăm cu documentele de imigrare"
    },
    success: { title: "Aplicația a fost Trimisă!", text: "Am primit CV-ul și informațiile dumneavoastră. Veți fi contactat în cazul în care profilul corespunde oportunităților disponibile.", newApplication: "Trimite o altă aplicație" },
    toast: { success: "Aplicația a fost trimisă cu succes!", error: "A apărut o eroare. Vă rugăm încercați din nou." }
  },
  en: {
    meta: { title: "Candidates Portal | Global Jobs Consulting", description: "Join our candidate database and find job opportunities in Romania, Austria or Serbia." },
    hero: { label: "Candidates Portal", title: "APPLY FOR A JOB IN EUROPE", description: "Fill out the form and upload your CV to be included in our candidate database. We will contact you when a suitable opportunity arises." },
    citizenships: [
      { value: "bangladesh", label: "Bangladesh" }, { value: "nepal", label: "Nepal" }, { value: "india", label: "India" },
      { value: "pakistan", label: "Pakistan" }, { value: "sri_lanka", label: "Sri Lanka" }, { value: "philippines", label: "Philippines" },
      { value: "vietnam", label: "Vietnam" }, { value: "indonesia", label: "Indonesia" }, { value: "kenya", label: "Kenya" },
      { value: "ethiopia", label: "Ethiopia" }, { value: "nigeria", label: "Nigeria" }, { value: "ghana", label: "Ghana" },
      { value: "morocco", label: "Morocco" }, { value: "egypt", label: "Egypt" }, { value: "tunisia", label: "Tunisia" },
      { value: "altele", label: "Other country" }
    ],
    englishLevels: [{ value: "incepator", label: "Beginner" }, { value: "mediu", label: "Intermediate" }, { value: "avansat", label: "Advanced" }],
    industries: [
      { value: "horeca", label: "HoReCa" }, { value: "constructii", label: "Construction" }, { value: "agricultura", label: "Agriculture" },
      { value: "depozite", label: "Warehousing & Logistics" }, { value: "productie", label: "Manufacturing" }, { value: "servicii", label: "Services" },
      { value: "oricare", label: "Any field" }
    ],
    form: {
      title: "Application Form",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      citizenship: "Citizenship",
      selectCountry: "Select country",
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp",
      experience: "Professional Experience",
      experienceYears: "Years of Experience",
      englishLevel: "English Level",
      selectLevel: "Select level",
      industryPreference: "Preferred Industry",
      selectIndustry: "Select industry",
      documents: "Documents",
      uploadCv: "Upload CV (PDF, DOC, DOCX - max 10MB)",
      clickUpload: "Click to upload CV",
      dragDrop: "or drag & drop",
      videoCv: "Video CV Link (optional)",
      videoCvHint: "Add a link to a short presentation video (YouTube, Vimeo, etc.)",
      message: "Additional Message",
      messagePlaceholder: "Describe your experience and motivation...",
      privacy: "I agree to the",
      privacyLink: "Privacy Policy",
      submit: "Submit Application",
      submitting: "Submitting...",
      required: "Required field",
      invalidEmail: "Invalid email",
      invalidValue: "Invalid value",
      fileTooLarge: "File is too large. Maximum size is 10MB.",
      privacyRequired: "You must accept the Privacy Policy"
    },
    sidebar: {
      destinations: "Destination Countries",
      romania: "Romania", romaniaDesc: "Opportunities in all fields",
      austria: "Austria", austriaDesc: "Competitive salaries in EUR",
      serbia: "Serbia", serbiaDesc: "Growing market",
      nextSteps: "What's Next?",
      step1: "We receive and analyze your application",
      step2: "We contact you for a video interview",
      step3: "We present you to suitable employers",
      step4: "We help you with immigration documents"
    },
    success: { title: "Application Submitted!", text: "We have received your CV and information. You will be contacted if your profile matches available opportunities.", newApplication: "Submit another application" },
    toast: { success: "Application submitted successfully!", error: "An error occurred. Please try again." }
  },
  de: {
    meta: { title: "Bewerberportal | Global Jobs Consulting", description: "Registrieren Sie sich in unserer Kandidatendatenbank und finden Sie Jobmöglichkeiten in Rumänien, Österreich oder Serbien." },
    hero: { label: "Bewerberportal", title: "BEWERBEN SIE SICH FÜR EINEN JOB IN EUROPA", description: "Füllen Sie das Formular aus und laden Sie Ihren Lebenslauf hoch, um in unsere Kandidatendatenbank aufgenommen zu werden. Wir kontaktieren Sie, wenn eine passende Gelegenheit entsteht." },
    citizenships: [
      { value: "bangladesh", label: "Bangladesch" }, { value: "nepal", label: "Nepal" }, { value: "india", label: "Indien" },
      { value: "pakistan", label: "Pakistan" }, { value: "sri_lanka", label: "Sri Lanka" }, { value: "philippines", label: "Philippinen" },
      { value: "vietnam", label: "Vietnam" }, { value: "indonesia", label: "Indonesien" }, { value: "kenya", label: "Kenia" },
      { value: "ethiopia", label: "Äthiopien" }, { value: "nigeria", label: "Nigeria" }, { value: "ghana", label: "Ghana" },
      { value: "morocco", label: "Marokko" }, { value: "egypt", label: "Ägypten" }, { value: "tunisia", label: "Tunesien" },
      { value: "altele", label: "Anderes Land" }
    ],
    englishLevels: [{ value: "incepator", label: "Anfänger" }, { value: "mediu", label: "Mittelstufe" }, { value: "avansat", label: "Fortgeschritten" }],
    industries: [
      { value: "horeca", label: "HoReCa" }, { value: "constructii", label: "Bauwesen" }, { value: "agricultura", label: "Landwirtschaft" },
      { value: "depozite", label: "Lager & Logistik" }, { value: "productie", label: "Produktion" }, { value: "servicii", label: "Dienstleistungen" },
      { value: "oricare", label: "Jeder Bereich" }
    ],
    form: {
      title: "Bewerbungsformular",
      personalInfo: "Persönliche Informationen",
      fullName: "Vollständiger Name",
      citizenship: "Staatsangehörigkeit",
      selectCountry: "Land wählen",
      email: "E-Mail",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      experience: "Berufserfahrung",
      experienceYears: "Jahre Erfahrung",
      englishLevel: "Englischniveau",
      selectLevel: "Niveau wählen",
      industryPreference: "Bevorzugte Branche",
      selectIndustry: "Branche wählen",
      documents: "Dokumente",
      uploadCv: "Lebenslauf hochladen (PDF, DOC, DOCX - max 10MB)",
      clickUpload: "Klicken zum Hochladen",
      dragDrop: "oder per Drag & Drop",
      videoCv: "Video-Lebenslauf Link (optional)",
      videoCvHint: "Fügen Sie einen Link zu einem kurzen Präsentationsvideo hinzu (YouTube, Vimeo, etc.)",
      message: "Zusätzliche Nachricht",
      messagePlaceholder: "Beschreiben Sie Ihre Erfahrung und Motivation...",
      privacy: "Ich stimme der",
      privacyLink: "Datenschutzrichtlinie zu",
      submit: "Bewerbung absenden",
      submitting: "Wird gesendet...",
      required: "Pflichtfeld",
      invalidEmail: "Ungültige E-Mail",
      invalidValue: "Ungültiger Wert",
      fileTooLarge: "Datei ist zu groß. Maximale Größe ist 10MB.",
      privacyRequired: "Sie müssen die Datenschutzrichtlinie akzeptieren"
    },
    sidebar: {
      destinations: "Zielländer",
      romania: "Rumänien", romaniaDesc: "Möglichkeiten in allen Bereichen",
      austria: "Österreich", austriaDesc: "Wettbewerbsfähige Gehälter in EUR",
      serbia: "Serbien", serbiaDesc: "Wachsender Markt",
      nextSteps: "Was kommt als Nächstes?",
      step1: "Wir erhalten und analysieren Ihre Bewerbung",
      step2: "Wir kontaktieren Sie für ein Videointerview",
      step3: "Wir stellen Sie passenden Arbeitgebern vor",
      step4: "Wir helfen Ihnen mit den Einwanderungsdokumenten"
    },
    success: { title: "Bewerbung eingereicht!", text: "Wir haben Ihren Lebenslauf und Ihre Informationen erhalten. Sie werden kontaktiert, wenn Ihr Profil zu verfügbaren Möglichkeiten passt.", newApplication: "Weitere Bewerbung einreichen" },
    toast: { success: "Bewerbung erfolgreich eingereicht!", error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." }
  },
  sr: {
    meta: { title: "Portal kandidata | Global Jobs Consulting", description: "Prijavite se u našu bazu kandidata i pronađite posao u Rumuniji, Austriji ili Srbiji." },
    hero: { label: "Portal kandidata", title: "PRIJAVITE SE ZA POSAO U EVROPI", description: "Popunite formular i otpremite svoj CV da biste bili uključeni u našu bazu kandidata. Kontaktiraćemo vas kada se pojavi odgovarajuća prilika." },
    citizenships: [
      { value: "bangladesh", label: "Bangladeš" }, { value: "nepal", label: "Nepal" }, { value: "india", label: "Indija" },
      { value: "pakistan", label: "Pakistan" }, { value: "sri_lanka", label: "Šri Lanka" }, { value: "philippines", label: "Filipini" },
      { value: "vietnam", label: "Vijetnam" }, { value: "indonesia", label: "Indonezija" }, { value: "kenya", label: "Kenija" },
      { value: "ethiopia", label: "Etiopija" }, { value: "nigeria", label: "Nigerija" }, { value: "ghana", label: "Gana" },
      { value: "morocco", label: "Maroko" }, { value: "egypt", label: "Egipat" }, { value: "tunisia", label: "Tunis" },
      { value: "altele", label: "Druga zemlja" }
    ],
    englishLevels: [{ value: "incepator", label: "Početnik" }, { value: "mediu", label: "Srednji" }, { value: "avansat", label: "Napredni" }],
    industries: [
      { value: "horeca", label: "HoReCa" }, { value: "constructii", label: "Građevinarstvo" }, { value: "agricultura", label: "Poljoprivreda" },
      { value: "depozite", label: "Skladištenje i logistika" }, { value: "productie", label: "Proizvodnja" }, { value: "servicii", label: "Usluge" },
      { value: "oricare", label: "Bilo koja oblast" }
    ],
    form: {
      title: "Formular za prijavu",
      personalInfo: "Lične informacije",
      fullName: "Puno ime",
      citizenship: "Državljanstvo",
      selectCountry: "Izaberite zemlju",
      email: "Email",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      experience: "Profesionalno iskustvo",
      experienceYears: "Godina iskustva",
      englishLevel: "Nivo engleskog",
      selectLevel: "Izaberite nivo",
      industryPreference: "Preferirana industrija",
      selectIndustry: "Izaberite industriju",
      documents: "Dokumenti",
      uploadCv: "Otpremi CV (PDF, DOC, DOCX - max 10MB)",
      clickUpload: "Kliknite za otpremanje CV-a",
      dragDrop: "ili prevucite i otpustite",
      videoCv: "Link video CV-a (opciono)",
      videoCvHint: "Dodajte link ka kratkom prezentacionom videu (YouTube, Vimeo, itd.)",
      message: "Dodatna poruka",
      messagePlaceholder: "Opišite svoje iskustvo i motivaciju...",
      privacy: "Slažem se sa",
      privacyLink: "Politikom privatnosti",
      submit: "Pošalji prijavu",
      submitting: "Slanje...",
      required: "Obavezno polje",
      invalidEmail: "Nevažeći email",
      invalidValue: "Nevažeća vrednost",
      fileTooLarge: "Fajl je prevelik. Maksimalna veličina je 10MB.",
      privacyRequired: "Morate prihvatiti Politiku privatnosti"
    },
    sidebar: {
      destinations: "Odredišne zemlje",
      romania: "Rumunija", romaniaDesc: "Mogućnosti u svim oblastima",
      austria: "Austrija", austriaDesc: "Konkurentne plate u EUR",
      serbia: "Srbija", serbiaDesc: "Tržište u rastu",
      nextSteps: "Šta sledi?",
      step1: "Primamo i analiziramo vašu prijavu",
      step2: "Kontaktiramo vas za video intervju",
      step3: "Predstavljamo vas odgovarajućim poslodavcima",
      step4: "Pomažemo vam sa imigracionim dokumentima"
    },
    success: { title: "Prijava poslata!", text: "Primili smo vaš CV i informacije. Bićete kontaktirani ako vaš profil odgovara dostupnim mogućnostima.", newApplication: "Pošalji novu prijavu" },
    toast: { success: "Prijava uspešno poslata!", error: "Došlo je do greške. Molimo pokušajte ponovo." }
  },
  ne: {
    meta: { title: "उम्मेदवार पोर्टल | Global Jobs Consulting", description: "हाम्रो उम्मेदवार डाटाबेसमा सामेल हुनुहोस् र रोमानिया, अष्ट्रिया वा सर्बियामा रोजगारीका अवसरहरू पाउनुहोस्।" },
    hero: { label: "उम्मेदवार पोर्टल", title: "युरोपमा जागिरको लागि आवेदन गर्नुहोस्", description: "फारम भर्नुहोस् र हाम्रो उम्मेदवार डाटाबेसमा सामेल हुन आफ्नो CV अपलोड गर्नुहोस्। उपयुक्त अवसर आउँदा हामी सम्पर्क गर्नेछौं।" },
    citizenships: [
      { value: "bangladesh", label: "बंगलादेश" }, { value: "nepal", label: "नेपाल" }, { value: "india", label: "भारत" },
      { value: "pakistan", label: "पाकिस्तान" }, { value: "sri_lanka", label: "श्रीलंका" }, { value: "philippines", label: "फिलिपिन्स" },
      { value: "vietnam", label: "भियतनाम" }, { value: "indonesia", label: "इन्डोनेसिया" }, { value: "kenya", label: "केन्या" },
      { value: "ethiopia", label: "इथियोपिया" }, { value: "nigeria", label: "नाइजेरिया" }, { value: "ghana", label: "घाना" },
      { value: "morocco", label: "मोरक्को" }, { value: "egypt", label: "इजिप्ट" }, { value: "tunisia", label: "ट्युनिसिया" },
      { value: "altele", label: "अन्य देश" }
    ],
    englishLevels: [{ value: "incepator", label: "शुरुआती" }, { value: "mediu", label: "मध्यम" }, { value: "avansat", label: "उन्नत" }],
    industries: [
      { value: "horeca", label: "होटल र रेस्टुरेन्ट" }, { value: "constructii", label: "निर्माण" }, { value: "agricultura", label: "कृषि" },
      { value: "depozite", label: "गोदाम र लजिस्टिक्स" }, { value: "productie", label: "उत्पादन" }, { value: "servicii", label: "सेवाहरू" },
      { value: "oricare", label: "कुनै पनि क्षेत्र" }
    ],
    form: {
      title: "आवेदन फारम",
      personalInfo: "व्यक्तिगत जानकारी",
      fullName: "पूरा नाम",
      citizenship: "नागरिकता",
      selectCountry: "देश छान्नुहोस्",
      email: "इमेल",
      phone: "फोन",
      whatsapp: "व्हाट्सएप",
      experience: "व्यावसायिक अनुभव",
      experienceYears: "अनुभवको वर्ष",
      englishLevel: "अंग्रेजी स्तर",
      selectLevel: "स्तर छान्नुहोस्",
      industryPreference: "रुचाइएको उद्योग",
      selectIndustry: "उद्योग छान्नुहोस्",
      documents: "कागजातहरू",
      uploadCv: "CV अपलोड गर्नुहोस् (PDF, DOC, DOCX - अधिकतम 10MB)",
      clickUpload: "CV अपलोड गर्न क्लिक गर्नुहोस्",
      dragDrop: "वा ड्र्याग र ड्रप गर्नुहोस्",
      videoCv: "भिडियो CV लिंक (वैकल्पिक)",
      videoCvHint: "छोटो परिचय भिडियोको लिंक थप्नुहोस् (YouTube, Vimeo, आदि)",
      message: "थप सन्देश",
      messagePlaceholder: "आफ्नो अनुभव र प्रेरणा वर्णन गर्नुहोस्...",
      privacy: "म सहमत छु",
      privacyLink: "गोपनीयता नीति",
      submit: "आवेदन पेश गर्नुहोस्",
      submitting: "पेश गर्दै...",
      required: "आवश्यक फिल्ड",
      invalidEmail: "अमान्य इमेल",
      invalidValue: "अमान्य मान",
      fileTooLarge: "फाइल धेरै ठूलो छ। अधिकतम साइज 10MB हो।",
      privacyRequired: "तपाईंले गोपनीयता नीति स्वीकार गर्नुपर्छ"
    },
    sidebar: {
      destinations: "गन्तव्य देशहरू",
      romania: "रोमानिया", romaniaDesc: "सबै क्षेत्रमा अवसरहरू",
      austria: "अष्ट्रिया", austriaDesc: "EUR मा प्रतिस्पर्धी तलब",
      serbia: "सर्बिया", serbiaDesc: "बढ्दो बजार",
      nextSteps: "अब के हुन्छ?",
      step1: "हामी तपाईंको आवेदन प्राप्त र विश्लेषण गर्छौं",
      step2: "हामी भिडियो अन्तर्वार्ताको लागि सम्पर्क गर्छौं",
      step3: "हामी तपाईंलाई उपयुक्त रोजगारदाताहरूलाई प्रस्तुत गर्छौं",
      step4: "हामी आप्रवासन कागजातमा मद्दत गर्छौं"
    },
    success: { title: "आवेदन पेश भयो!", text: "हामीले तपाईंको CV र जानकारी प्राप्त गर्यौं। तपाईंको प्रोफाइल उपलब्ध अवसरहरूसँग मेल खाएमा सम्पर्क गरिनेछ।", newApplication: "अर्को आवेदन पेश गर्नुहोस्" },
    toast: { success: "आवेदन सफलतापूर्वक पेश भयो!", error: "त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।" }
  },
  bn: {
    meta: { title: "প্রার্থী পোর্টাল | Global Jobs Consulting", description: "আমাদের প্রার্থী ডাটাবেসে যোগ দিন এবং রোমানিয়া, অস্ট্রিয়া বা সার্বিয়ায় চাকরির সুযোগ খুঁজুন।" },
    hero: { label: "প্রার্থী পোর্টাল", title: "ইউরোপে চাকরির জন্য আবেদন করুন", description: "ফর্ম পূরণ করুন এবং আমাদের প্রার্থী ডাটাবেসে অন্তর্ভুক্ত হতে আপনার CV আপলোড করুন। উপযুক্ত সুযোগ এলে আমরা যোগাযোগ করব।" },
    citizenships: [
      { value: "bangladesh", label: "বাংলাদেশ" }, { value: "nepal", label: "নেপাল" }, { value: "india", label: "ভারত" },
      { value: "pakistan", label: "পাকিস্তান" }, { value: "sri_lanka", label: "শ্রীলঙ্কা" }, { value: "philippines", label: "ফিলিপাইন" },
      { value: "vietnam", label: "ভিয়েতনাম" }, { value: "indonesia", label: "ইন্দোনেশিয়া" }, { value: "kenya", label: "কেনিয়া" },
      { value: "ethiopia", label: "ইথিওপিয়া" }, { value: "nigeria", label: "নাইজেরিয়া" }, { value: "ghana", label: "ঘানা" },
      { value: "morocco", label: "মরক্কো" }, { value: "egypt", label: "মিশর" }, { value: "tunisia", label: "তিউনিসিয়া" },
      { value: "altele", label: "অন্য দেশ" }
    ],
    englishLevels: [{ value: "incepator", label: "প্রাথমিক" }, { value: "mediu", label: "মাধ্যমিক" }, { value: "avansat", label: "উন্নত" }],
    industries: [
      { value: "horeca", label: "হোটেল ও রেস্তোরাঁ" }, { value: "constructii", label: "নির্মাণ" }, { value: "agricultura", label: "কৃষি" },
      { value: "depozite", label: "গুদাম ও লজিস্টিক" }, { value: "productie", label: "উৎপাদন" }, { value: "servicii", label: "সেবা" },
      { value: "oricare", label: "যেকোনো ক্ষেত্র" }
    ],
    form: {
      title: "আবেদন ফর্ম",
      personalInfo: "ব্যক্তিগত তথ্য",
      fullName: "পূর্ণ নাম",
      citizenship: "নাগরিকত্ব",
      selectCountry: "দেশ নির্বাচন করুন",
      email: "ইমেইল",
      phone: "ফোন",
      whatsapp: "হোয়াটসঅ্যাপ",
      experience: "পেশাদার অভিজ্ঞতা",
      experienceYears: "অভিজ্ঞতার বছর",
      englishLevel: "ইংরেজি স্তর",
      selectLevel: "স্তর নির্বাচন করুন",
      industryPreference: "পছন্দের শিল্প",
      selectIndustry: "শিল্প নির্বাচন করুন",
      documents: "নথি",
      uploadCv: "CV আপলোড করুন (PDF, DOC, DOCX - সর্বোচ্চ 10MB)",
      clickUpload: "CV আপলোড করতে ক্লিক করুন",
      dragDrop: "অথবা টেনে এনে ছাড়ুন",
      videoCv: "ভিডিও CV লিঙ্ক (ঐচ্ছিক)",
      videoCvHint: "একটি সংক্ষিপ্ত পরিচিতি ভিডিওর লিঙ্ক যোগ করুন (YouTube, Vimeo, ইত্যাদি)",
      message: "অতিরিক্ত বার্তা",
      messagePlaceholder: "আপনার অভিজ্ঞতা এবং প্রেরণা বর্ণনা করুন...",
      privacy: "আমি সম্মত",
      privacyLink: "গোপনীয়তা নীতি",
      submit: "আবেদন জমা দিন",
      submitting: "জমা দেওয়া হচ্ছে...",
      required: "আবশ্যক ক্ষেত্র",
      invalidEmail: "অবৈধ ইমেইল",
      invalidValue: "অবৈধ মান",
      fileTooLarge: "ফাইল খুব বড়। সর্বোচ্চ আকার 10MB।",
      privacyRequired: "আপনাকে গোপনীয়তা নীতি গ্রহণ করতে হবে"
    },
    sidebar: {
      destinations: "গন্তব্য দেশ",
      romania: "রোমানিয়া", romaniaDesc: "সব ক্ষেত্রে সুযোগ",
      austria: "অস্ট্রিয়া", austriaDesc: "EUR-এ প্রতিযোগিতামূলক বেতন",
      serbia: "সার্বিয়া", serbiaDesc: "ক্রমবর্ধমান বাজার",
      nextSteps: "পরবর্তী কী?",
      step1: "আমরা আপনার আবেদন গ্রহণ এবং বিশ্লেষণ করি",
      step2: "আমরা ভিডিও ইন্টারভিউয়ের জন্য যোগাযোগ করি",
      step3: "আমরা আপনাকে উপযুক্ত নিয়োগকর্তাদের কাছে উপস্থাপন করি",
      step4: "আমরা অভিবাসন নথিতে সাহায্য করি"
    },
    success: { title: "আবেদন জমা হয়েছে!", text: "আমরা আপনার CV এবং তথ্য পেয়েছি। আপনার প্রোফাইল উপলব্ধ সুযোগের সাথে মিলে গেলে যোগাযোগ করা হবে।", newApplication: "আরেকটি আবেদন জমা দিন" },
    toast: { success: "আবেদন সফলভাবে জমা হয়েছে!", error: "একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" }
  },
  hi: {
    meta: { title: "उम्मीदवार पोर्टल | Global Jobs Consulting", description: "हमारे उम्मीदवार डेटाबेस में शामिल हों और रोमानिया, ऑस्ट्रिया या सर्बिया में नौकरी के अवसर खोजें।" },
    hero: { label: "उम्मीदवार पोर्टल", title: "यूरोप में नौकरी के लिए आवेदन करें", description: "फॉर्म भरें और हमारे उम्मीदवार डेटाबेस में शामिल होने के लिए अपना CV अपलोड करें। उपयुक्त अवसर आने पर हम संपर्क करेंगे।" },
    citizenships: [
      { value: "bangladesh", label: "बांग्लादेश" }, { value: "nepal", label: "नेपाल" }, { value: "india", label: "भारत" },
      { value: "pakistan", label: "पाकिस्तान" }, { value: "sri_lanka", label: "श्रीलंका" }, { value: "philippines", label: "फिलीपींस" },
      { value: "vietnam", label: "वियतनाम" }, { value: "indonesia", label: "इंडोनेशिया" }, { value: "kenya", label: "केन्या" },
      { value: "ethiopia", label: "इथियोपिया" }, { value: "nigeria", label: "नाइजीरिया" }, { value: "ghana", label: "घाना" },
      { value: "morocco", label: "मोरक्को" }, { value: "egypt", label: "मिस्र" }, { value: "tunisia", label: "ट्यूनीशिया" },
      { value: "altele", label: "अन्य देश" }
    ],
    englishLevels: [{ value: "incepator", label: "शुरुआती" }, { value: "mediu", label: "मध्यवर्ती" }, { value: "avansat", label: "उन्नत" }],
    industries: [
      { value: "horeca", label: "होटल और रेस्टोरेंट" }, { value: "constructii", label: "निर्माण" }, { value: "agricultura", label: "कृषि" },
      { value: "depozite", label: "गोदाम और लॉजिस्टिक्स" }, { value: "productie", label: "विनिर्माण" }, { value: "servicii", label: "सेवाएं" },
      { value: "oricare", label: "कोई भी क्षेत्र" }
    ],
    form: {
      title: "आवेदन फॉर्म",
      personalInfo: "व्यक्तिगत जानकारी",
      fullName: "पूरा नाम",
      citizenship: "नागरिकता",
      selectCountry: "देश चुनें",
      email: "ईमेल",
      phone: "फोन",
      whatsapp: "व्हाट्सएप",
      experience: "पेशेवर अनुभव",
      experienceYears: "अनुभव के वर्ष",
      englishLevel: "अंग्रेजी स्तर",
      selectLevel: "स्तर चुनें",
      industryPreference: "पसंदीदा उद्योग",
      selectIndustry: "उद्योग चुनें",
      documents: "दस्तावेज़",
      uploadCv: "CV अपलोड करें (PDF, DOC, DOCX - अधिकतम 10MB)",
      clickUpload: "CV अपलोड करने के लिए क्लिक करें",
      dragDrop: "या ड्रैग एंड ड्रॉप करें",
      videoCv: "वीडियो CV लिंक (वैकल्पिक)",
      videoCvHint: "एक छोटे परिचय वीडियो का लिंक जोड़ें (YouTube, Vimeo, आदि)",
      message: "अतिरिक्त संदेश",
      messagePlaceholder: "अपना अनुभव और प्रेरणा बताएं...",
      privacy: "मैं सहमत हूं",
      privacyLink: "गोपनीयता नीति",
      submit: "आवेदन जमा करें",
      submitting: "जमा किया जा रहा है...",
      required: "आवश्यक फ़ील्ड",
      invalidEmail: "अमान्य ईमेल",
      invalidValue: "अमान्य मान",
      fileTooLarge: "फ़ाइल बहुत बड़ी है। अधिकतम आकार 10MB है।",
      privacyRequired: "आपको गोपनीयता नीति स्वीकार करनी होगी"
    },
    sidebar: {
      destinations: "गंतव्य देश",
      romania: "रोमानिया", romaniaDesc: "सभी क्षेत्रों में अवसर",
      austria: "ऑस्ट्रिया", austriaDesc: "EUR में प्रतिस्पर्धी वेतन",
      serbia: "सर्बिया", serbiaDesc: "बढ़ता बाज़ार",
      nextSteps: "आगे क्या?",
      step1: "हम आपका आवेदन प्राप्त करते हैं और विश्लेषण करते हैं",
      step2: "हम वीडियो इंटरव्यू के लिए संपर्क करते हैं",
      step3: "हम आपको उपयुक्त नियोक्ताओं से मिलवाते हैं",
      step4: "हम आप्रवासन दस्तावेज़ों में मदद करते हैं"
    },
    success: { title: "आवेदन जमा हो गया!", text: "हमने आपका CV और जानकारी प्राप्त कर ली है। उपलब्ध अवसरों से मेल खाने पर संपर्क किया जाएगा।", newApplication: "एक और आवेदन जमा करें" },
    toast: { success: "आवेदन सफलतापूर्वक जमा हो गया!", error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।" }
  },
  si: {
    meta: { title: "අපේක්ෂක ද්වාරය | Global Jobs Consulting", description: "අපගේ අපේක්ෂක දත්ත සමුදායට එක්වන්න සහ රොමේනියාව, ඔස්ට්‍රියාව හෝ සර්බියාවේ රැකියා අවස්ථා සොයන්න." },
    hero: { label: "අපේක්ෂක ද්වාරය", title: "යුරෝපයේ රැකියාවක් සඳහා අයදුම් කරන්න", description: "ෆෝරමය පුරවන්න සහ අපගේ අපේක්ෂක දත්ත සමුදායට ඇතුළත් වීමට ඔබේ CV උඩුගත කරන්න. සුදුසු අවස්ථාවක් ලැබුණු විට අපි සම්බන්ධ වෙමු." },
    citizenships: [
      { value: "bangladesh", label: "බංග්ලාදේශය" }, { value: "nepal", label: "නේපාලය" }, { value: "india", label: "ඉන්දියාව" },
      { value: "pakistan", label: "පකිස්තානය" }, { value: "sri_lanka", label: "ශ්‍රී ලංකාව" }, { value: "philippines", label: "පිලිපීනය" },
      { value: "vietnam", label: "වියට්නාමය" }, { value: "indonesia", label: "ඉන්දුනීසියාව" }, { value: "kenya", label: "කෙන්යාව" },
      { value: "ethiopia", label: "ඉතියෝපියාව" }, { value: "nigeria", label: "නයිජීරියාව" }, { value: "ghana", label: "ඝානාව" },
      { value: "morocco", label: "මොරොක්කෝව" }, { value: "egypt", label: "ඊජිප්තුව" }, { value: "tunisia", label: "ටියුනීසියාව" },
      { value: "altele", label: "වෙනත් රටක්" }
    ],
    englishLevels: [{ value: "incepator", label: "ආරම්භක" }, { value: "mediu", label: "මධ්‍යම" }, { value: "avansat", label: "උසස්" }],
    industries: [
      { value: "horeca", label: "හෝටල් සහ ආපන ශාලා" }, { value: "constructii", label: "ඉදිකිරීම්" }, { value: "agricultura", label: "කෘෂිකර්මය" },
      { value: "depozite", label: "ගබඩා සහ ප්‍රවාහනය" }, { value: "productie", label: "නිෂ්පාදනය" }, { value: "servicii", label: "සේවා" },
      { value: "oricare", label: "ඕනෑම ක්ෂේත්‍රයක්" }
    ],
    form: {
      title: "අයදුම්පත්‍ර ආකෘතිය",
      personalInfo: "පුද්ගලික තොරතුරු",
      fullName: "සම්පූර්ණ නම",
      citizenship: "පුරවැසිභාවය",
      selectCountry: "රට තෝරන්න",
      email: "ඊමේල්",
      phone: "දුරකථනය",
      whatsapp: "WhatsApp",
      experience: "වෘත්තීය අත්දැකීම්",
      experienceYears: "අත්දැකීම් වසර",
      englishLevel: "ඉංග්‍රීසි මට්ටම",
      selectLevel: "මට්ටම තෝරන්න",
      industryPreference: "කැමති කර්මාන්තය",
      selectIndustry: "කර්මාන්තය තෝරන්න",
      documents: "ලේඛන",
      uploadCv: "CV උඩුගත කරන්න (PDF, DOC, DOCX - උපරිම 10MB)",
      clickUpload: "CV උඩුගත කිරීමට ක්ලික් කරන්න",
      dragDrop: "හෝ ඇදගෙන එන්න",
      videoCv: "වීඩියෝ CV සබැඳිය (විකල්ප)",
      videoCvHint: "කෙටි හඳුන්වාදීමේ වීඩියෝවකට සබැඳියක් එක් කරන්න (YouTube, Vimeo, ආදිය)",
      message: "අමතර පණිවිඩය",
      messagePlaceholder: "ඔබේ අත්දැකීම සහ අභිප්‍රේරණය විස්තර කරන්න...",
      privacy: "මම එකඟ වෙමි",
      privacyLink: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
      submit: "අයදුම්පත යවන්න",
      submitting: "යවමින්...",
      required: "අවශ්‍ය ක්ෂේත්‍රය",
      invalidEmail: "අවලංගු ඊමේල්",
      invalidValue: "අවලංගු අගය",
      fileTooLarge: "ගොනුව විශාල වැඩියි. උපරිම ප්‍රමාණය 10MB.",
      privacyRequired: "ඔබ පෞද්ගලිකත්ව ප්‍රතිපත්තිය පිළිගත යුතුය"
    },
    sidebar: {
      destinations: "ගමනාන්ත රටවල්",
      romania: "රොමේනියාව", romaniaDesc: "සියලු ක්ෂේත්‍රවල අවස්ථා",
      austria: "ඔස්ට්‍රියාව", austriaDesc: "EUR වලින් තරඟකාරී වැටුප්",
      serbia: "සර්බියාව", serbiaDesc: "වර්ධනය වන වෙළඳපොළ",
      nextSteps: "ඊළඟට කුමක්ද?",
      step1: "අපි ඔබේ අයදුම්පත ලබා ගෙන විශ්ලේෂණය කරමු",
      step2: "අපි වීඩියෝ සම්මුඛ පරීක්ෂණයක් සඳහා සම්බන්ධ වෙමු",
      step3: "අපි ඔබව සුදුසු සේවා යෝජකයින්ට හඳුන්වා දෙමු",
      step4: "අපි ආගමන ලේඛන සමඟ උදව් කරමු"
    },
    success: { title: "අයදුම්පත යවන ලදී!", text: "අපි ඔබේ CV සහ තොරතුරු ලබා ගත්තෙමු. ඔබේ පැතිකඩ පවතින අවස්ථා සමඟ ගැළපෙන්නේ නම් සම්බන්ධ කරනු ලැබේ.", newApplication: "තවත් අයදුම්පතක් යවන්න" },
    toast: { success: "අයදුම්පත සාර්ථකව යවන ලදී!", error: "දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න." }
  }
};

export default function CandidatesPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      
      if (cvFile) {
        formData.append("cv_file", cvFile);
      }

      const response = await fetch(`${API}/candidates/submit`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || t.toast.error);
      }

      toast.success(t.toast.success);
      setSubmitted(true);
      reset();
      setCvFile(null);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || t.toast.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t.form.fileTooLarge);
        return;
      }
      setCvFile(file);
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
              <h1 className="font-heading text-3xl font-bold text-navy-900  mb-4">
                {t.success.title}
              </h1>
              <p className="text-gray-600 mb-8">
                {t.success.text}
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-coral hover:bg-red-600"
                data-testid="submit-another-btn"
              >
                {t.success.newApplication}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Explicit safe title extraction
  const titleText = (t && t.meta && t.meta.title) ? t.meta.title : 'Portal Candidați | Global Jobs Consulting';
  const descText = (t && t.meta && t.meta.description) ? t.meta.description : '';

  return (
    <>
      <SEOHead 
        title={titleText}
        description={descText}
        language={language}
      />

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="candidates-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-navy-300 font-medium text-sm  tracking-wider">
                {t.hero.label}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold  mt-2 mb-4">
                {t.hero.title}
              </h1>
              <p className="text-navy-200 text-lg">
                {t.hero.description}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-navy-900 ">
                    {t.form.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {t.form.personalInfo}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">{t.form.fullName} *</Label>
                          <Input
                            id="full_name"
                            {...register("full_name", { required: t.form.required })}
                            data-testid="input-full-name"
                          />
                          {errors.full_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="citizenship">{t.form.citizenship} *</Label>
                          <Select onValueChange={(value) => setValue("citizenship", value)}>
                            <SelectTrigger data-testid="select-citizenship">
                              <SelectValue placeholder={t.form.selectCountry} />
                            </SelectTrigger>
                            <SelectContent>
                              {t.citizenships.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register("citizenship", { required: true })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">{t.form.email} *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email", { 
                              required: t.form.required,
                              pattern: { value: /^\S+@\S+$/i, message: t.form.invalidEmail }
                            })}
                            data-testid="input-email"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">{t.form.phone} *</Label>
                          <Input
                            id="phone"
                            {...register("phone", { required: t.form.required })}
                            placeholder="+XX XXX XXX XXX"
                            data-testid="input-phone"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="whatsapp">{t.form.whatsapp} *</Label>
                        <Input
                          id="whatsapp"
                          {...register("whatsapp", { required: t.form.required })}
                          placeholder="+XX XXX XXX XXX"
                          data-testid="input-whatsapp"
                        />
                        {errors.whatsapp && (
                          <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {t.form.experience}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experience_years">{t.form.experienceYears} *</Label>
                          <Input
                            id="experience_years"
                            type="number"
                            min="0"
                            {...register("experience_years", { 
                              required: t.form.required,
                              valueAsNumber: true,
                              min: { value: 0, message: t.form.invalidValue }
                            })}
                            data-testid="input-experience"
                          />
                          {errors.experience_years && (
                            <p className="text-red-500 text-sm mt-1">{errors.experience_years.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="english_level">{t.form.englishLevel} *</Label>
                          <Select onValueChange={(value) => setValue("english_level", value)}>
                            <SelectTrigger data-testid="select-english-level">
                              <SelectValue placeholder={t.form.selectLevel} />
                            </SelectTrigger>
                            <SelectContent>
                              {t.englishLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register("english_level", { required: true })} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="industry_preference">{t.form.industryPreference} *</Label>
                        <Select onValueChange={(value) => setValue("industry_preference", value)}>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder={t.form.selectIndustry} />
                          </SelectTrigger>
                          <SelectContent>
                            {t.industries.map((ind) => (
                              <SelectItem key={ind.value} value={ind.value}>
                                {ind.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <input type="hidden" {...register("industry_preference", { required: true })} />
                      </div>
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        {t.form.documents}
                      </h3>

                      <div>
                        <Label>{t.form.uploadCv}</Label>
                        <div 
                          className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-400 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="cv-upload-area"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {cvFile ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <FileText className="h-6 w-6" />
                              <span>{cvFile.name}</span>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <Upload className="h-8 w-8 mx-auto mb-2" />
                              <p>{t.form.clickUpload}</p>
                              <p className="text-sm text-gray-400">{t.form.dragDrop}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="video_cv_url" className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          {t.form.videoCv}
                        </Label>
                        <Input
                          id="video_cv_url"
                          placeholder="https://youtube.com/watch?v=..."
                          {...register("video_cv_url")}
                          data-testid="input-video-cv"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {t.form.videoCvHint}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="message">{t.form.message}</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder={t.form.messagePlaceholder}
                          {...register("message")}
                          data-testid="textarea-message"
                        />
                      </div>

                      {/* Privacy Policy Consent */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="privacy_consent"
                          {...register("privacy_consent", { 
                            required: t.form.privacyRequired 
                          })}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral"
                          data-testid="checkbox-privacy-candidate"
                        />
                        <div>
                          <Label htmlFor="privacy_consent" className="text-sm text-gray-600 cursor-pointer">
                            {t.form.privacy}{" "}
                            <Link 
                              to={getLocalizedPath("/politica-confidentialitate")} 
                              target="_blank"
                              className="text-coral hover:underline font-medium"
                            >
                              {t.form.privacyLink}
                            </Link>
                            {" "}*
                          </Label>
                          {errors.privacy_consent && (
                            <p className="text-red-500 text-sm mt-1">{errors.privacy_consent.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-coral hover:bg-red-600 text-white h-12 font-semibold"
                      data-testid="submit-candidate-form"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t.form.submitting}
                        </>
                      ) : (
                        t.form.submit
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-sm bg-navy-900 text-white">
                <CardContent className="pt-6">
                  <h3 className="font-heading text-xl font-bold  mb-4">
                    {t.sidebar.destinations}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded">
                      <span className="text-2xl">🇷🇴</span>
                      <div>
                        <div className="font-semibold">{t.sidebar.romania}</div>
                        <div className="text-sm text-navy-200">{t.sidebar.romaniaDesc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded">
                      <span className="text-2xl">🇦🇹</span>
                      <div>
                        <div className="font-semibold">{t.sidebar.austria}</div>
                        <div className="text-sm text-navy-200">{t.sidebar.austriaDesc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded">
                      <span className="text-2xl">🇷🇸</span>
                      <div>
                        <div className="font-semibold">{t.sidebar.serbia}</div>
                        <div className="text-sm text-navy-200">{t.sidebar.serbiaDesc}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-heading text-xl font-bold text-navy-900  mb-4">
                    {t.sidebar.nextSteps}
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                      <span>{t.sidebar.step1}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                      <span>{t.sidebar.step2}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                      <span>{t.sidebar.step3}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
                      <span>{t.sidebar.step4}</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
