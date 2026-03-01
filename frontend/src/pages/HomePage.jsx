import { Helmet } from "react-helmet";
import HeroSlider from "@/components/HeroSlider";
import ServicesGrid from "@/components/ServicesGrid";
import ProcessSection from "@/components/ProcessSection";
import StatsSection from "@/components/StatsSection";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Clock, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const pageContent = {
  ro: {
    meta: {
      title: "Global Jobs Consulting | Recrutare și Plasare Forță de Muncă Asia & Africa",
      description: "Agenție de recrutare All-Inclusive în România, Austria și Serbia. 11 parteneri în Asia și Africa."
    },
    about: {
      label: "Despre Noi",
      title: "Conectăm Talente Globale cu Oportunități Locale",
      subtitle: "Soluții Globale pentru Deficitul de Forță de Muncă",
      text1: "Global Jobs Consulting este o agenție de recrutare All-Inclusive specializată în plasarea forței de muncă din Asia și Africa în piețele europene. Cu o rețea de 11 agenții partenere, oferim soluții complete de staffing pentru angajatorii din România, Austria și Serbia.",
      text2: "Ne ocupăm de întregul proces: de la selecția riguroasă a candidaților, întocmirea dosarelor de imigrare (vize și permise de muncă), până la integrarea în comunitate și monitorizarea pe termen lung.",
      cta: "Descoperă Serviciile Noastre",
      years: "Ani de Experiență"
    },
    advantages: [
      { title: "Rețea Globală", description: "Acces la candidați din Asia și Africa prin intermediul celor 11 agenții partenere." },
      { title: "Conformitate Legală", description: "Gestionăm integral documentația legală: vize, permise de muncă și autorizații." },
      { title: "Proces Rapid", description: "Livrăm candidați selectați în cel mai scurt timp posibil, cu suport complet." },
      { title: "Suport Continuu", description: "Monitorizare și asistență pe termen lung pentru integrarea cu succes." }
    ],
    markets: {
      label: "Piețe Acoperite",
      title: "Angajatori din 3 Țări",
      romania: { name: "România", desc: "Soluții complete de recrutare pentru angajatorii români din toate sectoarele industriale.", link: "Detalii pentru RO →" },
      austria: { name: "Austria", desc: "Forță de muncă calificată pentru piața austriacă, cu suport complet în procesul de imigrare.", link: "Detalii pentru AT →" },
      serbia: { name: "Serbia", desc: "Plasare de personal pentru companiile din Serbia care caută muncitori dedicați.", link: "Detalii pentru RS →" }
    },
    cta: {
      title: "Începeți Recrutarea Astăzi",
      description: "Indiferent dacă sunteți angajator în căutare de personal sau candidat în căutarea unei oportunități, suntem aici să vă ajutăm.",
      employer: "Sunt Angajator",
      candidate: "Caut un Job"
    }
  },
  en: {
    meta: {
      title: "Global Jobs Consulting | International Workforce Recruitment Asia & Africa",
      description: "All-Inclusive recruitment agency in Romania, Austria, and Serbia. 11 partners in Asia and Africa."
    },
    about: {
      label: "About Us",
      title: "Connecting Global Talent with Local Opportunities",
      subtitle: "Global Solutions for Workforce Shortage",
      text1: "Global Jobs Consulting is an All-Inclusive recruitment agency specialized in placing workforce from Asia and Africa in European markets. With a network of 11 partner agencies, we offer complete staffing solutions for employers in Romania, Austria, and Serbia.",
      text2: "We handle the entire process: from rigorous candidate selection, immigration documentation (visas and work permits), to community integration and long-term monitoring.",
      cta: "Discover Our Services",
      years: "Years of Experience"
    },
    advantages: [
      { title: "Global Network", description: "Access to candidates from Asia and Africa through our 11 partner agencies." },
      { title: "Legal Compliance", description: "We fully manage legal documentation: visas, work permits, and authorizations." },
      { title: "Fast Process", description: "We deliver selected candidates as quickly as possible, with full support." },
      { title: "Ongoing Support", description: "Long-term monitoring and assistance for successful integration." }
    ],
    markets: {
      label: "Markets Covered",
      title: "Employers from 3 Countries",
      romania: { name: "Romania", desc: "Complete recruitment solutions for Romanian employers across all industrial sectors.", link: "Details for RO →" },
      austria: { name: "Austria", desc: "Qualified workforce for the Austrian market, with full immigration process support.", link: "Details for AT →" },
      serbia: { name: "Serbia", desc: "Staff placement for Serbian companies looking for dedicated workers.", link: "Details for RS →" }
    },
    cta: {
      title: "Start Recruiting Today",
      description: "Whether you're an employer looking for staff or a candidate looking for an opportunity, we're here to help you.",
      employer: "I'm an Employer",
      candidate: "Looking for a Job"
    }
  },
  de: {
    meta: {
      title: "Global Jobs Consulting | Internationale Arbeitskräftevermittlung Asien & Afrika",
      description: "All-Inclusive-Rekrutierungsagentur in Rumänien, Österreich und Serbien. 11 Partner in Asien und Afrika."
    },
    about: {
      label: "Über uns",
      title: "Wir verbinden globale Talente mit lokalen Möglichkeiten",
      subtitle: "Globale Lösungen für den Arbeitskräftemangel",
      text1: "Global Jobs Consulting ist eine All-Inclusive-Rekrutierungsagentur, die sich auf die Vermittlung von Arbeitskräften aus Asien und Afrika in europäische Märkte spezialisiert hat. Mit einem Netzwerk von 11 Partneragenturen bieten wir vollständige Personallösungen für Arbeitgeber in Rumänien, Österreich und Serbien.",
      text2: "Wir kümmern uns um den gesamten Prozess: von der sorgfältigen Auswahl der Kandidaten, der Erstellung von Einwanderungsdossiers (Visa und Arbeitserlaubnisse) bis hin zur Integration in die Gemeinschaft und langfristigen Überwachung.",
      cta: "Entdecken Sie unsere Dienstleistungen",
      years: "Jahre Erfahrung"
    },
    advantages: [
      { title: "Globales Netzwerk", description: "Zugang zu Kandidaten aus Asien und Afrika durch unsere 11 Partneragenturen." },
      { title: "Rechtliche Konformität", description: "Wir verwalten die gesamte rechtliche Dokumentation: Visa, Arbeitserlaubnisse und Genehmigungen." },
      { title: "Schneller Prozess", description: "Wir liefern ausgewählte Kandidaten so schnell wie möglich mit voller Unterstützung." },
      { title: "Kontinuierliche Unterstützung", description: "Langfristige Überwachung und Unterstützung für eine erfolgreiche Integration." }
    ],
    markets: {
      label: "Abgedeckte Märkte",
      title: "Arbeitgeber aus 3 Ländern",
      romania: { name: "Rumänien", desc: "Komplette Rekrutierungslösungen für rumänische Arbeitgeber in allen Industriesektoren.", link: "Details für RO →" },
      austria: { name: "Österreich", desc: "Qualifizierte Arbeitskräfte für den österreichischen Markt mit voller Unterstützung im Einwanderungsprozess.", link: "Details für AT →" },
      serbia: { name: "Serbien", desc: "Personalvermittlung für serbische Unternehmen, die engagierte Mitarbeiter suchen.", link: "Details für RS →" }
    },
    cta: {
      title: "Starten Sie heute mit der Rekrutierung",
      description: "Ob Sie als Arbeitgeber Personal suchen oder als Kandidat eine Stelle suchen - wir sind hier, um Ihnen zu helfen.",
      employer: "Ich bin Arbeitgeber",
      candidate: "Jobsuche"
    }
  },
  sr: {
    meta: {
      title: "Global Jobs Consulting | Međunarodna regrutacija radne snage Azija i Afrika",
      description: "Sveobuhvatna agencija za zapošljavanje u Rumuniji, Austriji i Srbiji. 11 partnera u Aziji i Africi."
    },
    about: {
      label: "O nama",
      title: "Povezujemo globalne talente sa lokalnim prilikama",
      subtitle: "Globalna rešenja za nedostatak radne snage",
      text1: "Global Jobs Consulting je sveobuhvatna agencija za zapošljavanje specijalizovana za plasiranje radne snage iz Azije i Afrike na evropska tržišta. Sa mrežom od 11 partnerskih agencija, nudimo kompletna rešenja za zapošljavanje poslodavcima u Rumuniji, Austriji i Srbiji.",
      text2: "Brinemo se o celom procesu: od pažljivog odabira kandidata, pripreme imigracionih dosijea (vize i radne dozvole) do integracije u zajednicu i dugoročnog praćenja.",
      cta: "Otkrijte naše usluge",
      years: "Godina iskustva"
    },
    advantages: [
      { title: "Globalna mreža", description: "Pristup kandidatima iz Azije i Afrike kroz naših 11 partnerskih agencija." },
      { title: "Pravna usklađenost", description: "U potpunosti upravljamo pravnom dokumentacijom: vize, radne dozvole i ovlašćenja." },
      { title: "Brz proces", description: "Isporučujemo odabrane kandidate što je brže moguće, uz punu podršku." },
      { title: "Kontinuirana podrška", description: "Dugoročno praćenje i pomoć za uspešnu integraciju." }
    ],
    markets: {
      label: "Pokrivena tržišta",
      title: "Poslodavci iz 3 zemlje",
      romania: { name: "Rumunija", desc: "Kompletna rešenja za zapošljavanje za rumunske poslodavce u svim industrijskim sektorima.", link: "Detalji za RO →" },
      austria: { name: "Austrija", desc: "Kvalifikovana radna snaga za austrijsko tržište, uz punu podršku u imigracionom procesu.", link: "Detalji za AT →" },
      serbia: { name: "Srbija", desc: "Plasman osoblja za srpske kompanije koje traže posvećene radnike.", link: "Detalji za RS →" }
    },
    cta: {
      title: "Počnite sa regrutacijom danas",
      description: "Bilo da ste poslodavac u potrazi za osobljem ili kandidat u potrazi za prilikom, tu smo da vam pomognemo.",
      employer: "Ja sam poslodavac",
      candidate: "Tražim posao"
    }
  }
};

export default function HomePage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = pageContent[language] || pageContent.ro;
  const icons = [Globe, Shield, Clock, Users];

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />
      <Helmet>
        <meta name="keywords" content="recrutare, forța de muncă, Asia, Africa, România, Austria, Serbia, HoReCa, construcții, agricultură" />
      </Helmet>

      <div data-testid="home-page">
        {/* Hero Slider */}
        <HeroSlider />

        {/* About Section */}
        <section className="py-20 bg-white" data-testid="about-section">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative">
                <img
                  src="https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/zeb6mv7z_poza%20pt%20talente%20globale%20afaceri%20locale.png"
                  alt="Global Jobs Consulting Team"
                  className="rounded-2xl shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-coral text-white p-6 rounded-2xl shadow-xl hidden md:block">
                  <div className="font-heading text-4xl font-bold">4</div>
                  <div className="text-white/80 text-sm">{t.about.years}</div>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="text-coral font-semibold text-sm tracking-wider">
                  {t.about.label}
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                  {t.about.title}
                </h2>
                <p className="text-xl text-gold font-medium mb-6">
                  {t.about.subtitle}
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t.about.text1}
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {t.about.text2}
                </p>

                {/* Advantages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {t.advantages.map((adv, index) => {
                    const Icon = icons[index];
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-coral/10 rounded-lg">
                          <Icon className="h-5 w-5 text-coral" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy-900 text-sm">{adv.title}</h4>
                          <p className="text-gray-500 text-xs">{adv.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to={getLocalizedPath("/servicii")}
                  className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
                  data-testid="about-cta"
                >
                  {t.about.cta}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Services Grid */}
        <ServicesGrid />

        {/* Process Section */}
        <ProcessSection />

        {/* Target Markets */}
        <section className="py-20 bg-gray-50" data-testid="markets-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-coral font-semibold text-sm tracking-wider">
                {t.markets.label}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                {t.markets.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Romania */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-romania">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-3xl">🇷🇴</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.markets.romania.name}</h3>
                <p className="text-gray-600 mb-4">{t.markets.romania.desc}</p>
                <Link to={getLocalizedPath("/angajatori")} className="text-coral font-semibold text-sm hover:underline">
                  {t.markets.romania.link}
                </Link>
              </div>

              {/* Austria */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-austria">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-3xl">🇦🇹</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.markets.austria.name}</h3>
                <p className="text-gray-600 mb-4">{t.markets.austria.desc}</p>
                <Link to={getLocalizedPath("/angajatori")} className="text-coral font-semibold text-sm hover:underline">
                  {t.markets.austria.link}
                </Link>
              </div>

              {/* Serbia */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-serbia">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-3xl">🇷🇸</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.markets.serbia.name}</h3>
                <p className="text-gray-600 mb-4">{t.markets.serbia.desc}</p>
                <Link to={getLocalizedPath("/angajatori")} className="text-coral font-semibold text-sm hover:underline">
                  {t.markets.serbia.link}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-navy-900 to-navy-800 relative overflow-hidden" data-testid="final-cta-section">
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                {t.cta.title}
              </h2>
              <p className="text-navy-200 text-lg mb-8">
                {t.cta.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to={getLocalizedPath("/angajatori")}
                  className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg"
                  data-testid="final-cta-employer"
                >
                  {t.cta.employer}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to={getLocalizedPath("/candidati")}
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
                  data-testid="final-cta-candidate"
                >
                  {t.cta.candidate}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
