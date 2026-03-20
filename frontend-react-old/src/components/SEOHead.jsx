import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://www.gjc.ro";
const OG_IMAGE = "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/en2yk94c_Design%20f%C4%83r%C4%83%20titlu%20%281%29.png";

// Map routes to their translations
const routeTranslations = {
  "/": { ro: "/", en: "/en", de: "/de", sr: "/sr" },
  "/despre-noi": { ro: "/despre-noi", en: "/en/about-us", de: "/de/uber-uns", sr: "/sr/o-nama" },
  "/angajatori": { ro: "/angajatori", en: "/en/employers", de: "/de/arbeitgeber", sr: "/sr/poslodavci" },
  "/angajatori/procedura": { ro: "/angajatori/procedura", en: "/en/employers/procedure", de: "/de/arbeitgeber/verfahren", sr: "/sr/poslodavci/procedura" },
  "/angajatori/eligibilitate": { ro: "/angajatori/eligibilitate", en: "/en/employers/eligibility", de: "/de/arbeitgeber/berechtigung", sr: "/sr/poslodavci/podobnost" },
  "/angajatori/costuri": { ro: "/angajatori/costuri", en: "/en/employers/costs", de: "/de/arbeitgeber/kosten", sr: "/sr/poslodavci/troskovi" },
  "/servicii": { ro: "/servicii", en: "/en/services", de: "/de/dienstleistungen", sr: "/sr/usluge" },
  "/candidati": { ro: "/candidati", en: "/en/candidates", de: "/de/kandidaten", sr: "/sr/kandidati" },
  "/blog": { ro: "/blog", en: "/en/blog", de: "/de/blog", sr: "/sr/blog" },
  "/contact": { ro: "/contact", en: "/en/contact", de: "/de/kontakt", sr: "/sr/kontakt" },
  "/politica-confidentialitate": { 
    ro: "/politica-confidentialitate", 
    en: "/en/privacy-policy", 
    de: "/de/datenschutz", 
    sr: "/sr/politika-privatnosti" 
  },
  "/formular-angajator": { 
    ro: "/formular-angajator", 
    en: "/en/employer-form", 
    de: "/de/arbeitgeber-formular", 
    sr: "/sr/formular-poslodavac" 
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
    '/about-us': '/despre-noi',
    '/uber-uns': '/despre-noi',
    '/o-nama': '/despre-noi',
    '/employers': '/angajatori',
    '/employers/procedure': '/angajatori/procedura',
    '/employers/eligibility': '/angajatori/eligibilitate',
    '/employers/costs': '/angajatori/costuri',
    '/services': '/servicii',
    '/candidates': '/candidati',
    '/contact': '/contact',
    '/privacy-policy': '/politica-confidentialitate',
    '/employer-form': '/formular-angajator',
    '/arbeitgeber': '/angajatori',
    '/arbeitgeber/verfahren': '/angajatori/procedura',
    '/arbeitgeber/berechtigung': '/angajatori/eligibilitate',
    '/arbeitgeber/kosten': '/angajatori/costuri',
    '/dienstleistungen': '/servicii',
    '/kandidaten': '/candidati',
    '/kontakt': '/contact',
    '/datenschutz': '/politica-confidentialitate',
    '/arbeitgeber-formular': '/formular-angajator',
    '/poslodavci': '/angajatori',
    '/poslodavci/procedura': '/angajatori/procedura',
    '/poslodavci/podobnost': '/angajatori/eligibilitate',
    '/poslodavci/troskovi': '/angajatori/costuri',
    '/usluge': '/servicii',
    '/politika-privatnosti': '/politica-confidentialitate',
    '/formular-poslodavac': '/formular-angajator'
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
      { property: 'og:site_name', content: 'Global Jobs Consulting' },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' }
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
      { name: 'twitter:description', content: description || '' },
      { name: 'twitter:image', content: OG_IMAGE }
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
