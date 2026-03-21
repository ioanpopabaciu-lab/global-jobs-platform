import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Globe, Shield, Clock, Users, ArrowRight, FileText, Building2 } from "lucide-react";
import { Locale, locales, defaultLocale, industries } from "@/types";
import { getDictionary } from "@/i18n/config";
import HeroSlider from "@/components/home/HeroSlider";

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gjc.ro";

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
    alternates: {
      canonical: locale === "ro" ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        "ro-RO": baseUrl,
        "en-US": `${baseUrl}/en`,
        "de-AT": `${baseUrl}/de`,
        "sr-RS": `${baseUrl}/sr`,
        "ne-NP": `${baseUrl}/ne`,
        "bn-BD": `${baseUrl}/bn`,
        "hi-IN": `${baseUrl}/hi`,
        "si-LK": `${baseUrl}/si`,
      },
    },
    openGraph: {
      title: dict.metadata.title,
      description: dict.metadata.description,
      url: locale === "ro" ? baseUrl : `${baseUrl}/${locale}`,
      type: "website",
      locale: locale === "ro" ? "ro_RO" : `${locale}_${locale.toUpperCase()}`,
    },
  };
}

// Page content translations
const pageContent = {
  ro: {
    about: {
      label: "Despre Noi",
      title: "Conectăm Talente Globale cu Oportunități Locale",
      subtitle: "Soluții Globale pentru Deficitul de Forță de Muncă",
      text1: "Global Jobs Consulting este o agenție de recrutare All-Inclusive specializată în plasarea forței de muncă din Asia și Africa în piețele europene. Cu o rețea de 11 agenții partenere, oferim soluții complete de staffing pentru angajatorii din România, Austria și Serbia.",
      text2: "Ne ocupăm de întregul proces: de la selecția riguroasă a candidaților, întocmirea dosarelor de imigrare (vize și permise de muncă), până la integrarea în comunitate și monitorizarea pe termen lung.",
      cta: "Descoperă Serviciile Noastre",
      years: "Ani de Experiență"
    },
    advantages: [
      { title: "Rețea Globală", description: "Acces la candidați din Asia și Africa prin intermediul celor 11 agenții partenere." },
      { title: "Conformitate Legală", description: "Gestionăm integral documentația legală: vize, permise de muncă și autorizații." },
      { title: "Proces Rapid", description: "Livrăm candidați selectați în cel mai scurt timp posibil, cu suport complet." },
      { title: "Suport Continuu", description: "Monitorizare și asistență pe termen lung pentru integrarea cu succes." }
    ],
    stats: {
      partners: "11+",
      partnersLabel: "Parteneri în Asia & Africa",
      experience: "4",
      experienceLabel: "Ani de Experiență",
      markets: "3",
      marketsLabel: "Piețe Europene",
      candidates: "500+",
      candidatesLabel: "Candidați Plasați"
    },
    markets: {
      label: "Piețe Acoperite",
      title: "Angajatori din 3 Țări",
      romania: { name: "România", desc: "Soluții complete de recrutare pentru angajatorii români din toate sectoarele industriale.", link: "Detalii pentru RO →" },
      austria: { name: "Austria", desc: "Forță de muncă calificată pentru piața austriacă, cu suport complet în procesul de imigrare.", link: "Detalii pentru AT →" },
      serbia: { name: "Serbia", desc: "Plasare de personal pentru companiile din Serbia care caută muncitori dedicați.", link: "Detalii pentru RS →" }
    },
    cta: {
      title: "Începeți Recrutarea Astăzi",
      description: "Indiferent dacă sunteți angajator în căutare de personal sau candidat în căutarea unei oportunități, suntem aici să vă ajutăm.",
      employer: "Sunt Angajator",
      candidate: "Caut un Job"
    },
    hero: {
      headline: "Muncitori Internaționali pentru Companii Europene",
      subheadline: "Soluții legale de recrutare din Asia și Africa pentru România, Austria și Serbia",
      cta1: "Solicită Muncitori",
      cta2: "Află Mai Multe"
    }
  },
  en: {
    about: {
      label: "About Us",
      title: "Connecting Global Talent with Local Opportunities",
      subtitle: "Global Solutions for Workforce Shortage",
      text1: "Global Jobs Consulting is an All-Inclusive recruitment agency specialized in placing workforce from Asia and Africa in European markets. With a network of 11 partner agencies, we offer complete staffing solutions for employers in Romania, Austria, and Serbia.",
      text2: "We handle the entire process: from rigorous candidate selection, immigration documentation (visas and work permits), to community integration and long-term monitoring.",
      cta: "Discover Our Services",
      years: "Years of Experience"
    },
    advantages: [
      { title: "Global Network", description: "Access to candidates from Asia and Africa through our 11 partner agencies." },
      { title: "Legal Compliance", description: "We fully manage legal documentation: visas, work permits, and authorizations." },
      { title: "Fast Process", description: "We deliver selected candidates as quickly as possible, with full support." },
      { title: "Ongoing Support", description: "Long-term monitoring and assistance for successful integration." }
    ],
    stats: {
      partners: "11+",
      partnersLabel: "Partners in Asia & Africa",
      experience: "4",
      experienceLabel: "Years of Experience",
      markets: "3",
      marketsLabel: "European Markets",
      candidates: "500+",
      candidatesLabel: "Candidates Placed"
    },
    markets: {
      label: "Markets Covered",
      title: "Employers from 3 Countries",
      romania: { name: "Romania", desc: "Complete recruitment solutions for Romanian employers across all industrial sectors.", link: "Details for RO →" },
      austria: { name: "Austria", desc: "Qualified workforce for the Austrian market, with full immigration process support.", link: "Details for AT →" },
      serbia: { name: "Serbia", desc: "Staff placement for Serbian companies looking for dedicated workers.", link: "Details for RS →" }
    },
    cta: {
      title: "Start Recruiting Today",
      description: "Whether you're an employer looking for staff or a candidate looking for an opportunity, we're here to help you.",
      employer: "I'm an Employer",
      candidate: "Looking for a Job"
    },
    hero: {
      headline: "International Workers for European Companies",
      subheadline: "Legal recruitment solutions from Asia and Africa for Romania, Austria, and Serbia",
      cta1: "Request Workers",
      cta2: "Learn More"
    }
  },
  de: {
    about: {
      label: "Über Uns",
      title: "Wir Verbinden Globale Talente mit Lokalen Chancen",
      subtitle: "Globale Lösungen für den Arbeitskräftemangel",
      text1: "Global Jobs Consulting ist eine All-Inclusive-Rekrutierungsagentur, die sich auf die Vermittlung von Arbeitskräften aus Asien und Afrika in europäische Märkte spezialisiert hat. Mit einem Netzwerk von 11 Partneragenturen bieten wir komplette Personallösungen für Arbeitgeber in Rumänien, Österreich und Serbien.",
      text2: "Wir kümmern uns um den gesamten Prozess: von der sorgfältigen Auswahl der Kandidaten, der Erstellung von Einwanderungsdossiers (Visa und Arbeitserlaubnisse) bis hin zur Integration in die Gemeinschaft und langfristigen Überwachung.",
      cta: "Entdecken Sie unsere Dienstleistungen",
      years: "Jahre Erfahrung"
    },
    advantages: [
      { title: "Globales Netzwerk", description: "Zugang zu Kandidaten aus Asien und Afrika durch unsere 11 Partneragenturen." },
      { title: "Rechtliche Konformität", description: "Wir verwalten die gesamte rechtliche Dokumentation: Visa, Arbeitserlaubnisse und Genehmigungen." },
      { title: "Schneller Prozess", description: "Wir liefern ausgewählte Kandidaten so schnell wie möglich mit voller Unterstützung." },
      { title: "Kontinuierliche Unterstützung", description: "Langfristige Überwachung und Unterstützung für eine erfolgreiche Integration." }
    ],
    stats: {
      partners: "11+",
      partnersLabel: "Partner in Asien & Afrika",
      experience: "4",
      experienceLabel: "Jahre Erfahrung",
      markets: "3",
      marketsLabel: "Europäische Märkte",
      candidates: "500+",
      candidatesLabel: "Platzierte Kandidaten"
    },
    markets: {
      label: "Abgedeckte Märkte",
      title: "Arbeitgeber aus 3 Ländern",
      romania: { name: "Rumänien", desc: "Komplette Rekrutierungslösungen für rumänische Arbeitgeber in allen Industriesektoren.", link: "Details für RO →" },
      austria: { name: "Österreich", desc: "Qualifizierte Arbeitskräfte für den österreichischen Markt mit voller Unterstützung im Einwanderungsprozess.", link: "Details für AT →" },
      serbia: { name: "Serbien", desc: "Personalvermittlung für serbische Unternehmen, die engagierte Mitarbeiter suchen.", link: "Details für RS →" }
    },
    cta: {
      title: "Starten Sie heute mit der Rekrutierung",
      description: "Ob Sie als Arbeitgeber Personal suchen oder als Kandidat eine Stelle suchen - wir sind hier, um Ihnen zu helfen.",
      employer: "Ich bin Arbeitgeber",
      candidate: "Jobsuche"
    },
    hero: {
      headline: "Internationale Arbeiter für Europäische Unternehmen",
      subheadline: "Legale Rekrutierungslösungen aus Asien und Afrika für Rumänien, Österreich und Serbien",
      cta1: "Arbeiter Anfordern",
      cta2: "Mehr Erfahren"
    }
  },
  sr: {
    about: {
      label: "O Nama",
      title: "Povezujemo Globalne Talente sa Lokalnim Prilikama",
      subtitle: "Globalna rešenja za nedostatak radne snage",
      text1: "Global Jobs Consulting je sveobuhvatna agencija za zapošljavanje specijalizovana za plasiranje radne snage iz Azije i Afrike na evropska tržišta. Sa mrežom od 11 partnerskih agencija, nudimo kompletna rešenja za zapošljavanje poslodavcima u Rumuniji, Austriji i Srbiji.",
      text2: "Brinemo se o celom procesu: od pažljivog odabira kandidata, pripreme imigracionih dosijea (vize i radne dozvole) do integracije u zajednicu i dugoročnog praćenja.",
      cta: "Otkrijte naše usluge",
      years: "Godina iskustva"
    },
    advantages: [
      { title: "Globalna mreža", description: "Pristup kandidatima iz Azije i Afrike kroz naših 11 partnerskih agencija." },
      { title: "Pravna usklađenost", description: "U potpunosti upravljamo pravnom dokumentacijom: vize, radne dozvole i ovlašćenja." },
      { title: "Brz proces", description: "Isporučujemo odabrane kandidate što je brže moguće, uz punu podršku." },
      { title: "Kontinuirana podrška", description: "Dugoročno praćenje i pomoć za uspešnu integraciju." }
    ],
    stats: {
      partners: "11+",
      partnersLabel: "Partnera u Aziji i Africi",
      experience: "4",
      experienceLabel: "Godina Iskustva",
      markets: "3",
      marketsLabel: "Evropska Tržišta",
      candidates: "500+",
      candidatesLabel: "Plasiranih Kandidata"
    },
    markets: {
      label: "Pokrivena tržišta",
      title: "Poslodavci iz 3 zemlje",
      romania: { name: "Rumunija", desc: "Kompletna rešenja za zapošljavanje za rumunske poslodavce u svim industrijskim sektorima.", link: "Detalji za RO →" },
      austria: { name: "Austrija", desc: "Kvalifikovana radna snaga za austrijsko tržište, uz punu podršku u imigracionom procesu.", link: "Detalji za AT →" },
      serbia: { name: "Srbija", desc: "Plasman osoblja za srpske kompanije koje traže posvećene radnike.", link: "Detalji za RS →" }
    },
    cta: {
      title: "Počnite sa regrutacijom danas",
      description: "Bilo da ste poslodavac u potrazi za osobljem ili kandidat u potrazi za prilikom, tu smo da vam pomognemo.",
      employer: "Ja sam poslodavac",
      candidate: "Tražim posao"
    },
    hero: {
      headline: "Međunarodni Radnici za Evropske Kompanije",
      subheadline: "Legalna rešenja za regrutaciju iz Azije i Afrike za Rumuniju, Austriju i Srbiju",
      cta1: "Zatražite Radnike",
      cta2: "Saznajte Više"
    }
  },
  ne: {
    about: { label: "हाम्रो बारेमा", title: "विश्वव्यापी प्रतिभालाई स्थानीय अवसरहरूसँग जोड्दै", subtitle: "श्रमिक अभावको लागि विश्वव्यापी समाधान", text1: "Global Jobs Consulting एक सर्वसमावेशी भर्ती एजेन्सी हो।", text2: "हामी सम्पूर्ण प्रक्रिया ह्यान्डल गर्छौं।", cta: "हाम्रा सेवाहरू पत्ता लगाउनुहोस्", years: "वर्षको अनुभव" },
    advantages: [{ title: "विश्वव्यापी नेटवर्क", description: "११ साझेदार एजेन्सीहरू मार्फत पहुँच।" }, { title: "कानूनी अनुपालन", description: "सम्पूर्ण कानूनी कागजात व्यवस्थापन।" }, { title: "छिटो प्रक्रिया", description: "छानिएका उम्मेदवारहरू प्रदान।" }, { title: "निरन्तर सहयोग", description: "दीर्घकालीन अनुगमन र सहायता।" }],
    stats: { partners: "११+", partnersLabel: "एशिया र अफ्रिकामा साझेदारहरू", experience: "४", experienceLabel: "वर्षको अनुभव", markets: "३", marketsLabel: "युरोपेली बजारहरू", candidates: "५००+", candidatesLabel: "राखिएका उम्मेदवारहरू" },
    markets: { label: "कभर गरिएका बजारहरू", title: "३ देशका रोजगारदाताहरू", romania: { name: "रोमानिया", desc: "रोमानियाली रोजगारदाताहरूको लागि समाधान।", link: "RO को लागि विवरण →" }, austria: { name: "अष्ट्रिया", desc: "अष्ट्रियाली बजारको लागि योग्य जनशक्ति।", link: "AT को लागि विवरण →" }, serbia: { name: "सर्बिया", desc: "सर्बियाली कम्पनीहरूको लागि कर्मचारी प्लेसमेन्ट।", link: "RS को लागि विवरण →" } },
    cta: { title: "आज भर्ती सुरु गर्नुहोस्", description: "हामी मद्दत गर्न यहाँ छौं।", employer: "म रोजगारदाता हुँ", candidate: "म काम खोज्दै छु" },
    hero: { headline: "युरोपेली कम्पनीहरूका लागि अन्तर्राष्ट्रिय कामदारहरू", subheadline: "एशिया र अफ्रिकाबाट कानूनी भर्ती समाधानहरू", cta1: "कामदार अनुरोध गर्नुहोस्", cta2: "थप जान्नुहोस्" }
  },
  bn: {
    about: { label: "আমাদের সম্পর্কে", title: "গ্লোবাল ট্যালেন্টকে স্থানীয় সুযোগের সাথে সংযুক্ত করা", subtitle: "কর্মশক্তির ঘাটতির জন্য গ্লোবাল সমাধান", text1: "Global Jobs Consulting একটি সর্বসমাবেশী নিয়োগ সংস্থা।", text2: "আমরা সম্পূর্ণ প্রক্রিয়া পরিচালনা করি।", cta: "আমাদের সেবা আবিষ্কার করুন", years: "বছরের অভিজ্ঞতা" },
    advantages: [{ title: "গ্লোবাল নেটওয়ার্ক", description: "১১ অংশীদার সংস্থার মাধ্যমে অ্যাক্সেস।" }, { title: "আইনি সম্মতি", description: "সম্পূর্ণ আইনি ডকুমেন্টেশন পরিচালনা।" }, { title: "দ্রুত প্রক্রিয়া", description: "নির্বাচিত প্রার্থীদের সরবরাহ।" }, { title: "চলমান সহায়তা", description: "দীর্ঘমেয়াদী পর্যবেক্ষণ এবং সহায়তা।" }],
    stats: { partners: "১১+", partnersLabel: "এশিয়া ও আফ্রিকায় অংশীদার", experience: "৪", experienceLabel: "বছরের অভিজ্ঞতা", markets: "৩", marketsLabel: "ইউরোপীয় বাজার", candidates: "৫০০+", candidatesLabel: "নিয়োগপ্রাপ্ত প্রার্থী" },
    markets: { label: "কভার করা বাজার", title: "৩ দেশের নিয়োগকর্তা", romania: { name: "রোমানিয়া", desc: "রোমানিয়ান নিয়োগকর্তাদের জন্য সমাধান।", link: "RO এর জন্য বিস্তারিত →" }, austria: { name: "অস্ট্রিয়া", desc: "অস্ট্রিয়ান বাজারের জন্য যোগ্য কর্মশক্তি।", link: "AT এর জন্য বিস্তারিত →" }, serbia: { name: "সার্বিয়া", desc: "সার্বিয়ান কোম্পানিগুলির জন্য কর্মী নিয়োগ।", link: "RS এর জন্য বিস্তারিত →" } },
    cta: { title: "আজই নিয়োগ শুরু করুন", description: "আমরা সাহায্য করতে এখানে আছি।", employer: "আমি একজন নিয়োগকর্তা", candidate: "আমি চাকরি খুঁজছি" },
    hero: { headline: "ইউরোপীয় কোম্পানিগুলির জন্য আন্তর্জাতিক কর্মী", subheadline: "এশিয়া এবং আফ্রিকা থেকে আইনি নিয়োগ সমাধান", cta1: "কর্মী অনুরোধ করুন", cta2: "আরও জানুন" }
  },
  hi: {
    about: { label: "हमारे बारे में", title: "वैश्विक प्रतिभा को स्थानीय अवसरों से जोड़ना", subtitle: "कार्यबल की कमी के लिए वैश्विक समाधान", text1: "Global Jobs Consulting एक सर्वसमावेशी भर्ती एजेंसी है।", text2: "हम पूरी प्रक्रिया संभालते हैं।", cta: "हमारी सेवाएं खोजें", years: "वर्षों का अनुभव" },
    advantages: [{ title: "वैश्विक नेटवर्क", description: "11 भागीदार एजेंसियों के माध्यम से पहुंच।" }, { title: "कानूनी अनुपालन", description: "सभी कानूनी दस्तावेज़ीकरण का प्रबंधन।" }, { title: "तेज़ प्रक्रिया", description: "चयनित उम्मीदवारों को वितरित।" }, { title: "निरंतर समर्थन", description: "दीर्घकालिक निगरानी और सहायता।" }],
    stats: { partners: "11+", partnersLabel: "एशिया और अफ्रीका में भागीदार", experience: "4", experienceLabel: "वर्षों का अनुभव", markets: "3", marketsLabel: "यूरोपीय बाजार", candidates: "500+", candidatesLabel: "नियुक्त उम्मीदवार" },
    markets: { label: "कवर किए गए बाज़ार", title: "3 देशों के नियोक्ता", romania: { name: "रोमानिया", desc: "रोमानियाई नियोक्ताओं के लिए समाधान।", link: "RO के लिए विवरण →" }, austria: { name: "ऑस्ट्रिया", desc: "ऑस्ट्रियाई बाज़ार के लिए योग्य कार्यबल।", link: "AT के लिए विवरण →" }, serbia: { name: "सर्बिया", desc: "सर्बियाई कंपनियों के लिए स्टाफ प्लेसमेंट।", link: "RS के लिए विवरण →" } },
    cta: { title: "आज ही भर्ती शुरू करें", description: "हम मदद के लिए यहां हैं।", employer: "मैं एक नियोक्ता हूं", candidate: "मैं नौकरी ढूंढ रहा हूं" },
    hero: { headline: "यूरोपीय कंपनियों के लिए अंतर्राष्ट्रीय कर्मचारी", subheadline: "एशिया और अफ्रीका से कानूनी भर्ती समाधान", cta1: "कर्मचारी अनुरोध करें", cta2: "अधिक जानें" }
  },
  si: {
    about: { label: "අපි ගැන", title: "ගෝලීය දක්ෂතාවය ප්‍රාදේශීය අවස්ථා සමඟ සම්බන්ධ කිරීම", subtitle: "ශ්‍රම හිඟයට ගෝලීය විසඳුම්", text1: "Global Jobs Consulting යනු සම්පූර්ණ-සේවා බඳවා ගැනීමේ ආයතනයකි.", text2: "අපි සම්පූර්ණ ක්‍රියාවලිය හසුරුවමු.", cta: "අපගේ සේවාවන් සොයා ගන්න", years: "වසරවල පළපුරුද්ද" },
    advantages: [{ title: "ගෝලීය ජාලය", description: "හවුල්කාර ආයතන 11 හරහා ප්‍රවේශය." }, { title: "නීත්‍යානුකූල අනුකූලතාව", description: "සියලු නීතිමය ලේඛන කළමනාකරණය." }, { title: "වේගවත් ක්‍රියාවලිය", description: "තෝරාගත් අපේක්ෂකයින් ලබා දීම." }, { title: "අඛණ්ඩ සහාය", description: "දිගුකාලීන අධීක්ෂණය සහ සහාය." }],
    stats: { partners: "11+", partnersLabel: "ආසියාවේ සහ අප්‍රිකාවේ හවුල්කරුවන්", experience: "4", experienceLabel: "වසරවල පළපුරුද්ද", markets: "3", marketsLabel: "යුරෝපීය වෙළඳපොළ", candidates: "500+", candidatesLabel: "බඳවා ගත් අපේක්ෂකයින්" },
    markets: { label: "ආවරණය කරන වෙළඳපොළ", title: "රටවල් 3ක සේවා යෝජකයින්", romania: { name: "රොමේනියාව", desc: "රොමේනියානු සේවා යෝජකයින් සඳහා විසඳුම්.", link: "RO සඳහා විස්තර →" }, austria: { name: "ඔස්ට්‍රියාව", desc: "ඔස්ට්‍රියානු වෙළඳපොළ සඳහා සුදුසුකම් ලත් ශ්‍රම බලකාය.", link: "AT සඳහා විස්තර →" }, serbia: { name: "සර්බියාව", desc: "සර්බියානු සමාගම් සඳහා කාර්ය මණ්ඩල පිහිටුවීම.", link: "RS සඳහා විස්තර →" } },
    cta: { title: "අද බඳවා ගැනීම ආරම්භ කරන්න", description: "අපි උදව් කිරීමට මෙහි සිටිමු.", employer: "මම සේවා යෝජකයෙක්", candidate: "මම රැකියාවක් සොයමි" },
    hero: { headline: "යුරෝපීය සමාගම් සඳහා ජාත්‍යන්තර සේවකයින්", subheadline: "ආසියාවෙන් හා අප්‍රිකාවෙන් නීතිමය බඳවා ගැනීමේ විසඳුම්", cta1: "සේවකයින් ඉල්ලන්න", cta2: "තව දැනගන්න" }
  }
};

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const t = pageContent[validLocale] || pageContent.ro;
  const dict = await getDictionary(validLocale);
  const icons = [Globe, Shield, Clock, Users];

  // Helper to get locale-prefixed path
  const getPath = (path: string) => {
    if (validLocale === "ro") return path;
    return `/${validLocale}${path}`;
  };

  return (
    <div data-testid="home-page">
      {/* Hero Section Slider */}
      <HeroSlider 
        headline={t.hero.headline}
        subheadline={t.hero.subheadline}
        cta1={t.hero.cta1}
        cta2={t.hero.cta2}
        locale={validLocale}
      />

      {/* Stats Section */}
      <section className="py-12 bg-white border-b" data-testid="stats-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-coral mb-2">{t.stats.partners}</div>
              <div className="text-gray-600 text-sm">{t.stats.partnersLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-coral mb-2">{t.stats.experience}</div>
              <div className="text-gray-600 text-sm">{t.stats.experienceLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-coral mb-2">{t.stats.markets}</div>
              <div className="text-gray-600 text-sm">{t.stats.marketsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-coral mb-2">{t.stats.candidates}</div>
              <div className="text-gray-600 text-sm">{t.stats.candidatesLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white" data-testid="about-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image - Optimized WebP with lazy loading */}
            <div className="relative">
              <Image
                src="/images/optimized/about_team.webp"
                alt="Global Jobs Consulting Team"
                width={600}
                height={468}
                className="rounded-2xl shadow-lg w-full"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={80}
              />
              <div className="absolute -bottom-6 -right-6 bg-coral text-white p-6 rounded-2xl shadow-xl hidden md:block">
                <div className="text-4xl font-bold">4</div>
                <div className="text-white/80 text-sm">{t.about.years}</div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="text-coral font-semibold text-sm tracking-wider">
                {t.about.label}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                {t.about.title}
              </h2>
              <p className="text-xl text-amber-600 font-medium mb-6">
                {t.about.subtitle}
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t.about.text1}
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {t.about.text2}
              </p>

              {/* Advantages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {t.advantages.map((adv, index) => {
                  const Icon = icons[index];
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-coral/10 rounded-lg">
                        <Icon className="h-5 w-5 text-coral" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 text-sm">{adv.title}</h4>
                        <p className="text-gray-500 text-xs">{adv.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href={getPath("/about")}
                className="inline-flex items-center gap-2 bg-coral text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
                data-testid="about-cta"
              >
                {t.about.cta}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50" data-testid="industries-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900">Industrii</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[ "Construcții", "Agricultură", "HoReCa", "Producție", "Transport", "Curățenie", "Logistică", "IT", "Sănătate" ].map((ind, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-coral/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-coral" />
                </div>
                <h3 className="font-semibold text-navy-900">
                  {ind}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Markets */}
      <section className="py-20 bg-white" data-testid="markets-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-coral font-semibold text-sm tracking-wider">
              {t.markets.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mt-2">
              {t.markets.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Romania */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-romania">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-3xl">🇷🇴</span>
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-2">{t.markets.romania.name}</h3>
              <p className="text-gray-600 mb-4">{t.markets.romania.desc}</p>
              <Link href={getPath("/employers")} className="text-coral font-semibold text-sm hover:underline">
                {t.markets.romania.link}
              </Link>
            </div>

            {/* Austria */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-austria">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-3xl">🇦🇹</span>
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-2">{t.markets.austria.name}</h3>
              <p className="text-gray-600 mb-4">{t.markets.austria.desc}</p>
              <Link href={getPath("/employers")} className="text-coral font-semibold text-sm hover:underline">
                {t.markets.austria.link}
              </Link>
            </div>

            {/* Serbia */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-serbia">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-3xl">🇷🇸</span>
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-2">{t.markets.serbia.name}</h3>
              <p className="text-gray-600 mb-4">{t.markets.serbia.desc}</p>
              <Link href={getPath("/employers")} className="text-coral font-semibold text-sm hover:underline">
                {t.markets.serbia.link}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-navy-900 text-center relative overflow-hidden" data-testid="final-cta-section">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1920&auto=format')] bg-cover bg-center"></div>
        <div className="container mx-auto px-4 relative z-10 text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-10">
            Începe Colaborarea cu GJC Astăzi
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href={getPath("/request-workers")}
              className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-transform hover:scale-105 shadow-xl"
            >
              Solicită Muncitori
            </Link>
            <Link
              href={getPath("/register")}
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white text-navy-900 transition-colors shadow-lg"
            >
              Înregistrează-te Candidat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
