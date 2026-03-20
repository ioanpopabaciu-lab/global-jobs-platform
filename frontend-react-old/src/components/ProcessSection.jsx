import { Link } from "react-router-dom";
import { 
  Search, 
  FileCheck, 
  Plane, 
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const content = {
  ro: {
    label: "Servicii All-Inclusive",
    title: "Procesul Nostru",
    description: "De la identificarea candidatului până la integrarea în echipa dumneavoastră, gestionăm fiecare etapă cu profesionalism.",
    steps: [
      { step: "01", title: "Selecție Riguroasă", description: "Identificăm candidații potriviți prin rețeaua noastră de 11 agenții partenere.", features: ["Verificare documente", "Testare aptitudini", "Interviuri video"] },
      { step: "02", title: "Documentație Completă", description: "Gestionăm integral procesul de imigrare: vize, permise de muncă și autorizații.", features: ["Dosare vize", "Permise de muncă", "Traduceri legalizate"] },
      { step: "03", title: "Logistică & Transport", description: "Organizăm transportul, cazarea inițială și toate aspectele logistice.", features: ["Bilete avion", "Cazare temporară", "Transfer aeroport"] },
      { step: "04", title: "Integrare în Echipă", description: "Asigurăm o tranziție lină și suport continuu pentru angajat și angajator.", features: ["Orientare culturală", "Suport HR", "Monitorizare 6 luni"] }
    ],
    cta: {
      title: "Soluții Complete de Recrutare",
      description: "Nu vă faceți griji cu birocrația și logistica. Noi ne ocupăm de tot, de la selecție până la integrare, astfel încât să vă puteți concentra pe afacerea dumneavoastră.",
      services: "Vezi Toate Serviciile",
      contact: "Contactează-ne"
    }
  },
  en: {
    label: "All-Inclusive Services",
    title: "Our Process",
    description: "From identifying the candidate to integrating them into your team, we professionally manage every step.",
    steps: [
      { step: "01", title: "Rigorous Selection", description: "We identify suitable candidates through our network of 11 partner agencies.", features: ["Document verification", "Skills testing", "Video interviews"] },
      { step: "02", title: "Complete Documentation", description: "We fully manage the immigration process: visas, work permits, and authorizations.", features: ["Visa files", "Work permits", "Certified translations"] },
      { step: "03", title: "Logistics & Transport", description: "We organize transport, initial accommodation, and all logistical aspects.", features: ["Flight tickets", "Temporary housing", "Airport transfer"] },
      { step: "04", title: "Team Integration", description: "We ensure a smooth transition and ongoing support for employee and employer.", features: ["Cultural orientation", "HR support", "6-month monitoring"] }
    ],
    cta: {
      title: "Complete Recruitment Solutions",
      description: "Don't worry about bureaucracy and logistics. We handle everything from selection to integration, so you can focus on your business.",
      services: "View All Services",
      contact: "Contact Us"
    }
  },
  de: {
    label: "All-Inclusive-Dienstleistungen",
    title: "Unser Prozess",
    description: "Von der Identifizierung des Kandidaten bis zur Integration in Ihr Team verwalten wir jeden Schritt professionell.",
    steps: [
      { step: "01", title: "Sorgfältige Auswahl", description: "Wir identifizieren geeignete Kandidaten über unser Netzwerk von 11 Partneragenturen.", features: ["Dokumentenprüfung", "Fähigkeitstests", "Videointerviews"] },
      { step: "02", title: "Vollständige Dokumentation", description: "Wir verwalten den gesamten Einwanderungsprozess: Visa, Arbeitserlaubnisse und Genehmigungen.", features: ["Visumakten", "Arbeitserlaubnisse", "Beglaubigte Übersetzungen"] },
      { step: "03", title: "Logistik & Transport", description: "Wir organisieren Transport, erste Unterkunft und alle logistischen Aspekte.", features: ["Flugtickets", "Temporäre Unterkunft", "Flughafentransfer"] },
      { step: "04", title: "Teamintegration", description: "Wir sorgen für einen reibungslosen Übergang und kontinuierliche Unterstützung.", features: ["Kulturelle Orientierung", "HR-Unterstützung", "6-monatige Überwachung"] }
    ],
    cta: {
      title: "Komplette Rekrutierungslösungen",
      description: "Machen Sie sich keine Sorgen über Bürokratie und Logistik. Wir kümmern uns um alles, von der Auswahl bis zur Integration.",
      services: "Alle Dienstleistungen ansehen",
      contact: "Kontaktieren Sie uns"
    }
  },
  sr: {
    label: "Sveobuhvatne usluge",
    title: "Naš proces",
    description: "Od identifikacije kandidata do integracije u vaš tim, profesionalno upravljamo svakim korakom.",
    steps: [
      { step: "01", title: "Rigorozna selekcija", description: "Identifikujemo odgovarajuće kandidate kroz našu mrežu od 11 partnerskih agencija.", features: ["Provera dokumenata", "Testiranje veština", "Video intervjui"] },
      { step: "02", title: "Kompletna dokumentacija", description: "U potpunosti upravljamo imigracionim procesom: vize, radne dozvole i ovlašćenja.", features: ["Vizna dokumentacija", "Radne dozvole", "Overeni prevodi"] },
      { step: "03", title: "Logistika i transport", description: "Organizujemo transport, početni smeštaj i sve logističke aspekte.", features: ["Avionske karte", "Privremeni smeštaj", "Aerodromski transfer"] },
      { step: "04", title: "Integracija u tim", description: "Obezbeđujemo gladak prelaz i kontinuiranu podršku za zaposlenog i poslodavca.", features: ["Kulturna orijentacija", "HR podrška", "6-mesečno praćenje"] }
    ],
    cta: {
      title: "Kompletna rešenja za zapošljavanje",
      description: "Ne brinite o birokratiji i logistici. Mi se brinemo o svemu, od selekcije do integracije.",
      services: "Pogledajte sve usluge",
      contact: "Kontaktirajte nas"
    }
  }
};

const icons = [Search, FileCheck, Plane, Users];

export default function ProcessSection() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <section className="py-20 bg-white" data-testid="process-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-coral font-semibold text-sm tracking-wider">
            {t.label}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
            {t.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.steps.map((step, index) => {
            const Icon = icons[index];
            return (
              <div 
                key={index}
                className="relative group"
                data-testid={`process-step-${index + 1}`}
              >
                {/* Connector Line */}
                {index < t.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-navy-100 z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-coral rounded-full" />
                  </div>
                )}

                <div className="relative z-10 bg-white p-6 rounded-xl border border-gray-100 hover:border-coral/30 hover:shadow-lg transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 bg-coral text-white font-heading font-bold text-lg px-3 py-1 rounded-full">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="mt-4 mb-4 p-3 bg-navy-50 rounded-xl inline-block group-hover:bg-coral/10 transition-colors">
                    <Icon className="h-8 w-8 text-navy-700" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-xl font-bold text-navy-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
            {t.cta.title}
          </h3>
          <p className="text-navy-200 max-w-2xl mx-auto mb-8">
            {t.cta.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/servicii"
              className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
              data-testid="process-cta-services"
            >
              {t.cta.services}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
              data-testid="process-cta-contact"
            >
              {t.cta.contact}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
