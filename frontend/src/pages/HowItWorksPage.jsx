import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  FileText, Users, Plane, Building2, CheckCircle, 
  ArrowRight, Clock, Shield, Headphones 
} from 'lucide-react';

const pageContent = {
  ro: {
    title: "Cum Funcționează",
    subtitle: "Procesul nostru de recrutare în 5 pași simpli",
    metaTitle: "Cum Funcționează | Global Jobs Consulting",
    metaDescription: "Descoperiți procesul nostru de recrutare internațională în 5 pași simpli. De la cerere la integrare.",
    steps: [
      {
        icon: FileText,
        title: "1. Trimiteți Cererea",
        description: "Completați formularul cu detalii despre necesarul de personal: număr de muncitori, industrie, calificări necesare.",
        duration: "1 zi"
      },
      {
        icon: Users,
        title: "2. Selecția Candidaților",
        description: "Echipa noastră selectează candidați potriviți din baza noastră de date cu peste 10.000 de profesioniști verificați.",
        duration: "1-2 săptămâni"
      },
      {
        icon: FileText,
        title: "3. Documentație & Vize",
        description: "Gestionăm toate procedurile legale: dosare IGI, vize de muncă, permise de ședere și contracte de muncă.",
        duration: "4-6 săptămâni"
      },
      {
        icon: Plane,
        title: "4. Transport & Sosire",
        description: "Organizăm transportul candidaților și îi preluăm la sosire pentru a asigura o tranziție fără probleme.",
        duration: "1 săptămână"
      },
      {
        icon: Building2,
        title: "5. Integrare & Suport",
        description: "Oferim suport continuu pentru integrarea în companie și comunitate pe toată durata contractului.",
        duration: "Continuu"
      }
    ],
    cta: "Începeți Acum",
    ctaSubtitle: "Completați formularul și vă contactăm în 24 de ore",
    features: [
      { icon: Clock, title: "Proces Rapid", desc: "4-8 săptămâni de la cerere la angajare" },
      { icon: Shield, title: "100% Legal", desc: "Conformitate completă cu legislația" },
      { icon: Headphones, title: "Suport 24/7", desc: "Echipă dedicată pentru orice problemă" }
    ]
  },
  en: {
    title: "How It Works",
    subtitle: "Our recruitment process in 5 simple steps",
    metaTitle: "How It Works | Global Jobs Consulting",
    metaDescription: "Discover our international recruitment process in 5 simple steps. From request to integration.",
    steps: [
      {
        icon: FileText,
        title: "1. Submit Request",
        description: "Fill out the form with details about your staffing needs: number of workers, industry, required qualifications.",
        duration: "1 day"
      },
      {
        icon: Users,
        title: "2. Candidate Selection",
        description: "Our team selects suitable candidates from our database of over 10,000 verified professionals.",
        duration: "1-2 weeks"
      },
      {
        icon: FileText,
        title: "3. Documentation & Visas",
        description: "We handle all legal procedures: IGI files, work visas, residence permits and employment contracts.",
        duration: "4-6 weeks"
      },
      {
        icon: Plane,
        title: "4. Transport & Arrival",
        description: "We organize candidate transportation and welcome them upon arrival for a smooth transition.",
        duration: "1 week"
      },
      {
        icon: Building2,
        title: "5. Integration & Support",
        description: "We provide ongoing support for company and community integration throughout the contract.",
        duration: "Ongoing"
      }
    ],
    cta: "Start Now",
    ctaSubtitle: "Fill out the form and we'll contact you within 24 hours",
    features: [
      { icon: Clock, title: "Fast Process", desc: "4-8 weeks from request to hire" },
      { icon: Shield, title: "100% Legal", desc: "Full compliance with legislation" },
      { icon: Headphones, title: "24/7 Support", desc: "Dedicated team for any issue" }
    ]
  },
  de: {
    title: "So Funktioniert's",
    subtitle: "Unser Rekrutierungsprozess in 5 einfachen Schritten",
    metaTitle: "So Funktioniert's | Global Jobs Consulting",
    metaDescription: "Entdecken Sie unseren internationalen Rekrutierungsprozess in 5 einfachen Schritten.",
    steps: [
      {
        icon: FileText,
        title: "1. Anfrage Senden",
        description: "Füllen Sie das Formular mit Details zu Ihrem Personalbedarf aus.",
        duration: "1 Tag"
      },
      {
        icon: Users,
        title: "2. Kandidatenauswahl",
        description: "Unser Team wählt passende Kandidaten aus unserer Datenbank mit über 10.000 geprüften Fachleuten.",
        duration: "1-2 Wochen"
      },
      {
        icon: FileText,
        title: "3. Dokumentation & Visa",
        description: "Wir kümmern uns um alle rechtlichen Verfahren: IGI-Akten, Arbeitsvisa, Aufenthaltsgenehmigungen.",
        duration: "4-6 Wochen"
      },
      {
        icon: Plane,
        title: "4. Transport & Ankunft",
        description: "Wir organisieren den Transport der Kandidaten und empfangen sie bei der Ankunft.",
        duration: "1 Woche"
      },
      {
        icon: Building2,
        title: "5. Integration & Support",
        description: "Wir bieten kontinuierliche Unterstützung für die Integration während der gesamten Vertragslaufzeit.",
        duration: "Laufend"
      }
    ],
    cta: "Jetzt Starten",
    ctaSubtitle: "Füllen Sie das Formular aus und wir kontaktieren Sie innerhalb von 24 Stunden",
    features: [
      { icon: Clock, title: "Schneller Prozess", desc: "4-8 Wochen von Anfrage bis Einstellung" },
      { icon: Shield, title: "100% Legal", desc: "Volle Gesetzeskonformität" },
      { icon: Headphones, title: "24/7 Support", desc: "Dediziertes Team für jedes Problem" }
    ]
  },
  sr: {
    title: "Kako Funkcioniše",
    subtitle: "Naš proces regrutacije u 5 jednostavnih koraka",
    metaTitle: "Kako Funkcioniše | Global Jobs Consulting",
    metaDescription: "Otkrijte naš međunarodni proces regrutacije u 5 jednostavnih koraka.",
    steps: [
      {
        icon: FileText,
        title: "1. Pošaljite Zahtev",
        description: "Popunite formular sa detaljima o vašim potrebama za kadrovima.",
        duration: "1 dan"
      },
      {
        icon: Users,
        title: "2. Izbor Kandidata",
        description: "Naš tim bira odgovarajuće kandidate iz naše baze podataka sa preko 10.000 proverenih profesionalaca.",
        duration: "1-2 nedelje"
      },
      {
        icon: FileText,
        title: "3. Dokumentacija & Vize",
        description: "Brinemo o svim pravnim postupcima: IGI dosijei, radne vize, dozvole boravka.",
        duration: "4-6 nedelja"
      },
      {
        icon: Plane,
        title: "4. Transport & Dolazak",
        description: "Organizujemo transport kandidata i dočekujemo ih po dolasku.",
        duration: "1 nedelja"
      },
      {
        icon: Building2,
        title: "5. Integracija & Podrška",
        description: "Pružamo kontinuiranu podršku za integraciju tokom celog ugovora.",
        duration: "Stalno"
      }
    ],
    cta: "Započnite Sada",
    ctaSubtitle: "Popunite formular i kontaktiraćemo vas u roku od 24 sata",
    features: [
      { icon: Clock, title: "Brz Proces", desc: "4-8 nedelja od zahteva do zapošljavanja" },
      { icon: Shield, title: "100% Legalno", desc: "Potpuna usklađenost sa zakonima" },
      { icon: Headphones, title: "24/7 Podrška", desc: "Posvećen tim za svaki problem" }
    ]
  }
};

export default function HowItWorksPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = pageContent[language] || pageContent.ro;

  return (
    <>
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">{t.subtitle}</p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {t.steps.map((step, index) => (
                <div key={index} className="relative flex gap-6 mb-12 last:mb-0">
                  {/* Timeline line */}
                  {index < t.steps.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-coral/30" />
                  )}
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-coral rounded-full flex items-center justify-center z-10">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <Card className="flex-1 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-navy-900">{step.title}</h3>
                        <span className="text-sm bg-coral/10 text-coral px-3 py-1 rounded-full font-medium">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {t.features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-coral">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.cta}</h2>
            <p className="text-white/90 text-lg mb-8">{t.ctaSubtitle}</p>
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-coral hover:bg-gray-100 rounded-full px-8 font-semibold"
            >
              <Link to={language === 'ro' ? '/solicita-muncitori' : `/${language}/request-workers`}>
                {t.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
