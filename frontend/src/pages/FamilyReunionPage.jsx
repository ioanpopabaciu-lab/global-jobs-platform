import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Heart, FileText, Clock, Users, Home, Shield, HelpCircle, UserPlus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Pachet FAMILY REUNION | Global Jobs Consulting", 
      description: "Servicii complete pentru reunificarea familiei în România. Aducerea soțului/soției, copiilor sau părinților în România legal și sigur." 
    },
    hero: {
      label: "FAMILY REUNION",
      title: "Reunește-ți Familia în România",
      description: "Te ajutăm să aduci legal membrii familiei tale în România, respectând toate cerințele legale pentru reunificarea familiei."
    },
    forWhom: {
      title: "Cui Se Adresează?",
      items: [
        "Titulari de permis de ședere care doresc să aducă soțul/soția",
        "Părinți care vor să-și reunească familia cu copiii minori",
        "Persoane care doresc să aducă părinții în întreținere în România",
        "Titulari de viză de lungă ședere pregătind reunificarea",
        "Rezidenți legali cu cel puțin 1 an de ședere în România"
      ]
    },
    eligibility: {
      title: "Condiții de Eligibilitate",
      sponsor: "Sponsorul (persoana din România) trebuie să aibă:",
      sponsorItems: [
        "Permis de ședere valid în România (min. 1 an)",
        "Venituri suficiente pentru întreținerea familiei",
        "Spațiu de locuit adecvat pentru familia extinsă",
        "Asigurare medicală validă"
      ],
      family: "Membrii familiei eligibili:",
      familyItems: [
        "Soț/Soție (căsătorie legal recunoscută)",
        "Copii minori sub 18 ani",
        "Copii adulți aflați în întreținere (max. 21 ani)",
        "Părinți în întreținere (în anumite condiții)"
      ]
    },
    includes: {
      title: "Ce Include Pachetul?",
      items: [
        { icon: "eval", title: "Evaluare Eligibilitate", description: "Verificăm dacă îndeplinești toate condițiile legale pentru reunificare" },
        { icon: "file", title: "Pregătire Dosar", description: "Colectăm și pregătim toate documentele necesare (traduse și legalizate)" },
        { icon: "submit", title: "Depunere IGI", description: "Depunem dosarul la Inspectoratul pentru Imigrări" },
        { icon: "visa", title: "Coordonare Viză", description: "Gestionăm procesul de obținere a vizei pentru membrii familiei" },
        { icon: "arrival", title: "Suport la Sosire", description: "Asistență la primirea familiei și înregistrarea la autorități" },
        { icon: "integrate", title: "Integrare", description: "Suport pentru înscrierea copiilor la școală și alte formalități" }
      ]
    },
    process: {
      title: "Procesul de Reunificare",
      steps: [
        { step: "01", title: "Evaluare Inițială", description: "Analizăm situația ta și verificăm eligibilitatea", duration: "1-3 zile" },
        { step: "02", title: "Pregătire Documente Sponsor", description: "Colectăm documentele tale din România", duration: "7-14 zile" },
        { step: "03", title: "Pregătire Documente Familie", description: "Ghidăm familia pentru pregătirea dosarului", duration: "14-21 zile" },
        { step: "04", title: "Depunere IGI", description: "Depunem cererea de reunificare la IGI", duration: "1-3 zile" },
        { step: "05", title: "Procesare IGI", description: "Așteptăm aprobarea cererii", duration: "30-90 zile" },
        { step: "06", title: "Obținere Viză", description: "Membrii familiei aplică pentru viză", duration: "15-45 zile" },
        { step: "07", title: "Sosire și Înregistrare", description: "Primim familia și facem înregistrările", duration: "7-14 zile" }
      ]
    },
    documents: {
      title: "Documente Necesare",
      sponsor: "De la Sponsor:",
      sponsorDocs: [
        "Copie permis de ședere valid",
        "Dovada veniturilor (min. 6 luni)",
        "Contract de muncă sau dovadă activitate",
        "Dovada spațiului de locuit",
        "Asigurare medicală",
        "Declarație de întreținere"
      ],
      family: "De la Membrii Familiei:",
      familyDocs: [
        "Pașapoarte valide",
        "Certificate de căsătorie/naștere",
        "Cazier judiciar",
        "Certificat medical",
        "Fotografii tip pașaport"
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        { q: "Cât timp trebuie să fiu în România înainte de a putea aduce familia?", a: "De regulă, trebuie să ai cel puțin 1 an de rezidență legală. În unele cazuri (permis unic), se poate și mai devreme." },
        { q: "Soția/soțul meu poate lucra în România?", a: "Da, odată ce obține permisul de ședere pentru reunificarea familiei, poate lucra fără restricții." },
        { q: "Pot aduce și părinții mei?", a: "Da, în anumite condiții: dacă sunt în întreținerea ta, nu au alte mijloace de subzistență și ai venituri suficiente." },
        { q: "Ce se întâmplă dacă divorțez după reunificare?", a: "Soțul/soția poate solicita permis de ședere individual dacă a locuit min. 5 ani în România sau există copii din căsătorie." }
      ]
    },
    cta: {
      title: "Reunește-ți Familia",
      description: "Completează formularul pentru o evaluare gratuită a eligibilității.",
      button: "Solicită Consultanță"
    }
  },
  en: {
    meta: { 
      title: "FAMILY REUNION Package | Global Jobs Consulting", 
      description: "Complete services for family reunification in Romania. Bringing your spouse, children or parents to Romania legally and safely." 
    },
    hero: {
      label: "FAMILY REUNION",
      title: "Reunite Your Family in Romania",
      description: "We help you bring your family members to Romania legally, meeting all legal requirements for family reunification."
    },
    forWhom: {
      title: "Who Is It For?",
      items: [
        "Residence permit holders who want to bring their spouse",
        "Parents who want to reunite with their minor children",
        "People who want to bring dependent parents to Romania",
        "Long-stay visa holders preparing for reunification",
        "Legal residents with at least 1 year of residence in Romania"
      ]
    },
    eligibility: {
      title: "Eligibility Conditions",
      sponsor: "The Sponsor (person in Romania) must have:",
      sponsorItems: ["Valid residence permit in Romania (min. 1 year)", "Sufficient income to support family", "Adequate living space for extended family", "Valid health insurance"],
      family: "Eligible family members:",
      familyItems: ["Spouse (legally recognized marriage)", "Minor children under 18", "Adult children in dependence (max. 21 years)", "Dependent parents (under certain conditions)"]
    },
    includes: {
      title: "What Does the Package Include?",
      items: [
        { icon: "eval", title: "Eligibility Assessment", description: "We verify if you meet all legal conditions" },
        { icon: "file", title: "File Preparation", description: "We collect and prepare all documents" },
        { icon: "submit", title: "IGI Submission", description: "We submit the file to Immigration" },
        { icon: "visa", title: "Visa Coordination", description: "We manage visa obtaining for family" },
        { icon: "arrival", title: "Arrival Support", description: "Assistance receiving family and registration" },
        { icon: "integrate", title: "Integration", description: "Support for school enrollment and formalities" }
      ]
    },
    process: {
      title: "Reunification Process",
      steps: [
        { step: "01", title: "Initial Assessment", description: "We analyze your situation", duration: "1-3 days" },
        { step: "02", title: "Sponsor Documents", description: "We collect your documents", duration: "7-14 days" },
        { step: "03", title: "Family Documents", description: "We guide family preparation", duration: "14-21 days" },
        { step: "04", title: "IGI Submission", description: "We submit the request", duration: "1-3 days" },
        { step: "05", title: "IGI Processing", description: "Waiting for approval", duration: "30-90 days" },
        { step: "06", title: "Visa Obtaining", description: "Family applies for visa", duration: "15-45 days" },
        { step: "07", title: "Arrival", description: "Reception and registration", duration: "7-14 days" }
      ]
    },
    documents: {
      title: "Required Documents",
      sponsor: "From Sponsor:",
      sponsorDocs: ["Residence permit copy", "Income proof (min. 6 months)", "Employment contract", "Living space proof", "Health insurance", "Support declaration"],
      family: "From Family Members:",
      familyDocs: ["Valid passports", "Marriage/birth certificates", "Criminal record", "Medical certificate", "Passport photos"]
    },
    faq: {
      title: "FAQs",
      items: [
        { q: "How long must I be in Romania before bringing family?", a: "Usually 1 year of legal residence. Sometimes earlier with single permit." },
        { q: "Can my spouse work?", a: "Yes, once they get the family reunification permit." },
        { q: "Can I bring my parents?", a: "Yes, if they are dependent on you and you have sufficient income." },
        { q: "What happens if I divorce?", a: "Spouse can request individual permit if lived min. 5 years or has children." }
      ]
    },
    cta: { title: "Reunite Your Family", description: "Fill out the form for a free eligibility assessment.", button: "Request Consultation" }
  },
  de: {
    meta: { title: "FAMILY REUNION Paket | Global Jobs Consulting", description: "Familienzusammenführung in Rumänien." },
    hero: { label: "FAMILY REUNION", title: "Familie in Rumänien Zusammenführen", description: "Wir helfen Ihnen, Familienmitglieder legal nach Rumänien zu bringen." },
    forWhom: { title: "Für Wen?", items: ["Ehepartner mitbringen", "Minderjährige Kinder", "Abhängige Eltern", "Langzeitvisum-Inhaber", "Min. 1 Jahr Aufenthalt"] },
    eligibility: { title: "Voraussetzungen", sponsor: "Sponsor muss haben:", sponsorItems: ["Gültige Aufenthaltserlaubnis", "Ausreichendes Einkommen", "Wohnraum", "Krankenversicherung"], family: "Berechtigte Familienmitglieder:", familyItems: ["Ehepartner", "Kinder unter 18", "Abhängige Erwachsene bis 21", "Abhängige Eltern"] },
    includes: { title: "Paketinhalt", items: [
      { icon: "eval", title: "Berechtigungsprüfung", description: "Prüfung aller Bedingungen" },
      { icon: "file", title: "Dokumentenvorbereitung", description: "Sammlung aller Unterlagen" },
      { icon: "submit", title: "IGI-Einreichung", description: "Antragsstellung" },
      { icon: "visa", title: "Visum-Koordination", description: "Visumsprozess" },
      { icon: "arrival", title: "Ankunftshilfe", description: "Empfang und Registrierung" },
      { icon: "integrate", title: "Integration", description: "Schulanmeldung etc." }
    ]},
    process: { title: "Prozess", steps: [
      { step: "01", title: "Bewertung", description: "Situationsanalyse", duration: "1-3 Tage" },
      { step: "02", title: "Sponsor-Dokumente", description: "Ihre Unterlagen", duration: "7-14 Tage" },
      { step: "03", title: "Familien-Dokumente", description: "Anleitung", duration: "14-21 Tage" },
      { step: "04", title: "IGI-Antrag", description: "Einreichung", duration: "1-3 Tage" },
      { step: "05", title: "Bearbeitung", description: "Warten", duration: "30-90 Tage" },
      { step: "06", title: "Visum", description: "Familie beantragt", duration: "15-45 Tage" },
      { step: "07", title: "Ankunft", description: "Empfang", duration: "7-14 Tage" }
    ]},
    documents: { title: "Dokumente", sponsor: "Vom Sponsor:", sponsorDocs: ["Permit-Kopie", "Einkommensnachweis", "Arbeitsvertrag", "Wohnnachweis", "Versicherung", "Erklärung"], family: "Von Familie:", familyDocs: ["Pässe", "Urkunden", "Führungszeugnis", "Attest", "Fotos"] },
    faq: { title: "FAQ", items: [
      { q: "Wie lange vor Familie?", a: "1 Jahr Aufenthalt erforderlich." },
      { q: "Kann Ehepartner arbeiten?", a: "Ja, mit Familienerlaubnis." },
      { q: "Eltern mitbringen?", a: "Ja, wenn abhängig." },
      { q: "Bei Scheidung?", a: "Eigene Erlaubnis nach 5 Jahren möglich." }
    ]},
    cta: { title: "Familie Zusammenführen", description: "Kostenlose Bewertung.", button: "Beratung Anfordern" }
  },
  sr: {
    meta: { title: "FAMILY REUNION Paket | Global Jobs Consulting", description: "Spajanje porodice u Rumuniji." },
    hero: { label: "FAMILY REUNION", title: "Spojite Porodicu u Rumuniji", description: "Pomažemo vam da legalno dovedete porodicu." },
    forWhom: { title: "Kome?", items: ["Supružnik", "Deca", "Roditelji", "Dugotrajna viza", "Min. 1 godina"] },
    eligibility: { title: "Uslovi", sponsor: "Sponzor mora imati:", sponsorItems: ["Dozvolu boravka", "Prihode", "Smeštaj", "Osiguranje"], family: "Članovi porodice:", familyItems: ["Supružnik", "Deca do 18", "Odrasla deca do 21", "Zavisni roditelji"] },
    includes: { title: "Uključeno", items: [
      { icon: "eval", title: "Provera", description: "Svi uslovi" },
      { icon: "file", title: "Dokumenta", description: "Priprema" },
      { icon: "submit", title: "IGI", description: "Podnošenje" },
      { icon: "visa", title: "Viza", description: "Koordinacija" },
      { icon: "arrival", title: "Dolazak", description: "Prijem" },
      { icon: "integrate", title: "Integracija", description: "Škola itd." }
    ]},
    process: { title: "Proces", steps: [
      { step: "01", title: "Procena", description: "Analiza", duration: "1-3 dana" },
      { step: "02", title: "Sponzor", description: "Dokumenta", duration: "7-14 dana" },
      { step: "03", title: "Porodica", description: "Priprema", duration: "14-21 dan" },
      { step: "04", title: "IGI", description: "Zahtev", duration: "1-3 dana" },
      { step: "05", title: "Obrada", description: "Čekanje", duration: "30-90 dana" },
      { step: "06", title: "Viza", description: "Prijava", duration: "15-45 dana" },
      { step: "07", title: "Dolazak", description: "Prijem", duration: "7-14 dana" }
    ]},
    documents: { title: "Dokumenta", sponsor: "Od Sponzora:", sponsorDocs: ["Dozvola", "Prihodi", "Ugovor", "Smeštaj", "Osiguranje", "Izjava"], family: "Od Porodice:", familyDocs: ["Pasoši", "Izvodi", "Uverenje", "Lekarsko", "Slike"] },
    faq: { title: "Pitanja", items: [
      { q: "Koliko pre porodice?", a: "1 godina boravka." },
      { q: "Može supružnik raditi?", a: "Da, sa dozvolom." },
      { q: "Roditelji?", a: "Da, ako su zavisni." },
      { q: "Razvod?", a: "Vlastita dozvola posle 5 godina." }
    ]},
    cta: { title: "Spojite Porodicu", description: "Besplatna procena.", button: "Konsultacija" }
  }
};

const iconMap = { eval: Shield, file: FileText, submit: FileText, visa: Users, arrival: Home, integrate: UserPlus };

export default function FamilyReunionPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead title={t.meta.title} description={t.meta.description} language={language} />
      <div className="min-h-screen bg-gray-50" data-testid="family-reunion-page">
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-block bg-coral/20 text-coral px-4 py-1 rounded-full text-sm font-semibold mb-4">
                <Heart className="inline h-4 w-4 mr-2" />{t.hero.label}
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
            <div className="max-w-5xl mx-auto">
              <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.eligibility.title}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-bold text-navy-900 mb-4">{t.eligibility.sponsor}</h3>
                    <ul className="space-y-2">
                      {t.eligibility.sponsorItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-coral mt-1" /><span className="text-gray-600 text-sm">{item}</span></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-bold text-navy-900 mb-4">{t.eligibility.family}</h3>
                    <ul className="space-y-2">
                      {t.eligibility.familyItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-coral mt-1" /><span className="text-gray-600 text-sm">{item}</span></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {t.process.steps.slice(0, 4).map((step, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                  <div className="text-coral text-3xl font-bold mb-2">{step.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-navy-200 text-sm mb-3">{step.description}</p>
                  <div className="flex items-center gap-1 text-xs text-coral"><Clock className="h-3 w-3" />{step.duration}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-6">
              {t.process.steps.slice(4).map((step, idx) => (
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

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.documents.title}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-navy-900 mb-4">{t.documents.sponsor}</h3>
                  <div className="space-y-2">
                    {t.documents.sponsorDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded"><CheckCircle2 className="h-4 w-4 text-coral" /><span className="text-sm">{doc}</span></div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-4">{t.documents.family}</h3>
                  <div className="space-y-2">
                    {t.documents.familyDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded"><CheckCircle2 className="h-4 w-4 text-coral" /><span className="text-sm">{doc}</span></div>
                    ))}
                  </div>
                </div>
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
              <Link to={`${getLocalizedPath('/contact')}?service=family-reunion`}>{t.cta.button}<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
