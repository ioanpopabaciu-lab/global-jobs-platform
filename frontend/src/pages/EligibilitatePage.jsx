import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight, Building2, Users, FileCheck, AlertTriangle, Shield, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Eligibilitate Companie - Recrutare Non-UE | Global Jobs Consulting", 
      description: "Verificați dacă firma dvs. îndeplinește condițiile legale pentru angajarea muncitorilor din afara UE în România. Cerințe IGI actualizate." 
    },
    hero: {
      label: "Eligibilitate Companie",
      title: "Este Firma Ta Eligibilă pentru Recrutare Non-UE?",
      description: "Conform legislației IGI, angajatorii trebuie să îndeplinească anumite criterii pentru a putea angaja cetățeni din afara Uniunii Europene."
    },
    requirements: {
      title: "Cerințe Obligatorii pentru Angajatori",
      description: "Compania dumneavoastră trebuie să îndeplinească toate condițiile de mai jos pentru a fi eligibilă:",
      items: [
        {
          icon: "clock",
          title: "Vechime Minimă 1 An",
          description: "Compania trebuie să fie înregistrată la Registrul Comerțului de cel puțin 12 luni.",
          tip: "Se calculează de la data înregistrării CUI"
        },
        {
          icon: "users",
          title: "Minim 2 Angajați Activi",
          description: "Firma trebuie să aibă cel puțin 2 angajați cu contract de muncă activ în momentul depunerii.",
          tip: "Se verifică în REVISAL"
        },
        {
          icon: "file",
          title: "Obligații Fiscale la Zi",
          description: "Nu trebuie să existe datorii restante la ANAF. Certificatul fiscal trebuie să fie \"curat\".",
          tip: "Se solicită certificat de atestare fiscală"
        },
        {
          icon: "shield",
          title: "Fără Sancțiuni Active",
          description: "Compania nu trebuie să aibă sancțiuni active de la ANAF, ITM, AJOFM sau IGI.",
          tip: "Se verifică în bazele de date oficiale"
        },
        {
          icon: "home",
          title: "Cazare Asigurată",
          description: "Angajatorul trebuie să demonstreze că poate oferi cazare corespunzătoare muncitorilor.",
          tip: "Contract de închiriere sau proprietate"
        },
        {
          icon: "money",
          title: "Salariu Conform Legii",
          description: "Salariul oferit trebuie să fie cel puțin egal cu salariul minim pe economie pentru calificarea respectivă.",
          tip: "Se verifică grila salarială în vigoare"
        }
      ]
    },
    disqualifying: {
      title: "Situații Care Exclud Eligibilitatea",
      items: [
        "Companie înființată de mai puțin de 1 an",
        "Lipsa angajaților sau un singur angajat",
        "Datorii restante la bugetul de stat",
        "Sancțiuni aplicate de ITM în ultimele 12 luni",
        "Sancțiuni IGI pentru încălcări anterioare ale regimului străinilor",
        "Imposibilitatea de a dovedi cazare corespunzătoare",
        "Salariu oferit sub minimul legal"
      ]
    },
    process: {
      title: "Cum Verificăm Eligibilitatea",
      steps: [
        { step: "1", title: "Completezi Formularul", description: "Ne transmiți datele companiei prin formularul online." },
        { step: "2", title: "Analizăm Documentele", description: "Verificăm toate criteriile de eligibilitate." },
        { step: "3", title: "Primești Răspunsul", description: "În maxim 24h te informăm dacă firma este eligibilă." },
        { step: "4", title: "Începem Procedura", description: "Dacă totul este în regulă, trecem la etapa următoare." }
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        {
          q: "Ce fac dacă firma mea are mai puțin de 1 an?",
          a: "Din păcate, trebuie să aștepți împlinirea termenului de 12 luni. Nu există excepții de la această regulă."
        },
        {
          q: "Am o amendă veche de la ITM. Sunt exclus?",
          a: "Depinde de vechimea sancțiunii și dacă a fost achitată. Analizăm fiecare caz în parte."
        },
        {
          q: "Pot închiria un apartament special pentru muncitori?",
          a: "Da, atât timp cât contractul de închiriere este încheiat înainte de depunerea dosarului și respectă normele de locuire."
        },
        {
          q: "Ce se întâmplă dacă angajatorul are datorii la ANAF?",
          a: "Trebuie achitate integral datoriile înainte de depunerea dosarului. Eșalonările sunt acceptate dacă sunt respectate."
        }
      ]
    },
    checker: {
      title: "Verificare Rapidă Eligibilitate",
      description: "Răspunde la întrebările de mai jos pentru o estimare inițială:",
      questions: [
        "Firma are cel puțin 1 an de la înființare?",
        "Ai minimum 2 angajați cu contract activ?",
        "Obligațiile fiscale sunt plătite la zi?",
        "Nu ai sancțiuni active de la ITM/ANAF/IGI?",
        "Poți asigura cazare pentru muncitori?",
        "Salariul oferit este cel puțin minimul legal?"
      ],
      resultPositive: "Firma pare să îndeplinească criteriile de bază! Completează formularul pentru o verificare completă.",
      resultNegative: "Există criterii neîndeplinite. Contactează-ne pentru a discuta opțiunile disponibile."
    },
    cta: {
      title: "Verifică Eligibilitatea Firmei Tale",
      description: "Completează formularul și primești răspunsul în maxim 24 de ore.",
      button: "Completează Formularul de Eligibilitate"
    }
  },
  en: {
    meta: { 
      title: "Company Eligibility - Non-EU Recruitment | Global Jobs Consulting", 
      description: "Check if your company meets the legal requirements for hiring non-EU workers in Romania. Updated IGI requirements." 
    },
    hero: {
      label: "Company Eligibility",
      title: "Is Your Company Eligible for Non-EU Recruitment?",
      description: "According to IGI legislation, employers must meet certain criteria to hire citizens from outside the European Union."
    },
    requirements: {
      title: "Mandatory Requirements for Employers",
      description: "Your company must meet all the conditions below to be eligible:",
      items: [
        { icon: "clock", title: "Minimum 1 Year Old", description: "Company must be registered for at least 12 months.", tip: "Calculated from CUI registration date" },
        { icon: "users", title: "Minimum 2 Active Employees", description: "Company must have at least 2 employees with active contracts.", tip: "Verified in REVISAL" },
        { icon: "file", title: "Tax Obligations Up to Date", description: "No outstanding debts to ANAF. Clean tax certificate required.", tip: "Tax attestation certificate requested" },
        { icon: "shield", title: "No Active Sanctions", description: "No active sanctions from ANAF, ITM, AJOFM or IGI.", tip: "Verified in official databases" },
        { icon: "home", title: "Accommodation Provided", description: "Employer must demonstrate ability to provide suitable accommodation.", tip: "Rental or ownership contract" },
        { icon: "money", title: "Legal Salary", description: "Offered salary must be at least minimum wage for the qualification.", tip: "Verified against current salary grid" }
      ]
    },
    disqualifying: {
      title: "Situations That Exclude Eligibility",
      items: [
        "Company less than 1 year old",
        "No employees or only one employee",
        "Outstanding debts to state budget",
        "ITM sanctions in the last 12 months",
        "IGI sanctions for previous immigration violations",
        "Inability to prove suitable accommodation",
        "Offered salary below legal minimum"
      ]
    },
    process: {
      title: "How We Verify Eligibility",
      steps: [
        { step: "1", title: "Fill Out the Form", description: "Send us company details via online form." },
        { step: "2", title: "We Analyze Documents", description: "We verify all eligibility criteria." },
        { step: "3", title: "You Get the Answer", description: "Within 24h we inform you if the company is eligible." },
        { step: "4", title: "We Start the Procedure", description: "If everything is fine, we move to the next step." }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        { q: "What if my company is less than 1 year old?", a: "Unfortunately, you must wait until the 12-month term is met. No exceptions." },
        { q: "I have an old ITM fine. Am I excluded?", a: "Depends on the sanction's age and if it was paid. We analyze each case." },
        { q: "Can I rent an apartment specifically for workers?", a: "Yes, as long as the rental contract is signed before filing and meets housing standards." },
        { q: "What if employer has debts to ANAF?", a: "Debts must be fully paid before filing. Payment plans are accepted if respected." }
      ]
    },
    checker: {
      title: "Quick Eligibility Check",
      description: "Answer the questions below for an initial estimate:",
      questions: [
        "Is your company at least 1 year old?",
        "Do you have minimum 2 employees with active contracts?",
        "Are tax obligations paid up to date?",
        "No active sanctions from ITM/ANAF/IGI?",
        "Can you provide accommodation for workers?",
        "Is offered salary at least legal minimum?"
      ],
      resultPositive: "Company seems to meet basic criteria! Fill out the form for a complete check.",
      resultNegative: "There are unmet criteria. Contact us to discuss available options."
    },
    cta: {
      title: "Check Your Company's Eligibility",
      description: "Fill out the form and get your answer within 24 hours.",
      button: "Fill Out Eligibility Form"
    }
  },
  de: {
    meta: { 
      title: "Firmenberechtigung - Nicht-EU-Rekrutierung | Global Jobs Consulting", 
      description: "Prüfen Sie, ob Ihr Unternehmen die Voraussetzungen für die Einstellung von Nicht-EU-Arbeitnehmern erfüllt." 
    },
    hero: {
      label: "Firmenberechtigung",
      title: "Ist Ihr Unternehmen für Nicht-EU-Rekrutierung berechtigt?",
      description: "Laut IGI-Gesetzgebung müssen Arbeitgeber bestimmte Kriterien erfüllen."
    },
    requirements: {
      title: "Pflichtanforderungen für Arbeitgeber",
      description: "Ihr Unternehmen muss alle folgenden Bedingungen erfüllen:",
      items: [
        { icon: "clock", title: "Mindestens 1 Jahr alt", description: "Mindestens 12 Monate registriert.", tip: "Ab CUI-Registrierung" },
        { icon: "users", title: "Mind. 2 aktive Mitarbeiter", description: "Mindestens 2 Mitarbeiter mit Vertrag.", tip: "In REVISAL verifiziert" },
        { icon: "file", title: "Steuern aktuell", description: "Keine Schulden bei ANAF.", tip: "Steuerbescheinigung erforderlich" },
        { icon: "shield", title: "Keine Sanktionen", description: "Keine aktiven Sanktionen.", tip: "In Datenbanken verifiziert" },
        { icon: "home", title: "Unterkunft gesichert", description: "Nachweis geeigneter Unterkunft.", tip: "Miet- oder Eigentumsvertrag" },
        { icon: "money", title: "Legales Gehalt", description: "Mindestlohn für die Qualifikation.", tip: "Aktuelle Gehaltsskala" }
      ]
    },
    disqualifying: {
      title: "Ausschlusskriterien",
      items: [
        "Unternehmen unter 1 Jahr alt",
        "Keine oder nur ein Mitarbeiter",
        "Ausstehende Staatsschulden",
        "ITM-Sanktionen in den letzten 12 Monaten",
        "IGI-Sanktionen für frühere Verstöße",
        "Keine geeignete Unterkunft nachweisbar",
        "Gehalt unter Mindestlohn"
      ]
    },
    process: {
      title: "Wie Wir die Berechtigung Prüfen",
      steps: [
        { step: "1", title: "Formular ausfüllen", description: "Firmendaten online senden." },
        { step: "2", title: "Dokumente analysieren", description: "Alle Kriterien prüfen." },
        { step: "3", title: "Antwort erhalten", description: "Innerhalb 24h Bescheid." },
        { step: "4", title: "Verfahren starten", description: "Bei Eignung nächster Schritt." }
      ]
    },
    faq: {
      title: "Häufige Fragen",
      items: [
        { q: "Was wenn Firma unter 1 Jahr alt?", a: "Sie müssen warten. Keine Ausnahmen." },
        { q: "Alte ITM-Strafe?", a: "Hängt vom Alter und Zahlung ab. Einzelfallprüfung." },
        { q: "Kann ich Wohnung für Arbeiter mieten?", a: "Ja, wenn Vertrag vor Antrag und Normen entspricht." },
        { q: "Schulden bei ANAF?", a: "Müssen vor Antrag beglichen sein." }
      ]
    },
    checker: {
      title: "Schnelle Berechtigungsprüfung",
      description: "Beantworten Sie folgende Fragen:",
      questions: [
        "Ist Firma mindestens 1 Jahr alt?",
        "Mindestens 2 aktive Mitarbeiter?",
        "Steuern aktuell?",
        "Keine Sanktionen?",
        "Unterkunft möglich?",
        "Gehalt mindestens Minimum?"
      ],
      resultPositive: "Scheint Grundkriterien zu erfüllen! Formular für vollständige Prüfung.",
      resultNegative: "Kriterien nicht erfüllt. Kontaktieren Sie uns."
    },
    cta: {
      title: "Firmenberechtigung Prüfen",
      description: "Formular ausfüllen, Antwort in 24 Stunden.",
      button: "Berechtigungsformular Ausfüllen"
    }
  },
  sr: {
    meta: { 
      title: "Podobnost kompanije - Non-EU regrutacija | Global Jobs Consulting", 
      description: "Proverite da li vaša kompanija ispunjava uslove za zapošljavanje radnika izvan EU u Rumuniji." 
    },
    hero: {
      label: "Podobnost Kompanije",
      title: "Da Li Je Vaša Kompanija Podobna za Non-EU Regrutaciju?",
      description: "Prema IGI zakonodavstvu, poslodavci moraju ispuniti određene kriterijume."
    },
    requirements: {
      title: "Obavezni Zahtevi za Poslodavce",
      description: "Vaša kompanija mora ispuniti sve uslove:",
      items: [
        { icon: "clock", title: "Minimum 1 godina", description: "Registrovana najmanje 12 meseci.", tip: "Od registracije CUI" },
        { icon: "users", title: "Min. 2 aktivna zaposlena", description: "Najmanje 2 zaposlena sa ugovorom.", tip: "Verifikacija u REVISAL" },
        { icon: "file", title: "Porezi ažurirani", description: "Bez dugova ANAF-u.", tip: "Poreska potvrda" },
        { icon: "shield", title: "Bez sankcija", description: "Bez aktivnih sankcija.", tip: "Provera u bazama" },
        { icon: "home", title: "Smeštaj obezbeđen", description: "Dokaz odgovarajućeg smeštaja.", tip: "Ugovor o zakupu" },
        { icon: "money", title: "Legalna plata", description: "Minimalna zarada za kvalifikaciju.", tip: "Aktuelna skala" }
      ]
    },
    disqualifying: {
      title: "Situacije Koje Isključuju",
      items: [
        "Kompanija mlađa od 1 godine",
        "Bez zaposlenih ili samo jedan",
        "Dugovi državi",
        "ITM sankcije u poslednjih 12 meseci",
        "IGI sankcije za prethodne prekršaje",
        "Nemogućnost dokaza smeštaja",
        "Plata ispod minimuma"
      ]
    },
    process: {
      title: "Kako Proveravamo Podobnost",
      steps: [
        { step: "1", title: "Popunite formular", description: "Pošaljite podatke online." },
        { step: "2", title: "Analiziramo", description: "Proveravamo sve kriterijume." },
        { step: "3", title: "Dobijate odgovor", description: "U roku od 24h." },
        { step: "4", title: "Počinjemo proceduru", description: "Ako je sve u redu." }
      ]
    },
    faq: {
      title: "Česta Pitanja",
      items: [
        { q: "Šta ako je firma mlađa od 1 godine?", a: "Morate čekati. Nema izuzetaka." },
        { q: "Stara ITM kazna?", a: "Zavisi od starosti i plaćanja. Analiza slučaja." },
        { q: "Mogu li iznajmiti stan za radnike?", a: "Da, ako je ugovor pre prijave." },
        { q: "Dugovi ANAF-u?", a: "Moraju biti plaćeni pre prijave." }
      ]
    },
    checker: {
      title: "Brza Provera Podobnosti",
      description: "Odgovorite na pitanja:",
      questions: [
        "Da li je firma stara bar 1 godinu?",
        "Minimum 2 aktivna zaposlena?",
        "Porezi ažurirani?",
        "Bez sankcija?",
        "Smeštaj moguć?",
        "Plata bar minimum?"
      ],
      resultPositive: "Izgleda da ispunjava kriterijume! Popunite formular za potpunu proveru.",
      resultNegative: "Kriterijumi nisu ispunjeni. Kontaktirajte nas."
    },
    cta: {
      title: "Proverite Podobnost Kompanije",
      description: "Popunite formular, odgovor u 24 sata.",
      button: "Popunite Formular za Podobnost"
    }
  }
};

const iconMap = {
  clock: Clock,
  users: Users,
  file: FileCheck,
  shield: Shield,
  home: Building2,
  money: CheckCircle2
};

export default function EligibilitatePage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />

      <div className="min-h-screen bg-gray-50" data-testid="eligibilitate-page">
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

        {/* Requirements */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-heading text-3xl font-bold text-navy-900 mb-4">{t.requirements.title}</h2>
              <p className="text-gray-600">{t.requirements.description}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.requirements.items.map((item, idx) => {
                const Icon = iconMap[item.icon] || CheckCircle2;
                return (
                  <Card key={idx} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-coral/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-coral" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="text-xs text-coral font-medium bg-coral/10 px-3 py-1 rounded-full inline-block">
                        {item.tip}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Disqualifying Situations */}
        <section className="py-16 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <h2 className="font-heading text-2xl font-bold text-navy-900">{t.disqualifying.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {t.disqualifying.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-navy-900 text-center mb-12">{t.process.title}</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {t.process.steps.map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 bg-coral text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
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
