import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  FileText, Users, Plane, Building2, 
  ArrowRight, Clock, Shield, Headphones 
} from 'lucide-react';

const pageContent = {
  ro: {
    title: "Cum Funcționează",
    subtitle: "Procesul nostru de recrutare în 5 pași simpli",
    metaTitle: "Cum Funcționează | Global Jobs Consulting",
    metaDescription: "Descoperiți procesul nostru de recrutare internațională în 5 pași simpli. De la cerere la integrare.",
    steps: [
      {
        icon: FileText,
        title: "1. Trimiteți Cererea",
        description: "Completați formularul cu detalii despre necesarul de personal: număr de muncitori, industrie, calificări necesare.",
        duration: "1 zi"
      },
      {
        icon: Users,
        title: "2. Selecția Candidaților",
        description: "Echipa noastră selectează candidați potriviți din baza noastră de date cu peste 10.000 de profesioniști verificați.",
        duration: "1-2 săptămâni"
      },
      {
        icon: FileText,
        title: "3. Documentație & Vize",
        description: "Gestionăm toate procedurile legale: dosare IGI, vize de muncă, permise de ședere și contracte de muncă.",
        duration: "4-6 săptămâni"
      },
      {
        icon: Plane,
        title: "4. Transport & Sosire",
        description: "Organizăm transportul candidaților și îi preluăm la sosire pentru a asigura o tranziție fără probleme.",
        duration: "1 săptămână"
      },
      {
        icon: Building2,
        title: "5. Integrare & Suport",
        description: "Oferim suport continuu pentru integrarea în companie și comunitate pe toată durata contractului.",
        duration: "Continuu"
      }
    ],
    cta: "Începeți Acum",
    ctaSubtitle: "Completați formularul și vă contactăm în 24 de ore",
    features: [
      { icon: Clock, title: "Proces Rapid", desc: "4-8 săptămâni de la cerere la angajare" },
      { icon: Shield, title: "100% Legal", desc: "Conformitate completă cu legislația" },
      { icon: Headphones, title: "Suport 24/7", desc: "Echipă dedicată pentru orice problemă" }
    ]
  },
  en: {
    title: "How It Works",
    subtitle: "Our recruitment process in 5 simple steps",
    metaTitle: "How It Works | Global Jobs Consulting",
    metaDescription: "Discover our international recruitment process in 5 simple steps. From request to integration.",
    steps: [
      {
        icon: FileText,
        title: "1. Submit Request",
        description: "Fill out the form with details about your staffing needs: number of workers, industry, required qualifications.",
        duration: "1 day"
      },
      {
        icon: Users,
        title: "2. Candidate Selection",
        description: "Our team selects suitable candidates from our database of over 10,000 verified professionals.",
        duration: "1-2 weeks"
      },
      {
        icon: FileText,
        title: "3. Documentation & Visas",
        description: "We handle all legal procedures: IGI files, work visas, residence permits and employment contracts.",
        duration: "4-6 weeks"
      },
      {
        icon: Plane,
        title: "4. Transport & Arrival",
        description: "We organize candidate transportation and welcome them upon arrival for a smooth transition.",
        duration: "1 week"
      },
      {
        icon: Building2,
        title: "5. Integration & Support",
        description: "We provide ongoing support for company and community integration throughout the contract.",
        duration: "Ongoing"
      }
    ],
    cta: "Start Now",
    ctaSubtitle: "Fill out the form and we'll contact you within 24 hours",
    features: [
      { icon: Clock, title: "Fast Process", desc: "4-8 weeks from request to hire" },
      { icon: Shield, title: "100% Legal", desc: "Full compliance with legislation" },
      { icon: Headphones, title: "24/7 Support", desc: "Dedicated team for any issue" }
    ]
  },
  de: {
    title: "So Funktioniert's",
    subtitle: "Unser Rekrutierungsprozess in 5 einfachen Schritten",
    metaTitle: "So Funktioniert's | Global Jobs Consulting",
    metaDescription: "Entdecken Sie unseren internationalen Rekrutierungsprozess in 5 einfachen Schritten.",
    steps: [
      {
        icon: FileText,
        title: "1. Anfrage Senden",
        description: "Füllen Sie das Formular mit Details zu Ihrem Personalbedarf aus.",
        duration: "1 Tag"
      },
      {
        icon: Users,
        title: "2. Kandidatenauswahl",
        description: "Unser Team wählt passende Kandidaten aus unserer Datenbank mit über 10.000 geprüften Fachleuten.",
        duration: "1-2 Wochen"
      },
      {
        icon: FileText,
        title: "3. Dokumentation & Visa",
        description: "Wir kümmern uns um alle rechtlichen Verfahren: IGI-Akten, Arbeitsvisa, Aufenthaltsgenehmigungen.",
        duration: "4-6 Wochen"
      },
      {
        icon: Plane,
        title: "4. Transport & Ankunft",
        description: "Wir organisieren den Transport der Kandidaten und empfangen sie bei der Ankunft.",
        duration: "1 Woche"
      },
      {
        icon: Building2,
        title: "5. Integration & Support",
        description: "Wir bieten kontinuierliche Unterstützung für die Integration während der gesamten Vertragslaufzeit.",
        duration: "Laufend"
      }
    ],
    cta: "Jetzt Starten",
    ctaSubtitle: "Füllen Sie das Formular aus und wir kontaktieren Sie innerhalb von 24 Stunden",
    features: [
      { icon: Clock, title: "Schneller Prozess", desc: "4-8 Wochen von Anfrage bis Einstellung" },
      { icon: Shield, title: "100% Legal", desc: "Volle Gesetzeskonformität" },
      { icon: Headphones, title: "24/7 Support", desc: "Dediziertes Team für jedes Problem" }
    ]
  },
  sr: {
    title: "Kako Funkcioniše",
    subtitle: "Naš proces regrutacije u 5 jednostavnih koraka",
    metaTitle: "Kako Funkcioniše | Global Jobs Consulting",
    metaDescription: "Otkrijte naš međunarodni proces regrutacije u 5 jednostavnih koraka.",
    steps: [
      {
        icon: FileText,
        title: "1. Pošaljite Zahtev",
        description: "Popunite formular sa detaljima o vašim potrebama za kadrovima.",
        duration: "1 dan"
      },
      {
        icon: Users,
        title: "2. Izbor Kandidata",
        description: "Naš tim bira odgovarajuće kandidate iz naše baze podataka sa preko 10.000 proverenih profesionalaca.",
        duration: "1-2 nedelje"
      },
      {
        icon: FileText,
        title: "3. Dokumentacija & Vize",
        description: "Brinemo o svim pravnim postupcima: IGI dosijei, radne vize, dozvole boravka.",
        duration: "4-6 nedelja"
      },
      {
        icon: Plane,
        title: "4. Transport & Dolazak",
        description: "Organizujemo transport kandidata i dočekujemo ih po dolasku.",
        duration: "1 nedelja"
      },
      {
        icon: Building2,
        title: "5. Integracija & Podrška",
        description: "Pružamo kontinuiranu podršku za integraciju tokom celog ugovora.",
        duration: "Stalno"
      }
    ],
    cta: "Započnite Sada",
    ctaSubtitle: "Popunite formular i kontaktiraćemo vas u roku od 24 sata",
    features: [
      { icon: Clock, title: "Brz Proces", desc: "4-8 nedelja od zahteva do zapošljavanja" },
      { icon: Shield, title: "100% Legalno", desc: "Potpuna usklađenost sa zakonima" },
      { icon: Headphones, title: "24/7 Podrška", desc: "Posvećen tim za svaki problem" }
    ]
  },
  ne: {
    title: "कसरी काम गर्छ",
    subtitle: "हाम्रो भर्ती प्रक्रिया ५ सरल चरणहरूमा",
    metaTitle: "कसरी काम गर्छ | Global Jobs Consulting",
    metaDescription: "हाम्रो अन्तर्राष्ट्रिय भर्ती प्रक्रिया ५ सरल चरणहरूमा पत्ता लगाउनुहोस्।",
    steps: [
      { icon: FileText, title: "१. अनुरोध पेश गर्नुहोस्", description: "तपाईंको कर्मचारी आवश्यकताहरूको विवरण सहित फारम भर्नुहोस्।", duration: "१ दिन" },
      { icon: Users, title: "२. उम्मेदवार छनोट", description: "हाम्रो टोलीले १०,००० भन्दा बढी प्रमाणित पेशेवरहरूबाट उपयुक्त उम्मेदवारहरू छान्छ।", duration: "१-२ हप्ता" },
      { icon: FileText, title: "३. कागजात र भिसा", description: "हामी सबै कानूनी प्रक्रियाहरू सम्हाल्छौं: IGI फाइलहरू, कार्य भिसा, बसोबास अनुमति।", duration: "४-६ हप्ता" },
      { icon: Plane, title: "४. यातायात र आगमन", description: "हामी उम्मेदवार यातायात व्यवस्थापन गर्छौं र आगमनमा स्वागत गर्छौं।", duration: "१ हप्ता" },
      { icon: Building2, title: "५. एकीकरण र समर्थन", description: "हामी सम्पूर्ण अनुबंधभर एकीकरणको लागि निरन्तर समर्थन प्रदान गर्छौं।", duration: "निरन्तर" }
    ],
    cta: "अहिले सुरु गर्नुहोस्",
    ctaSubtitle: "फारम भर्नुहोस् र हामी २४ घण्टामा सम्पर्क गर्नेछौं",
    features: [
      { icon: Clock, title: "छिटो प्रक्रिया", desc: "अनुरोधदेखि भर्तीसम्म ४-८ हप्ता" },
      { icon: Shield, title: "१००% कानूनी", desc: "कानूनसँग पूर्ण अनुपालन" },
      { icon: Headphones, title: "२४/७ समर्थन", desc: "कुनै पनि समस्याको लागि समर्पित टोली" }
    ]
  },
  bn: {
    title: "কিভাবে কাজ করে",
    subtitle: "আমাদের নিয়োগ প্রক্রিয়া ৫টি সহজ ধাপে",
    metaTitle: "কিভাবে কাজ করে | Global Jobs Consulting",
    metaDescription: "৫টি সহজ ধাপে আমাদের আন্তর্জাতিক নিয়োগ প্রক্রিয়া আবিষ্কার করুন।",
    steps: [
      { icon: FileText, title: "১. অনুরোধ জমা দিন", description: "আপনার কর্মী প্রয়োজনের বিস্তারিত দিয়ে ফর্ম পূরণ করুন।", duration: "১ দিন" },
      { icon: Users, title: "২. প্রার্থী নির্বাচন", description: "আমাদের দল ১০,০০০+ যাচাইকৃত পেশাদারদের থেকে উপযুক্ত প্রার্থী নির্বাচন করে।", duration: "১-২ সপ্তাহ" },
      { icon: FileText, title: "৩. ডকুমেন্টেশন ও ভিসা", description: "আমরা সমস্ত আইনি প্রক্রিয়া পরিচালনা করি: IGI ফাইল, কাজের ভিসা, বসবাসের অনুমতি।", duration: "৪-৬ সপ্তাহ" },
      { icon: Plane, title: "৪. পরিবহন ও আগমন", description: "আমরা প্রার্থী পরিবহন সংগঠিত করি এবং আগমনে স্বাগত জানাই।", duration: "১ সপ্তাহ" },
      { icon: Building2, title: "৫. ইন্টিগ্রেশন ও সাপোর্ট", description: "আমরা পুরো চুক্তি জুড়ে ইন্টিগ্রেশনের জন্য চলমান সহায়তা প্রদান করি।", duration: "চলমান" }
    ],
    cta: "এখনই শুরু করুন",
    ctaSubtitle: "ফর্ম পূরণ করুন এবং আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব",
    features: [
      { icon: Clock, title: "দ্রুত প্রক্রিয়া", desc: "অনুরোধ থেকে নিয়োগ পর্যন্ত ৪-৮ সপ্তাহ" },
      { icon: Shield, title: "১০০% আইনি", desc: "আইনের সাথে সম্পূর্ণ সম্মতি" },
      { icon: Headphones, title: "২৪/৭ সাপোর্ট", desc: "যেকোনো সমস্যার জন্য নিবেদিত দল" }
    ]
  },
  hi: {
    title: "यह कैसे काम करता है",
    subtitle: "हमारी भर्ती प्रक्रिया 5 सरल चरणों में",
    metaTitle: "यह कैसे काम करता है | Global Jobs Consulting",
    metaDescription: "5 सरल चरणों में हमारी अंतर्राष्ट्रीय भर्ती प्रक्रिया जानें।",
    steps: [
      { icon: FileText, title: "1. अनुरोध जमा करें", description: "अपनी स्टाफिंग जरूरतों के विवरण के साथ फॉर्म भरें।", duration: "1 दिन" },
      { icon: Users, title: "2. उम्मीदवार चयन", description: "हमारी टीम 10,000+ सत्यापित पेशेवरों में से उपयुक्त उम्मीदवारों का चयन करती है।", duration: "1-2 सप्ताह" },
      { icon: FileText, title: "3. दस्तावेज़ीकरण और वीज़ा", description: "हम सभी कानूनी प्रक्रियाओं को संभालते हैं: IGI फ़ाइलें, कार्य वीज़ा, निवास परमिट।", duration: "4-6 सप्ताह" },
      { icon: Plane, title: "4. परिवहन और आगमन", description: "हम उम्मीदवार परिवहन व्यवस्थित करते हैं और आगमन पर स्वागत करते हैं।", duration: "1 सप्ताह" },
      { icon: Building2, title: "5. एकीकरण और समर्थन", description: "हम पूरे अनुबंध में एकीकरण के लिए निरंतर समर्थन प्रदान करते हैं।", duration: "जारी" }
    ],
    cta: "अभी शुरू करें",
    ctaSubtitle: "फॉर्म भरें और हम 24 घंटे में संपर्क करेंगे",
    features: [
      { icon: Clock, title: "तेज़ प्रक्रिया", desc: "अनुरोध से भर्ती तक 4-8 सप्ताह" },
      { icon: Shield, title: "100% कानूनी", desc: "कानून के साथ पूर्ण अनुपालन" },
      { icon: Headphones, title: "24/7 समर्थन", desc: "किसी भी समस्या के लिए समर्पित टीम" }
    ]
  },
  si: {
    title: "එය ක්‍රියා කරන ආකාරය",
    subtitle: "අපගේ බඳවා ගැනීමේ ක්‍රියාවලිය සරල පියවර 5කින්",
    metaTitle: "එය ක්‍රියා කරන ආකාරය | Global Jobs Consulting",
    metaDescription: "සරල පියවර 5කින් අපගේ ජාත්‍යන්තර බඳවා ගැනීමේ ක්‍රියාවලිය සොයා ගන්න.",
    steps: [
      { icon: FileText, title: "1. ඉල්ලීම ඉදිරිපත් කරන්න", description: "ඔබේ කාර්ය මණ්ඩල අවශ්‍යතා පිළිබඳ විස්තර සහිතව ෆෝරමය පුරවන්න.", duration: "දින 1" },
      { icon: Users, title: "2. අපේක්ෂක තේරීම", description: "අපගේ කණ්ඩායම සත්‍යාපිත වෘත්තිකයින් 10,000+ කින් සුදුසු අපේක්ෂකයින් තෝරා ගනී.", duration: "සති 1-2" },
      { icon: FileText, title: "3. ලේඛන සහ වීසා", description: "අපි සියලු නීතිමය ක්‍රියා පටිපාටි හසුරුවමු: IGI ගොනු, වැඩ වීසා, පදිංචි බලපත්‍ර.", duration: "සති 4-6" },
      { icon: Plane, title: "4. ප්‍රවාහනය සහ පැමිණීම", description: "අපි අපේක්ෂක ප්‍රවාහනය සංවිධානය කර පැමිණීමේදී පිළිගනිමු.", duration: "සතියක්" },
      { icon: Building2, title: "5. ඒකාබද්ධ කිරීම සහ සහාය", description: "අපි ගිවිසුම පුරාම ඒකාබද්ධ කිරීම සඳහා අඛණ්ඩ සහාය සපයමු.", duration: "අඛණ්ඩව" }
    ],
    cta: "දැන් ආරම්භ කරන්න",
    ctaSubtitle: "ෆෝරමය පුරවන්න, අපි පැය 24ක් ඇතුළත සම්බන්ධ වෙමු",
    features: [
      { icon: Clock, title: "වේගවත් ක්‍රියාවලිය", desc: "ඉල්ලීමේ සිට බඳවා ගැනීම දක්වා සති 4-8" },
      { icon: Shield, title: "100% නීත්‍යානුකූල", desc: "නීතිය සමඟ සම්පූර්ණ අනුකූලතාව" },
      { icon: Headphones, title: "24/7 සහාය", desc: "ඕනෑම ගැටලුවක් සඳහා කැපවූ කණ්ඩායම" }
    ]
  }
};

export default function HowItWorksPage() {
  const { language } = useLanguage();
  const t = pageContent[language || 'ro'] || pageContent.ro;

  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">{t.subtitle}</p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {t.steps.map((step, index) => (
                <div key={index} className="relative flex gap-6 mb-12 last:mb-0">
                  {/* Timeline line */}
                  {index < t.steps.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-coral/30" />
                  )}
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-coral rounded-full flex items-center justify-center z-10">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <Card className="flex-1 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-navy-900">{step.title}</h3>
                        <span className="text-sm bg-coral/10 text-coral px-3 py-1 rounded-full font-medium">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {t.features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-coral">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.cta}</h2>
            <p className="text-white/90 text-lg mb-8">{t.ctaSubtitle}</p>
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-coral hover:bg-gray-100 rounded-full px-8 font-semibold"
            >
              <Link to={language === 'ro' ? '/solicita-muncitori' : `/${language}/request-workers`}>
                {t.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
  );
}
