// Types for the application

// Locale types
export type Locale = 'ro' | 'en' | 'de' | 'sr' | 'ne' | 'bn' | 'hi' | 'si';

export const locales: Locale[] = ['ro', 'en', 'de', 'sr', 'ne', 'bn', 'hi', 'si'];
export const defaultLocale: Locale = 'ro';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  account_type: 'admin' | 'employer' | 'candidate' | 'student' | 'immigration_client';
  created_at: string;
  profile_completed?: boolean;
}

// Industry types
export interface Industry {
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  image: string;
  icon: string;
  workers_count?: number;
}

export const industries: Industry[] = [
  {
    slug: 'construction',
    name: {
      ro: 'Construcții',
      en: 'Construction',
      de: 'Bauwesen',
      sr: 'Građevinarstvo',
      ne: 'निर्माण',
      bn: 'নির্মাণ',
      hi: 'निर्माण',
      si: 'ඉදිකිරීම්',
    },
    description: {
      ro: 'Muncitori calificați pentru proiecte de construcții',
      en: 'Skilled workers for construction projects',
      de: 'Qualifizierte Arbeiter für Bauprojekte',
      sr: 'Kvalifikovani radnici za građevinske projekte',
      ne: 'निर्माण परियोजनाहरूका लागि कुशल कामदारहरू',
      bn: 'নির্মাণ প্রকল্পের জন্য দক্ষ শ্রমিক',
      hi: 'निर्माण परियोजनाओं के लिए कुशल श्रमिक',
      si: 'ඉදිකිරීම් ව්‍යාපෘති සඳහා දක්ෂ සේවකයින්',
    },
    image: '/images/industries/construction.jpg',
    icon: 'hard-hat',
  },
  {
    slug: 'horeca',
    name: {
      ro: 'HoReCa',
      en: 'Hospitality',
      de: 'Gastgewerbe',
      sr: 'Ugostiteljstvo',
      ne: 'आतिथ्य',
      bn: 'আতিথেয়তা',
      hi: 'आतिथ्य',
      si: 'ආගන්තුක සත්කාරය',
    },
    description: {
      ro: 'Personal pentru hoteluri, restaurante și catering',
      en: 'Staff for hotels, restaurants, and catering',
      de: 'Personal für Hotels, Restaurants und Catering',
      sr: 'Osoblje za hotele, restorane i ketering',
      ne: 'होटल, रेस्टुरेन्ट र क्याटरिङका लागि कर्मचारी',
      bn: 'হোটেল, রেস্তোরাঁ এবং ক্যাটারিং এর জন্য কর্মী',
      hi: 'होटल, रेस्टोरेंट और कैटरिंग के लिए स्टाफ',
      si: 'හෝටල්, ආපන ශාලා සහ කේටරින් සඳහා කාර්ය මණ්ඩලය',
    },
    image: '/images/industries/horeca.jpg',
    icon: 'utensils',
  },
  {
    slug: 'agriculture',
    name: {
      ro: 'Agricultură',
      en: 'Agriculture',
      de: 'Landwirtschaft',
      sr: 'Poljoprivreda',
      ne: 'कृषि',
      bn: 'কৃষি',
      hi: 'कृषि',
      si: 'කෘෂිකර්මය',
    },
    description: {
      ro: 'Muncitori agricoli sezonieri și permanenți',
      en: 'Seasonal and permanent agricultural workers',
      de: 'Saisonale und festangestellte Landarbeiter',
      sr: 'Sezonski i stalni poljoprivredni radnici',
      ne: 'मौसमी र स्थायी कृषि कामदारहरू',
      bn: 'মৌসুমী এবং স্থায়ী কৃষি শ্রমিক',
      hi: 'मौसमी और स्थायी कृषि श्रमिक',
      si: 'සෘතුමය හා ස්ථිර කෘෂිකාර්මික සේවකයින්',
    },
    image: '/images/industries/agriculture.jpg',
    icon: 'tractor',
  },
  {
    slug: 'manufacturing',
    name: {
      ro: 'Producție',
      en: 'Manufacturing',
      de: 'Fertigung',
      sr: 'Proizvodnja',
      ne: 'उत्पादन',
      bn: 'উৎপাদন',
      hi: 'विनिर्माण',
      si: 'නිෂ්පාදනය',
    },
    description: {
      ro: 'Operatori și tehnicieni pentru linii de producție',
      en: 'Operators and technicians for production lines',
      de: 'Bediener und Techniker für Produktionslinien',
      sr: 'Operateri i tehničari za proizvodne linije',
      ne: 'उत्पादन लाइनका लागि अपरेटर र प्राविधिकहरू',
      bn: 'উৎপাদন লাইনের জন্য অপারেটর এবং প্রযুক্তিবিদ',
      hi: 'उत्पादन लाइनों के लिए ऑपरेटर और तकनीशियन',
      si: 'නිෂ්පාදන මාර්ග සඳහා ක්‍රියාකරුවන් සහ කාර්මිකයින්',
    },
    image: '/images/industries/manufacturing.jpg',
    icon: 'factory',
  },
  {
    slug: 'logistics',
    name: {
      ro: 'Logistică',
      en: 'Logistics',
      de: 'Logistik',
      sr: 'Logistika',
      ne: 'लजिस्टिक्स',
      bn: 'লজিস্টিক',
      hi: 'लॉजिस्टिक्स',
      si: 'ප්‍රවාහනය',
    },
    description: {
      ro: 'Personal pentru depozite și transport',
      en: 'Warehouse and transport staff',
      de: 'Lager- und Transportpersonal',
      sr: 'Osoblje za skladišta i transport',
      ne: 'गोदाम र यातायात कर्मचारी',
      bn: 'গুদাম এবং পরিবহন কর্মী',
      hi: 'गोदाम और परिवहन स्टाफ',
      si: 'ගබඩා සහ ප්‍රවාහන කාර්ය මණ්ඩලය',
    },
    image: '/images/industries/logistics.jpg',
    icon: 'truck',
  },
];

// Country types for worker recruitment
export interface Country {
  slug: string;
  name: Record<Locale, string>;
  flag: string;
  continent: 'asia' | 'africa';
}

export const countries: Country[] = [
  { slug: 'nepal', name: { ro: 'Nepal', en: 'Nepal', de: 'Nepal', sr: 'Nepal', ne: 'नेपाल', bn: 'নেপাল', hi: 'नेपाल', si: 'නේපාලය' }, flag: '🇳🇵', continent: 'asia' },
  { slug: 'bangladesh', name: { ro: 'Bangladesh', en: 'Bangladesh', de: 'Bangladesch', sr: 'Bangladeš', ne: 'बंगलादेश', bn: 'বাংলাদেশ', hi: 'बांग्लादेश', si: 'බංග්ලාදේශය' }, flag: '🇧🇩', continent: 'asia' },
  { slug: 'india', name: { ro: 'India', en: 'India', de: 'Indien', sr: 'Indija', ne: 'भारत', bn: 'ভারত', hi: 'भारत', si: 'ඉන්දියාව' }, flag: '🇮🇳', continent: 'asia' },
  { slug: 'sri-lanka', name: { ro: 'Sri Lanka', en: 'Sri Lanka', de: 'Sri Lanka', sr: 'Šri Lanka', ne: 'श्रीलंका', bn: 'শ্রীলঙ্কা', hi: 'श्रीलंका', si: 'ශ්‍රී ලංකාව' }, flag: '🇱🇰', continent: 'asia' },
  { slug: 'pakistan', name: { ro: 'Pakistan', en: 'Pakistan', de: 'Pakistan', sr: 'Pakistan', ne: 'पाकिस्तान', bn: 'পাকিস্তান', hi: 'पाकिस्तान', si: 'පකිස්තානය' }, flag: '🇵🇰', continent: 'asia' },
  { slug: 'philippines', name: { ro: 'Filipine', en: 'Philippines', de: 'Philippinen', sr: 'Filipini', ne: 'फिलिपिन्स', bn: 'ফিলিপাইন', hi: 'फिलीपींस', si: 'පිලිපීනය' }, flag: '🇵🇭', continent: 'asia' },
  { slug: 'vietnam', name: { ro: 'Vietnam', en: 'Vietnam', de: 'Vietnam', sr: 'Vijetnam', ne: 'भियतनाम', bn: 'ভিয়েতনাম', hi: 'वियतनाम', si: 'වියට්නාමය' }, flag: '🇻🇳', continent: 'asia' },
  { slug: 'indonesia', name: { ro: 'Indonezia', en: 'Indonesia', de: 'Indonesien', sr: 'Indonezija', ne: 'इन्डोनेसिया', bn: 'ইন্দোনেশিয়া', hi: 'इंडोनेशिया', si: 'ඉන්දුනීසියාව' }, flag: '🇮🇩', continent: 'asia' },
  { slug: 'kenya', name: { ro: 'Kenya', en: 'Kenya', de: 'Kenia', sr: 'Kenija', ne: 'केन्या', bn: 'কেনিয়া', hi: 'केन्या', si: 'කෙන්යාව' }, flag: '🇰🇪', continent: 'africa' },
  { slug: 'ethiopia', name: { ro: 'Etiopia', en: 'Ethiopia', de: 'Äthiopien', sr: 'Etiopija', ne: 'इथियोपिया', bn: 'ইথিওপিয়া', hi: 'इथियोपिया', si: 'ඉතියෝපියාව' }, flag: '🇪🇹', continent: 'africa' },
  { slug: 'nigeria', name: { ro: 'Nigeria', en: 'Nigeria', de: 'Nigeria', sr: 'Nigerija', ne: 'नाइजेरिया', bn: 'নাইজেরিয়া', hi: 'नाइजीरिया', si: 'නයිජීරියාව' }, flag: '🇳🇬', continent: 'africa' },
  { slug: 'ghana', name: { ro: 'Ghana', en: 'Ghana', de: 'Ghana', sr: 'Gana', ne: 'घाना', bn: 'ঘানা', hi: 'घाना', si: 'ඝානාව' }, flag: '🇬🇭', continent: 'africa' },
  { slug: 'morocco', name: { ro: 'Maroc', en: 'Morocco', de: 'Marokko', sr: 'Maroko', ne: 'मोरक्को', bn: 'মরক্কো', hi: 'मोरक्को', si: 'මොරොක්කෝව' }, flag: '🇲🇦', continent: 'africa' },
  { slug: 'egypt', name: { ro: 'Egipt', en: 'Egypt', de: 'Ägypten', sr: 'Egipat', ne: 'इजिप्ट', bn: 'মিশর', hi: 'मिस्र', si: 'ඊජිප්තුව' }, flag: '🇪🇬', continent: 'africa' },
  { slug: 'tunisia', name: { ro: 'Tunisia', en: 'Tunisia', de: 'Tunesien', sr: 'Tunis', ne: 'ट्युनिसिया', bn: 'তিউনিসিয়া', hi: 'ट्यूनीशिया', si: 'ටියුනීසියාව' }, flag: '🇹🇳', continent: 'africa' },
];

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Job types
export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  country: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

// Blog types
export interface BlogPost {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
  image: string;
  author: string;
  category: string;
  published_at: string;
  tags: string[];
}
