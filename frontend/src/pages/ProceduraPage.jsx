import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, ArrowRight, Users, Building2, Plane, Shield, FileCheck, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Procedură Recrutare Non-UE | Global Jobs Consulting", 
      description: "Ghid complet pentru procedura legală de recrutare a muncitorilor non-UE în România. Aviz IGI, vize de muncă, permise de ședere." 
    },
    hero: {
      label: "Procedură Recrutare Non-UE",
      title: "Ghid Complet pentru Angajarea Muncitorilor din Afara UE",
      description: "Totul despre procedura legală de obținere a avizului de angajare IGI și aducerea forței de muncă din țări terțe în România."
    },
    intro: {
      title: "Ce Trebuie Să Știi",
      text: "Recrutarea muncitorilor din afara Uniunii Europene necesită parcurgerea unei proceduri legale stricte, reglementată de Inspectoratul General pentru Imigrări (IGI). Acest proces durează în medie 30-45 de zile și implică mai multe etape administrative.",
      highlight: "Global Jobs Consulting gestionează integral acest proces, astfel încât tu să te poți concentra pe afacerea ta."
    },
    steps: {
      title: "Etapele Procedurii",
      items: [
        {
          step: "01",
          title: "Analiza Cerințelor",
          duration: "1-3 zile",
          description: "Evaluăm nevoile companiei tale și verificăm eligibilitatea conform legislației IGI.",
          details: ["Definirea profilului postului", "Verificarea condițiilor de cazare", "Stabilirea salariului conform grilei"]
        },
        {
          step: "02", 
          title: "Adeverința AJOFM",
          duration: "5-10 zile",
          description: "Obținem adeverința de la Agenția pentru Ocuparea Forței de Muncă care atestă că nu există candidați disponibili pe piața locală.",
          details: ["Publicarea anunțului de angajare", "Perioada de așteptare legală", "Emiterea adeverinței"]
        },
        {
          step: "03",
          title: "Depunerea Dosarului IGI",
          duration: "1-3 zile",
          description: "Pregătim și depunem dosarul complet la Inspectoratul General pentru Imigrări pentru obținerea Avizului de Angajare.",
          details: ["Certificate fiscale", "Contract de muncă pre-completat", "Dovada cazării", "Certificat de atestare fiscală"]
        },
        {
          step: "04",
          title: "Procesare IGI",
          duration: "30 zile (max 45)",
          description: "IGI analizează dosarul și emite Avizul de Angajare dacă toate condițiile sunt îndeplinite.",
          details: ["Verificarea eligibilității angajatorului", "Verificarea dosarului", "Emiterea avizului"]
        },
        {
          step: "05",
          title: "Obținerea Vizei",
          duration: "15-30 zile",
          description: "Candidatul depune cererea de viză la Consulatul României din țara sa de origine.",
          details: ["Programare la consulat", "Depunerea documentelor", "Emiterea vizei de lungă ședere"]
        },
        {
          step: "06",
          title: "Sosire și Integrare",
          duration: "1-7 zile",
          description: "Coordonăm sosirea candidatului și începerea activității, inclusiv obținerea permisului de ședere.",
          details: ["Transport aeroport", "Cazare", "Înregistrare la IGI", "Permis de ședere în scop de muncă"]
        }
      ]
    },
    documents: {
      title: "Documente Necesare de la Angajator",
      items: [
        "Certificat constatator ORC (nu mai vechi de 30 zile)",
        "Certificat de atestare fiscală ANAF",
        "Contract de muncă pre-completat",
        "Dovada spațiului de cazare (contract închiriere/proprietate)",
        "Adeverință AJOFM",
        "Declarație pe propria răspundere privind condițiile oferite"
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        {
          q: "Cât durează întregul proces?",
          a: "În medie, de la depunerea dosarului până la sosirea muncitorului trec între 60-120 de zile, în funcție de țara de origine și perioada de așteptare la consolat."
        },
        {
          q: "Pot angaja muncitori pentru orice domeniu?",
          a: "Da, legislația permite angajarea în orice domeniu, dar există cerințe specifice pentru anumite sectoare (ex: construcții, HoReCa, agricultură)."
        },
        {
          q: "Ce se întâmplă dacă muncitorul pleacă înainte de termen?",
          a: "Angajatorul are obligația de a notifica IGI în termen de 3 zile. Se poate angaja un înlocuitor parcurgând aceeași procedură."
        }
      ]
    },
    cta: {
      title: "Solicită Consultanță Gratuită",
      description: "Experții noștri te pot ghida prin întregul proces de recrutare internațională.",
      button: "Completează Formularul"
    }
  },
  en: {
    meta: { 
      title: "Non-EU Recruitment Procedure | Global Jobs Consulting", 
      description: "Complete guide for the legal procedure of recruiting non-EU workers in Romania. IGI permit, work visas, residence permits." 
    },
    hero: {
      label: "Non-EU Recruitment Procedure",
      title: "Complete Guide for Hiring Workers from Outside the EU",
      description: "Everything about the legal procedure for obtaining IGI employment permits and bringing third-country workforce to Romania."
    },
    intro: {
      title: "What You Need to Know",
      text: "Recruiting workers from outside the European Union requires following a strict legal procedure regulated by the General Inspectorate for Immigration (IGI). This process takes an average of 30-45 days and involves multiple administrative steps.",
      highlight: "Global Jobs Consulting fully manages this process, so you can focus on your business."
    },
    steps: {
      title: "Procedure Steps",
      items: [
        {
          step: "01",
          title: "Requirements Analysis",
          duration: "1-3 days",
          description: "We evaluate your company's needs and verify eligibility according to IGI legislation.",
          details: ["Job profile definition", "Accommodation conditions check", "Salary according to grid"]
        },
        {
          step: "02",
          title: "AJOFM Certificate",
          duration: "5-10 days",
          description: "We obtain the certificate from the Employment Agency attesting that there are no available candidates on the local market.",
          details: ["Job posting publication", "Legal waiting period", "Certificate issuance"]
        },
        {
          step: "03",
          title: "IGI File Submission",
          duration: "1-3 days",
          description: "We prepare and submit the complete file to IGI for obtaining the Employment Permit.",
          details: ["Tax certificates", "Pre-filled employment contract", "Accommodation proof", "Fiscal attestation"]
        },
        {
          step: "04",
          title: "IGI Processing",
          duration: "30 days (max 45)",
          description: "IGI analyzes the file and issues the Employment Permit if all conditions are met.",
          details: ["Employer eligibility verification", "File verification", "Permit issuance"]
        },
        {
          step: "05",
          title: "Visa Obtaining",
          duration: "15-30 days",
          description: "The candidate applies for a visa at the Romanian Consulate in their country of origin.",
          details: ["Consulate appointment", "Document submission", "Long-stay visa issuance"]
        },
        {
          step: "06",
          title: "Arrival and Integration",
          duration: "1-7 days",
          description: "We coordinate the candidate's arrival and start of activity, including residence permit.",
          details: ["Airport transport", "Accommodation", "IGI registration", "Work residence permit"]
        }
      ]
    },
    documents: {
      title: "Documents Required from Employer",
      items: [
        "ORC certificate (not older than 30 days)",
        "ANAF tax attestation certificate",
        "Pre-filled employment contract",
        "Accommodation proof (rental/ownership contract)",
        "AJOFM certificate",
        "Declaration on own responsibility regarding conditions offered"
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "How long does the entire process take?",
          a: "On average, from file submission to worker arrival takes between 60-120 days, depending on country of origin and consulate waiting period."
        },
        {
          q: "Can I hire workers for any field?",
          a: "Yes, legislation allows hiring in any field, but there are specific requirements for certain sectors (e.g., construction, HoReCa, agriculture)."
        },
        {
          q: "What happens if the worker leaves before term?",
          a: "The employer must notify IGI within 3 days. A replacement can be hired following the same procedure."
        }
      ]
    },
    cta: {
      title: "Request Free Consultation",
      description: "Our experts can guide you through the entire international recruitment process.",
      button: "Fill Out the Form"
    }
  },
  de: {
    meta: { 
      title: "Nicht-EU-Rekrutierungsverfahren | Global Jobs Consulting", 
      description: "Vollständiger Leitfaden für das rechtliche Verfahren zur Einstellung von Nicht-EU-Arbeitnehmern in Rumänien." 
    },
    hero: {
      label: "Nicht-EU-Rekrutierungsverfahren",
      title: "Vollständiger Leitfaden zur Einstellung von Arbeitnehmern außerhalb der EU",
      description: "Alles über das rechtliche Verfahren zur Erlangung der IGI-Arbeitsgenehmigung."
    },
    intro: {
      title: "Was Sie wissen müssen",
      text: "Die Einstellung von Arbeitnehmern von außerhalb der Europäischen Union erfordert ein strenges gesetzliches Verfahren. Dieser Prozess dauert durchschnittlich 30-45 Tage.",
      highlight: "Global Jobs Consulting verwaltet diesen Prozess vollständig."
    },
    steps: {
      title: "Verfahrensschritte",
      items: [
        { step: "01", title: "Anforderungsanalyse", duration: "1-3 Tage", description: "Wir bewerten den Bedarf Ihres Unternehmens.", details: ["Jobprofil", "Unterkunft", "Gehalt"] },
        { step: "02", title: "AJOFM-Bescheinigung", duration: "5-10 Tage", description: "Bescheinigung der Arbeitsagentur.", details: ["Stellenanzeige", "Wartezeit", "Ausstellung"] },
        { step: "03", title: "IGI-Einreichung", duration: "1-3 Tage", description: "Einreichung bei IGI.", details: ["Steuerbescheinigungen", "Arbeitsvertrag", "Unterkunftsnachweis"] },
        { step: "04", title: "IGI-Bearbeitung", duration: "30 Tage (max 45)", description: "IGI prüft die Akte.", details: ["Prüfung", "Genehmigung"] },
        { step: "05", title: "Visum", duration: "15-30 Tage", description: "Visumantrag am Konsulat.", details: ["Termin", "Dokumente", "Visum"] },
        { step: "06", title: "Ankunft", duration: "1-7 Tage", description: "Koordination der Ankunft.", details: ["Transport", "Unterkunft", "Aufenthaltserlaubnis"] }
      ]
    },
    documents: {
      title: "Erforderliche Dokumente",
      items: [
        "ORC-Bescheinigung",
        "ANAF-Steuerbescheinigung",
        "Vorausgefüllter Arbeitsvertrag",
        "Unterkunftsnachweis",
        "AJOFM-Bescheinigung",
        "Eigenerklärung"
      ]
    },
    faq: {
      title: "Häufige Fragen",
      items: [
        { q: "Wie lange dauert der Prozess?", a: "Durchschnittlich 60-120 Tage von der Einreichung bis zur Ankunft." },
        { q: "Kann ich für jeden Bereich einstellen?", a: "Ja, aber mit spezifischen Anforderungen für bestimmte Sektoren." },
        { q: "Was passiert bei vorzeitigem Verlassen?", a: "IGI muss innerhalb von 3 Tagen benachrichtigt werden." }
      ]
    },
    cta: {
      title: "Kostenlose Beratung anfordern",
      description: "Unsere Experten führen Sie durch den gesamten Prozess.",
      button: "Formular ausfüllen"
    }
  },
  sr: {
    meta: { 
      title: "Procedura regrutacije Non-EU | Global Jobs Consulting", 
      description: "Kompletan vodič za zakonsku proceduru zapošljavanja radnika izvan EU u Rumuniji." 
    },
    hero: {
      label: "Procedura regrutacije Non-EU",
      title: "Kompletan Vodič za Zapošljavanje Radnika izvan EU",
      description: "Sve o zakonskoj proceduri za dobijanje IGI dozvole za zapošljavanje."
    },
    intro: {
      title: "Šta Treba da Znate",
      text: "Zapošljavanje radnika izvan Evropske unije zahteva strogi zakonski postupak. Ovaj proces traje u proseku 30-45 dana.",
      highlight: "Global Jobs Consulting u potpunosti upravlja ovim procesom."
    },
    steps: {
      title: "Koraci Procedure",
      items: [
        { step: "01", title: "Analiza Zahteva", duration: "1-3 dana", description: "Procenjujemo potrebe vaše kompanije.", details: ["Profil posla", "Smeštaj", "Plata"] },
        { step: "02", title: "AJOFM Potvrda", duration: "5-10 dana", description: "Potvrda agencije za zapošljavanje.", details: ["Oglas", "Period čekanja", "Izdavanje"] },
        { step: "03", title: "IGI Prijava", duration: "1-3 dana", description: "Podnošenje IGI-ju.", details: ["Poreske potvrde", "Ugovor", "Dokaz smeštaja"] },
        { step: "04", title: "IGI Obrada", duration: "30 dana (max 45)", description: "IGI analizira dokumentaciju.", details: ["Provera", "Izdavanje dozvole"] },
        { step: "05", title: "Viza", duration: "15-30 dana", description: "Zahtev za vizu u konzulatu.", details: ["Termin", "Dokumenti", "Viza"] },
        { step: "06", title: "Dolazak", duration: "1-7 dana", description: "Koordinacija dolaska.", details: ["Prevoz", "Smeštaj", "Boravišna dozvola"] }
      ]
    },
    documents: {
      title: "Potrebna Dokumenta",
      items: [
        "ORC potvrda",
        "ANAF poreska potvrda",
        "Popunjen ugovor o radu",
        "Dokaz o smeštaju",
        "AJOFM potvrda",
        "Izjava o uslovima"
      ]
    },
    faq: {
      title: "Česta Pitanja",
      items: [
        { q: "Koliko traje proces?", a: "U proseku 60-120 dana od prijave do dolaska." },
        { q: "Mogu li zaposliti za bilo koju oblast?", a: "Da, ali sa specifičnim zahtevima za neke sektore." },
        { q: "Šta ako radnik ode ranije?", a: "IGI mora biti obavešten u roku od 3 dana." }
      ]
    },
    cta: {
      title: "Zatražite Besplatnu Konsultaciju",
      description: "Naši stručnjaci će vas voditi kroz ceo proces.",
      button: "Popunite Formular"
    }
  }
};

export default function ProceduraPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />

      <div className="min-h-screen bg-gray-50" data-testid="procedura-page">
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

        {/* Intro */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">{t.intro.title}</h2>
              <p className="text-gray-600 text-lg mb-6">{t.intro.text}</p>
              <div className="bg-coral/10 border-l-4 border-coral p-6 rounded-r-lg">
                <p className="text-navy-900 font-medium">{t.intro.highlight}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.steps.title}</h2>
            <div className="max-w-5xl mx-auto space-y-6">
              {t.steps.items.map((step, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-navy-900 text-white p-6 md:w-48 flex flex-col justify-center items-center">
                        <div className="text-4xl font-bold text-coral">{step.step}</div>
                        <div className="text-sm text-navy-200 mt-2">{step.duration}</div>
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="font-heading text-xl font-bold text-navy-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {step.details.map((detail, dIdx) => (
                            <li key={dIdx} className="flex items-center gap-2 text-sm text-gray-500">
                              <CheckCircle2 className="h-4 w-4 text-coral flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8 flex items-center gap-3">
                <FileText className="h-8 w-8 text-coral" />
                {t.documents.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {t.documents.items.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
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
        <section className="py-16 bg-navy-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">{t.cta.title}</h2>
            <p className="text-navy-200 text-lg mb-8 max-w-2xl mx-auto">{t.cta.description}</p>
            <Button asChild size="lg" className="bg-coral hover:bg-red-600 text-white rounded-full px-8">
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
