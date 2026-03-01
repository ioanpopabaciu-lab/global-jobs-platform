import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const content = {
  ro: {
    loading: "Se încarcă articolul...",
    notFound: { title: "Articol Negăsit", text: "Articolul solicitat nu a fost găsit.", backToBlog: "Înapoi la Blog" },
    backToBlog: "Înapoi la Blog",
    cta: { title: "Aveți Nevoie de Personal?", text: "Contactați-ne pentru o consultație gratuită despre nevoile dumneavoastră de recrutare.", button: "Solicită Ofertă" }
  },
  en: {
    loading: "Loading article...",
    notFound: { title: "Article Not Found", text: "The requested article was not found.", backToBlog: "Back to Blog" },
    backToBlog: "Back to Blog",
    cta: { title: "Need Staff?", text: "Contact us for a free consultation about your recruitment needs.", button: "Request Quote" }
  },
  de: {
    loading: "Artikel wird geladen...",
    notFound: { title: "Artikel nicht gefunden", text: "Der angeforderte Artikel wurde nicht gefunden.", backToBlog: "Zurück zum Blog" },
    backToBlog: "Zurück zum Blog",
    cta: { title: "Benötigen Sie Personal?", text: "Kontaktieren Sie uns für eine kostenlose Beratung zu Ihren Rekrutierungsbedürfnissen.", button: "Angebot anfordern" }
  },
  sr: {
    loading: "Učitavanje članka...",
    notFound: { title: "Članak nije pronađen", text: "Traženi članak nije pronađen.", backToBlog: "Nazad na Blog" },
    backToBlog: "Nazad na Blog",
    cta: { title: "Potrebno vam je osoblje?", text: "Kontaktirajte nas za besplatnu konsultaciju o vašim potrebama za zapošljavanjem.", button: "Zatražite ponudu" }
  }
};

const dateLocales = {
  ro: 'ro-RO',
  en: 'en-US',
  de: 'de-DE',
  sr: 'sr-RS'
};

export default function BlogPostPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;
  
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/blog/posts/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error(t.notFound.title);
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, t.notFound.title]);

  // Set page title dynamically via useEffect to avoid Helmet issues
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Global Jobs Consulting Blog`;
    }
  }, [post]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(dateLocales[language] || 'ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-navy-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl font-bold text-navy-900 mb-4">{t.notFound.title}</h1>
          <p className="text-gray-600 mb-6">{t.notFound.text}</p>
          <Link 
            to="/blog"
            className="inline-flex items-center text-navy-600 font-semibold hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.notFound.backToBlog}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="description" content={post.excerpt || ''} />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="blog-post-page">
        {/* Hero Image */}
        <div className="relative h-[400px] overflow-hidden mb-8">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-900/60" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <Link 
                to={getLocalizedPath("/blog")}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                data-testid="back-to-blog"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backToBlog}
              </Link>
              <span className="block text-navy-200 text-sm  tracking-wider mb-2">
                {post.category}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white  max-w-4xl">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {post.category}
              </span>
            </div>

            {/* Content */}
            <article className="bg-white rounded-lg p-8 shadow-sm" data-testid="blog-content">
              <p className="text-xl text-gray-700 mb-6 font-medium leading-relaxed">
                {post.excerpt}
              </p>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </article>

            {/* CTA */}
            <div className="mt-12 bg-navy-900 rounded-lg p-8 text-center text-white">
              <h3 className="font-heading text-2xl font-bold  mb-4">
                {t.cta.title}
              </h3>
              <p className="text-navy-200 mb-6">
                {t.cta.text}
              </p>
              <Link 
                to="/angajatori"
                className="inline-flex items-center bg-white text-navy-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                data-testid="blog-cta"
              >
                {t.cta.button}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
