import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Briefcase, FileCheck, Plane, Heart } from "lucide-react";
import { Locale, locales, defaultLocale, countries } from "@/types";
import { getDictionary } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Pentru Candidați | Locuri de Muncă în Europa",
    en: "For Candidates | Jobs in Europe",
    de: "Für Kandidaten | Arbeitsplätze in Europa",
    sr: "Za Kandidate | Poslovi u Evropi",
    ne: "उम्मेदवारहरूको लागि | युरोपमा रोजगारी",
    bn: "প্রার্থীদের জন্য | ইউরোপে চাকরি",
    hi: "उम्मीदवारों के लिए | यूरोप में नौकरियां",
    si: "අපේක්ෂකයින් සඳහා | යුරෝපයේ රැකියා"
  };

  return {
    title: titles[locale] || titles.ro,
    description: "Find your dream job in Europe with Global Jobs Consulting. We help candidates from Asia and Africa find work in Romania, Austria and Serbia.",
  };
}

const pageContent = {
  ro: {
    hero: {
      title: "Cariera Ta în Europa Începe Aici",
      subtitle: "Te ajutăm să găsești un loc de muncă sigur și legal în România, Austria sau Serbia",
      cta: "Aplică Acum"
    },
    benefits: {
      title: "Ce Oferim Candidaților",
      items: [
        { icon: Briefcase, title: "Locuri de Muncă Verificate", desc: "Colaborăm doar cu angajatori de încredere și verificați" },
        { icon: FileCheck, title: "Suport Complet", desc: "Te ajutăm cu toate documentele: viză, permis de muncă" },
        { icon: Plane, title: "Organizare Călătorie", desc: "Asistență cu transportul și cazarea inițială" },
        { icon: Heart, title: "Integrare", desc: "Sprijin pentru adaptarea la noua comunitate" }
      ]
    },
    countries: {
      title: "Recrutăm Din Următoarele Țări",
      asia: "Asia",
      africa: "Africa"
    },
    cta: {
      title: "Ești Gata Pentru O Nouă Carieră?",
      desc: "Înregistrează-te și echipa noastră te va contacta pentru a discuta oportunitățile disponibile.",
      button: "Înregistrează-te Ca Candidat",
      loginText: "Ai deja cont?",
      loginButton: "Intră în cont"
    }
  },
  en: {
    hero: {
      title: "Your Career in Europe Starts Here",
      subtitle: "We help you find a safe and legal job in Romania, Austria or Serbia",
      cta: "Apply Now"
    },
    benefits: {
      title: "What We Offer Candidates",
      items: [
        { icon: Briefcase, title: "Verified Jobs", desc: "We only work with trusted and verified employers" },
        { icon: FileCheck, title: "Complete Support", desc: "We help with all documents: visa, work permit" },
        { icon: Plane, title: "Travel Organization", desc: "Assistance with transportation and initial accommodation" },
        { icon: Heart, title: "Integration", desc: "Support for adapting to the new community" }
      ]
    },
    countries: {
      title: "We Recruit From The Following Countries",
      asia: "Asia",
      africa: "Africa"
    },
    cta: {
      title: "Ready For A New Career?",
      desc: "Register and our team will contact you to discuss available opportunities.",
      button: "Register As Candidate",
      loginText: "Already have an account?",
      loginButton: "Log In"
    }
  }
};

export default async function CandidatesPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const t = pageContent[validLocale as keyof typeof pageContent] || pageContent.ro;
  const dict = await getDictionary(validLocale);

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  const asiaCountries = countries.filter(c => c.continent === 'asia');
  const africaCountries = countries.filter(c => c.continent === 'africa');

  return (
    <div data-testid="candidates-page">
      {/* Hero */}
      <section className="relative py-20 bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084" alt="" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.hero.title}</h1>
            <p className="text-xl text-white/80 mb-8">{t.hero.subtitle}</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg">
              {t.hero.cta}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">{t.benefits.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.benefits.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-2xl p-6 text-center">
                  <Icon className="h-12 w-12 text-coral mx-auto mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">{t.countries.title}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Asia */}
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-6 text-center">{t.countries.asia}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {asiaCountries.map((country) => (
                  <div key={country.slug} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <span className="text-3xl mb-2 block">{country.flag}</span>
                    <span className="text-sm font-medium text-navy-900">{country.name[validLocale]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Africa */}
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-6 text-center">{t.countries.africa}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {africaCountries.map((country) => (
                  <div key={country.slug} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <span className="text-3xl mb-2 block">{country.flag}</span>
                    <span className="text-sm font-medium text-navy-900">{country.name[validLocale]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">{t.cta.desc}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register?type=candidate" className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg">
              {t.cta.button}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-white/60">{t.cta.loginText}</span>
              <Link href="/login" className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-navy-900 transition-colors">
                {t.cta.loginButton}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
