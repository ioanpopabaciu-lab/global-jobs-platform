import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Flag, FileText, Clock, Users, Globe, Shield, HelpCircle, Home, Award } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Pachet SETTLEMENT & CITIZENSHIP | Global Jobs Consulting", 
      description: "Servicii pentru obținerea rezidenței permanente și cetățeniei române. Ședere pe termen lung, stabilire în România, naturalizare." 
    },
    hero: {
      label: "SETTLEMENT & CITIZENSHIP",
      title: "Stabilește-te Definitiv în România",
      description: "Te ghidăm pe drumul de la permisul de ședere temporar la reședința permanentă și, eventual, la cetățenia română."
    },
    forWhom: {
      title: "Cui Se Adresează?",
      items: [
        "Persoane cu min. 5 ani de rezidență legală în România",
        "Titulari de permis de ședere care doresc drept de ședere permanentă",
        "Rezidenți pe termen lung care doresc cetățenia română",
        "Persoane de origine română care doresc redobândirea cetățeniei",
        "Soți/soții de cetățeni români"
      ]
    },
    pathways: {
      title: "Căi spre Stabilire",
      items: [
        { 
          title: "Drept de Ședere Permanentă", 
          description: "După 5 ani de rezidență legală continuă, poți obține dreptul de ședere permanentă",
          requirements: ["5 ani rezidență legală", "Venituri stabile", "Fără antecedente penale", "Cunoașterea limbii române (A2)"]
        },
        { 
          title: "Cetățenie prin Naturalizare", 
          description: "După 8 ani de rezidență (5 cu permis permanent), poți aplica pentru cetățenie",
          requirements: ["8 ani rezidență totală", "5 ani cu ședere permanentă", "Integrare socială", "Limba română (B1)"]
        },
        { 
          title: "Cetățenie prin Căsătorie", 
          description: "Soții cetățenilor români pot obține cetățenia după 5 ani de căsătorie",
          requirements: ["5 ani căsătorie", "3 ani rezidență", "Integrare socială", "Limba română"]
        },
        { 
          title: "Redobândire Cetățenie", 
          description: "Persoanele de origine română pot redobândi cetățenia",
          requirements: ["Dovada originii române", "Acte de stare civilă", "Cazier curat", "Nu este necesară rezidența"]
        }
      ]
    },
    includes: {
      title: "Ce Include Pachetul?",
      items: [
        { icon: "eval", title: "Evaluare Traiectorie", description: "Stabilim cea mai bună cale spre obiectivul tău (ședere permanentă sau cetățenie)" },
        { icon: "file", title: "Pregătire Dosar Complet", description: "Colectăm, traducem și legalizăm toate documentele necesare" },
        { icon: "legal", title: "Asistență Juridică", description: "Reprezentare în fața autorităților și consiliere juridică" },
        { icon: "lang", title: "Pregătire Examen Limbă", description: "Resurse și îndrumare pentru certificarea lingvistică" },
        { icon: "submit", title: "Depunere și Monitorizare", description: "Depunem dosarul și monitorizăm procesul până la finalizare" },
        { icon: "ceremony", title: "Asistență Ceremonie", description: "Te însoțim la depunerea jurământului (pentru cetățenie)" }
      ]
    },
    process: {
      title: "Procesul de Obținere a Cetățeniei",
      steps: [
        { step: "01", title: "Evaluare Eligibilitate", description: "Verificăm dacă îndeplinești condițiile", duration: "1-3 zile" },
        { step: "02", title: "Certificat Lingvistic", description: "Te pregătim și programăm pentru examen", duration: "1-3 luni" },
        { step: "03", title: "Pregătire Dosar", description: "Colectăm toate documentele necesare", duration: "14-30 zile" },
        { step: "04", title: "Depunere ANC", description: "Depunem dosarul la Autoritatea pentru Cetățenie", duration: "1 zi" },
        { step: "05", title: "Verificare și Interviu", description: "Procesare dosar și eventual interviu", duration: "6-24 luni" },
        { step: "06", title: "Emitere Ordin", description: "Publicarea ordinului de acordare", duration: "1-3 luni" },
        { step: "07", title: "Jurământ", description: "Depunerea jurământului de credință", duration: "1-2 luni" },
        { step: "08", title: "Documente Identitate", description: "Obținere CI și pașaport românesc", duration: "30 zile" }
      ]
    },
    documents: {
      title: "Documente Necesare (Cetățenie)",
      items: [
        "Cerere tip pentru acordarea cetățeniei",
        "Certificat de naștere (original + traducere)",
        "Certificat de căsătorie (dacă e cazul)",
        "Permis de ședere permanentă",
        "Certificat de cazier judiciar (România + țara de origine)",
        "Certificat de competență lingvistică (B1)",
        "Dovada mijloacelor de întreținere",
        "Adeverință de la locul de muncă",
        "Declarație pe propria răspundere",
        "Dovada reședinței efective în România"
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        { q: "Pot păstra cetățenia actuală?", a: "Da, România permite dubla cetățenie. Nu trebuie să renunți la cetățenia anterioară." },
        { q: "Cât durează procesul de naturalizare?", a: "În medie 12-24 de luni de la depunerea dosarului complet, în funcție de volumul de cereri." },
        { q: "Ce nivel de limbă română am nevoie?", a: "Pentru ședere permanentă: A2. Pentru cetățenie: B1. Oferim resurse de pregătire." },
        { q: "Copiii mei pot obține cetățenia?", a: "Da, copiii minori primesc automat cetățenia odată cu părintele. Copiii majori aplică separat." }
      ]
    },
    benefits: {
      title: "Beneficiile Cetățeniei Române",
      items: [
        "Drept de vot și participare politică",
        "Pașaport UE - liberă circulație în spațiul Schengen",
        "Drept de muncă fără restricții în UE",
        "Acces la sistemul de sănătate și educație",
        "Drept de proprietate fără restricții",
        "Transmitere cetățeniei către copii"
      ]
    },
    cta: {
      title: "Începe Drumul spre Cetățenie",
      description: "Contactează-ne pentru o evaluare gratuită a eligibilității tale.",
      button: "Solicită Consultanță"
    }
  },
  en: {
    meta: { title: "SETTLEMENT & CITIZENSHIP Package | Global Jobs Consulting", description: "Services for obtaining permanent residence and Romanian citizenship." },
    hero: { label: "SETTLEMENT & CITIZENSHIP", title: "Settle Permanently in Romania", description: "We guide you from temporary residence permit to permanent residence and Romanian citizenship." },
    forWhom: { title: "Who Is It For?", items: ["People with min. 5 years legal residence", "Permit holders wanting permanent residence", "Long-term residents wanting citizenship", "People of Romanian origin", "Spouses of Romanian citizens"] },
    pathways: { title: "Pathways to Settlement", items: [
      { title: "Permanent Residence Right", description: "After 5 years of continuous legal residence", requirements: ["5 years legal residence", "Stable income", "No criminal record", "Romanian language (A2)"] },
      { title: "Citizenship by Naturalization", description: "After 8 years of residence", requirements: ["8 years total residence", "5 years permanent", "Social integration", "Romanian (B1)"] },
      { title: "Citizenship by Marriage", description: "Spouses of Romanian citizens after 5 years", requirements: ["5 years marriage", "3 years residence", "Social integration", "Romanian"] },
      { title: "Citizenship Recovery", description: "People of Romanian origin", requirements: ["Proof of origin", "Civil documents", "Clean record", "No residence required"] }
    ]},
    includes: { title: "What's Included?", items: [
      { icon: "eval", title: "Pathway Assessment", description: "We determine the best path" },
      { icon: "file", title: "Complete File Preparation", description: "We collect and prepare documents" },
      { icon: "legal", title: "Legal Assistance", description: "Representation and counsel" },
      { icon: "lang", title: "Language Exam Prep", description: "Resources for certification" },
      { icon: "submit", title: "Submission and Monitoring", description: "We submit and track" },
      { icon: "ceremony", title: "Ceremony Assistance", description: "Oath accompaniment" }
    ]},
    process: { title: "Citizenship Process", steps: [
      { step: "01", title: "Eligibility Check", description: "Verify conditions", duration: "1-3 days" },
      { step: "02", title: "Language Certificate", description: "Exam preparation", duration: "1-3 months" },
      { step: "03", title: "File Preparation", description: "Collect documents", duration: "14-30 days" },
      { step: "04", title: "ANC Submission", description: "File at Authority", duration: "1 day" },
      { step: "05", title: "Review", description: "Processing and interview", duration: "6-24 months" },
      { step: "06", title: "Order Issuance", description: "Publication", duration: "1-3 months" },
      { step: "07", title: "Oath", description: "Oath ceremony", duration: "1-2 months" },
      { step: "08", title: "ID Documents", description: "Get ID and passport", duration: "30 days" }
    ]},
    documents: { title: "Required Documents", items: ["Application form", "Birth certificate", "Marriage certificate", "Permanent permit", "Criminal record", "Language certificate (B1)", "Income proof", "Employment certificate", "Declaration", "Residence proof"] },
    faq: { title: "FAQs", items: [
      { q: "Can I keep my citizenship?", a: "Yes, Romania allows dual citizenship." },
      { q: "How long is the process?", a: "12-24 months from complete file submission." },
      { q: "What language level?", a: "Permanent residence: A2. Citizenship: B1." },
      { q: "Can my children get citizenship?", a: "Yes, minors automatically with parents." }
    ]},
    benefits: { title: "Benefits of Romanian Citizenship", items: ["Voting rights", "EU passport - Schengen freedom", "Work anywhere in EU", "Healthcare and education", "Property rights", "Citizenship for children"] },
    cta: { title: "Start Your Citizenship Journey", description: "Free eligibility assessment.", button: "Request Consultation" }
  },
  de: {
    meta: { title: "SETTLEMENT & CITIZENSHIP Paket | Global Jobs Consulting", description: "Daueraufenthalt und rumänische Staatsbürgerschaft." },
    hero: { label: "SETTLEMENT & CITIZENSHIP", title: "Dauerhaft in Rumänien Niederlassen", description: "Vom temporären zum permanenten Aufenthalt und zur Staatsbürgerschaft." },
    forWhom: { title: "Für Wen?", items: ["Min. 5 Jahre Aufenthalt", "Daueraufenthalt", "Staatsbürgerschaft", "Rumänische Abstammung", "Ehepartner"] },
    pathways: { title: "Wege", items: [
      { title: "Daueraufenthalt", description: "Nach 5 Jahren", requirements: ["5 Jahre", "Einkommen", "Kein Vorstrafenregister", "Rumänisch A2"] },
      { title: "Einbürgerung", description: "Nach 8 Jahren", requirements: ["8 Jahre total", "5 Jahre permanent", "Integration", "Rumänisch B1"] },
      { title: "Durch Heirat", description: "Nach 5 Jahren Ehe", requirements: ["5 Jahre Ehe", "3 Jahre Aufenthalt", "Integration", "Rumänisch"] },
      { title: "Wiedererlangung", description: "Rumänische Abstammung", requirements: ["Abstammungsnachweis", "Dokumente", "Sauber", "Kein Aufenthalt nötig"] }
    ]},
    includes: { title: "Inklusiv", items: [
      { icon: "eval", title: "Bewertung", description: "Bester Weg" },
      { icon: "file", title: "Dokumentenvorbereitung", description: "Vollständig" },
      { icon: "legal", title: "Rechtliche Hilfe", description: "Vertretung" },
      { icon: "lang", title: "Sprachprüfung", description: "Vorbereitung" },
      { icon: "submit", title: "Einreichung", description: "Monitoring" },
      { icon: "ceremony", title: "Zeremonie", description: "Begleitung" }
    ]},
    process: { title: "Prozess", steps: [
      { step: "01", title: "Prüfung", description: "Berechtigung", duration: "1-3 Tage" },
      { step: "02", title: "Sprachzertifikat", description: "Vorbereitung", duration: "1-3 Monate" },
      { step: "03", title: "Dokumente", description: "Sammeln", duration: "14-30 Tage" },
      { step: "04", title: "Einreichung", description: "ANC", duration: "1 Tag" },
      { step: "05", title: "Prüfung", description: "Interview", duration: "6-24 Monate" },
      { step: "06", title: "Bescheid", description: "Veröffentlichung", duration: "1-3 Monate" },
      { step: "07", title: "Eid", description: "Zeremonie", duration: "1-2 Monate" },
      { step: "08", title: "Dokumente", description: "Ausweis", duration: "30 Tage" }
    ]},
    documents: { title: "Dokumente", items: ["Antrag", "Geburtsurkunde", "Heiratsurkunde", "Permit", "Führungszeugnis", "Sprachzertifikat", "Einkommensnachweis", "Arbeitsbescheinigung", "Erklärung", "Wohnnachweis"] },
    faq: { title: "FAQ", items: [
      { q: "Doppelte Staatsbürgerschaft?", a: "Ja, erlaubt." },
      { q: "Wie lange?", a: "12-24 Monate." },
      { q: "Sprachniveau?", a: "Daueraufenthalt: A2, Staatsbürgerschaft: B1." },
      { q: "Kinder?", a: "Automatisch mit Eltern." }
    ]},
    benefits: { title: "Vorteile", items: ["Wahlrecht", "EU-Pass", "Arbeit in EU", "Gesundheit/Bildung", "Eigentum", "Kinder"] },
    cta: { title: "Starten", description: "Kostenlose Bewertung.", button: "Beratung" }
  },
  sr: {
    meta: { title: "SETTLEMENT & CITIZENSHIP Paket | Global Jobs Consulting", description: "Stalni boravak i državljanstvo." },
    hero: { label: "SETTLEMENT & CITIZENSHIP", title: "Nastanite se u Rumuniji", description: "Od privremenog do stalnog boravka i državljanstva." },
    forWhom: { title: "Kome?", items: ["Min. 5 godina boravka", "Stalni boravak", "Državljanstvo", "Rumunsko poreklo", "Supružnici"] },
    pathways: { title: "Putevi", items: [
      { title: "Stalni Boravak", description: "Posle 5 godina", requirements: ["5 godina", "Prihodi", "Bez krivičnog dosijea", "Rumunski A2"] },
      { title: "Naturalizacija", description: "Posle 8 godina", requirements: ["8 godina", "5 permanentno", "Integracija", "Rumunski B1"] },
      { title: "Kroz Brak", description: "Posle 5 godina braka", requirements: ["5 godina braka", "3 godine boravka", "Integracija", "Rumunski"] },
      { title: "Ponovno Sticanje", description: "Rumunsko poreklo", requirements: ["Dokaz porekla", "Dokumenta", "Čist dosije", "Bez boravka"] }
    ]},
    includes: { title: "Uključeno", items: [
      { icon: "eval", title: "Procena", description: "Najbolji put" },
      { icon: "file", title: "Dokumenta", description: "Kompletno" },
      { icon: "legal", title: "Pravna pomoć", description: "Zastupanje" },
      { icon: "lang", title: "Jezik", description: "Priprema" },
      { icon: "submit", title: "Podnošenje", description: "Praćenje" },
      { icon: "ceremony", title: "Ceremonija", description: "Pratnja" }
    ]},
    process: { title: "Proces", steps: [
      { step: "01", title: "Provera", description: "Podobnost", duration: "1-3 dana" },
      { step: "02", title: "Sertifikat", description: "Priprema", duration: "1-3 meseca" },
      { step: "03", title: "Dokumenta", description: "Prikupljanje", duration: "14-30 dana" },
      { step: "04", title: "Podnošenje", description: "ANC", duration: "1 dan" },
      { step: "05", title: "Obrada", description: "Intervju", duration: "6-24 meseca" },
      { step: "06", title: "Rešenje", description: "Objavljivanje", duration: "1-3 meseca" },
      { step: "07", title: "Zakletva", description: "Ceremonija", duration: "1-2 meseca" },
      { step: "08", title: "Dokumenta", description: "Lična karta", duration: "30 dana" }
    ]},
    documents: { title: "Dokumenta", items: ["Zahtev", "Izvod rođenih", "Venčani list", "Dozvola", "Uverenje", "Sertifikat", "Prihodi", "Potvrda", "Izjava", "Dokaz boravka"] },
    faq: { title: "Pitanja", items: [
      { q: "Dvojno državljanstvo?", a: "Da, dozvoljeno." },
      { q: "Koliko traje?", a: "12-24 meseca." },
      { q: "Nivo jezika?", a: "Stalni: A2, Državljanstvo: B1." },
      { q: "Deca?", a: "Automatski sa roditeljima." }
    ]},
    benefits: { title: "Benefiti", items: ["Glasanje", "EU pasoš", "Rad u EU", "Zdravstvo/obrazovanje", "Imovina", "Deca"] },
    cta: { title: "Počnite", description: "Besplatna procena.", button: "Konsultacija" }
  }
};

const iconMap = { eval: Shield, file: FileText, legal: Shield, lang: Globe, submit: FileText, ceremony: Award };

export default function SettlementCitizenshipPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead title={t.meta.title} description={t.meta.description} language={language} />
      <div className="min-h-screen bg-gray-50" data-testid="settlement-citizenship-page">
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-block bg-coral/20 text-coral px-4 py-1 rounded-full text-sm font-semibold mb-4">
                <Flag className="inline h-4 w-4 mr-2" />{t.hero.label}
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg md:text-xl">{t.hero.description}</p>
            </div>
          </div>
        </div>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.forWhom.title}</h2>
              <div className="space-y-3">
                {t.forWhom.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-coral/5 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" /><span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.pathways.title}</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {t.pathways.items.map((pathway, idx) => (
                <Card key={idx} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-bold text-navy-900 mb-3">{pathway.title}</h3>
                    <p className="text-gray-600 mb-4">{pathway.description}</p>
                    <ul className="space-y-2">
                      {pathway.requirements.map((req, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-coral" /><span className="text-gray-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.includes.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.includes.items.map((item, idx) => {
                const Icon = iconMap[item.icon] || FileText;
                return (
                  <Card key={idx} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-coral/10 rounded-xl flex items-center justify-center mb-4"><Icon className="h-6 w-6 text-coral" /></div>
                      <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">{t.process.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {t.process.steps.map((step, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10">
                  <div className="text-coral text-2xl font-bold mb-2">{step.step}</div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-navy-200 text-sm mb-2">{step.description}</p>
                  <div className="flex items-center gap-1 text-xs text-coral"><Clock className="h-3 w-3" />{step.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-coral/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.benefits.title}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {t.benefits.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow">
                    <CheckCircle2 className="h-6 w-6 text-coral" /><span className="text-navy-900 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.documents.title}</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {t.documents.items.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-coral" /><span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 flex items-center gap-3"><HelpCircle className="h-8 w-8 text-coral" />{t.faq.title}</h2>
              <div className="space-y-4">
                {t.faq.items.map((item, idx) => (
                  <Card key={idx}><CardContent className="p-6"><h3 className="font-semibold text-navy-900 mb-2">{item.q}</h3><p className="text-gray-600">{item.a}</p></CardContent></Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-coral">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">{t.cta.title}</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">{t.cta.description}</p>
            <Button asChild size="lg" className="bg-navy-900 hover:bg-navy-800 text-white rounded-full px-8">
              <Link to={`${getLocalizedPath('/contact')}?service=settlement-citizenship`}>{t.cta.button}<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
