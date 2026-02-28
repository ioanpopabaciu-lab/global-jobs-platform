import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const content = {
  ro: {
    meta: { title: "Blog | Global Jobs Consulting", description: "Articole și noutăți despre recrutare internațională, vize de muncă și oportunități de angajare în România, Austria și Serbia." },
    hero: { label: "Blog", title: "NOUTĂȚI ȘI INFORMAȚII", description: "Articole despre recrutare internațională, legislație, și sfaturi practice pentru angajatori și candidați." },
    loading: "Se încarcă articolele...",
    noPosts: "Nu există articole momentan.",
    readMore: "Citește mai mult"
  },
  en: {
    meta: { title: "Blog | Global Jobs Consulting", description: "Articles and news about international recruitment, work visas and employment opportunities in Romania, Austria and Serbia." },
    hero: { label: "Blog", title: "NEWS AND INFORMATION", description: "Articles about international recruitment, legislation, and practical tips for employers and candidates." },
    loading: "Loading articles...",
    noPosts: "No articles available at the moment.",
    readMore: "Read more"
  },
  de: {
    meta: { title: "Blog | Global Jobs Consulting", description: "Artikel und Neuigkeiten über internationale Rekrutierung, Arbeitsvisa und Beschäftigungsmöglichkeiten in Rumänien, Österreich und Serbien." },
    hero: { label: "Blog", title: "NEUIGKEITEN UND INFORMATIONEN", description: "Artikel über internationale Rekrutierung, Gesetzgebung und praktische Tipps für Arbeitgeber und Kandidaten." },
    loading: "Artikel werden geladen...",
    noPosts: "Derzeit keine Artikel verfügbar.",
    readMore: "Weiterlesen"
  },
  sr: {
    meta: { title: "Blog | Global Jobs Consulting", description: "Članci i vesti o međunarodnom zapošljavanju, radnim vizama i mogućnostima zapošljavanja u Rumuniji, Austriji i Srbiji." },
    hero: { label: "Blog", title: "VESTI I INFORMACIJE", description: "Članci o međunarodnom zapošljavanju, zakonodavstvu i praktičnim savetima za poslodavce i kandidate." },
    loading: "Učitavanje članaka...",
    noPosts: "Trenutno nema dostupnih članaka.",
    readMore: "Pročitaj više"
  }
};

const dateLocales = {
  ro: 'ro-RO',
  en: 'en-US',
  de: 'de-DE',
  sr: 'sr-RS'
};

export default function BlogPage() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/blog/posts`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocales[language] || 'ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Blog | Global Jobs Consulting</title>
        <meta name="description" content={(t && t.meta && t.meta.description) || ''} />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="blog-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-navy-300 font-medium text-sm  tracking-wider">
                {t.hero.label}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold  mt-2 mb-4">
                {t.hero.title}
              </h1>
              <p className="text-navy-200 text-lg">
                {t.hero.description}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-navy-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">{t.loading}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">{t.noPosts}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Card 
                  key={post.id || index} 
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white"
                  data-testid={`blog-post-${index}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {post.category}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-navy-900  mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-navy-600 font-semibold text-sm hover:text-navy-800 transition-colors"
                      data-testid={`blog-read-more-${index}`}
                    >
                      {t.readMore}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
