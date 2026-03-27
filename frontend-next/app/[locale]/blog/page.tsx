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
    slug: "cum-sa-angajezi-forta-munca-asia-romania-ghid",
    title: { 
      ro: "Cum sa angajezi forta de munca din Asia in Romania: Ghidul Pas cu Pas", 
      en: "How to hire Asian workforce in Romania: Step by Step Guide" 
    },
    excerpt: { 
      ro: "Intr-o economie in plina expansiune, deficitul de personal a devenit principala bariera in calea cresterii firmelor romanesti.", 
      en: "In a booming economy, the staff shortage has become the main barrier to the growth of Romanian companies." 
    },
    date: "2024-03-01",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/ljok1yt7_poza%201.png"
  },
  {
    slug: "etapele-colaborari-succes-selectie-integrare",
    title: { 
      ro: "Etapele unei colaborari de succes: De la Selectie la Integrare", 
      en: "Stages of a successful collaboration: From Selection to Integration" 
    },
    excerpt: { 
      ro: "Eliminarea stresului administrativ pentru angajator prin solutia noastra completa de tip la cheie.", 
      en: "Eliminating administrative stress for the employer through our complete turnkey solution." 
    },
    date: "2024-02-15",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/vriozis1_poza%202.png"
  },
  {
    slug: "avantaje-forta-munca-nepal-horeca",
    title: { 
      ro: "Avantajele fortei de munca din Nepal pentru sectorul HoReCa", 
      en: "Advantages of the workforce from Nepal for the HoReCa sector" 
    },
    excerpt: { 
      ro: "Lucratorii din Nepal sunt recunoscuti global pentru amabilitatea lor nativa si etica muncii. Intr-o industrie unde zambetul...", 
      en: "Workers from Nepal are globally recognized for their native friendliness and work ethic. In an industry where a smile..." 
    },
    date: "2024-02-01",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/3qjb8k8w_poza%203.png"
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
