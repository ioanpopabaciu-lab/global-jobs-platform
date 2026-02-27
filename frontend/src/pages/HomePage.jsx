import { Helmet } from "react-helmet";
import HeroSlider from "@/components/HeroSlider";
import ServicesGrid from "@/components/ServicesGrid";
import ProcessSection from "@/components/ProcessSection";
import StatsSection from "@/components/StatsSection";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Clock, Users } from "lucide-react";

const advantages = [
  {
    icon: Globe,
    title: "Rețea Globală",
    description: "Acces la candidați din Asia și Africa prin intermediul celor 11 agenții partenere."
  },
  {
    icon: Shield,
    title: "Conformitate Legală",
    description: "Gestionăm integral documentația legală: vize, permise de muncă și autorizații pentru RO, AT și RS."
  },
  {
    icon: Clock,
    title: "Proces Rapid",
    description: "Livrăm candidați selectați în cel mai scurt timp posibil, cu suport complet pe tot parcursul."
  },
  {
    icon: Users,
    title: "Suport Continuu",
    description: "Monitorizare și asistență pe termen lung pentru integrarea cu succes a noilor angajați."
  }
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Global Jobs Consulting | Recrutare și Plasare Forță de Muncă Asia & Africa</title>
        <meta name="description" content="Agenție de recrutare All-Inclusive în România, Austria și Serbia. Peste 30 de parteneri în 18 țări. Soluții stabile pentru forță de muncă calificată și necalificată." />
        <meta name="keywords" content="recrutare, forța de muncă, Asia, Africa, România, Austria, Serbia, HoReCa, construcții, agricultură, producție" />
        <link rel="canonical" href="https://www.gjc.ro" />
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
                  src="https://images.unsplash.com/photo-1740477138822-906f6b845579?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxmYXJtJTIwYWdyaWN1bHR1cmUlMjB3b3JrZXJzJTIwaGFydmVzdCUyMHNtaWxpbmclMjBhc2lhfGVufDB8fHx8MTc3MjIyMzQxNXww&ixlib=rb-4.1.0&q=85"
                  alt="Echipa Global Jobs Consulting"
                  className="rounded-2xl shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-coral text-white p-6 rounded-2xl shadow-xl hidden md:block">
                  <div className="font-heading text-4xl font-bold">4</div>
                  <div className="text-white/80 text-sm">Ani de Experiență</div>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="text-coral font-semibold text-sm tracking-wider">
                  Despre Noi
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-6">
                  Partenerul Dumneavoastră în Recrutare Internațională
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Global Jobs Consulting este o agenție de recrutare All-Inclusive specializată 
                  în plasarea forței de muncă din Asia și Africa în piețele europene. Cu o rețea 
                  de peste 30 de agenții partenere în 18 țări, oferim soluții complete de staffing 
                  pentru angajatorii din România, Austria și Serbia.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Ne ocupăm de întregul proces: de la selecția riguroasă a candidaților, 
                  întocmirea dosarelor de imigrare (vize și permise de muncă), până la 
                  integrarea în comunitate și monitorizarea pe termen lung.
                </p>

                {/* Advantages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {advantages.map((adv, index) => {
                    const Icon = adv.icon;
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
                  to="/servicii"
                  className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
                  data-testid="about-cta"
                >
                  Descoperă Serviciile Noastre
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
                Piețe Acoperite
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                Angajatori din 3 Țări
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Romania */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-romania">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-3xl">🇷🇴</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">România</h3>
                <p className="text-gray-600 mb-4">
                  Soluții complete de recrutare pentru angajatorii români din toate sectoarele industriale.
                </p>
                <Link to="/angajatori" className="text-coral font-semibold text-sm hover:underline">
                  Detalii pentru RO →
                </Link>
              </div>

              {/* Austria */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-austria">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-3xl">🇦🇹</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">Austria</h3>
                <p className="text-gray-600 mb-4">
                  Forță de muncă calificată pentru piața austriacă, cu suport complet în procesul de imigrare.
                </p>
                <Link to="/angajatori" className="text-coral font-semibold text-sm hover:underline">
                  Detalii pentru AT →
                </Link>
              </div>

              {/* Serbia */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-serbia">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-3xl">🇷🇸</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">Serbia</h3>
                <p className="text-gray-600 mb-4">
                  Plasare de personal pentru companiile din Serbia care caută muncitori dedicați.
                </p>
                <Link to="/angajatori" className="text-coral font-semibold text-sm hover:underline">
                  Detalii pentru RS →
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
                Începeți Recrutarea Astăzi
              </h2>
              <p className="text-navy-200 text-lg mb-8">
                Indiferent dacă sunteți angajator în căutare de personal sau candidat 
                în căutarea unei oportunități, suntem aici să vă ajutăm.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/angajatori"
                  className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg"
                  data-testid="final-cta-employer"
                >
                  Sunt Angajator
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/candidati"
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
                  data-testid="final-cta-candidate"
                >
                  Caut un Job
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
