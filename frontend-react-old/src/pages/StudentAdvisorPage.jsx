import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, GraduationCap, FileText, Clock, Users, BookOpen, Building2, Globe, Shield, HelpCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Pachet STUDENT ADVISOR | Global Jobs Consulting", 
      description: "Servicii complete pentru studenții internaționali care doresc să studieze în România. Consiliere, documente, viză, cazare și suport universitar." 
    },
    hero: {
      label: "STUDENT ADVISOR",
      title: "Pachetul Complet pentru Studenți Internaționali",
      description: "Te ghidăm pas cu pas de la alegerea universității până la obținerea vizei de studii și integrarea în România."
    },
    forWhom: {
      title: "Cui Se Adresează?",
      items: [
        "Studenți din țări non-UE care doresc să studieze în România",
        "Absolvenți de liceu care caută programe universitare în limba engleză",
        "Studenți care doresc transfer de la o universitate străină",
        "Tineri care vor să obțină o diplomă europeană recunoscută internațional"
      ]
    },
    includes: {
      title: "Ce Include Pachetul?",
      items: [
        { icon: "book", title: "Consiliere Universitară", description: "Identificăm universitatea și programul de studii potrivite pentru profilul și bugetul tău" },
        { icon: "file", title: "Pregătire Dosar Admitere", description: "Pregătim complet dosarul de înscriere: traduceri, legalizări, echivalări" },
        { icon: "letter", title: "Scrisoare de Acceptare", description: "Gestionăm comunicarea cu universitatea până la obținerea scrisorii de acceptare" },
        { icon: "visa", title: "Asistență Viză Studii", description: "Pregătim dosarul de viză și te ghidăm pentru interviul la consulat" },
        { icon: "home", title: "Suport Cazare", description: "Te ajutăm să găsești cazare în campus sau privată" },
        { icon: "support", title: "Integrare și Suport", description: "Suport continuu în primul semestru pentru orice problemă administrativă" }
      ]
    },
    process: {
      title: "Procesul Pas cu Pas",
      steps: [
        { step: "01", title: "Evaluare Inițială", description: "Analizăm profilul tău academic, preferințele și bugetul disponibil", duration: "1-2 zile" },
        { step: "02", title: "Selecție Universitate", description: "Identificăm universitățile potrivite și te ajutăm să alegi programul de studii", duration: "3-5 zile" },
        { step: "03", title: "Pregătire Dosar", description: "Colectăm, traducem și legalizăm toate documentele necesare", duration: "7-14 zile" },
        { step: "04", title: "Depunere Înscriere", description: "Depunem dosarul la universitate și monitorizăm procesul de admitere", duration: "14-30 zile" },
        { step: "05", title: "Scrisoare Acceptare", description: "Obținem scrisoarea de acceptare de la universitate", duration: "7-21 zile" },
        { step: "06", title: "Dosar Viză", description: "Pregătim dosarul complet pentru viza de studii", duration: "5-7 zile" },
        { step: "07", title: "Programare Consulat", description: "Te ghidăm pentru interviul la consulat", duration: "15-45 zile" },
        { step: "08", title: "Sosire și Integrare", description: "Te întâmpinăm și te ajutăm cu formalitățile la sosire", duration: "1-7 zile" }
      ]
    },
    documents: {
      title: "Documente Necesare",
      items: [
        "Pașaport valid (min. 12 luni)",
        "Diplomă de bacalaureat sau echivalent",
        "Foaie matricolă / Transcript",
        "Certificat de naștere",
        "Certificat medical",
        "Cazier judiciar",
        "Dovada mijloacelor financiare",
        "Fotografii tip pașaport",
        "CV în format Europass"
      ]
    },
    faq: {
      title: "Întrebări Frecvente",
      items: [
        { q: "Pot studia în limba engleză în România?", a: "Da, multe universități oferă programe complete în limba engleză, mai ales în domenii ca Medicină, IT, Business și Inginerie." },
        { q: "Cât costă studiile în România?", a: "Taxele de școlarizare variază între 2.000-9.000 EUR/an, în funcție de universitate și program. Medicina este de obicei mai scumpă." },
        { q: "Pot lucra în timpul studiilor?", a: "Da, studenții non-UE pot lucra part-time (4 ore/zi) în timpul anului universitar, fără restricții în vacanțe." },
        { q: "Ce se întâmplă după absolvire?", a: "Poți aplica pentru permis de ședere în scop de muncă sau pentru continuarea studiilor (master, doctorat)." }
      ]
    },
    cta: {
      title: "Începe-ți Călătoria Academică",
      description: "Completează formularul și primești o evaluare gratuită a profilului tău în maxim 24 de ore.",
      button: "Solicită Consultanță Gratuită"
    }
  },
  en: {
    meta: { 
      title: "STUDENT ADVISOR Package | Global Jobs Consulting", 
      description: "Complete services for international students who want to study in Romania. Counseling, documents, visa, accommodation and university support." 
    },
    hero: {
      label: "STUDENT ADVISOR",
      title: "Complete Package for International Students",
      description: "We guide you step by step from choosing a university to obtaining your study visa and integrating in Romania."
    },
    forWhom: {
      title: "Who Is It For?",
      items: [
        "Non-EU students who want to study in Romania",
        "High school graduates looking for English-taught university programs",
        "Students wanting to transfer from a foreign university",
        "Young people who want to obtain an internationally recognized European degree"
      ]
    },
    includes: {
      title: "What Does the Package Include?",
      items: [
        { icon: "book", title: "University Counseling", description: "We identify the university and study program suitable for your profile and budget" },
        { icon: "file", title: "Admission File Preparation", description: "We completely prepare the enrollment file: translations, legalizations, equivalences" },
        { icon: "letter", title: "Acceptance Letter", description: "We manage communication with the university until obtaining the acceptance letter" },
        { icon: "visa", title: "Study Visa Assistance", description: "We prepare the visa file and guide you for the consulate interview" },
        { icon: "home", title: "Accommodation Support", description: "We help you find on-campus or private accommodation" },
        { icon: "support", title: "Integration and Support", description: "Continuous support in the first semester for any administrative issues" }
      ]
    },
    process: {
      title: "Step by Step Process",
      steps: [
        { step: "01", title: "Initial Assessment", description: "We analyze your academic profile, preferences and available budget", duration: "1-2 days" },
        { step: "02", title: "University Selection", description: "We identify suitable universities and help you choose the study program", duration: "3-5 days" },
        { step: "03", title: "File Preparation", description: "We collect, translate and legalize all necessary documents", duration: "7-14 days" },
        { step: "04", title: "Application Submission", description: "We submit the file to the university and monitor the admission process", duration: "14-30 days" },
        { step: "05", title: "Acceptance Letter", description: "We obtain the acceptance letter from the university", duration: "7-21 days" },
        { step: "06", title: "Visa File", description: "We prepare the complete file for the study visa", duration: "5-7 days" },
        { step: "07", title: "Consulate Appointment", description: "We guide you for the consulate interview", duration: "15-45 days" },
        { step: "08", title: "Arrival and Integration", description: "We welcome you and help with formalities upon arrival", duration: "1-7 days" }
      ]
    },
    documents: {
      title: "Required Documents",
      items: [
        "Valid passport (min. 12 months)",
        "High school diploma or equivalent",
        "Transcript",
        "Birth certificate",
        "Medical certificate",
        "Criminal record",
        "Proof of financial means",
        "Passport photos",
        "CV in Europass format"
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        { q: "Can I study in English in Romania?", a: "Yes, many universities offer complete programs in English, especially in fields like Medicine, IT, Business and Engineering." },
        { q: "How much do studies cost in Romania?", a: "Tuition fees vary between 2,000-9,000 EUR/year, depending on university and program. Medicine is usually more expensive." },
        { q: "Can I work while studying?", a: "Yes, non-EU students can work part-time (4 hours/day) during the academic year, without restrictions during vacations." },
        { q: "What happens after graduation?", a: "You can apply for a work residence permit or continue your studies (master's, PhD)." }
      ]
    },
    cta: {
      title: "Start Your Academic Journey",
      description: "Fill out the form and receive a free profile evaluation within 24 hours.",
      button: "Request Free Consultation"
    }
  },
  de: {
    meta: { 
      title: "STUDENT ADVISOR Paket | Global Jobs Consulting", 
      description: "Komplette Dienstleistungen für internationale Studenten, die in Rumänien studieren möchten." 
    },
    hero: {
      label: "STUDENT ADVISOR",
      title: "Komplettpaket für Internationale Studenten",
      description: "Wir begleiten Sie Schritt für Schritt von der Universitätswahl bis zum Studienvisum."
    },
    forWhom: {
      title: "Für Wen?",
      items: [
        "Nicht-EU-Studenten, die in Rumänien studieren möchten",
        "Abiturienten auf der Suche nach englischsprachigen Programmen",
        "Studenten, die von einer ausländischen Universität wechseln möchten",
        "Junge Menschen, die einen international anerkannten europäischen Abschluss erwerben möchten"
      ]
    },
    includes: {
      title: "Was Beinhaltet das Paket?",
      items: [
        { icon: "book", title: "Universitätsberatung", description: "Wir identifizieren die passende Universität und das Studienprogramm" },
        { icon: "file", title: "Bewerbungsvorbereitung", description: "Wir bereiten die Bewerbungsunterlagen vollständig vor" },
        { icon: "letter", title: "Zulassungsschreiben", description: "Wir kommunizieren mit der Universität bis zum Erhalt der Zulassung" },
        { icon: "visa", title: "Visum-Assistenz", description: "Wir bereiten die Visumsunterlagen vor" },
        { icon: "home", title: "Unterkunftsunterstützung", description: "Wir helfen bei der Wohnungssuche" },
        { icon: "support", title: "Integration und Support", description: "Kontinuierliche Unterstützung im ersten Semester" }
      ]
    },
    process: {
      title: "Schritt für Schritt Prozess",
      steps: [
        { step: "01", title: "Erstbewertung", description: "Analyse Ihres akademischen Profils", duration: "1-2 Tage" },
        { step: "02", title: "Universitätsauswahl", description: "Identifizierung geeigneter Universitäten", duration: "3-5 Tage" },
        { step: "03", title: "Dokumentenvorbereitung", description: "Sammeln und Übersetzen aller Dokumente", duration: "7-14 Tage" },
        { step: "04", title: "Bewerbungseinreichung", description: "Einreichung bei der Universität", duration: "14-30 Tage" },
        { step: "05", title: "Zulassungsschreiben", description: "Erhalt der Zulassung", duration: "7-21 Tage" },
        { step: "06", title: "Visumsakte", description: "Vorbereitung der Visumsunterlagen", duration: "5-7 Tage" },
        { step: "07", title: "Konsulatstermin", description: "Begleitung zum Konsulat", duration: "15-45 Tage" },
        { step: "08", title: "Ankunft", description: "Empfang und Hilfe bei Formalitäten", duration: "1-7 Tage" }
      ]
    },
    documents: {
      title: "Erforderliche Dokumente",
      items: ["Gültiger Reisepass", "Abitur-Zeugnis", "Transcript", "Geburtsurkunde", "Ärztliches Attest", "Führungszeugnis", "Finanznachweis", "Passfotos", "Europass-Lebenslauf"]
    },
    faq: {
      title: "Häufige Fragen",
      items: [
        { q: "Kann ich auf Englisch studieren?", a: "Ja, viele Universitäten bieten englischsprachige Programme an." },
        { q: "Was kostet das Studium?", a: "Studiengebühren: 2.000-9.000 EUR/Jahr." },
        { q: "Kann ich während des Studiums arbeiten?", a: "Ja, 4 Stunden/Tag während des Semesters." },
        { q: "Was passiert nach dem Abschluss?", a: "Arbeitserlaubnis oder weitere Studien möglich." }
      ]
    },
    cta: {
      title: "Starten Sie Ihre Akademische Reise",
      description: "Füllen Sie das Formular aus für eine kostenlose Bewertung.",
      button: "Kostenlose Beratung Anfordern"
    }
  },
  sr: {
    meta: { 
      title: "STUDENT ADVISOR Paket | Global Jobs Consulting", 
      description: "Kompletne usluge za međunarodne studente koji žele da studiraju u Rumuniji." 
    },
    hero: {
      label: "STUDENT ADVISOR",
      title: "Kompletan Paket za Međunarodne Studente",
      description: "Vodimo vas korak po korak od izbora univerziteta do dobijanja studentske vize."
    },
    forWhom: {
      title: "Kome Je Namenjeno?",
      items: [
        "Studenti iz zemalja van EU koji žele da studiraju u Rumuniji",
        "Maturanti koji traže programe na engleskom jeziku",
        "Studenti koji žele transfer sa stranog univerziteta",
        "Mladi koji žele da dobiju međunarodno priznatu evropsku diplomu"
      ]
    },
    includes: {
      title: "Šta Uključuje Paket?",
      items: [
        { icon: "book", title: "Univerzitetsko Savetovanje", description: "Identifikujemo odgovarajući univerzitet i program" },
        { icon: "file", title: "Priprema Dokumentacije", description: "Kompletno pripremamo dokumentaciju" },
        { icon: "letter", title: "Pismo Prihvatanja", description: "Upravljamo komunikacijom sa univerzitetom" },
        { icon: "visa", title: "Pomoć za Vizu", description: "Pripremamo dokumentaciju za vizu" },
        { icon: "home", title: "Podrška za Smeštaj", description: "Pomažemo u pronalaženju smeštaja" },
        { icon: "support", title: "Integracija", description: "Kontinuirana podrška u prvom semestru" }
      ]
    },
    process: {
      title: "Proces Korak po Korak",
      steps: [
        { step: "01", title: "Početna Procena", description: "Analiziramo vaš profil", duration: "1-2 dana" },
        { step: "02", title: "Izbor Univerziteta", description: "Identifikujemo odgovarajuće univerzitete", duration: "3-5 dana" },
        { step: "03", title: "Priprema Dokumenata", description: "Prikupljamo i prevodimo dokumente", duration: "7-14 dana" },
        { step: "04", title: "Podnošenje Prijave", description: "Podnosimo prijavu univerzitetu", duration: "14-30 dana" },
        { step: "05", title: "Pismo Prihvatanja", description: "Dobijamo pismo prihvatanja", duration: "7-21 dana" },
        { step: "06", title: "Dokumentacija za Vizu", description: "Pripremamo dokumentaciju", duration: "5-7 dana" },
        { step: "07", title: "Konzulat", description: "Vodimo vas na intervju", duration: "15-45 dana" },
        { step: "08", title: "Dolazak", description: "Dočekujemo vas i pomažemo", duration: "1-7 dana" }
      ]
    },
    documents: {
      title: "Potrebna Dokumenta",
      items: ["Važeći pasoš", "Diploma srednje škole", "Transkript", "Izvod iz matične knjige rođenih", "Lekarsko uverenje", "Uverenje o nekažnjavanju", "Dokaz o finansijskim sredstvima", "Fotografije", "CV u Europass formatu"]
    },
    faq: {
      title: "Česta Pitanja",
      items: [
        { q: "Mogu li studirati na engleskom?", a: "Da, mnogi univerziteti nude programe na engleskom." },
        { q: "Koliko koštaju studije?", a: "Školarina: 2.000-9.000 EUR/godišnje." },
        { q: "Mogu li raditi tokom studija?", a: "Da, 4 sata dnevno tokom semestra." },
        { q: "Šta posle diplomiranja?", a: "Možete aplicirati za radnu dozvolu ili nastaviti studije." }
      ]
    },
    cta: {
      title: "Započnite Svoje Akademsko Putovanje",
      description: "Popunite formular za besplatnu procenu.",
      button: "Zatražite Besplatnu Konsultaciju"
    }
  }
};

const iconMap = {
  book: BookOpen,
  file: FileText,
  letter: FileText,
  visa: Globe,
  home: Building2,
  support: Users
};

export default function StudentAdvisorPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead title={t.meta.title} description={t.meta.description} language={language} />

      <div className="min-h-screen bg-gray-50" data-testid="student-advisor-page">
        {/* Hero */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="inline-block bg-coral/20 text-coral px-4 py-1 rounded-full text-sm font-semibold mb-4">
                <GraduationCap className="inline h-4 w-4 mr-2" />
                {t.hero.label}
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg md:text-xl leading-relaxed">{t.hero.description}</p>
            </div>
          </div>
        </div>

        {/* For Whom */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-8">{t.forWhom.title}</h2>
              <div className="grid md:grid-cols-2 gap-4">
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

        {/* What's Included */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-navy-900 text-center mb-12">{t.includes.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {t.includes.items.map((item, idx) => {
                const Icon = iconMap[item.icon] || FileText;
                return (
                  <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {t.process.steps.map((step, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                  <div className="text-coral text-3xl font-bold mb-2">{step.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-navy-200 text-sm mb-3">{step.description}</p>
                  <div className="flex items-center gap-1 text-xs text-coral">
                    <Clock className="h-3 w-3" />
                    {step.duration}
                  </div>
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
                <FileText className="h-8 w-8 text-coral" />
                {t.documents.title}
              </h2>
              <div className="grid md:grid-cols-3 gap-3">
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
                <HelpCircle className="h-8 w-8 text-coral" />
                {t.faq.title}
              </h2>
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
              <Link to={`${getLocalizedPath('/contact')}?service=student-advisor`}>
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
