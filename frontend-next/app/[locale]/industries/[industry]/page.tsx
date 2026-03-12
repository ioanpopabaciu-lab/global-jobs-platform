import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Locale, locales, defaultLocale, industries, Industry } from "@/types";
import { getDictionary } from "@/i18n/config";
import { notFound } from "next/navigation";

// Generate static params for all locale + industry combinations
export function generateStaticParams() {
  const params: { locale: Locale; industry: string }[] = [];
  for (const locale of locales) {
    for (const industry of industries) {
      params.push({ locale, industry: industry.slug });
    }
  }
  return params;
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale, industry: industrySlug },
}: {
  params: { locale: Locale; industry: string };
}): Promise<Metadata> {
  const industry = industries.find((i) => i.slug === industrySlug);
  if (!industry) return { title: "Not Found" };

  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gjc.ro";

  return {
    title: `${industry.name[validLocale]} | Global Jobs Consulting`,
    description: industry.description[validLocale],
    alternates: {
      canonical: validLocale === "ro" 
        ? `${baseUrl}/industries/${industrySlug}`
        : `${baseUrl}/${validLocale}/industries/${industrySlug}`,
    },
    openGraph: {
      title: `${industry.name[validLocale]} | Global Jobs Consulting`,
      description: industry.description[validLocale],
      type: "website",
    },
  };
}

const industryContent: Record<string, {
  ro: { positions: string[]; benefits: string[] };
  en: { positions: string[]; benefits: string[] };
}> = {
  construction: {
    ro: {
      positions: ["Zidari", "Dulgheri", "Fierari-betonieri", "Electricieni", "Instalatori", "Tâmplari", "Operatori utilaje"],
      benefits: ["Muncitori cu experiență în proiecte mari", "Pregătiți pentru condiții dificile de lucru", "Respectă normele de siguranță"]
    },
    en: {
      positions: ["Masons", "Carpenters", "Ironworkers", "Electricians", "Plumbers", "Joiners", "Equipment Operators"],
      benefits: ["Workers experienced in large projects", "Prepared for difficult working conditions", "Comply with safety standards"]
    }
  },
  horeca: {
    ro: {
      positions: ["Bucătari", "Ospătari", "Barmani", "Personal curățenie", "Recepționeri", "Personal bucătărie"],
      benefits: ["Atenție la detalii și servicii de calitate", "Experiență în hoteluri și restaurante", "Abilități de comunicare"]
    },
    en: {
      positions: ["Chefs", "Waiters", "Bartenders", "Cleaning Staff", "Receptionists", "Kitchen Staff"],
      benefits: ["Attention to detail and quality service", "Experience in hotels and restaurants", "Communication skills"]
    }
  },
  agriculture: {
    ro: {
      positions: ["Muncitori agricoli", "Operatori tractoare", "Recoltatori", "Îngrijitori sere", "Crescători de animale"],
      benefits: ["Muncitori harnici și dedicați", "Experiență în fermă", "Disponibilitate pentru muncă sezonieră"]
    },
    en: {
      positions: ["Agricultural workers", "Tractor operators", "Harvesters", "Greenhouse attendants", "Animal breeders"],
      benefits: ["Hard-working and dedicated workers", "Farm experience", "Availability for seasonal work"]
    }
  },
  manufacturing: {
    ro: {
      positions: ["Operatori CNC", "Operatori linii de producție", "Sudori", "Electricieni industriali", "Tehnicieni"],
      benefits: ["Pregătire tehnică solidă", "Atenție la detalii", "Capacitate de a lucra în schimburi"]
    },
    en: {
      positions: ["CNC Operators", "Production Line Operators", "Welders", "Industrial Electricians", "Technicians"],
      benefits: ["Solid technical training", "Attention to detail", "Ability to work in shifts"]
    }
  },
  logistics: {
    ro: {
      positions: ["Stivuitoriști", "Operatori depozit", "Șoferi", "Ambalatori", "Personal sortare"],
      benefits: ["Eficiență și precizie", "Experiență în depozite", "Permise de stivuitor"]
    },
    en: {
      positions: ["Forklift Operators", "Warehouse Operators", "Drivers", "Packers", "Sorting Staff"],
      benefits: ["Efficiency and precision", "Warehouse experience", "Forklift licenses"]
    }
  }
};

const industryImages: Record<string, string> = {
  construction: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070",
  horeca: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070",
  agriculture: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070",
  manufacturing: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070",
  logistics: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070"
};

interface IndustryPageProps {
  params: { locale: Locale; industry: string };
}

export default async function IndustryPage({ params: { locale, industry: industrySlug } }: IndustryPageProps) {
  const industry = industries.find((i) => i.slug === industrySlug);
  if (!industry) notFound();

  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const dict = await getDictionary(validLocale);
  const content = industryContent[industrySlug]?.[validLocale as "ro" | "en"] || industryContent[industrySlug]?.ro;

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  const pageLabels = {
    ro: {
      positions: "Poziții Disponibile",
      benefits: "De Ce Să Alegeți Candidații Noștri",
      cta: "Solicită Muncitori pentru Această Industrie",
      otherIndustries: "Alte Industrii"
    },
    en: {
      positions: "Available Positions",
      benefits: "Why Choose Our Candidates",
      cta: "Request Workers for This Industry",
      otherIndustries: "Other Industries"
    }
  };
  const labels = pageLabels[validLocale as "ro" | "en"] || pageLabels.ro;

  return (
    <div data-testid={`industry-${industrySlug}-page`}>
      {/* Hero */}
      <section className="relative py-20 bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src={industryImages[industrySlug] || industryImages.construction}
            alt={industry.name[validLocale]}
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{industry.name[validLocale]}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">{industry.description[validLocale]}</p>
        </div>
      </section>

      {/* Positions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">{labels.positions}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {content?.positions.map((position, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 text-center">
                <span className="font-medium text-navy-900">{position}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">{labels.benefits}</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {content?.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-coral flex-shrink-0" />
                <span className="text-navy-900">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">{labels.cta}</h2>
          <Link
            href={getPath("/request-workers")}
            className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg"
          >
            {dict.nav.requestWorkers}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Other Industries */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">{labels.otherIndustries}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {industries.filter(i => i.slug !== industrySlug).map((ind) => (
              <Link
                key={ind.slug}
                href={getPath(`/industries/${ind.slug}`)}
                className="px-6 py-3 bg-gray-50 rounded-full text-navy-900 font-medium hover:bg-coral hover:text-white transition-colors"
              >
                {ind.name[validLocale]}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
