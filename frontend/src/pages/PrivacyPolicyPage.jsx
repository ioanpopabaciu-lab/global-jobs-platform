import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { title: "Politică de Confidențialitate | Global Jobs Consulting", description: "Politica de confidențialitate Global Jobs Consulting SRL. Aflați cum colectăm, utilizăm și protejăm datele dumneavoastră personale." },
    hero: { back: "Înapoi la pagina principală", title: "Politică de Confidențialitate", subtitle: "Protecția datelor dumneavoastră personale este importantă pentru noi." },
    operator: {
      title: "Informații Operator Date",
      operator: "Operator:",
      email: "Email:",
      website: "Website:"
    },
    sections: [
      {
        title: "1. Ce date colectăm",
        intro: "În cadrul activității noastre, colectăm următoarele categorii de date personale:",
        items: ["Nume și prenume", "Adresă de email", "Număr de telefon", "CV și informații profesionale (experiență, calificări, competențe)", "Mesaje din formularul de contact", "Cetățenie și preferințe de angajare (pentru candidați)", "Informații despre companie (pentru angajatori)"]
      },
      {
        title: "2. Scopul prelucrării",
        intro: "Datele personale sunt prelucrate în următoarele scopuri:",
        items: ["Evaluarea candidaturilor pentru pozițiile disponibile", "Contactarea candidaților în vederea procesului de recrutare", "Comunicare profesională cu angajatorii și candidații", "Furnizarea serviciilor de recrutare și plasare forță de muncă", "Răspunsuri la solicitările primite prin formularul de contact", "Îmbunătățirea serviciilor noastre"]
      },
      {
        title: "3. Temeiul legal al prelucrării",
        intro: "Prelucrăm datele dumneavoastră personale în baza următoarelor temeiuri legale:",
        items: [
          { bold: "Consimțământ:", text: "Acordul explicit al persoanei vizate pentru prelucrarea datelor" },
          { bold: "Demersuri precontractuale:", text: "Prelucrarea necesară în vederea încheierii unui contract de muncă sau colaborare" },
          { bold: "Interes legitim:", text: "Interesul nostru legitim de a oferi servicii de recrutare de calitate" }
        ]
      },
      {
        title: "4. Stocarea datelor",
        intro: "Datele personale sunt stocate în condiții de siguranță, utilizând măsuri tehnice și organizatorice adecvate.",
        items: ["Datele pot fi procesate prin furnizori de servicii cloud și infrastructură IT externi", "Păstrăm datele doar pe perioada necesară îndeplinirii scopurilor pentru care au fost colectate", "Datele candidaților sunt păstrate pentru o perioadă de maxim 2 ani de la ultima interacțiune", "Implementăm măsuri de securitate pentru protejarea datelor împotriva accesului neautorizat"]
      },
      {
        title: "5. Drepturile utilizatorilor",
        intro: "În conformitate cu Regulamentul General privind Protecția Datelor (GDPR), aveți următoarele drepturi:",
        items: [
          { bold: "Dreptul de acces:", text: "Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră" },
          { bold: "Dreptul la rectificare:", text: "Puteți solicita corectarea datelor inexacte" },
          { bold: "Dreptul la ștergere:", text: "Puteți solicita ștergerea datelor dumneavoastră personale" },
          { bold: "Dreptul la opoziție:", text: "Vă puteți opune prelucrării datelor în anumite circumstanțe" },
          { bold: "Dreptul la portabilitate:", text: "Puteți solicita transferul datelor către alt operator" },
          { bold: "Dreptul de a depune plângere:", text: "Puteți depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)" }
        ],
        contactNote: "Pentru exercitarea acestor drepturi, vă rugăm să ne contactați la adresa de email:"
      }
    ],
    cookies: {
      title: "6. Cookie-uri",
      text1: "Website-ul nostru utilizează cookie-uri esențiale pentru funcționarea corectă a site-ului. Cookie-urile esențiale sunt necesare pentru navigarea pe site și utilizarea funcționalităților de bază.",
      text2: "Nu utilizăm cookie-uri de marketing sau tracking fără consimțământul dumneavoastră explicit."
    },
    updates: {
      title: "7. Modificări ale politicii",
      text: "Ne rezervăm dreptul de a actualiza această politică de confidențialitate. Orice modificări vor fi publicate pe această pagină cu data ultimei actualizări.",
      lastUpdate: "Ultima actualizare: Februarie 2026"
    },
    backButton: "Înapoi la pagina principală"
  },
  en: {
    meta: { title: "Privacy Policy | Global Jobs Consulting", description: "Global Jobs Consulting SRL Privacy Policy. Learn how we collect, use and protect your personal data." },
    hero: { back: "Back to homepage", title: "Privacy Policy", subtitle: "Protecting your personal data is important to us." },
    operator: {
      title: "Data Controller Information",
      operator: "Controller:",
      email: "Email:",
      website: "Website:"
    },
    sections: [
      {
        title: "1. What data we collect",
        intro: "As part of our activities, we collect the following categories of personal data:",
        items: ["First and last name", "Email address", "Phone number", "CV and professional information (experience, qualifications, skills)", "Contact form messages", "Citizenship and employment preferences (for candidates)", "Company information (for employers)"]
      },
      {
        title: "2. Purpose of processing",
        intro: "Personal data is processed for the following purposes:",
        items: ["Evaluating applications for available positions", "Contacting candidates for the recruitment process", "Professional communication with employers and candidates", "Providing recruitment and workforce placement services", "Responding to inquiries received through the contact form", "Improving our services"]
      },
      {
        title: "3. Legal basis for processing",
        intro: "We process your personal data based on the following legal grounds:",
        items: [
          { bold: "Consent:", text: "Explicit agreement of the data subject for data processing" },
          { bold: "Pre-contractual steps:", text: "Processing necessary for entering into an employment or collaboration contract" },
          { bold: "Legitimate interest:", text: "Our legitimate interest in providing quality recruitment services" }
        ]
      },
      {
        title: "4. Data storage",
        intro: "Personal data is stored securely, using appropriate technical and organizational measures.",
        items: ["Data may be processed by external cloud service and IT infrastructure providers", "We only keep data for the period necessary to fulfill the purposes for which it was collected", "Candidate data is kept for a maximum of 2 years from the last interaction", "We implement security measures to protect data against unauthorized access"]
      },
      {
        title: "5. User rights",
        intro: "In accordance with the General Data Protection Regulation (GDPR), you have the following rights:",
        items: [
          { bold: "Right of access:", text: "You can request a copy of the personal data we hold about you" },
          { bold: "Right to rectification:", text: "You can request correction of inaccurate data" },
          { bold: "Right to erasure:", text: "You can request deletion of your personal data" },
          { bold: "Right to object:", text: "You can object to data processing in certain circumstances" },
          { bold: "Right to portability:", text: "You can request data transfer to another controller" },
          { bold: "Right to lodge a complaint:", text: "You can file a complaint with the National Supervisory Authority for Personal Data Processing" }
        ],
        contactNote: "To exercise these rights, please contact us at:"
      }
    ],
    cookies: {
      title: "6. Cookies",
      text1: "Our website uses essential cookies for proper site functionality. Essential cookies are necessary for site navigation and use of basic features.",
      text2: "We do not use marketing or tracking cookies without your explicit consent."
    },
    updates: {
      title: "7. Policy changes",
      text: "We reserve the right to update this privacy policy. Any changes will be posted on this page with the date of last update.",
      lastUpdate: "Last updated: February 2026"
    },
    backButton: "Back to homepage"
  },
  de: {
    meta: { title: "Datenschutzrichtlinie | Global Jobs Consulting", description: "Datenschutzrichtlinie der Global Jobs Consulting SRL. Erfahren Sie, wie wir Ihre personenbezogenen Daten erheben, verwenden und schützen." },
    hero: { back: "Zurück zur Startseite", title: "Datenschutzrichtlinie", subtitle: "Der Schutz Ihrer personenbezogenen Daten ist uns wichtig." },
    operator: {
      title: "Informationen zum Datenverantwortlichen",
      operator: "Verantwortlicher:",
      email: "E-Mail:",
      website: "Website:"
    },
    sections: [
      {
        title: "1. Welche Daten wir erheben",
        intro: "Im Rahmen unserer Tätigkeit erheben wir folgende Kategorien personenbezogener Daten:",
        items: ["Vor- und Nachname", "E-Mail-Adresse", "Telefonnummer", "Lebenslauf und berufliche Informationen (Erfahrung, Qualifikationen, Fähigkeiten)", "Kontaktformular-Nachrichten", "Staatsangehörigkeit und Beschäftigungspräferenzen (für Kandidaten)", "Unternehmensinformationen (für Arbeitgeber)"]
      },
      {
        title: "2. Zweck der Verarbeitung",
        intro: "Personenbezogene Daten werden für folgende Zwecke verarbeitet:",
        items: ["Bewertung von Bewerbungen für verfügbare Positionen", "Kontaktaufnahme mit Kandidaten für den Rekrutierungsprozess", "Professionelle Kommunikation mit Arbeitgebern und Kandidaten", "Bereitstellung von Rekrutierungs- und Arbeitsvermittlungsdiensten", "Beantwortung von Anfragen über das Kontaktformular", "Verbesserung unserer Dienstleistungen"]
      },
      {
        title: "3. Rechtsgrundlage für die Verarbeitung",
        intro: "Wir verarbeiten Ihre personenbezogenen Daten auf folgenden Rechtsgrundlagen:",
        items: [
          { bold: "Einwilligung:", text: "Ausdrückliche Zustimmung der betroffenen Person zur Datenverarbeitung" },
          { bold: "Vorvertragliche Maßnahmen:", text: "Verarbeitung, die für den Abschluss eines Arbeits- oder Kooperationsvertrags erforderlich ist" },
          { bold: "Berechtigtes Interesse:", text: "Unser berechtigtes Interesse an der Bereitstellung qualitativ hochwertiger Rekrutierungsdienste" }
        ]
      },
      {
        title: "4. Datenspeicherung",
        intro: "Personenbezogene Daten werden sicher gespeichert, unter Verwendung angemessener technischer und organisatorischer Maßnahmen.",
        items: ["Daten können von externen Cloud-Dienst- und IT-Infrastrukturanbietern verarbeitet werden", "Wir bewahren Daten nur für den Zeitraum auf, der zur Erfüllung der Zwecke erforderlich ist", "Kandidatendaten werden maximal 2 Jahre ab der letzten Interaktion aufbewahrt", "Wir implementieren Sicherheitsmaßnahmen zum Schutz der Daten vor unbefugtem Zugriff"]
      },
      {
        title: "5. Benutzerrechte",
        intro: "Gemäß der Datenschutz-Grundverordnung (DSGVO) haben Sie folgende Rechte:",
        items: [
          { bold: "Auskunftsrecht:", text: "Sie können eine Kopie der personenbezogenen Daten anfordern, die wir über Sie gespeichert haben" },
          { bold: "Recht auf Berichtigung:", text: "Sie können die Korrektur unrichtiger Daten verlangen" },
          { bold: "Recht auf Löschung:", text: "Sie können die Löschung Ihrer personenbezogenen Daten verlangen" },
          { bold: "Widerspruchsrecht:", text: "Sie können der Datenverarbeitung unter bestimmten Umständen widersprechen" },
          { bold: "Recht auf Datenübertragbarkeit:", text: "Sie können die Übertragung der Daten an einen anderen Verantwortlichen verlangen" },
          { bold: "Beschwerderecht:", text: "Sie können Beschwerde bei der nationalen Datenschutzbehörde einlegen" }
        ],
        contactNote: "Um diese Rechte auszuüben, kontaktieren Sie uns bitte unter:"
      }
    ],
    cookies: {
      title: "6. Cookies",
      text1: "Unsere Website verwendet essentielle Cookies für die ordnungsgemäße Funktionalität der Website. Essentielle Cookies sind für die Navigation und die Nutzung der Grundfunktionen erforderlich.",
      text2: "Wir verwenden keine Marketing- oder Tracking-Cookies ohne Ihre ausdrückliche Zustimmung."
    },
    updates: {
      title: "7. Änderungen der Richtlinie",
      text: "Wir behalten uns das Recht vor, diese Datenschutzrichtlinie zu aktualisieren. Alle Änderungen werden auf dieser Seite mit dem Datum der letzten Aktualisierung veröffentlicht.",
      lastUpdate: "Letzte Aktualisierung: Februar 2026"
    },
    backButton: "Zurück zur Startseite"
  },
  sr: {
    meta: { title: "Politika privatnosti | Global Jobs Consulting", description: "Politika privatnosti Global Jobs Consulting SRL. Saznajte kako prikupljamo, koristimo i štitimo vaše lične podatke." },
    hero: { back: "Nazad na početnu stranicu", title: "Politika privatnosti", subtitle: "Zaštita vaših ličnih podataka nam je važna." },
    operator: {
      title: "Informacije o rukovaocu podacima",
      operator: "Rukovalac:",
      email: "Email:",
      website: "Website:"
    },
    sections: [
      {
        title: "1. Koje podatke prikupljamo",
        intro: "U okviru naših aktivnosti prikupljamo sledeće kategorije ličnih podataka:",
        items: ["Ime i prezime", "Email adresa", "Broj telefona", "CV i profesionalne informacije (iskustvo, kvalifikacije, veštine)", "Poruke iz kontakt forme", "Državljanstvo i preferencije zaposlenja (za kandidate)", "Informacije o kompaniji (za poslodavce)"]
      },
      {
        title: "2. Svrha obrade",
        intro: "Lični podaci se obrađuju u sledeće svrhe:",
        items: ["Procena prijava za dostupne pozicije", "Kontaktiranje kandidata za proces zapošljavanja", "Profesionalna komunikacija sa poslodavcima i kandidatima", "Pružanje usluga zapošljavanja i posredovanja", "Odgovaranje na upite primljene putem kontakt forme", "Poboljšanje naših usluga"]
      },
      {
        title: "3. Pravni osnov za obradu",
        intro: "Obrađujemo vaše lične podatke na osnovu sledećih pravnih osnova:",
        items: [
          { bold: "Saglasnost:", text: "Izričita saglasnost lica na koje se podaci odnose za obradu podataka" },
          { bold: "Predugovorne radnje:", text: "Obrada neophodna za zaključenje ugovora o radu ili saradnji" },
          { bold: "Legitimni interes:", text: "Naš legitimni interes u pružanju kvalitetnih usluga zapošljavanja" }
        ]
      },
      {
        title: "4. Čuvanje podataka",
        intro: "Lični podaci se čuvaju na siguran način, koristeći odgovarajuće tehničke i organizacione mere.",
        items: ["Podaci mogu biti obrađivani od strane eksternih provajdera cloud usluga i IT infrastrukture", "Čuvamo podatke samo onoliko koliko je neophodno za ispunjenje svrha za koje su prikupljeni", "Podaci kandidata se čuvaju maksimalno 2 godine od poslednje interakcije", "Primenjujemo mere bezbednosti za zaštitu podataka od neovlašćenog pristupa"]
      },
      {
        title: "5. Prava korisnika",
        intro: "U skladu sa Opštom uredbom o zaštiti podataka (GDPR), imate sledeća prava:",
        items: [
          { bold: "Pravo na pristup:", text: "Možete zatražiti kopiju ličnih podataka koje čuvamo o vama" },
          { bold: "Pravo na ispravku:", text: "Možete zatražiti ispravku netačnih podataka" },
          { bold: "Pravo na brisanje:", text: "Možete zatražiti brisanje vaših ličnih podataka" },
          { bold: "Pravo na prigovor:", text: "Možete se usprotiviti obradi podataka u određenim okolnostima" },
          { bold: "Pravo na prenosivost:", text: "Možete zatražiti prenos podataka drugom rukovaocu" },
          { bold: "Pravo na žalbu:", text: "Možete podneti žalbu nacionalnom nadzornom organu za zaštitu podataka" }
        ],
        contactNote: "Za ostvarivanje ovih prava, molimo kontaktirajte nas na:"
      }
    ],
    cookies: {
      title: "6. Kolačići",
      text1: "Naš website koristi esencijalne kolačiće za pravilno funkcionisanje sajta. Esencijalni kolačići su neophodni za navigaciju i korišćenje osnovnih funkcionalnosti.",
      text2: "Ne koristimo marketinške ili tracking kolačiće bez vaše izričite saglasnosti."
    },
    updates: {
      title: "7. Izmene politike",
      text: "Zadržavamo pravo da ažuriramo ovu politiku privatnosti. Sve izmene će biti objavljene na ovoj stranici sa datumom poslednjeg ažuriranja.",
      lastUpdate: "Poslednje ažuriranje: Februar 2026"
    },
    backButton: "Nazad na početnu stranicu"
  }
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <Helmet>
        <title>Politica de Confidențialitate | Global Jobs Consulting</title>
        <meta name="description" content={(t && t.meta && t.meta.description) || ''} />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="privacy-policy-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-12 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Link to="/" className="inline-flex items-center text-coral hover:text-white transition mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.hero.back}
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-coral" />
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                  {t.hero.title}
                </h1>
              </div>
              <p className="text-navy-200">
                {t.hero.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
            
            {/* Company Info */}
            <div className="mb-10 p-6 bg-navy-50 rounded-xl">
              <h2 className="font-heading text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-coral" />
                {t.operator.title}
              </h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>{t.operator.operator}</strong> Global Jobs Consulting SRL</p>
                <p><strong>CUI:</strong> 48270947</p>
                <p><strong>Nr. Reg. Com.:</strong> J05/1458/2023</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-coral" />
                  <strong>{t.operator.email}</strong> <a href="mailto:office@gjc.ro" className="text-coral hover:underline">office@gjc.ro</a>
                </p>
                <p><strong>{t.operator.website}</strong> <a href="https://www.gjc.ro" className="text-coral hover:underline">www.gjc.ro</a></p>
              </div>
            </div>

            {/* Dynamic Sections */}
            {t.sections.map((section, idx) => (
              <section key={idx} className="mb-10">
                <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 mb-4">
                  {section.intro}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      {typeof item === 'string' ? item : (
                        <><strong>{item.bold}</strong> {item.text}</>
                      )}
                    </li>
                  ))}
                </ul>
                {section.contactNote && (
                  <div className="mt-6 p-4 bg-coral/10 rounded-lg border border-coral/20">
                    <p className="text-gray-700">
                      {section.contactNote}{" "}
                      <a href="mailto:office@gjc.ro" className="text-coral font-semibold hover:underline">
                        office@gjc.ro
                      </a>
                    </p>
                  </div>
                )}
              </section>
            ))}

            {/* Cookies */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                {t.cookies.title}
              </h2>
              <p className="text-gray-700 mb-4">
                {t.cookies.text1}
              </p>
              <p className="text-gray-700">
                {t.cookies.text2}
              </p>
            </section>

            {/* Updates */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                {t.updates.title}
              </h2>
              <p className="text-gray-700">
                {t.updates.text}
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                {t.updates.lastUpdate}
              </p>
            </section>

            {/* Back Button */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-center">
              <Button asChild className="bg-coral hover:bg-red-600 text-white rounded-full px-8">
                <Link to="/">{t.backButton}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
