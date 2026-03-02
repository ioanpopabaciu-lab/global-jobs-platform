import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Clock, Euro, FileText, Users, Plane, Building2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Costuri și Termene Recrutare Non-UE | Global Jobs Consulting", 
      description: "Informații complete despre costurile și termenele pentru angajarea muncitorilor din afara UE în România. Taxe IGI, costuri agenție, timpi de procesare." 
    },
    hero: {
      label: "Costuri & Termene",
      title: "Cât Costă și Cât Durează Recrutarea Non-UE?",
      description: "Transparență totală: toate costurile și termenele implicate în procesul de recrutare a muncitorilor din afara Uniunii Europene."
    },
    timeline: {
      title: "Durata Totală a Procesului",
      description: "De la depunerea cererii până la sosirea muncitorului",
      total: "60-120 zile",
      note: "Termenul variază în funcție de țara de origine și perioada de așteptare la consulat",
      phases: [
        { name: "Verificare eligibilitate", duration: "1-3 zile" },
        { name: "Adeverință AJOFM", duration: "5-10 zile" },
        { name: "Procesare IGI", duration: "30-45 zile" },
        { name: "Obținere viză", duration: "15-30 zile" },
        { name: "Transport și sosire", duration: "7-14 zile" }
      ]
    },
    costs: {
      title: "Structura Costurilor",
      description: "Costurile sunt împărțite în taxe oficiale și servicii de recrutare",
      categories: [
        {
          title: "Taxe Oficiale IGI",
          icon: "file",
          items: [
            { name: "Aviz de Angajare - Muncitor Permanent", price: "~100 EUR", note: "Taxă de stat" },
            { name: "Aviz de Angajare - Muncitor Sezonier", price: "~25 EUR", note: "Taxă de stat" },
            { name: "Permis de Ședere (anual)", price: "~120 EUR", note: "Plătit de muncitor" },
            { name: "Viză de lungă ședere", price: "~120 EUR", note: "Plătit de muncitor" }
          ]
        },
        {
          title: "Costuri Consulat",
          icon: "plane",
          items: [
            { name: "Taxa de viză", price: "Variabil", note: "Depinde de țara de origine" },
            { name: "Traduceri și legalizări", price: "50-150 EUR", note: "Documente personale" }
          ]
        },
        {
          title: "Costuri Angajator",
          icon: "building",
          items: [
            { name: "Servicii recrutare GJC", price: "La cerere", note: "Ofertă personalizată" },
            { name: "Transport aerian muncitor", price: "300-800 EUR", note: "În funcție de origine" },
            { name: "Cazare primă lună", price: "Variabil", note: "Obligația angajatorului" }
          ]
        }
      ]
    },
    included: {
      title: "Ce Include Serviciul Nostru",
      items: [
        "Verificarea completă a eligibilității companiei",
        "Selecția și pre-screening-ul candidaților",
        "Pregătirea întregului dosar pentru IGI",
        "Asistență în obținerea adeverinței AJOFM",
        "Coordonare cu consulatul pentru viză",
        "Organizare transport și primire la aeroport",
        "Asistență la obținerea permisului de ședere",
        "Suport post-angajare pentru primele 6 luni"
      ]
    },
    comparison: {
      title: "De Ce Global Jobs Consulting?",
      headers: ["Aspect", "Fără Agenție", "Cu GJC"],
      rows: [
        { aspect: "Timp alocat de angajator", without: "80+ ore", with: "Sub 5 ore" },
        { aspect: "Risc de respingere dosar", without: "Ridicat", with: "Minim" },
        { aspect: "Cunoaștere legislație", without: "Necesară", with: "Nu este necesară" },
        { aspect: "Selecție candidați", without: "Dificilă", with: "Pre-verificați" },
        { aspect: "Suport post-angajare", without: "Nu", with: "6 luni inclus" },
        { aspect: "Garanție înlocuire", without: "Nu", with: "Da" }
      ]
    },
    faq: {
      title: "Întrebări Frecvente despre Costuri",
      items: [
        {
          q: "Cine plătește costurile de recrutare?",
          a: "Conform legislației, angajatorul suportă costurile de recrutare. Muncitorul plătește doar taxele personale (viză, permis de ședere)."
        },
        {
          q: "Există costuri ascunse?",
          a: "Nu. Toate costurile sunt prezentate transparent în oferta noastră, iar contractul specifică clar ce este inclus și ce nu."
        },
        {
          q: "Se poate plăti în rate?",
          a: "Da, oferim opțiuni de plată eșalonată pentru serviciile noastre de recrutare."
        },
        {
          q: "Ce se întâmplă dacă muncitorul pleacă înainte de termen?",
          a: "Oferim garanție de înlocuire în primele 6 luni. În funcție de contract, înlocuirea poate fi gratuită sau cu costuri reduse."
        }
      ]
    },
    cta: {
      title: "Solicită o Ofertă Personalizată",
      description: "Completează formularul și primești o ofertă detaliată în maxim 24 de ore, fără obligații.",
      button: "Solicită Ofertă Gratuită"
    }
  },
  en: {
    meta: { 
      title: "Non-EU Recruitment Costs and Timelines | Global Jobs Consulting", 
      description: "Complete information about costs and timelines for hiring non-EU workers in Romania. IGI fees, agency costs, processing times." 
    },
    hero: {
      label: "Costs & Timelines",
      title: "How Much Does Non-EU Recruitment Cost and How Long Does It Take?",
      description: "Total transparency: all costs and timelines involved in the non-EU worker recruitment process."
    },
    timeline: {
      title: "Total Process Duration",
      description: "From application submission to worker arrival",
      total: "60-120 days",
      note: "Timeline varies depending on country of origin and consulate waiting period",
      phases: [
        { name: "Eligibility verification", duration: "1-3 days" },
        { name: "AJOFM certificate", duration: "5-10 days" },
        { name: "IGI processing", duration: "30-45 days" },
        { name: "Visa obtaining", duration: "15-30 days" },
        { name: "Transport and arrival", duration: "7-14 days" }
      ]
    },
    costs: {
      title: "Cost Structure",
      description: "Costs are divided into official fees and recruitment services",
      categories: [
        {
          title: "Official IGI Fees",
          icon: "file",
          items: [
            { name: "Employment Permit - Permanent Worker", price: "~100 EUR", note: "State fee" },
            { name: "Employment Permit - Seasonal Worker", price: "~25 EUR", note: "State fee" },
            { name: "Residence Permit (annual)", price: "~120 EUR", note: "Paid by worker" },
            { name: "Long-stay visa", price: "~120 EUR", note: "Paid by worker" }
          ]
        },
        {
          title: "Consulate Costs",
          icon: "plane",
          items: [
            { name: "Visa fee", price: "Variable", note: "Depends on country of origin" },
            { name: "Translations and legalizations", price: "50-150 EUR", note: "Personal documents" }
          ]
        },
        {
          title: "Employer Costs",
          icon: "building",
          items: [
            { name: "GJC recruitment services", price: "On request", note: "Personalized offer" },
            { name: "Worker air transport", price: "300-800 EUR", note: "Depending on origin" },
            { name: "First month accommodation", price: "Variable", note: "Employer obligation" }
          ]
        }
      ]
    },
    included: {
      title: "What Our Service Includes",
      items: [
        "Complete company eligibility verification",
        "Candidate selection and pre-screening",
        "Full IGI file preparation",
        "Assistance in obtaining AJOFM certificate",
        "Coordination with consulate for visa",
        "Transport organization and airport pickup",
        "Assistance in obtaining residence permit",
        "Post-employment support for first 6 months"
      ]
    },
    comparison: {
      title: "Why Global Jobs Consulting?",
      headers: ["Aspect", "Without Agency", "With GJC"],
      rows: [
        { aspect: "Employer time allocated", without: "80+ hours", with: "Under 5 hours" },
        { aspect: "File rejection risk", without: "High", with: "Minimal" },
        { aspect: "Legislation knowledge", without: "Required", with: "Not required" },
        { aspect: "Candidate selection", without: "Difficult", with: "Pre-verified" },
        { aspect: "Post-employment support", without: "No", with: "6 months included" },
        { aspect: "Replacement guarantee", without: "No", with: "Yes" }
      ]
    },
    faq: {
      title: "Frequently Asked Questions About Costs",
      items: [
        { q: "Who pays the recruitment costs?", a: "By law, the employer bears recruitment costs. The worker only pays personal fees (visa, residence permit)." },
        { q: "Are there hidden costs?", a: "No. All costs are transparently presented in our offer, and the contract clearly specifies what is included." },
        { q: "Can I pay in installments?", a: "Yes, we offer installment payment options for our recruitment services." },
        { q: "What happens if the worker leaves early?", a: "We offer replacement guarantee in the first 6 months. Depending on contract, replacement can be free or at reduced cost." }
      ]
    },
    cta: {
      title: "Request a Personalized Offer",
      description: "Fill out the form and receive a detailed offer within 24 hours, no obligations.",
      button: "Request Free Offer"
    }
  },
  de: {
    meta: { 
      title: "Kosten und Fristen Nicht-EU-Rekrutierung | Global Jobs Consulting", 
      description: "Vollständige Informationen über Kosten und Fristen für die Einstellung von Nicht-EU-Arbeitnehmern in Rumänien." 
    },
    hero: {
      label: "Kosten & Fristen",
      title: "Was Kostet die Nicht-EU-Rekrutierung und Wie Lange Dauert Sie?",
      description: "Vollständige Transparenz: alle Kosten und Fristen im Rekrutierungsprozess."
    },
    timeline: {
      title: "Gesamte Prozessdauer",
      description: "Von der Antragstellung bis zur Ankunft des Arbeitnehmers",
      total: "60-120 Tage",
      note: "Zeitrahmen variiert je nach Herkunftsland und Wartezeit am Konsulat",
      phases: [
        { name: "Berechtigungsprüfung", duration: "1-3 Tage" },
        { name: "AJOFM-Bescheinigung", duration: "5-10 Tage" },
        { name: "IGI-Bearbeitung", duration: "30-45 Tage" },
        { name: "Visum erhalten", duration: "15-30 Tage" },
        { name: "Transport und Ankunft", duration: "7-14 Tage" }
      ]
    },
    costs: {
      title: "Kostenstruktur",
      description: "Kosten aufgeteilt in offizielle Gebühren und Rekrutierungsdienste",
      categories: [
        {
          title: "Offizielle IGI-Gebühren",
          icon: "file",
          items: [
            { name: "Arbeitsgenehmigung - Festangestellter", price: "~100 EUR", note: "Staatsgebühr" },
            { name: "Arbeitsgenehmigung - Saisonarbeiter", price: "~25 EUR", note: "Staatsgebühr" },
            { name: "Aufenthaltserlaubnis (jährlich)", price: "~120 EUR", note: "Vom Arbeiter bezahlt" },
            { name: "Langzeitvisum", price: "~120 EUR", note: "Vom Arbeiter bezahlt" }
          ]
        },
        {
          title: "Konsulatskosten",
          icon: "plane",
          items: [
            { name: "Visumgebühr", price: "Variabel", note: "Je nach Herkunftsland" },
            { name: "Übersetzungen", price: "50-150 EUR", note: "Persönliche Dokumente" }
          ]
        },
        {
          title: "Arbeitgeberkosten",
          icon: "building",
          items: [
            { name: "GJC Rekrutierungsdienste", price: "Auf Anfrage", note: "Personalisiertes Angebot" },
            { name: "Flugtransport Arbeiter", price: "300-800 EUR", note: "Je nach Herkunft" },
            { name: "Unterkunft erster Monat", price: "Variabel", note: "Arbeitgeberpflicht" }
          ]
        }
      ]
    },
    included: {
      title: "Was Unser Service Beinhaltet",
      items: [
        "Vollständige Berechtigungsprüfung",
        "Kandidatenauswahl und Pre-Screening",
        "Vollständige IGI-Akte",
        "Hilfe bei AJOFM-Bescheinigung",
        "Konsulatskoordination",
        "Transportorganisation",
        "Hilfe bei Aufenthaltserlaubnis",
        "6 Monate Post-Support"
      ]
    },
    comparison: {
      title: "Warum Global Jobs Consulting?",
      headers: ["Aspekt", "Ohne Agentur", "Mit GJC"],
      rows: [
        { aspect: "Arbeitgeberzeit", without: "80+ Stunden", with: "Unter 5 Stunden" },
        { aspect: "Ablehnungsrisiko", without: "Hoch", with: "Minimal" },
        { aspect: "Gesetzeskenntnis", without: "Erforderlich", with: "Nicht erforderlich" },
        { aspect: "Kandidatenauswahl", without: "Schwierig", with: "Vorgeprüft" },
        { aspect: "Post-Support", without: "Nein", with: "6 Monate" },
        { aspect: "Ersatzgarantie", without: "Nein", with: "Ja" }
      ]
    },
    faq: {
      title: "Häufige Kostenfragen",
      items: [
        { q: "Wer zahlt die Rekrutierungskosten?", a: "Laut Gesetz trägt der Arbeitgeber die Kosten. Der Arbeiter zahlt nur persönliche Gebühren." },
        { q: "Gibt es versteckte Kosten?", a: "Nein. Alle Kosten sind transparent in unserem Angebot." },
        { q: "Ratenzahlung möglich?", a: "Ja, wir bieten Ratenzahlungsoptionen." },
        { q: "Was wenn Arbeiter früh geht?", a: "6 Monate Ersatzgarantie. Kostenloser oder reduzierter Ersatz." }
      ]
    },
    cta: {
      title: "Personalisiertes Angebot Anfordern",
      description: "Formular ausfüllen, Angebot in 24 Stunden, keine Verpflichtungen.",
      button: "Kostenloses Angebot Anfordern"
    }
  },
  sr: {
    meta: { 
      title: "Troškovi i Rokovi Non-EU Regrutacije | Global Jobs Consulting", 
      description: "Kompletne informacije o troškovima i rokovima za zapošljavanje radnika izvan EU u Rumuniji." 
    },
    hero: {
      label: "Troškovi i Rokovi",
      title: "Koliko Košta i Koliko Traje Non-EU Regrutacija?",
      description: "Potpuna transparentnost: svi troškovi i rokovi u procesu regrutacije."
    },
    timeline: {
      title: "Ukupno Trajanje Procesa",
      description: "Od podnošenja zahteva do dolaska radnika",
      total: "60-120 dana",
      note: "Vremenski okvir varira u zavisnosti od zemlje porekla",
      phases: [
        { name: "Provera podobnosti", duration: "1-3 dana" },
        { name: "AJOFM potvrda", duration: "5-10 dana" },
        { name: "IGI obrada", duration: "30-45 dana" },
        { name: "Dobijanje vize", duration: "15-30 dana" },
        { name: "Transport i dolazak", duration: "7-14 dana" }
      ]
    },
    costs: {
      title: "Struktura Troškova",
      description: "Troškovi podeljeni na službene takse i usluge regrutacije",
      categories: [
        {
          title: "Službene IGI Takse",
          icon: "file",
          items: [
            { name: "Radna dozvola - Stalni radnik", price: "~100 EUR", note: "Državna taksa" },
            { name: "Radna dozvola - Sezonski radnik", price: "~25 EUR", note: "Državna taksa" },
            { name: "Boravišna dozvola (godišnje)", price: "~120 EUR", note: "Plaća radnik" },
            { name: "Dugotrajna viza", price: "~120 EUR", note: "Plaća radnik" }
          ]
        },
        {
          title: "Konzularski Troškovi",
          icon: "plane",
          items: [
            { name: "Taksa za vizu", price: "Varijabilno", note: "Zavisi od zemlje" },
            { name: "Prevodi i overe", price: "50-150 EUR", note: "Lična dokumenta" }
          ]
        },
        {
          title: "Troškovi Poslodavca",
          icon: "building",
          items: [
            { name: "GJC usluge regrutacije", price: "Na zahtev", note: "Personalizovana ponuda" },
            { name: "Avionski prevoz radnika", price: "300-800 EUR", note: "Zavisno od porekla" },
            { name: "Smeštaj prvi mesec", price: "Varijabilno", note: "Obaveza poslodavca" }
          ]
        }
      ]
    },
    included: {
      title: "Šta Uključuje Naša Usluga",
      items: [
        "Potpuna provera podobnosti",
        "Selekcija kandidata",
        "Priprema IGI dokumentacije",
        "Pomoć sa AJOFM potvrdom",
        "Koordinacija sa konzulatom",
        "Organizacija transporta",
        "Pomoć sa boravišnom dozvolom",
        "6 meseci post-podrške"
      ]
    },
    comparison: {
      title: "Zašto Global Jobs Consulting?",
      headers: ["Aspekt", "Bez Agencije", "Sa GJC"],
      rows: [
        { aspect: "Vreme poslodavca", without: "80+ sati", with: "Ispod 5 sati" },
        { aspect: "Rizik odbijanja", without: "Visok", with: "Minimalan" },
        { aspect: "Poznavanje zakona", without: "Potrebno", with: "Nije potrebno" },
        { aspect: "Izbor kandidata", without: "Teško", with: "Provereni" },
        { aspect: "Post-podrška", without: "Ne", with: "6 meseci" },
        { aspect: "Garancija zamene", without: "Ne", with: "Da" }
      ]
    },
    faq: {
      title: "Česta Pitanja o Troškovima",
      items: [
        { q: "Ko plaća troškove regrutacije?", a: "Po zakonu, poslodavac snosi troškove. Radnik plaća samo lične takse." },
        { q: "Ima li skrivenih troškova?", a: "Ne. Svi troškovi su transparentno prikazani." },
        { q: "Može li se platiti na rate?", a: "Da, nudimo opcije plaćanja na rate." },
        { q: "Šta ako radnik ode ranije?", a: "6 meseci garancije zamene. Besplatna ili smanjena zamena." }
      ]
    },
    cta: {
      title: "Zatražite Personalizovanu Ponudu",
      description: "Popunite formular, ponuda u 24 sata, bez obaveza.",
      button: "Zatražite Besplatnu Ponudu"
    }
  }
};

const iconMap = {
  file: FileText,
  plane: Plane,
  building: Building2
};

export default function CosturiPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />

      <div className="min-h-screen bg-gray-50" data-testid="costuri-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white pt-40 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <span className="text-coral font-semibold text-sm tracking-wider uppercase">{t.hero.label}</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mt-3 mb-6">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg">{t.hero.description}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.timeline.title}</h2>
              <p className="text-gray-600 mb-6">{t.timeline.description}</p>
              <div className="text-5xl font-bold text-coral mb-4">{t.timeline.total}</div>
              <p className="text-sm text-gray-500 mb-8">{t.timeline.note}</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {t.timeline.phases.map((phase, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm">
                      <div className="font-semibold">{phase.name}</div>
                      <div className="text-navy-200 text-xs">{phase.duration}</div>
                    </div>
                    {idx < t.timeline.phases.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-gray-300 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Costs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-heading text-3xl font-bold text-navy-900 mb-4">{t.costs.title}</h2>
              <p className="text-gray-600">{t.costs.description}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {t.costs.categories.map((category, idx) => {
                const Icon = iconMap[category.icon] || FileText;
                return (
                  <Card key={idx} className="overflow-hidden">
                    <CardHeader className="bg-navy-900 text-white py-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <Icon className="h-6 w-6 text-coral" />
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {category.items.map((item, iIdx) => (
                        <div key={iIdx} className={`p-4 ${iIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-navy-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.note}</div>
                            </div>
                            <div className="text-coral font-bold">{item.price}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 text-center">{t.included.title}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {t.included.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-coral/5 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 text-center">{t.comparison.title}</h2>
            <div className="max-w-3xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-900 text-white">
                    {t.comparison.headers.map((header, idx) => (
                      <th key={idx} className="p-4 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.comparison.rows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-4 font-medium text-navy-900">{row.aspect}</td>
                      <td className="p-4 text-gray-600">{row.without}</td>
                      <td className="p-4 text-coral font-semibold">{row.with}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.faq.title}</h2>
              <div className="space-y-4">
                {t.faq.items.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-navy-900 mb-2">{item.q}</h3>
                      <p className="text-gray-600">{item.a}</p>
                    </CardContent>
                  </Card>
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
              <Link to={getLocalizedPath('/formular-angajator')}>
                {t.cta.button}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
