import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Users, Award, Globe, Target } from "lucide-react";
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

const pageContent = {
  ro: {
    hero: {
      title: "Conectăm Talente Globale cu Oportunități Locale",
      subtitle: "Suntem o agenție de recrutare internațională specializată în plasarea forței de muncă din Asia și Africa în Europa"
    },
    story: {
      title: "Povestea Noastră",
      text1: "Global Jobs Consulting a fost fondată cu misiunea de a adresa deficitul cronic de forță de muncă din Europa, conectând angajatorii cu candidați motivați și calificați din Asia și Africa.",
      text2: "Cu sediul în Oradea, România, și o rețea de 11 agenții partenere în întreaga lume, oferim soluții complete de recrutare pentru companii din România, Austria și Serbia.",
      text3: "Ne mândrim cu o abordare etică și transparentă, asigurându-ne că atât angajatorii, cât și candidații beneficiază de pe urma colaborării cu noi."
    },
    values: {
      title: "Valorile Noastre",
      items: [
        { icon: Users, title: "Oameni Mai Întâi", desc: "Punem oamenii în centrul a tot ceea ce facem" },
        { icon: Award, title: "Excelență", desc: "Ne străduim pentru cele mai înalte standarde" },
        { icon: Globe, title: "Diversitate", desc: "Celebrăm și promovăm diversitatea culturală" },
        { icon: Target, title: "Integritate", desc: "Acționăm cu onestitate și transparență" }
      ]
    },
    team: {
      title: "Echipa Noastră",
      desc: "O echipă dedicată de profesioniști cu experiență în recrutare internațională, imigrare și resurse umane."
    }
  },
  en: {
    hero: {
      title: "Connecting Global Talent with Local Opportunities",
      subtitle: "We are an international recruitment agency specialized in placing workforce from Asia and Africa in Europe"
    },
    story: {
      title: "Our Story",
      text1: "Global Jobs Consulting was founded with the mission to address Europe's chronic workforce shortage, connecting employers with motivated and qualified candidates from Asia and Africa.",
      text2: "Based in Oradea, Romania, and with a network of 11 partner agencies worldwide, we provide comprehensive recruitment solutions for companies in Romania, Austria and Serbia.",
      text3: "We pride ourselves on an ethical and transparent approach, ensuring both employers and candidates benefit from working with us."
    },
    values: {
      title: "Our Values",
      items: [
        { icon: Users, title: "People First", desc: "We put people at the center of everything we do" },
        { icon: Award, title: "Excellence", desc: "We strive for the highest standards" },
        { icon: Globe, title: "Diversity", desc: "We celebrate and promote cultural diversity" },
        { icon: Target, title: "Integrity", desc: "We act with honesty and transparency" }
      ]
    },
    team: {
      title: "Our Team",
      desc: "A dedicated team of professionals with experience in international recruitment, immigration and human resources."
    }
  }
};

export default async function AboutPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const t = pageContent[validLocale as keyof typeof pageContent] || pageContent.ro;
  const dict = await getDictionary(validLocale);

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="relative py-20 bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070" alt="" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.hero.title}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{t.hero.subtitle}</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/zeb6mv7z_poza%20pt%20talente%20globale%20afaceri%20locale.png"
                alt="GJC Team"
                width={600}
                height={400}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-6">{t.story.title}</h2>
              <p className="text-gray-600 mb-4">{t.story.text1}</p>
              <p className="text-gray-600 mb-4">{t.story.text2}</p>
              <p className="text-gray-600">{t.story.text3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">{t.values.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.values.items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <Icon className="h-12 w-12 text-coral mx-auto mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.team.title}</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">{t.team.desc}</p>
          <Link href={getPath("/contact")} className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg">
            {dict.nav.contact}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
