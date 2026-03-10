import { Helmet } from "react-helmet";
import HeroSlider from "@/components/HeroSlider";
import ServicesGrid from "@/components/ServicesGrid";
import ProcessSection from "@/components/ProcessSection";
import StatsSection from "@/components/StatsSection";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Shield, Clock, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

// Import new design system for homepage only
import "@/styles/gjc-homepage-new.css";

const pageContent = {
  ro: {
    meta: {
      title: "Global Jobs Consulting | Recrutare și Plasare Forță de Muncă Asia & Africa",
      description: "Agenție de recrutare All-Inclusive în România, Austria și Serbia. 11 parteneri în Asia și Africa."
    },
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
    }
  },
  en: {
    meta: {
      title: "Global Jobs Consulting | International Workforce Recruitment Asia & Africa",
      description: "All-Inclusive recruitment agency in Romania, Austria, and Serbia. 11 partners in Asia and Africa."
    },
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
    }
  },
  de: {
    meta: {
      title: "Global Jobs Consulting | Internationale Arbeitskräftevermittlung Asien & Afrika",
      description: "All-Inclusive-Rekrutierungsagentur in Rumänien, Österreich und Serbien. 11 Partner in Asien und Afrika."
    },
    about: {
      label: "Über uns",
      title: "Wir verbinden globale Talente mit lokalen Möglichkeiten",
      subtitle: "Globale Lösungen für den Arbeitskräftemangel",
      text1: "Global Jobs Consulting ist eine All-Inclusive-Rekrutierungsagentur, die sich auf die Vermittlung von Arbeitskräften aus Asien und Afrika in europäische Märkte spezialisiert hat. Mit einem Netzwerk von 11 Partneragenturen bieten wir vollständige Personallösungen für Arbeitgeber in Rumänien, Österreich und Serbien.",
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
    }
  },
  sr: {
    meta: {
      title: "Global Jobs Consulting | Međunarodna regrutacija radne snage Azija i Afrika",
      description: "Sveobuhvatna agencija za zapošljavanje u Rumuniji, Austriji i Srbiji. 11 partnera u Aziji i Africi."
    },
    about: {
      label: "O nama",
      title: "Povezujemo globalne talente sa lokalnim prilikama",
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
    }
  },
  ne: {
    meta: {
      title: "Global Jobs Consulting | अन्तर्राष्ट्रिय जनशक्ति भर्ती एशिया र अफ्रिका",
      description: "रोमानिया, अष्ट्रिया र सर्बियामा सर्वसमावेशी भर्ती एजेन्सी। एशिया र अफ्रिकामा ११ साझेदारहरू।"
    },
    about: {
      label: "हाम्रो बारेमा",
      title: "विश्वव्यापी प्रतिभालाई स्थानीय अवसरहरूसँग जोड्दै",
      subtitle: "श्रमिक अभावको लागि विश्वव्यापी समाधान",
      text1: "Global Jobs Consulting एक सर्वसमावेशी भर्ती एजेन्सी हो जुन एशिया र अफ्रिकाबाट युरोपेली बजारहरूमा कामदारहरू राख्नमा विशेषज्ञ छ। ११ साझेदार एजेन्सीहरूको नेटवर्कको साथ, हामी रोमानिया, अष्ट्रिया र सर्बियाका रोजगारदाताहरूलाई पूर्ण स्टाफिङ समाधानहरू प्रदान गर्छौं।",
      text2: "हामी सम्पूर्ण प्रक्रियाको हेरचाह गर्छौं: उम्मेदवारहरूको कडा छनोटदेखि, आप्रवासन कागजातहरू (भिसा र कार्य अनुमति), समुदायमा एकीकरण र दीर्घकालीन अनुगमनसम्म।",
      cta: "हाम्रा सेवाहरू पत्ता लगाउनुहोस्",
      years: "वर्षको अनुभव"
    },
    advantages: [
      { title: "विश्वव्यापी नेटवर्क", description: "हाम्रो ११ साझेदार एजेन्सीहरू मार्फत एशिया र अफ्रिकाका उम्मेदवारहरूमा पहुँच।" },
      { title: "कानूनी अनुपालन", description: "हामी सम्पूर्ण कानूनी कागजात व्यवस्थापन गर्छौं: भिसा, कार्य अनुमति र अधिकार।" },
      { title: "छिटो प्रक्रिया", description: "हामी छानिएका उम्मेदवारहरू सकेसम्म चाँडो पूर्ण सहयोगसहित प्रदान गर्छौं।" },
      { title: "निरन्तर सहयोग", description: "सफल एकीकरणको लागि दीर्घकालीन अनुगमन र सहायता।" }
    ],
    markets: {
      label: "कभर गरिएका बजारहरू",
      title: "३ देशका रोजगारदाताहरू",
      romania: { name: "रोमानिया", desc: "सबै औद्योगिक क्षेत्रहरूमा रोमानियाली रोजगारदाताहरूको लागि पूर्ण भर्ती समाधानहरू।", link: "RO को लागि विवरण →" },
      austria: { name: "अष्ट्रिया", desc: "आप्रवासन प्रक्रियामा पूर्ण सहयोगसहित अष्ट्रियाली बजारको लागि योग्य जनशक्ति।", link: "AT को लागि विवरण →" },
      serbia: { name: "सर्बिया", desc: "समर्पित कामदारहरू खोज्ने सर्बियाली कम्पनीहरूको लागि कर्मचारी प्लेसमेन्ट।", link: "RS को लागि विवरण →" }
    },
    cta: {
      title: "आज भर्ती सुरु गर्नुहोस्",
      description: "तपाईं कर्मचारी खोज्ने रोजगारदाता होस् वा अवसर खोज्ने उम्मेदवार, हामी मद्दत गर्न यहाँ छौं।",
      employer: "म रोजगारदाता हुँ",
      candidate: "म काम खोज्दै छु"
    }
  },
  bn: {
    meta: {
      title: "Global Jobs Consulting | আন্তর্জাতিক কর্মশক্তি নিয়োগ এশিয়া ও আফ্রিকা",
      description: "রোমানিয়া, অস্ট্রিয়া এবং সার্বিয়ায় সর্বসমাবেশী নিয়োগ সংস্থা। এশিয়া ও আফ্রিকায় ১১ অংশীদার।"
    },
    about: {
      label: "আমাদের সম্পর্কে",
      title: "বিশ্বব্যাপী প্রতিভাকে স্থানীয় সুযোগের সাথে সংযুক্ত করা",
      subtitle: "শ্রমিক সংকটের জন্য বিশ্বব্যাপী সমাধান",
      text1: "Global Jobs Consulting হল একটি সর্বসমাবেশী নিয়োগ সংস্থা যা এশিয়া এবং আফ্রিকা থেকে ইউরোপীয় বাজারে কর্মী নিয়োগে বিশেষজ্ঞ। ১১টি অংশীদার সংস্থার নেটওয়ার্ক সহ, আমরা রোমানিয়া, অস্ট্রিয়া এবং সার্বিয়ার নিয়োগকর্তাদের জন্য সম্পূর্ণ স্টাফিং সমাধান অফার করি।",
      text2: "আমরা সম্পূর্ণ প্রক্রিয়া পরিচালনা করি: প্রার্থীদের কঠোর নির্বাচন থেকে, অভিবাসন ডকুমেন্টেশন (ভিসা এবং কাজের অনুমতি), সম্প্রদায়ে একীভূতকরণ এবং দীর্ঘমেয়াদী পর্যবেক্ষণ পর্যন্ত।",
      cta: "আমাদের সেবা আবিষ্কার করুন",
      years: "বছরের অভিজ্ঞতা"
    },
    advantages: [
      { title: "গ্লোবাল নেটওয়ার্ক", description: "আমাদের ১১ অংশীদার সংস্থার মাধ্যমে এশিয়া ও আফ্রিকার প্রার্থীদের অ্যাক্সেস।" },
      { title: "আইনি সম্মতি", description: "আমরা সম্পূর্ণ আইনি ডকুমেন্টেশন পরিচালনা করি: ভিসা, কাজের অনুমতি এবং অনুমোদন।" },
      { title: "দ্রুত প্রক্রিয়া", description: "আমরা সম্পূর্ণ সহায়তা সহ যত তাড়াতাড়ি সম্ভব নির্বাচিত প্রার্থীদের সরবরাহ করি।" },
      { title: "চলমান সহায়তা", description: "সফল একীভূতকরণের জন্য দীর্ঘমেয়াদী পর্যবেক্ষণ এবং সহায়তা।" }
    ],
    markets: {
      label: "কভার করা বাজার",
      title: "৩ দেশের নিয়োগকর্তা",
      romania: { name: "রোমানিয়া", desc: "সমস্ত শিল্প খাতে রোমানিয়ান নিয়োগকর্তাদের জন্য সম্পূর্ণ নিয়োগ সমাধান।", link: "RO এর জন্য বিস্তারিত →" },
      austria: { name: "অস্ট্রিয়া", desc: "সম্পূর্ণ অভিবাসন প্রক্রিয়া সহায়তা সহ অস্ট্রিয়ান বাজারের জন্য যোগ্য কর্মশক্তি।", link: "AT এর জন্য বিস্তারিত →" },
      serbia: { name: "সার্বিয়া", desc: "নিবেদিত কর্মী খুঁজছেন সার্বিয়ান কোম্পানিগুলির জন্য কর্মী নিয়োগ।", link: "RS এর জন্য বিস্তারিত →" }
    },
    cta: {
      title: "আজই নিয়োগ শুরু করুন",
      description: "আপনি কর্মী খুঁজছেন এমন নিয়োগকর্তা হন বা সুযোগ খুঁজছেন এমন প্রার্থী, আমরা সাহায্য করতে এখানে আছি।",
      employer: "আমি একজন নিয়োগকর্তা",
      candidate: "আমি চাকরি খুঁজছি"
    }
  },
  hi: {
    meta: {
      title: "Global Jobs Consulting | अंतर्राष्ट्रीय कार्यबल भर्ती एशिया और अफ्रीका",
      description: "रोमानिया, ऑस्ट्रिया और सर्बिया में सर्वसमावेशी भर्ती एजेंसी। एशिया और अफ्रीका में 11 भागीदार।"
    },
    about: {
      label: "हमारे बारे में",
      title: "वैश्विक प्रतिभा को स्थानीय अवसरों से जोड़ना",
      subtitle: "कार्यबल की कमी के लिए वैश्विक समाधान",
      text1: "Global Jobs Consulting एक सर्वसमावेशी भर्ती एजेंसी है जो एशिया और अफ्रीका से यूरोपीय बाजारों में कार्यबल रखने में विशेषज्ञ है। 11 भागीदार एजेंसियों के नेटवर्क के साथ, हम रोमानिया, ऑस्ट्रिया और सर्बिया में नियोक्ताओं के लिए पूर्ण स्टाफिंग समाधान प्रदान करते हैं।",
      text2: "हम पूरी प्रक्रिया संभालते हैं: उम्मीदवारों के कठोर चयन से, आप्रवासन दस्तावेज़ीकरण (वीज़ा और कार्य परमिट), समुदाय एकीकरण और दीर्घकालिक निगरानी तक।",
      cta: "हमारी सेवाएं खोजें",
      years: "वर्षों का अनुभव"
    },
    advantages: [
      { title: "वैश्विक नेटवर्क", description: "हमारी 11 भागीदार एजेंसियों के माध्यम से एशिया और अफ्रीका के उम्मीदवारों तक पहुंच।" },
      { title: "कानूनी अनुपालन", description: "हम सभी कानूनी दस्तावेज़ीकरण का प्रबंधन करते हैं: वीज़ा, कार्य परमिट और प्राधिकरण।" },
      { title: "तेज़ प्रक्रिया", description: "हम पूर्ण समर्थन के साथ जितनी जल्दी हो सके चयनित उम्मीदवारों को वितरित करते हैं।" },
      { title: "निरंतर समर्थन", description: "सफल एकीकरण के लिए दीर्घकालिक निगरानी और सहायता।" }
    ],
    markets: {
      label: "कवर किए गए बाज़ार",
      title: "3 देशों के नियोक्ता",
      romania: { name: "रोमानिया", desc: "सभी औद्योगिक क्षेत्रों में रोमानियाई नियोक्ताओं के लिए पूर्ण भर्ती समाधान।", link: "RO के लिए विवरण →" },
      austria: { name: "ऑस्ट्रिया", desc: "पूर्ण आप्रवासन प्रक्रिया समर्थन के साथ ऑस्ट्रियाई बाज़ार के लिए योग्य कार्यबल।", link: "AT के लिए विवरण →" },
      serbia: { name: "सर्बिया", desc: "समर्पित कर्मचारियों की तलाश में सर्बियाई कंपनियों के लिए स्टाफ प्लेसमेंट।", link: "RS के लिए विवरण →" }
    },
    cta: {
      title: "आज ही भर्ती शुरू करें",
      description: "चाहे आप स्टाफ की तलाश में नियोक्ता हों या अवसर की तलाश में उम्मीदवार, हम मदद के लिए यहां हैं।",
      employer: "मैं एक नियोक्ता हूं",
      candidate: "मैं नौकरी ढूंढ रहा हूं"
    }
  },
  si: {
    meta: {
      title: "Global Jobs Consulting | ජාත්‍යන්තර ශ්‍රම බලකාය බඳවා ගැනීම ආසියාව සහ අප්‍රිකාව",
      description: "රොමේනියාව, ඔස්ට්‍රියාව සහ සර්බියාවේ සර්ව-ඇතුළත් බඳවා ගැනීමේ ආයතනය. ආසියාව සහ අප්‍රිකාවේ හවුල්කරුවන් 11ක්."
    },
    about: {
      label: "අප ගැන",
      title: "ගෝලීය දක්ෂතාවය ප්‍රාදේශීය අවස්ථා සමඟ සම්බන්ධ කිරීම",
      subtitle: "ශ්‍රම හිඟයට ගෝලීය විසඳුම්",
      text1: "Global Jobs Consulting යනු ආසියාවෙන් සහ අප්‍රිකාවෙන් යුරෝපීය වෙළඳපොළවල් සඳහා ශ්‍රම බලකාය තැබීමට විශේෂඥ වූ සර්ව-ඇතුළත් බඳවා ගැනීමේ ආයතනයකි. හවුල්කාර ආයතන 11ක ජාලයක් සමඟ, අපි රොමේනියාව, ඔස්ට්‍රියාව සහ සර්බියාවේ සේවා යෝජකයින් සඳහා සම්පූර්ණ කාර්ය මණ්ඩල විසඳුම් ඉදිරිපත් කරමු.",
      text2: "අපි සම්පූර්ණ ක්‍රියාවලිය හසුරුවමු: අපේක්ෂකයින්ගේ දැඩි තේරීමෙන්, ආගමන ලේඛන (වීසා සහ වැඩ බලපත්‍ර), ප්‍රජා ඒකාබද්ධතාව සහ දිගුකාලීන අධීක්ෂණය දක්වා.",
      cta: "අපගේ සේවාවන් සොයා ගන්න",
      years: "වසරවල පළපුරුද්ද"
    },
    advantages: [
      { title: "ගෝලීය ජාලය", description: "අපගේ හවුල්කාර ආයතන 11 හරහා ආසියාව සහ අප්‍රිකාවේ අපේක්ෂකයින්ට ප්‍රවේශය." },
      { title: "නීත්‍යානුකූල අනුකූලතාව", description: "අපි සියලු නීතිමය ලේඛන කළමනාකරණය කරමු: වීසා, වැඩ බලපත්‍ර සහ අවසර." },
      { title: "වේගවත් ක්‍රියාවලිය", description: "අපි සම්පූර්ණ සහාය සමඟ හැකි ඉක්මනින් තෝරාගත් අපේක්ෂකයින් ලබා දෙමු." },
      { title: "අඛණ්ඩ සහාය", description: "සාර්ථක ඒකාබද්ධතාව සඳහා දිගුකාලීන අධීක්ෂණය සහ සහාය." }
    ],
    markets: {
      label: "ආවරණය කරන වෙළඳපොළ",
      title: "රටවල් 3ක සේවා යෝජකයින්",
      romania: { name: "රොමේනියාව", desc: "සියලුම කාර්මික අංශවල රොමේනියානු සේවා යෝජකයින් සඳහා සම්පූර්ණ බඳවා ගැනීමේ විසඳුම්.", link: "RO සඳහා විස්තර →" },
      austria: { name: "ඔස්ට්‍රියාව", desc: "සම්පූර්ණ ආගමන ක්‍රියාවලි සහාය සමඟ ඔස්ට්‍රියානු වෙළඳපොළ සඳහා සුදුසුකම් ලත් ශ්‍රම බලකාය.", link: "AT සඳහා විස්තර →" },
      serbia: { name: "සර්බියාව", desc: "කැපවූ සේවකයින් සොයන සර්බියානු සමාගම් සඳහා කාර්ය මණ්ඩල පිහිටුවීම.", link: "RS සඳහා විස්තර →" }
    },
    cta: {
      title: "අද බඳවා ගැනීම ආරම්භ කරන්න",
      description: "ඔබ කාර්ය මණ්ඩලය සොයන සේවා යෝජකයෙක් හෝ අවස්ථාවක් සොයන අපේක්ෂකයෙක් වුවද, අපි උදව් කිරීමට මෙහි සිටිමු.",
      employer: "මම සේවා යෝජකයෙක්",
      candidate: "මම රැකියාවක් සොයමි"
    }
  }
};

export default function HomePage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = pageContent[language] || pageContent.ro;
  const icons = [Globe, Shield, Clock, Users];

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />
      <Helmet>
        <meta name="keywords" content="recrutare, forța de muncă, Asia, Africa, România, Austria, Serbia, HoReCa, construcții, agricultură" />
      </Helmet>

      <div data-testid="home-page">
        {/* Hero Slider */}
        <HeroSlider />

        {/* About Section */}
        <section className="py-20 bg-white" data-testid="about-section">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative">
                <img
                  src="https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/zeb6mv7z_poza%20pt%20talente%20globale%20afaceri%20locale.png"
                  alt="Global Jobs Consulting Team"
                  className="rounded-2xl shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-coral text-white p-6 rounded-2xl shadow-xl hidden md:block">
                  <div className="font-heading text-4xl font-bold">4</div>
                  <div className="text-white/80 text-sm">{t.about.years}</div>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="text-coral font-semibold text-sm tracking-wider">
                  {t.about.label}
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                  {t.about.title}
                </h2>
                <p className="text-xl text-gold font-medium mb-6">
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
                  to={getLocalizedPath("/servicii")}
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

        {/* Stats Section */}
        <StatsSection />

        {/* Services Grid */}
        <ServicesGrid />

        {/* Process Section */}
        <ProcessSection />

        {/* Target Markets */}
        <section className="py-20 bg-gray-50" data-testid="markets-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-coral font-semibold text-sm tracking-wider">
                {t.markets.label}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                {t.markets.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Romania */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-romania">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-3xl">🇷🇴</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.markets.romania.name}</h3>
                <p className="text-gray-600 mb-4">{t.markets.romania.desc}</p>
                <Link to={getLocalizedPath("/angajatori")} className="text-coral font-semibold text-sm hover:underline">
                  {t.markets.romania.link}
                </Link>
              </div>

              {/* Austria */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-austria">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-3xl">🇦🇹</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.markets.austria.name}</h3>
                <p className="text-gray-600 mb-4">{t.markets.austria.desc}</p>
                <Link to={getLocalizedPath("/angajatori")} className="text-coral font-semibold text-sm hover:underline">
                  {t.markets.austria.link}
                </Link>
              </div>

              {/* Serbia */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-coral/30 transition-all" data-testid="market-serbia">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-3xl">🇷🇸</span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.markets.serbia.name}</h3>
                <p className="text-gray-600 mb-4">{t.markets.serbia.desc}</p>
                <Link to={getLocalizedPath("/angajatori")} className="text-coral font-semibold text-sm hover:underline">
                  {t.markets.serbia.link}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-navy-900 to-navy-800 relative overflow-hidden" data-testid="final-cta-section">
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                {t.cta.title}
              </h2>
              <p className="text-navy-200 text-lg mb-8">
                {t.cta.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to={getLocalizedPath("/angajatori")}
                  className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg"
                  data-testid="final-cta-employer"
                >
                  {t.cta.employer}
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to={getLocalizedPath("/candidati")}
                  className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
                  data-testid="final-cta-candidate"
                >
                  {t.cta.candidate}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
