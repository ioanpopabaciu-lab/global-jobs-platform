import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Briefcase, FileText, Clock, Users, Globe, Shield, HelpCircle, TrendingUp, Award } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Pachet WORK & CAREER | Global Jobs Consulting", 
      description: "Servicii complete pentru lucrătorii non-UE care doresc să se angajeze legal în România. Schimbare angajator, prelungire permis, aviz muncă." 
    },
    hero: {
      label: "WORK & CAREER",
      title: "Construiește-ți Cariera în România",
      description: "Servicii complete pentru lucrătorii non-UE care doresc să-și dezvolte cariera profesională în România, Austria sau Serbia."
    },
    forWhom: {
      title: "Cui Se Adresează?",
      items: [
        "Lucrători non-UE care doresc să se angajeze legal în România",
        "Persoane care vor să-și schimbe angajatorul actual",
        "Titulari de permis de ședere care doresc prelungirea",
        "Profesioniști care caută oportunități de carieră în UE",
        "Muncitori sezonieri care doresc să devină angajați permanenți"
      ]
    },
    includes: {
      title: "Ce Include Pachetul?",
      items: [
        { icon: "search", title: "Identificare Oportunități", description: "Te conectăm cu angajatori verificați care oferă condiții de muncă corecte" },
        { icon: "file", title: "Pregătire Documente", description: "Gestionăm integral documentația pentru avizul de muncă IGI" },
        { icon: "change", title: "Schimbare Angajator", description: "Asistență completă pentru transferul legal la alt angajator" },
        { icon: "extend", title: "Prelungire Permis", description: "Suport pentru prelungirea permisului de ședere în scop de muncă" },
        { icon: "legal", title: "Consultanță Juridică", description: "Verificăm contractele și te informăm despre drepturile tale" },
        { icon: "support", title: "Suport Continuu", description: "Asistență pe toată durata contractului de muncă" }
      ]
    },
    services: {
      title: "Tipuri de Servicii",
      items: [
        { title: "Prima Angajare", description: "Pentru persoane care nu au mai lucrat în România", price: "Consultație gratuită" },
        { title: "Schimbare Angajator", description: "Transfer legal la un nou angajator", price: "La cerere" },
        { title: "Prelungire Permis Muncă", description: "Reînnoire anuală a permisului de ședere", price: "La cerere" },
        { title: "Conversie Sezonier → Permanent", description: "Trecere de la statut sezonier la permanent", price: "La cerere" }
      ]
    },
    process: {
      title: "Procesul de Angajare",
      steps: [
        { step: "01", title: "Evaluare Profil", description: "Analizăm experiența, calificările și preferințele tale", duration: "1-2 zile" },
        { step: "02", title: "Identificare Angajator", description: "Găsim angajatorul potrivit pentru profilul tău", duration: "5-14 zile" },
        { step: "03", title: "Pregătire Dosar", description: "Colectăm și pregătim toate documentele necesare", duration: "7-10 zile" },
        { step: "04", title: "Depunere IGI", description: "Depunem dosarul pentru avizul de muncă", duration: "30-45 zile" },
        { step: "05", title: "Obținere Viză/Permis", description: "Gestionăm obținerea vizei sau permisului de ședere", duration: "15-30 zile" },
        { step: "06", title: "Începere Activitate", description: "Te susținem în primele zile la noul loc de muncă", duration: "Continuu" }
      ]
    },
    documents: {
      title: "Documente Necesare",
      items: [
        "Pașaport valid (min. 6 luni)",
        "Permis de ședere actual (dacă există)",
        "Contract de muncă anterior (dacă există)",
        "Diplome și certificate profesionale",
        "CV actualizat",
        "Certificat de cazier judiciar",
        "Dovada cazării în România"
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        { q: "Pot schimba angajatorul înainte de expirarea contractului?", a: "Da, dar este necesară parcurgerea procedurii legale. Noul angajator trebuie să obțină un nou aviz de muncă pentru tine." },
        { q: "Cât durează procedura de schimbare a angajatorului?", a: "În medie 45-60 de zile, incluzând obținerea noului aviz și actualizarea permisului de ședere." },
        { q: "Ce se întâmplă dacă rămân fără loc de muncă?", a: "Ai la dispoziție 90 de zile pentru a găsi un nou angajator, altfel trebuie să părăsești țara." },
        { q: "Pot aduce familia în România?", a: "Da, după 1 an de rezidență legală poți aplica pentru reunificarea familiei. Vezi pachetul FAMILY REUNION." }
      ]
    },
    cta: {
      title: "Construiește-ți Viitorul Profesional",
      description: "Contactează-ne pentru a discuta despre oportunitățile de carieră disponibile.",
      button: "Solicită Consultanță"
    }
  },
  en: {
    meta: { 
      title: "WORK & CAREER Package | Global Jobs Consulting", 
      description: "Complete services for non-EU workers who want to work legally in Romania. Employer change, permit extension, work permit." 
    },
    hero: {
      label: "WORK & CAREER",
      title: "Build Your Career in Romania",
      description: "Complete services for non-EU workers who want to develop their professional career in Romania, Austria or Serbia."
    },
    forWhom: {
      title: "Who Is It For?",
      items: [
        "Non-EU workers who want to work legally in Romania",
        "People who want to change their current employer",
        "Residence permit holders who want extension",
        "Professionals looking for career opportunities in EU",
        "Seasonal workers who want to become permanent employees"
      ]
    },
    includes: {
      title: "What Does the Package Include?",
      items: [
        { icon: "search", title: "Opportunity Identification", description: "We connect you with verified employers offering fair working conditions" },
        { icon: "file", title: "Document Preparation", description: "We fully manage documentation for IGI work permit" },
        { icon: "change", title: "Employer Change", description: "Complete assistance for legal transfer to another employer" },
        { icon: "extend", title: "Permit Extension", description: "Support for work residence permit extension" },
        { icon: "legal", title: "Legal Consultation", description: "We verify contracts and inform you about your rights" },
        { icon: "support", title: "Continuous Support", description: "Assistance throughout the employment contract" }
      ]
    },
    services: {
      title: "Service Types",
      items: [
        { title: "First Employment", description: "For people who haven't worked in Romania before", price: "Free consultation" },
        { title: "Employer Change", description: "Legal transfer to a new employer", price: "On request" },
        { title: "Work Permit Extension", description: "Annual renewal of residence permit", price: "On request" },
        { title: "Seasonal → Permanent Conversion", description: "Transition from seasonal to permanent status", price: "On request" }
      ]
    },
    process: {
      title: "Employment Process",
      steps: [
        { step: "01", title: "Profile Assessment", description: "We analyze your experience, qualifications and preferences", duration: "1-2 days" },
        { step: "02", title: "Employer Identification", description: "We find the right employer for your profile", duration: "5-14 days" },
        { step: "03", title: "File Preparation", description: "We collect and prepare all necessary documents", duration: "7-10 days" },
        { step: "04", title: "IGI Submission", description: "We submit the work permit file", duration: "30-45 days" },
        { step: "05", title: "Visa/Permit Obtaining", description: "We manage visa or residence permit obtaining", duration: "15-30 days" },
        { step: "06", title: "Start Work", description: "We support you in the first days at your new job", duration: "Continuous" }
      ]
    },
    documents: {
      title: "Required Documents",
      items: ["Valid passport (min. 6 months)", "Current residence permit (if any)", "Previous employment contract (if any)", "Diplomas and professional certificates", "Updated CV", "Criminal record certificate", "Proof of accommodation in Romania"]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        { q: "Can I change employer before contract expires?", a: "Yes, but the legal procedure must be followed. New employer must obtain a new work permit for you." },
        { q: "How long does employer change procedure take?", a: "On average 45-60 days, including new permit and residence permit update." },
        { q: "What happens if I lose my job?", a: "You have 90 days to find a new employer, otherwise you must leave the country." },
        { q: "Can I bring my family to Romania?", a: "Yes, after 1 year of legal residence you can apply for family reunification. See FAMILY REUNION package." }
      ]
    },
    cta: {
      title: "Build Your Professional Future",
      description: "Contact us to discuss available career opportunities.",
      button: "Request Consultation"
    }
  },
  de: {
    meta: { title: "WORK & CAREER Paket | Global Jobs Consulting", description: "Komplette Dienstleistungen für Nicht-EU-Arbeiter in Rumänien." },
    hero: { label: "WORK & CAREER", title: "Bauen Sie Ihre Karriere in Rumänien", description: "Komplette Dienstleistungen für Nicht-EU-Arbeiter." },
    forWhom: { title: "Für Wen?", items: ["Nicht-EU-Arbeiter", "Arbeitgeberwechsel", "Permit-Verlängerung", "Karrieremöglichkeiten", "Saisonarbeiter → Festanstellung"] },
    includes: { title: "Was Beinhaltet das Paket?", items: [
      { icon: "search", title: "Arbeitgebersuche", description: "Verbindung mit verifizierten Arbeitgebern" },
      { icon: "file", title: "Dokumentenvorbereitung", description: "Vollständige Dokumentation" },
      { icon: "change", title: "Arbeitgeberwechsel", description: "Legaler Transfer" },
      { icon: "extend", title: "Permit-Verlängerung", description: "Jährliche Erneuerung" },
      { icon: "legal", title: "Rechtsberatung", description: "Vertragsprüfung" },
      { icon: "support", title: "Support", description: "Kontinuierliche Unterstützung" }
    ]},
    services: { title: "Dienstleistungsarten", items: [
      { title: "Erstbeschäftigung", description: "Für Neuankömmlinge", price: "Kostenlos" },
      { title: "Arbeitgeberwechsel", description: "Legaler Transfer", price: "Auf Anfrage" },
      { title: "Permit-Verlängerung", description: "Jährlich", price: "Auf Anfrage" },
      { title: "Saisonal → Permanent", description: "Statuswechsel", price: "Auf Anfrage" }
    ]},
    process: { title: "Beschäftigungsprozess", steps: [
      { step: "01", title: "Bewertung", description: "Profilanalyse", duration: "1-2 Tage" },
      { step: "02", title: "Arbeitgeber finden", description: "Passenden Arbeitgeber", duration: "5-14 Tage" },
      { step: "03", title: "Dokumente", description: "Vorbereitung", duration: "7-10 Tage" },
      { step: "04", title: "IGI-Einreichung", description: "Arbeitserlaubnis", duration: "30-45 Tage" },
      { step: "05", title: "Visum/Permit", description: "Erhalt", duration: "15-30 Tage" },
      { step: "06", title: "Arbeitsbeginn", description: "Unterstützung", duration: "Kontinuierlich" }
    ]},
    documents: { title: "Dokumente", items: ["Reisepass", "Aktueller Permit", "Früherer Vertrag", "Zeugnisse", "CV", "Führungszeugnis", "Unterkunftsnachweis"] },
    faq: { title: "Häufige Fragen", items: [
      { q: "Arbeitgeberwechsel vor Vertragsende?", a: "Ja, mit legalem Verfahren." },
      { q: "Wie lange dauert der Wechsel?", a: "45-60 Tage." },
      { q: "Was bei Jobverlust?", a: "90 Tage Zeit für neuen Arbeitgeber." },
      { q: "Familie mitbringen?", a: "Nach 1 Jahr Residenz möglich." }
    ]},
    cta: { title: "Ihre Berufliche Zukunft", description: "Kontaktieren Sie uns.", button: "Beratung Anfordern" }
  },
  sr: {
    meta: { title: "WORK & CAREER Paket | Global Jobs Consulting", description: "Kompletne usluge za Non-EU radnike u Rumuniji." },
    hero: { label: "WORK & CAREER", title: "Izgradite Karijeru u Rumuniji", description: "Kompletne usluge za Non-EU radnike." },
    forWhom: { title: "Kome Je Namenjeno?", items: ["Non-EU radnici", "Promena poslodavca", "Produženje dozvole", "Karierne prilike", "Sezonski → stalni"] },
    includes: { title: "Šta Uključuje?", items: [
      { icon: "search", title: "Pronalaženje Poslodavca", description: "Povezivanje sa proverenim poslodavcima" },
      { icon: "file", title: "Priprema Dokumenata", description: "Kompletna dokumentacija" },
      { icon: "change", title: "Promena Poslodavca", description: "Legalni transfer" },
      { icon: "extend", title: "Produženje Dozvole", description: "Godišnja obnova" },
      { icon: "legal", title: "Pravno Savetovanje", description: "Provera ugovora" },
      { icon: "support", title: "Podrška", description: "Kontinuirana pomoć" }
    ]},
    services: { title: "Vrste Usluga", items: [
      { title: "Prvo Zaposlenje", description: "Za nove dolaske", price: "Besplatno" },
      { title: "Promena Poslodavca", description: "Legalni transfer", price: "Na zahtev" },
      { title: "Produženje", description: "Godišnje", price: "Na zahtev" },
      { title: "Sezonski → Stalni", description: "Promena statusa", price: "Na zahtev" }
    ]},
    process: { title: "Proces Zapošljavanja", steps: [
      { step: "01", title: "Procena", description: "Analiza profila", duration: "1-2 dana" },
      { step: "02", title: "Pronalaženje", description: "Odgovarajući poslodavac", duration: "5-14 dana" },
      { step: "03", title: "Dokumenta", description: "Priprema", duration: "7-10 dana" },
      { step: "04", title: "IGI Prijava", description: "Radna dozvola", duration: "30-45 dana" },
      { step: "05", title: "Viza/Dozvola", description: "Dobijanje", duration: "15-30 dana" },
      { step: "06", title: "Početak Rada", description: "Podrška", duration: "Kontinuirano" }
    ]},
    documents: { title: "Dokumenta", items: ["Pasoš", "Trenutna dozvola", "Prethodni ugovor", "Diplome", "CV", "Uverenje", "Dokaz smeštaja"] },
    faq: { title: "Česta Pitanja", items: [
      { q: "Promena pre isteka ugovora?", a: "Da, uz legalni postupak." },
      { q: "Koliko traje promena?", a: "45-60 dana." },
      { q: "Šta ako izgubim posao?", a: "90 dana za novog poslodavca." },
      { q: "Mogu li dovesti porodicu?", a: "Da, posle 1 godine." }
    ]},
    cta: { title: "Vaša Profesionalna Budućnost", description: "Kontaktirajte nas.", button: "Zatražite Konsultaciju" }
  }
};

const iconMap = { search: TrendingUp, file: FileText, change: Users, extend: Clock, legal: Shield, support: Award };

export default function WorkCareerPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead title={t.meta.title} description={t.meta.description} language={language} />
      <div className="min-h-screen bg-gray-50" data-testid="work-career-page">
        {/* Hero */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-block bg-coral/20 text-coral px-4 py-1 rounded-full text-sm font-semibold mb-4">
                <Briefcase className="inline h-4 w-4 mr-2" />{t.hero.label}
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg md:text-xl">{t.hero.description}</p>
            </div>
          </div>
        </div>

        {/* For Whom */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.forWhom.title}</h2>
              <div className="space-y-3">
                {t.forWhom.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-coral/5 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.services.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {t.services.items.map((service, idx) => (
                <Card key={idx} className="border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <div className="text-coral font-semibold">{service.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.includes.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.includes.items.map((item, idx) => {
                const Icon = iconMap[item.icon] || FileText;
                return (
                  <Card key={idx} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-coral/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-coral" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-navy-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">{t.process.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.process.steps.map((step, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                  <div className="text-coral text-3xl font-bold mb-2">{step.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-navy-200 text-sm mb-3">{step.description}</p>
                  <div className="flex items-center gap-1 text-xs text-coral"><Clock className="h-3 w-3" />{step.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 flex items-center gap-3">
                <FileText className="h-8 w-8 text-coral" />{t.documents.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {t.documents.items.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-coral flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 flex items-center gap-3">
                <HelpCircle className="h-8 w-8 text-coral" />{t.faq.title}
              </h2>
              <div className="space-y-4">
                {t.faq.items.map((item, idx) => (
                  <Card key={idx}><CardContent className="p-6">
                    <h3 className="font-semibold text-navy-900 mb-2">{item.q}</h3>
                    <p className="text-gray-600">{item.a}</p>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-coral">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">{t.cta.title}</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">{t.cta.description}</p>
            <Button asChild size="lg" className="bg-navy-900 hover:bg-navy-800 text-white rounded-full px-8">
              <Link to={`${getLocalizedPath('/contact')}?service=work-career`}>{t.cta.button}<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
