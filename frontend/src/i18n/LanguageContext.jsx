import { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from './translations';

const LanguageContext = createContext();

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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language] }}>
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
