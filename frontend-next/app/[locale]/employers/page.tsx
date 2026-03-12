import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Building2, Users, FileText, Globe } from "lucide-react";
import { Locale, locales, defaultLocale } from "@/types";
import { getDictionary } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Pentru Angajatori | Recrutare Personal din Asia și Africa",
    en: "For Employers | Recruit Staff from Asia and Africa",
    de: "Für Arbeitgeber | Personal aus Asien und Afrika rekrutieren",
    sr: "Za Poslodavce | Regrutacija osoblja iz Azije i Afrike",
    ne: "रोजगारदाताहरूको लागि | एशिया र अफ्रिकाबाट कर्मचारी भर्ती",
    bn: "নিয়োগকর্তাদের জন্য | এশিয়া এবং আফ্রিকা থেকে কর্মী নিয়োগ",
    hi: "नियोक्ताओं के लिए | एशिया और अफ्रीका से कर्मचारी भर्ती",
    si: "සේවා යෝජකයින් සඳහා | ආසියාවෙන් සහ අප්‍රිකාවෙන් කාර්ය මණ්ඩලය බඳවා ගැනීම"
  };
  
  const descriptions: Record<Locale, string> = {
    ro: "Soluții complete de recrutare pentru angajatorii din România, Austria și Serbia. Personal calificat din Asia și Africa.",
    en: "Complete recruitment solutions for employers in Romania, Austria and Serbia. Qualified staff from Asia and Africa.",
    de: "Komplette Rekrutierungslösungen für Arbeitgeber in Rumänien, Österreich und Serbien. Qualifiziertes Personal aus Asien und Afrika.",
    sr: "Kompletna rešenja za regrutaciju za poslodavce u Rumuniji, Austriji i Srbiji. Kvalifikovano osoblje iz Azije i Afrike.",
    ne: "रोमानिया, अष्ट्रिया र सर्बियाका रोजगारदाताहरूका लागि पूर्ण भर्ती समाधानहरू।",
    bn: "রোমানিয়া, অস্ট্রিয়া এবং সার্বিয়ার নিয়োগকর্তাদের জন্য সম্পূর্ণ নিয়োগ সমাধান।",
    hi: "रोमानिया, ऑस्ट्रिया और सर्बिया में नियोक्ताओं के लिए पूर्ण भर्ती समाधान।",
    si: "රොමේනියාව, ඔස්ට්‍රියාව සහ සර්බියාවේ සේවා යෝජකයින් සඳහා සම්පූර්ණ බඳවා ගැනීමේ විසඳුම්."
  };

  return {
    title: titles[locale] || titles.ro,
    description: descriptions[locale] || descriptions.ro,
  };
}

const pageContent = {
  ro: {
    hero: {
      title: "Soluții Complete de Recrutare",
      subtitle: "Accesați mii de candidați verificați din Asia și Africa pentru companiile dumneavoastră din România, Austria sau Serbia",
      cta: "Solicită Ofertă Personalizată"
    },
    benefits: {
      title: "De Ce Să Alegeți GJC?",
      items: [
        { title: "Rețea de 11+ Parteneri", desc: "Acces la candidați din Nepal, Bangladesh, India, Sri Lanka și țări africane" },
        { title: "Proces Legal Complet", desc: "Ne ocupăm de toate formalitățile: vize, permise de muncă, documentație" },
        { title: "Selecție Riguroasă", desc: "Candidați verificați și evaluați pentru aptitudinile tehnice și lingvistice" },
        { title: "Suport Post-Plasare", desc: "Monitorizăm integrarea și oferim asistență pe termen lung" }
      ]
    },
    process: {
      title: "Procesul de Recrutare",
      steps: [
        { num: "1", title: "Analiză Cerințe", desc: "Înțelegem nevoile dumneavoastră specifice de personal" },
        { num: "2", title: "Selecție Candidați", desc: "Identificăm și verificăm candidații potriviți" },
        { num: "3", title: "Documentație", desc: "Pregătim dosarele de imigrare și permise de muncă" },
        { num: "4", title: "Plasare & Suport", desc: "Asigurăm integrarea și monitorizarea pe termen lung" }
      ]
    },
    cta: {
      title: "Gata Să Începeți?",
      desc: "Contactați-ne pentru o consultație gratuită și o ofertă personalizată pentru nevoile dumneavoastră.",
      button: "Solicită Muncitori"
    }
  },
  en: {
    hero: {
      title: "Complete Recruitment Solutions",
      subtitle: "Access thousands of verified candidates from Asia and Africa for your companies in Romania, Austria, or Serbia",
      cta: "Request Custom Quote"
    },
    benefits: {
      title: "Why Choose GJC?",
      items: [
        { title: "Network of 11+ Partners", desc: "Access to candidates from Nepal, Bangladesh, India, Sri Lanka and African countries" },
        { title: "Complete Legal Process", desc: "We handle all formalities: visas, work permits, documentation" },
        { title: "Rigorous Selection", desc: "Verified and evaluated candidates for technical and language skills" },
        { title: "Post-Placement Support", desc: "We monitor integration and provide long-term assistance" }
      ]
    },
    process: {
      title: "Recruitment Process",
      steps: [
        { num: "1", title: "Requirements Analysis", desc: "We understand your specific staffing needs" },
        { num: "2", title: "Candidate Selection", desc: "We identify and verify suitable candidates" },
        { num: "3", title: "Documentation", desc: "We prepare immigration files and work permits" },
        { num: "4", title: "Placement & Support", desc: "We ensure integration and long-term monitoring" }
      ]
    },
    cta: {
      title: "Ready to Start?",
      desc: "Contact us for a free consultation and a personalized quote for your needs.",
      button: "Request Workers"
    }
  }
};

export default async function EmployersPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const t = pageContent[validLocale as keyof typeof pageContent] || pageContent.ro;
  const dict = await getDictionary(validLocale);

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  return (
    <div data-testid="employers-page">
      {/* Hero */}
      <section className="relative py-20 bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974" alt="" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.hero.title}</h1>
            <p className="text-xl text-white/80 mb-8">{t.hero.subtitle}</p>
            <Link href={getPath("/request-workers")} className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg">
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
            {t.benefits.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-coral mx-auto mb-4" />
                <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">{t.process.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {t.process.steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-coral text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">{t.cta.desc}</p>
          <Link href={getPath("/request-workers")} className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg">
            {t.cta.button}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
