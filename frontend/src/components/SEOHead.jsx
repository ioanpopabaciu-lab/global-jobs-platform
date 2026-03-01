import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://www.gjc.ro";

// Map routes to their translations
const routeTranslations = {
  "/": { ro: "/", en: "/en", de: "/de", sr: "/sr" },
  "/angajatori": { ro: "/angajatori", en: "/en/employers", de: "/de/arbeitgeber", sr: "/sr/poslodavci" },
  "/servicii": { ro: "/servicii", en: "/en/services", de: "/de/dienstleistungen", sr: "/sr/usluge" },
  "/candidati": { ro: "/candidati", en: "/en/candidates", de: "/de/kandidaten", sr: "/sr/kandidati" },
  "/blog": { ro: "/blog", en: "/en/blog", de: "/de/blog", sr: "/sr/blog" },
  "/contact": { ro: "/contact", en: "/en/contact", de: "/de/kontakt", sr: "/sr/kontakt" },
  "/politica-confidentialitate": { 
    ro: "/politica-confidentialitate", 
    en: "/en/privacy-policy", 
    de: "/de/datenschutz", 
    sr: "/sr/politika-privatnosti" 
  }
};

// Reverse mapping for finding base route from any language path
const getBaseRoute = (pathname) => {
  // Remove language prefix if present
  const langPrefixes = ["/en", "/de", "/sr"];
  let basePath = pathname;
  
  for (const prefix of langPrefixes) {
    if (pathname.startsWith(prefix)) {
      basePath = pathname.slice(prefix.length) || "/";
      break;
    }
  }
  
  // Find the base route
  for (const [baseRoute, translations] of Object.entries(routeTranslations)) {
    if (Object.values(translations).includes(basePath) || basePath === baseRoute) {
      return baseRoute;
    }
  }
  
  return pathname;
};

export default function SEOHead({ title, description, language = "ro" }) {
  const location = useLocation();
  const baseRoute = getBaseRoute(location.pathname);
  const translations = routeTranslations[baseRoute] || routeTranslations["/"];
  
  // Use useEffect to set document.title to avoid Helmet's string parsing issues
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
  
  // Set html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  
  return (
    <Helmet>
      <meta name="description" content={description || ''} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`${BASE_URL}${translations[language]}`} />
      
      {/* Hreflang tags for all languages */}
      <link rel="alternate" hreflang="ro" href={`${BASE_URL}${translations.ro}`} />
      <link rel="alternate" hreflang="en" href={`${BASE_URL}${translations.en}`} />
      <link rel="alternate" hreflang="de" href={`${BASE_URL}${translations.de}`} />
      <link rel="alternate" hreflang="sr" href={`${BASE_URL}${translations.sr}`} />
      <link rel="alternate" hreflang="x-default" href={`${BASE_URL}${translations.ro}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title || ''} />
      <meta property="og:description" content={description || ''} />
      <meta property="og:url" content={`${BASE_URL}${translations[language]}`} />
      <meta property="og:locale" content={language === "ro" ? "ro_RO" : language === "en" ? "en_US" : language === "de" ? "de_DE" : "sr_RS"} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Global Jobs Consulting" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || ''} />
      <meta name="twitter:description" content={description || ''} />
    </Helmet>
  );
}

export { routeTranslations, getBaseRoute, BASE_URL };
