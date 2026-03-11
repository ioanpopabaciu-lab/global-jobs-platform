import { Locale, defaultLocale, locales } from '@/types';

export const i18nConfig = {
  locales,
  defaultLocale,
};

// Dictionary loading function
const dictionaries = {
  ro: () => import('./dictionaries/ro.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  de: () => import('./dictionaries/de.json').then((module) => module.default),
  sr: () => import('./dictionaries/sr.json').then((module) => module.default),
  ne: () => import('./dictionaries/ne.json').then((module) => module.default),
  bn: () => import('./dictionaries/bn.json').then((module) => module.default),
  hi: () => import('./dictionaries/hi.json').then((module) => module.default),
  si: () => import('./dictionaries/si.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries[defaultLocale]();
};

// Locale display names with flags
export const localeNames: Record<Locale, { name: string; flag: string }> = {
  ro: { name: 'Română', flag: '🇷🇴' },
  en: { name: 'English', flag: '🇬🇧' },
  de: { name: 'Deutsch', flag: '🇦🇹' },
  sr: { name: 'Srpski', flag: '🇷🇸' },
  ne: { name: 'नेपाली', flag: '🇳🇵' },
  bn: { name: 'বাংলা', flag: '🇧🇩' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  si: { name: 'සිංහල', flag: '🇱🇰' },
};
