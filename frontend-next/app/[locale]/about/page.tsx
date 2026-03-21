import Image from "next/image";
import Link from "next/link";
import { Globe, Users, ShieldCheck, HeartPulse, Building2, Phone, Mail, MapPin, ArrowRight, Award, Target } from "lucide-react";
import type { Metadata } from "next";
import { Locale, locales, defaultLocale } from "@/types";
import { getDictionary } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Despre Noi | Global Jobs Consulting",
    en: "About Us | Global Jobs Consulting",
    de: "Über Uns | Global Jobs Consulting",
    sr: "O Nama | Global Jobs Consulting",
    ne: "हाम्रो बारेमा | Global Jobs Consulting",
    bn: "আমাদের সম্পর্কে | Global Jobs Consulting",
    hi: "हमारे बारे में | Global Jobs Consulting",
    si: "අපි ගැන | Global Jobs Consulting"
  };

  return {
    title: titles[locale] || titles.ro,
    description: "Global Jobs Consulting - Your trusted partner for international workforce recruitment from Asia and Africa.",
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: Locale } }) {
  // Helper to get locale-prefixed path
  const getPath = (path: string) => {
    if (locale === "ro") return path;
    return `/${locale}${path}`;
  };

  return (
    <main className="min-h-screen pt-24 pb-16 bg-white overflow-hidden" data-testid="about-page">
      
      {/* 1. Hero & Povestea Noastră */}
      <section className="container mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <span className="text-coral font-bold tracking-widest uppercase text-sm mb-4 block">Despre GJC</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy-900 mb-6 leading-tight">
            Conectăm oameni cu <span className="text-coral">oportunități reale</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Suntem o agenție de recrutare All-Inclusive, născută din dorința de a rezolva deficitul de forță de muncă din Europa cu profesioniști de top din Asia și Africa.
          </p>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            De la selecția atentă a fiecărui candidat până la gestionarea completă a documentelor de imigrare și integrarea noilor angajați, acoperim cap-coadă întregul proces. Asigurăm astfel stabilitate pentru companiile europene (cu focus pe România, Austria și Serbia) și o șansă la un viitor mai bun pentru candidații noștri.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Link href={getPath("/contact")} className="bg-navy-900 hover:bg-navy-800 text-white px-8 py-4 rounded-full font-bold transition-all inline-flex items-center gap-2 shadow-lg">
              Discută cu Noi <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-navy-900/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-lg mx-auto">
            <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1400&auto=format" 
              alt="Echipa GJC" 
              width={800} 
              height={600} 
              className="object-cover w-full h-[500px]"
              priority
            />
          </div>
        </div>
      </section>

      {/* 2. Misiunea noastră */}
      <section className="bg-navy-50 py-24">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="w-20 h-20 bg-coral text-white rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-12 shadow-xl">
            <Globe className="w-10 h-10 -rotate-12" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-navy-900 mb-10">Misiunea Noastră</h2>
          <p className="text-xl md:text-3xl text-gray-700 leading-relaxed italic border-x-4 border-coral px-8 py-4">
            "Să devenim partenerul numărul 1 al companiilor europene în gestionarea resurselor umane prin facilitarea accesului sigur, legal și etic la forță de muncă calificată din Asia și Africa."
          </p>
        </div>
      </section>

      {/* 3. Valorile Noastre (4 items) */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-navy-900 mb-6">Valorile Care Ne Ghidează</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Nu facem compromisuri când vine vorba de calitatea și etica serviciilor pe care le oferim.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 bg-blue-50 text-navy-900 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:bg-coral group-hover:text-white transition-colors">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-4">Integritate Legală</h3>
            <p className="text-gray-600">Procese 100% transparente cu management la virgulă pentru procedurile de imigrare.</p>
          </div>
          
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 bg-blue-50 text-navy-900 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:bg-coral group-hover:text-white transition-colors">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-4">Selecție Riguroasă</h3>
            <p className="text-gray-600">Filtrare directă prin interviuri și verificări stricte de background la sursă.</p>
          </div>
          
          <div className="bg-white border text-center border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 bg-blue-50 text-navy-900 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:bg-coral group-hover:text-white transition-colors">
              <HeartPulse className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-4">Empatie</h3>
            <p className="text-gray-600">Ne pasă de bunăstarea candidaților. Tratamentul etic este esențial.</p>
          </div>

          <div className="bg-white border text-center border-gray-100 rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-20 h-20 bg-blue-50 text-navy-900 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:bg-coral group-hover:text-white transition-colors">
              <Building2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-4">Parteneriate Solide</h3>
            <p className="text-gray-600">Oferim suport continuu angajatorilor pentru a asigura succesul retenției.</p>
          </div>
        </div>
      </section>

      {/* 4. Cifrele Noastre (Stats) */}
      <section className="py-24 bg-navy-900 text-white relative flex items-center overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-x-0 lg:divide-x divide-white/20 text-center">
            <div className="px-4">
              <div className="text-5xl md:text-7xl font-extrabold text-coral mb-4">11+</div>
              <div className="text-lg font-medium text-white/90 uppercase tracking-widest">Agenții Partenere<br/><span className="text-sm opacity-75 capitalize">Asia & Africa</span></div>
            </div>
            <div className="px-4">
              <div className="text-5xl md:text-7xl font-extrabold text-coral mb-4">4</div>
              <div className="text-lg font-medium text-white/90 uppercase tracking-widest">Ani Experiență<br/><span className="text-sm opacity-75 capitalize">Recrutare globală</span></div>
            </div>
            <div className="px-4">
              <div className="text-5xl md:text-7xl font-extrabold text-coral mb-4">3</div>
              <div className="text-lg font-medium text-white/90 uppercase tracking-widest">Piețe Conectate<br/><span className="text-sm opacity-75 capitalize">RO, AT, SRB</span></div>
            </div>
            <div className="px-4">
              <div className="text-5xl md:text-7xl font-extrabold text-coral mb-4">500+</div>
              <div className="text-lg font-medium text-white/90 uppercase tracking-widest">Candidați<br/><span className="text-sm opacity-75 capitalize">Plasați cu succes</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact Rapid */}
      <section className="py-24 bg-gray-50 relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-coral rounded-3xl p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-32 bg-red-600 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 p-32 bg-red-800 rounded-full blur-3xl opacity-30 -ml-20 -mb-20"></div>
            
            <div className="lg:w-1/2 mb-10 lg:mb-0 relative z-10 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Începem recrutarea?</h2>
              <p className="text-xl text-white/90">
                Echipa GJC vă stă la dispoziție pentru o consultație imediată.
              </p>
            </div>
            
            <div className="lg:w-1/2 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 relative z-10 w-full lg:items-end justify-center">
              <Link href="tel:+40700000000" className="flex items-center justify-center gap-3 bg-white text-coral px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg shrink-0">
                <Phone className="w-5 h-5" /> Sunați Acum
              </Link>
              <Link href="mailto:office@gjc.ro" className="flex items-center justify-center gap-3 bg-navy-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-navy-800 transition shadow-lg shrink-0">
                <Mail className="w-5 h-5" /> office@gjc.ro
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
