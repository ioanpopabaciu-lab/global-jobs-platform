import { useEffect } from "react";
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
  
  // Map language-specific paths back to base route
  const languagePathMappings = {
    '/employers': '/angajatori',
    '/services': '/servicii',
    '/candidates': '/candidati',
    '/contact': '/contact',
    '/privacy-policy': '/politica-confidentialitate',
    '/arbeitgeber': '/angajatori',
    '/dienstleistungen': '/servicii',
    '/kandidaten': '/candidati',
    '/kontakt': '/contact',
    '/datenschutz': '/politica-confidentialitate',
    '/poslodavci': '/angajatori',
    '/usluge': '/servicii',
    '/politika-privatnosti': '/politica-confidentialitate'
  };
  
  if (languagePathMappings[basePath]) {
    return languagePathMappings[basePath];
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
  
  // Set document.title to avoid Helmet's string parsing issues
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
  
  // Set html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  
  // Manually inject SEO meta tags and hreflang tags
  useEffect(() => {
    const head = document.head;
    
    // Helper to remove existing tag
    const removeExisting = (selector) => {
      const existing = head.querySelector(selector);
      if (existing) existing.remove();
    };
    
    // Update or create meta description
    removeExisting('meta[name="description"][data-seo="true"]');
    if (description) {
      const descMeta = document.createElement('meta');
      descMeta.name = 'description';
      descMeta.content = description;
      descMeta.setAttribute('data-seo', 'true');
      head.appendChild(descMeta);
    }
    
    // Update or create canonical link
    removeExisting('link[rel="canonical"][data-seo="true"]');
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = `${BASE_URL}${translations[language]}`;
    canonicalLink.setAttribute('data-seo', 'true');
    head.appendChild(canonicalLink);
    
    // Remove existing hreflang tags
    head.querySelectorAll('link[hreflang][data-seo="true"]').forEach(el => el.remove());
    
    // Add hreflang tags
    const languages = ['ro', 'en', 'de', 'sr'];
    languages.forEach(lang => {
      const hreflangLink = document.createElement('link');
      hreflangLink.rel = 'alternate';
      hreflangLink.hreflang = lang;
      hreflangLink.href = `${BASE_URL}${translations[lang]}`;
      hreflangLink.setAttribute('data-seo', 'true');
      head.appendChild(hreflangLink);
    });
    
    // Add x-default hreflang
    const xDefaultLink = document.createElement('link');
    xDefaultLink.rel = 'alternate';
    xDefaultLink.hreflang = 'x-default';
    xDefaultLink.href = `${BASE_URL}${translations.ro}`;
    xDefaultLink.setAttribute('data-seo', 'true');
    head.appendChild(xDefaultLink);
    
    // Update OG meta tags
    const ogTags = [
      { property: 'og:title', content: title || '' },
      { property: 'og:description', content: description || '' },
      { property: 'og:url', content: `${BASE_URL}${translations[language]}` },
      { property: 'og:locale', content: language === "ro" ? "ro_RO" : language === "en" ? "en_US" : language === "de" ? "de_DE" : "sr_RS" },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Global Jobs Consulting' }
    ];
    
    ogTags.forEach(tag => {
      removeExisting(`meta[property="${tag.property}"][data-seo="true"]`);
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      meta.setAttribute('data-seo', 'true');
      head.appendChild(meta);
    });
    
    // Update Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title || '' },
      { name: 'twitter:description', content: description || '' }
    ];
    
    twitterTags.forEach(tag => {
      removeExisting(`meta[name="${tag.name}"][data-seo="true"]`);
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      meta.setAttribute('data-seo', 'true');
      head.appendChild(meta);
    });
    
    // Cleanup on unmount
    return () => {
      head.querySelectorAll('[data-seo="true"]').forEach(el => el.remove());
    };
  }, [title, description, language, translations]);
  
  return null; // No JSX rendered - all done via useEffect
}

export { routeTranslations, getBaseRoute, BASE_URL };
