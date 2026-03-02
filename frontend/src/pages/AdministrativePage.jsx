import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Scale, FileText, Clock, Users, Globe, Shield, HelpCircle, Building2, Stamp, BookOpen } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Servicii Administrative & Juridice | Global Jobs Consulting", 
      description: "Servicii complete de asistență administrativă și juridică pentru străini în România. Traduceri, legalizări, apostilă, reprezentare legală." 
    },
    hero: {
      label: "SERVICII ADMINISTRATIVE & JURIDICE",
      title: "Asistență Completă pentru Toate Nevoile Administrative",
      description: "De la traduceri autorizate până la reprezentare în fața autorităților - gestionăm toate aspectele administrative și juridice ale șederii tale în România."
    },
    services: {
      title: "Servicii Disponibile",
      categories: [
        {
          title: "Traduceri și Legalizări",
          icon: "translate",
          items: [
            { name: "Traduceri autorizate", description: "Din/în orice limbă, pentru documente oficiale" },
            { name: "Legalizări notariale", description: "Legalizarea traducerilor și documentelor" },
            { name: "Apostilă Haga", description: "Apostilarea documentelor pentru uz internațional" },
            { name: "Supralegalizare", description: "Pentru țările care nu sunt parte la Convenția de la Haga" }
          ]
        },
        {
          title: "Echivalări și Recunoașteri",
          icon: "diploma",
          items: [
            { name: "Echivalare studii CNRED", description: "Recunoașterea diplomelor străine în România" },
            { name: "Echivalare calificări profesionale", description: "Recunoașterea calificărilor pentru exercitarea profesiei" },
            { name: "Recunoaștere permis de conducere", description: "Schimbarea permisului străin cu cel românesc" },
            { name: "Echivalare căsătorie", description: "Transcrierea actelor de stare civilă" }
          ]
        },
        {
          title: "Reprezentare și Asistență",
          icon: "legal",
          items: [
            { name: "Reprezentare IGI", description: "Reprezentare în fața Inspectoratului pentru Imigrări" },
            { name: "Asistență ANAF", description: "Obținere NIF, înregistrări fiscale" },
            { name: "Deschidere cont bancar", description: "Asistență pentru deschiderea contului" },
            { name: "Înregistrare asigurări", description: "CNAS, asigurări private de sănătate" }
          ]
        },
        {
          title: "Servicii Juridice",
          icon: "scale",
          items: [
            { name: "Consultanță dreptul imigrării", description: "Sfaturi juridice specializate" },
            { name: "Contestații administrative", description: "Atacarea deciziilor de respingere" },
            { name: "Asistență contractuală", description: "Verificare și negociere contracte de muncă" },
            { name: "Reprezentare în instanță", description: "Pentru cazuri legate de imigrare" }
          ]
        }
      ]
    },
    popular: {
      title: "Cele Mai Solicitate Servicii",
      items: [
        { title: "Echivalare Diplomă", time: "30-90 zile", description: "Recunoașterea diplomei universitare străine de către CNRED" },
        { title: "Traducere + Apostilă", time: "3-7 zile", description: "Pachet complet pentru documente destinate uzului internațional" },
        { title: "Schimbare Permis Conducere", time: "30-45 zile", description: "Transformarea permisului străin în permis românesc" },
        { title: "Obținere NIF", time: "1-3 zile", description: "Număr de Identificare Fiscală pentru străini" }
      ]
    },
    process: {
      title: "Cum Funcționează",
      steps: [
        { step: "01", title: "Solicitare", description: "Ne contactezi și ne spui ce serviciu ai nevoie" },
        { step: "02", title: "Evaluare", description: "Analizăm documentele și îți spunem ce este necesar" },
        { step: "03", title: "Pregătire", description: "Colectăm și pregătim documentele necesare" },
        { step: "04", title: "Depunere", description: "Depunem dosarul la autoritățile competente" },
        { step: "05", title: "Monitorizare", description: "Urmărim procesarea și te informăm despre progres" },
        { step: "06", title: "Finalizare", description: "Îți predăm documentele finalizate" }
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        { q: "Cât durează o traducere autorizată?", a: "Traducerile simple se fac în 24-48 ore. Pentru volume mari sau documente tehnice, termenul poate fi de 3-5 zile." },
        { q: "Ce este apostila și când am nevoie de ea?", a: "Apostila este o formă de legalizare internațională. Ai nevoie de ea când folosești documente românești în străinătate sau invers." },
        { q: "Cât costă echivalarea diplomei?", a: "Taxele CNRED sunt fixe (~200-300 RON). Costurile noastre de asistență depind de complexitatea dosarului." },
        { q: "Pot schimba permisul de conducere din orice țară?", a: "Da, dar procedura și termenele variază în funcție de țara de origine și eventualele acorduri bilaterale." }
      ]
    },
    cta: {
      title: "Ai Nevoie de Asistență Administrativă?",
      description: "Contactează-ne pentru o evaluare gratuită a nevoilor tale.",
      button: "Solicită Consultanță"
    }
  },
  en: {
    meta: { title: "Administrative & Legal Services | Global Jobs Consulting", description: "Complete administrative and legal assistance for foreigners in Romania." },
    hero: { label: "ADMINISTRATIVE & LEGAL SERVICES", title: "Complete Assistance for All Administrative Needs", description: "From certified translations to representation - we handle all administrative and legal aspects." },
    services: { title: "Available Services", categories: [
      { title: "Translations & Legalizations", icon: "translate", items: [
        { name: "Certified translations", description: "From/to any language" },
        { name: "Notarial legalizations", description: "Document legalization" },
        { name: "Hague Apostille", description: "For international use" },
        { name: "Super-legalization", description: "For non-Hague countries" }
      ]},
      { title: "Equivalences & Recognition", icon: "diploma", items: [
        { name: "CNRED diploma equivalence", description: "Recognition of foreign diplomas" },
        { name: "Professional qualifications", description: "Professional recognition" },
        { name: "Driving license recognition", description: "Exchange for Romanian" },
        { name: "Marriage equivalence", description: "Civil status transcription" }
      ]},
      { title: "Representation & Assistance", icon: "legal", items: [
        { name: "IGI representation", description: "Immigration representation" },
        { name: "ANAF assistance", description: "NIF, tax registration" },
        { name: "Bank account opening", description: "Account assistance" },
        { name: "Insurance registration", description: "CNAS, private health" }
      ]},
      { title: "Legal Services", icon: "scale", items: [
        { name: "Immigration law consultation", description: "Specialized advice" },
        { name: "Administrative appeals", description: "Rejection appeals" },
        { name: "Contract assistance", description: "Contract review" },
        { name: "Court representation", description: "Immigration cases" }
      ]}
    ]},
    popular: { title: "Most Requested Services", items: [
      { title: "Diploma Equivalence", time: "30-90 days", description: "CNRED recognition" },
      { title: "Translation + Apostille", time: "3-7 days", description: "Complete package" },
      { title: "Driving License Change", time: "30-45 days", description: "Exchange to Romanian" },
      { title: "NIF Obtaining", time: "1-3 days", description: "Tax ID for foreigners" }
    ]},
    process: { title: "How It Works", steps: [
      { step: "01", title: "Request", description: "Contact us" },
      { step: "02", title: "Assessment", description: "We analyze needs" },
      { step: "03", title: "Preparation", description: "Collect documents" },
      { step: "04", title: "Submission", description: "File at authorities" },
      { step: "05", title: "Monitoring", description: "Track progress" },
      { step: "06", title: "Completion", description: "Deliver documents" }
    ]},
    faq: { title: "FAQs", items: [
      { q: "How long for translation?", a: "24-48 hours for simple, 3-5 days for complex." },
      { q: "What is apostille?", a: "International legalization form." },
      { q: "Diploma equivalence cost?", a: "CNRED fees ~200-300 RON plus our assistance." },
      { q: "Any driving license?", a: "Yes, but procedure varies by country." }
    ]},
    cta: { title: "Need Administrative Assistance?", description: "Free needs assessment.", button: "Request Consultation" }
  },
  de: {
    meta: { title: "Administrative & Rechtliche Dienste | Global Jobs Consulting", description: "Komplette Unterstützung für Ausländer in Rumänien." },
    hero: { label: "ADMINISTRATIVE & RECHTLICHE DIENSTE", title: "Komplette Administrative Unterstützung", description: "Von Übersetzungen bis zur Vertretung." },
    services: { title: "Verfügbare Dienste", categories: [
      { title: "Übersetzungen", icon: "translate", items: [
        { name: "Beglaubigte Übersetzungen", description: "Alle Sprachen" },
        { name: "Notarielle Beglaubigung", description: "Dokumentenlegalisierung" },
        { name: "Haager Apostille", description: "International" },
        { name: "Überbeglaubigung", description: "Nicht-Haager Länder" }
      ]},
      { title: "Anerkennung", icon: "diploma", items: [
        { name: "CNRED Diplom", description: "Anerkennung" },
        { name: "Berufsqualifikationen", description: "Anerkennung" },
        { name: "Führerschein", description: "Umschreibung" },
        { name: "Heirat", description: "Transkription" }
      ]},
      { title: "Vertretung", icon: "legal", items: [
        { name: "IGI Vertretung", description: "Immigration" },
        { name: "ANAF Hilfe", description: "Steuer-ID" },
        { name: "Bankkonto", description: "Eröffnung" },
        { name: "Versicherung", description: "Anmeldung" }
      ]},
      { title: "Rechtliche Dienste", icon: "scale", items: [
        { name: "Einwanderungsrecht", description: "Beratung" },
        { name: "Widersprüche", description: "Ablehnungen" },
        { name: "Verträge", description: "Prüfung" },
        { name: "Gericht", description: "Vertretung" }
      ]}
    ]},
    popular: { title: "Beliebteste Dienste", items: [
      { title: "Diplom-Anerkennung", time: "30-90 Tage", description: "CNRED" },
      { title: "Übersetzung + Apostille", time: "3-7 Tage", description: "Komplett" },
      { title: "Führerschein", time: "30-45 Tage", description: "Umschreibung" },
      { title: "NIF", time: "1-3 Tage", description: "Steuer-ID" }
    ]},
    process: { title: "Ablauf", steps: [
      { step: "01", title: "Anfrage", description: "Kontakt" },
      { step: "02", title: "Bewertung", description: "Analyse" },
      { step: "03", title: "Vorbereitung", description: "Dokumente" },
      { step: "04", title: "Einreichung", description: "Behörden" },
      { step: "05", title: "Überwachung", description: "Fortschritt" },
      { step: "06", title: "Abschluss", description: "Übergabe" }
    ]},
    faq: { title: "FAQ", items: [
      { q: "Übersetzungsdauer?", a: "24-48 Stunden oder 3-5 Tage." },
      { q: "Was ist Apostille?", a: "Internationale Beglaubigung." },
      { q: "Diplomkosten?", a: "CNRED ~200-300 RON plus Hilfe." },
      { q: "Jeder Führerschein?", a: "Ja, variiert nach Land." }
    ]},
    cta: { title: "Administrative Hilfe?", description: "Kostenlose Bewertung.", button: "Beratung" }
  },
  sr: {
    meta: { title: "Administrativne i Pravne Usluge | Global Jobs Consulting", description: "Kompletna pomoć za strance u Rumuniji." },
    hero: { label: "ADMINISTRATIVNE I PRAVNE USLUGE", title: "Kompletna Administrativna Pomoć", description: "Od prevoda do zastupanja." },
    services: { title: "Dostupne Usluge", categories: [
      { title: "Prevodi", icon: "translate", items: [
        { name: "Ovlašćeni prevodi", description: "Svi jezici" },
        { name: "Notarska overa", description: "Legalizacija" },
        { name: "Haška Apostila", description: "Međunarodno" },
        { name: "Nadovera", description: "Zemlje van Haaga" }
      ]},
      { title: "Nostrifikacija", icon: "diploma", items: [
        { name: "CNRED diploma", description: "Priznavanje" },
        { name: "Kvalifikacije", description: "Priznavanje" },
        { name: "Vozačka", description: "Zamena" },
        { name: "Brak", description: "Transkript" }
      ]},
      { title: "Zastupanje", icon: "legal", items: [
        { name: "IGI zastupanje", description: "Imigracija" },
        { name: "ANAF pomoć", description: "Poreski broj" },
        { name: "Račun u banci", description: "Otvaranje" },
        { name: "Osiguranje", description: "Registracija" }
      ]},
      { title: "Pravne Usluge", icon: "scale", items: [
        { name: "Imigraciono pravo", description: "Savetovanje" },
        { name: "Žalbe", description: "Odbijanja" },
        { name: "Ugovori", description: "Provera" },
        { name: "Sud", description: "Zastupanje" }
      ]}
    ]},
    popular: { title: "Najpopularnije", items: [
      { title: "Nostrifikacija", time: "30-90 dana", description: "CNRED" },
      { title: "Prevod + Apostila", time: "3-7 dana", description: "Komplet" },
      { title: "Vozačka", time: "30-45 dana", description: "Zamena" },
      { title: "NIF", time: "1-3 dana", description: "Poreski broj" }
    ]},
    process: { title: "Kako Funkcioniše", steps: [
      { step: "01", title: "Zahtev", description: "Kontakt" },
      { step: "02", title: "Procena", description: "Analiza" },
      { step: "03", title: "Priprema", description: "Dokumenta" },
      { step: "04", title: "Podnošenje", description: "Institucije" },
      { step: "05", title: "Praćenje", description: "Progres" },
      { step: "06", title: "Završetak", description: "Predaja" }
    ]},
    faq: { title: "Pitanja", items: [
      { q: "Trajanje prevoda?", a: "24-48 sati ili 3-5 dana." },
      { q: "Šta je apostila?", a: "Međunarodna overa." },
      { q: "Cena nostrifikacije?", a: "CNRED ~200-300 RON plus pomoć." },
      { q: "Bilo koja vozačka?", a: "Da, varira po zemlji." }
    ]},
    cta: { title: "Administrativna Pomoć?", description: "Besplatna procena.", button: "Konsultacija" }
  }
};

const iconMap = { translate: Globe, diploma: BookOpen, legal: Shield, scale: Scale };

export default function AdministrativePage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead title={t.meta.title} description={t.meta.description} language={language} />
      <div className="min-h-screen bg-gray-50" data-testid="administrative-page">
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-block bg-coral/20 text-coral px-4 py-1 rounded-full text-sm font-semibold mb-4">
                <Scale className="inline h-4 w-4 mr-2" />{t.hero.label}
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg md:text-xl">{t.hero.description}</p>
            </div>
          </div>
        </div>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.services.title}</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {t.services.categories.map((category, idx) => {
                const Icon = iconMap[category.icon] || FileText;
                return (
                  <Card key={idx} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-coral" />
                        </div>
                        <h3 className="font-heading text-xl font-bold text-navy-900">{category.title}</h3>
                      </div>
                      <div className="space-y-3">
                        {category.items.map((item, iIdx) => (
                          <div key={iIdx} className="border-l-2 border-coral pl-3">
                            <div className="font-medium text-navy-900">{item.name}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.popular.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {t.popular.items.map((item, idx) => (
                <Card key={idx} className="border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                    <div className="flex items-center justify-center gap-1 text-coral mb-3">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{item.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">{t.process.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {t.process.steps.map((step, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 text-center">
                  <div className="text-coral text-3xl font-bold mb-2">{step.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-navy-200 text-sm">{step.description}</p>
                </div>
              ))}
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
              <Link to={`${getLocalizedPath('/contact')}?service=administrative`}>{t.cta.button}<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
