import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, getTranslation } from './translations';

const LanguageContext = createContext();

// Supported languages
const SUPPORTED_LANGUAGES = ['ro', 'en', 'de', 'sr', 'ne', 'bn', 'hi', 'si'];

// Route translations for URL localization
const routePaths = {
  '/': { ro: '/', en: '/en', de: '/de', sr: '/sr', ne: '/ne', bn: '/bn', hi: '/hi', si: '/si' },
  '/despre-noi': { ro: '/despre-noi', en: '/en/about-us', de: '/de/uber-uns', sr: '/sr/o-nama', ne: '/ne/about-us', bn: '/bn/about-us', hi: '/hi/about-us', si: '/si/about-us' },
  '/angajatori': { ro: '/angajatori', en: '/en/employers', de: '/de/arbeitgeber', sr: '/sr/poslodavci', ne: '/ne/employers', bn: '/bn/employers', hi: '/hi/employers', si: '/si/employers' },
  '/servicii': { ro: '/servicii', en: '/en/services', de: '/de/dienstleistungen', sr: '/sr/usluge', ne: '/ne/services', bn: '/bn/services', hi: '/hi/services', si: '/si/services' },
  '/candidati': { ro: '/candidati', en: '/en/candidates', de: '/de/kandidaten', sr: '/sr/kandidati', ne: '/ne/candidates', bn: '/bn/candidates', hi: '/hi/candidates', si: '/si/candidates' },
  '/blog': { ro: '/blog', en: '/en/blog', de: '/de/blog', sr: '/sr/blog', ne: '/ne/blog', bn: '/bn/blog', hi: '/hi/blog', si: '/si/blog' },
  '/contact': { ro: '/contact', en: '/en/contact', de: '/de/kontakt', sr: '/sr/kontakt', ne: '/ne/contact', bn: '/bn/contact', hi: '/hi/contact', si: '/si/contact' },
  '/solicita-muncitori': { ro: '/solicita-muncitori', en: '/en/request-workers', de: '/de/arbeiter-anfordern', sr: '/sr/zatrazite-radnike', ne: '/ne/request-workers', bn: '/bn/request-workers', hi: '/hi/request-workers', si: '/si/request-workers' },
  '/cum-functioneaza': { ro: '/cum-functioneaza', en: '/en/how-it-works', de: '/de/so-funktioniert-es', sr: '/sr/kako-funkcionise', ne: '/ne/how-it-works', bn: '/bn/how-it-works', hi: '/hi/how-it-works', si: '/si/how-it-works' },
  '/formular-angajator': { 
    ro: '/formular-angajator', 
    en: '/en/employer-form',
    de: '/de/arbeitgeber-formular',
    sr: '/sr/formular-poslodavac',
    ne: '/ne/employer-form',
    bn: '/bn/employer-form',
    hi: '/hi/employer-form',
    si: '/si/employer-form'
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('gjc-language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
    // Default to English for international accessibility
    return 'en';
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
