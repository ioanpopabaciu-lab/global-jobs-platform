import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Locale, locales, defaultLocale } from "@/types";
import { getDictionary } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Blog | Noutăți despre Recrutare Internațională",
    en: "Blog | International Recruitment News",
    de: "Blog | Neuigkeiten zur internationalen Rekrutierung",
    sr: "Blog | Vesti o međunarodnoj regrutaciji",
    ne: "ब्लग | अन्तर्राष्ट्रिय भर्ती समाचार",
    bn: "ব্লগ | আন্তর্জাতিক নিয়োগ সংবাদ",
    hi: "ब्लॉग | अंतर्राष्ट्रीय भर्ती समाचार",
    si: "බ්ලොග් | ජාත්‍යන්තර බඳවා ගැනීමේ ප්‍රවෘත්ති"
  };

  return {
    title: titles[locale] || titles.ro,
    description: "Latest news and articles about international recruitment, work permits, and immigration.",
  };
}

// Sample blog posts
const blogPosts = [
  {
    slug: "generatia-de-aur-supravietuire-import",
    title: { 
      ro: "De la „Generația de Aur” la Supraviețuirea prin Import", 
      en: "From the \"Golden Generation\" to Survival by Import" 
    },
    excerpt: { 
      ro: "Gopal a privit spre terminalul de plecări al Aeroportului Otopeni, strângând un bilet dus către Kathmandu...", 
      en: "Gopal looked toward the departures terminal holding a one-way ticket to Kathmandu..." 
    },
    date: new Date().toISOString().split('T')[0],
    author: "Global Jobs Consulting",
    image: "/images/blog_gopal.jpg"
  },
  {
    slug: "ghid-angajare-muncitori-straini",
    title: { ro: "Ghid Complet: Angajarea Muncitorilor Străini în România", en: "Complete Guide: Hiring Foreign Workers in Romania" },
    excerpt: { ro: "Tot ce trebuie să știți despre procesul de angajare a muncitorilor din țări terțe.", en: "Everything you need to know about hiring workers from third countries." },
    date: "2024-03-01",
    author: "GJC Team",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070"
  },
  {
    slug: "permise-munca-2024",
    title: { ro: "Permise de Muncă 2024: Ce s-a schimbat?", en: "Work Permits 2024: What has changed?" },
    excerpt: { ro: "Actualizările legislative privind permisele de muncă pentru străini.", en: "Legislative updates regarding work permits for foreigners." },
    date: "2024-02-15",
    author: "GJC Team",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070"
  },
  {
    slug: "sectoare-deficit-forta-munca",
    title: { ro: "Top 5 Sectoare cu Deficit de Forță de Muncă", en: "Top 5 Sectors with Workforce Shortage" },
    excerpt: { ro: "Care sunt industriile care au cea mai mare nevoie de muncitori?", en: "Which industries have the greatest need for workers?" },
    date: "2024-02-01",
    author: "GJC Team",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070"
  }
];

export default async function BlogPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const dict = await getDictionary(validLocale);

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  const pageTitle = {
    ro: "Blog & Noutăți",
    en: "Blog & News",
    de: "Blog & Neuigkeiten",
    sr: "Blog i vesti",
    ne: "ब्लग र समाचार",
    bn: "ব্লগ এবং সংবাদ",
    hi: "ब्लॉग और समाचार",
    si: "බ්ලොග් සහ ප්‍රවෘත්ති"
  };

  return (
    <div data-testid="blog-page">
      {/* Hero */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageTitle[validLocale] || pageTitle.ro}</h1>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title[validLocale as keyof typeof post.title] || post.title.ro}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString(validLocale)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 line-clamp-2">
                    {post.title[validLocale as keyof typeof post.title] || post.title.ro}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt[validLocale as keyof typeof post.excerpt] || post.excerpt.ro}
                  </p>
                  <Link
                    href={getPath(`/blog/${post.slug}`)}
                    className="inline-flex items-center gap-2 text-coral font-semibold hover:underline"
                  >
                    {dict.common.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
