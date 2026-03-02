import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, getTranslation } from './translations';

const LanguageContext = createContext();

// Route translations for URL localization
const routePaths = {
  '/': { ro: '/', en: '/en', de: '/de', sr: '/sr' },
  '/despre-noi': { ro: '/despre-noi', en: '/en/about-us', de: '/de/uber-uns', sr: '/sr/o-nama' },
  '/angajatori': { ro: '/angajatori', en: '/en/employers', de: '/de/arbeitgeber', sr: '/sr/poslodavci' },
  '/angajatori/procedura': { ro: '/angajatori/procedura', en: '/en/employers/procedure', de: '/de/arbeitgeber/verfahren', sr: '/sr/poslodavci/procedura' },
  '/angajatori/eligibilitate': { ro: '/angajatori/eligibilitate', en: '/en/employers/eligibility', de: '/de/arbeitgeber/berechtigung', sr: '/sr/poslodavci/podobnost' },
  '/angajatori/costuri': { ro: '/angajatori/costuri', en: '/en/employers/costs', de: '/de/arbeitgeber/kosten', sr: '/sr/poslodavci/troskovi' },
  '/servicii': { ro: '/servicii', en: '/en/services', de: '/de/dienstleistungen', sr: '/sr/usluge' },
  '/candidati': { ro: '/candidati', en: '/en/candidates', de: '/de/kandidaten', sr: '/sr/kandidati' },
  '/blog': { ro: '/blog', en: '/en/blog', de: '/de/blog', sr: '/sr/blog' },
  '/contact': { ro: '/contact', en: '/en/contact', de: '/de/kontakt', sr: '/sr/kontakt' },
  '/politica-confidentialitate': { 
    ro: '/politica-confidentialitate', 
    en: '/en/privacy-policy', 
    de: '/de/datenschutz', 
    sr: '/sr/politika-privatnosti' 
  },
  '/formular-angajator': { 
    ro: '/formular-angajator', 
    en: '/en/employer-form', 
    de: '/de/arbeitgeber-formular', 
    sr: '/sr/formular-poslodavac' 
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('gjc-language');
    if (saved && ['ro', 'en', 'de', 'sr'].includes(saved)) {
      return saved;
    }
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en') return 'en';
    if (browserLang === 'de') return 'de';
    if (browserLang === 'sr') return 'sr';
    return 'ro';
  });

  useEffect(() => {
    localStorage.setItem('gjc-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => getTranslation(language, key);

  // Get localized path for the current language
  const getLocalizedPath = useCallback((basePath) => {
    const paths = routePaths[basePath];
    if (paths) {
      return paths[language] || basePath;
    }
    // For paths not in the mapping, add language prefix for non-Romanian
    if (language !== 'ro') {
      return `/${language}${basePath}`;
    }
    return basePath;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language], getLocalizedPath, routePaths }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
