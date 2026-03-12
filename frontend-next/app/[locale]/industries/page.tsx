import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Locale, locales, defaultLocale, industries } from "@/types";
import { getDictionary } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Industrii | Sectoare în care recrutăm",
    en: "Industries | Sectors we recruit for",
    de: "Branchen | Sektoren, für die wir rekrutieren",
    sr: "Industrije | Sektori za koje regrutujemo",
    ne: "उद्योगहरू | हामीले भर्ती गर्ने क्षेत्रहरू",
    bn: "শিল্প | যে সেক্টরগুলির জন্য আমরা নিয়োগ করি",
    hi: "उद्योग | जिन क्षेत्रों के लिए हम भर्ती करते हैं",
    si: "කර්මාන්ත | අපි බඳවා ගන්නා අංශ"
  };

  return {
    title: titles[locale] || titles.ro,
    description: "Global Jobs Consulting recruits qualified workers for construction, HoReCa, agriculture, manufacturing and logistics.",
  };
}

const industryImages: Record<string, string> = {
  construction: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070",
  horeca: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070",
  agriculture: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070",
  manufacturing: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070",
  logistics: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070"
};

export default async function IndustriesPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const dict = await getDictionary(validLocale);

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  const pageContent = {
    ro: {
      title: "Industrii în Care Recrutăm",
      subtitle: "Oferim forță de muncă calificată pentru principalele sectoare economice din România, Austria și Serbia",
      cta: "Vezi Detalii"
    },
    en: {
      title: "Industries We Recruit For",
      subtitle: "We provide qualified workforce for the main economic sectors in Romania, Austria and Serbia",
      cta: "View Details"
    }
  };
  const content = pageContent[validLocale as "ro" | "en"] || pageContent.ro;

  return (
    <div data-testid="industries-page">
      {/* Hero */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{content.subtitle}</p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry) => (
              <Link
                key={industry.slug}
                href={getPath(`/industries/${industry.slug}`)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                data-testid={`industry-card-${industry.slug}`}
              >
                <div className="relative h-48">
                  <Image
                    src={industryImages[industry.slug]}
                    alt={industry.name[validLocale]}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">{industry.name[validLocale]}</h2>
                  <p className="text-white/80 text-sm mb-3 line-clamp-2">{industry.description[validLocale]}</p>
                  <span className="inline-flex items-center gap-2 text-coral font-semibold text-sm group-hover:gap-3 transition-all">
                    {content.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
