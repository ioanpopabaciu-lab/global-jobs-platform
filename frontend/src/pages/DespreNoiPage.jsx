import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Compass, TrendingUp, Users, Globe, Shield, Scale, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { 
      title: "Despre Noi | Global Jobs Consulting", 
      description: "La Global Jobs Consulting, misiunea noastră este să facilităm mobilitatea legală, sigură și transparentă a forței de muncă și a studenților internaționali către România." 
    },
    hero: {
      label: "Despre Global Jobs Consulting",
      title: "Partenerul Tău Strategic pentru Mobilitatea Internațională a Forței de Muncă",
      description: "Cu sediul în Oradea, România, suntem o agenție de recrutare all-inclusive specializată în plasarea forței de muncă din Asia și Africa în piețele europene."
    },
    mission: {
      label: "Misiunea Noastră",
      title: "Facilităm Mobilitatea Legală și Sigură",
      text: "La Global Jobs Consulting, misiunea noastră este să facilităm mobilitatea legală, sigură și transparentă a forței de muncă și a studenților internaționali către România, contribuind activ la dezvoltarea mediului economic și la integrarea responsabilă a cetățenilor non-UE.",
      points: [
        "Conformitate 100% cu legislația în vigoare",
        "Transparență totală în procesul de recrutare",
        "Suport complet pentru integrare"
      ]
    },
    purpose: {
      label: "Scopul Nostru",
      title: "Un Partener Strategic de Încredere",
      text: "Scopul nostru este să devenim un partener strategic de încredere pentru toți actorii implicați în procesul de mobilitate internațională a forței de muncă:",
      targets: [
        { icon: "building", title: "Companiile Românești", description: "Care se confruntă cu deficit de personal și au nevoie de soluții rapide și legale" },
        { icon: "graduation", title: "Studenții Internaționali", description: "Care aleg România pentru educație și vor să construiască o carieră aici" },
        { icon: "briefcase", title: "Lucrătorii Non-UE", description: "Care doresc stabilitate profesională și un viitor mai bun în Europa" },
        { icon: "heart", title: "Familiile", description: "Care urmăresc reunificarea și integrarea legală în România" }
      ]
    },
    objectives: {
      label: "Obiective Strategice",
      title: "Viziunea Noastră pentru Viitor",
      items: [
        { number: "01", title: "Conformitate Legală", description: "Creșterea gradului de conformitate legală în recrutarea internațională, eliminând practicile neconforme" },
        { number: "02", title: "Eficiență Procesare", description: "Reducerea timpilor de procesare prin gestionarea corectă și completă a documentației" },
        { number: "03", title: "Ecosistem Integrat", description: "Crearea unui ecosistem integrat de servicii pentru migranți și angajatori, de la recrutare la integrare" },
        { number: "04", title: "Digitalizare", description: "Digitalizarea proceselor pentru acces rapid și transparent la informații și servicii" },
        { number: "05", title: "Rețea Internațională", description: "Dezvoltarea unei rețele internaționale de parteneri în Asia și UE pentru acces la cei mai buni candidați" }
      ]
    },
    stats: {
      partners: { value: "11+", label: "Parteneri în Asia & Africa" },
      experience: { value: "4+", label: "Ani de Experiență" },
      countries: { value: "3", label: "Piețe Europene" },
      candidates: { value: "500+", label: "Candidați Plasați" }
    },
    cta: {
      title: "Pregătit să Începi?",
      description: "Contactează-ne pentru o consultație gratuită și descoperă cum te putem ajuta.",
      buttonEmployer: "Sunt Angajator",
      buttonCandidate: "Sunt Candidat"
    }
  },
  en: {
    meta: { 
      title: "About Us | Global Jobs Consulting", 
      description: "At Global Jobs Consulting, our mission is to facilitate legal, safe and transparent mobility of workforce and international students to Romania." 
    },
    hero: {
      label: "About Global Jobs Consulting",
      title: "Your Strategic Partner for International Workforce Mobility",
      description: "Based in Oradea, Romania, we are an all-inclusive recruitment agency specialized in placing workforce from Asia and Africa in European markets."
    },
    mission: {
      label: "Our Mission",
      title: "Facilitating Legal and Safe Mobility",
      text: "At Global Jobs Consulting, our mission is to facilitate legal, safe and transparent mobility of workforce and international students to Romania, actively contributing to economic development and responsible integration of non-EU citizens.",
      points: [
        "100% compliance with current legislation",
        "Total transparency in the recruitment process",
        "Complete support for integration"
      ]
    },
    purpose: {
      label: "Our Purpose",
      title: "A Trusted Strategic Partner",
      text: "Our purpose is to become a trusted strategic partner for all actors involved in the international workforce mobility process:",
      targets: [
        { icon: "building", title: "Romanian Companies", description: "Facing staff shortages and needing fast and legal solutions" },
        { icon: "graduation", title: "International Students", description: "Choosing Romania for education and wanting to build a career here" },
        { icon: "briefcase", title: "Non-EU Workers", description: "Seeking professional stability and a better future in Europe" },
        { icon: "heart", title: "Families", description: "Pursuing reunification and legal integration in Romania" }
      ]
    },
    objectives: {
      label: "Strategic Objectives",
      title: "Our Vision for the Future",
      items: [
        { number: "01", title: "Legal Compliance", description: "Increasing legal compliance in international recruitment, eliminating non-compliant practices" },
        { number: "02", title: "Processing Efficiency", description: "Reducing processing times through correct and complete documentation management" },
        { number: "03", title: "Integrated Ecosystem", description: "Creating an integrated service ecosystem for migrants and employers, from recruitment to integration" },
        { number: "04", title: "Digitalization", description: "Digitalizing processes for quick and transparent access to information and services" },
        { number: "05", title: "International Network", description: "Developing an international network of partners in Asia and EU for access to the best candidates" }
      ]
    },
    stats: {
      partners: { value: "11+", label: "Partners in Asia & Africa" },
      experience: { value: "4+", label: "Years of Experience" },
      countries: { value: "3", label: "European Markets" },
      candidates: { value: "500+", label: "Candidates Placed" }
    },
    cta: {
      title: "Ready to Start?",
      description: "Contact us for a free consultation and discover how we can help you.",
      buttonEmployer: "I'm an Employer",
      buttonCandidate: "I'm a Candidate"
    }
  },
  de: {
    meta: { 
      title: "Über Uns | Global Jobs Consulting", 
      description: "Bei Global Jobs Consulting ist es unsere Mission, die legale, sichere und transparente Mobilität von Arbeitskräften und internationalen Studenten nach Rumänien zu erleichtern." 
    },
    hero: {
      label: "Über Global Jobs Consulting",
      title: "Ihr Strategischer Partner für Internationale Arbeitskräftemobilität",
      description: "Mit Sitz in Oradea, Rumänien, sind wir eine All-Inclusive-Recruiting-Agentur, die sich auf die Vermittlung von Arbeitskräften aus Asien und Afrika in europäische Märkte spezialisiert hat."
    },
    mission: {
      label: "Unsere Mission",
      title: "Legale und Sichere Mobilität Ermöglichen",
      text: "Bei Global Jobs Consulting ist es unsere Mission, die legale, sichere und transparente Mobilität von Arbeitskräften und internationalen Studenten nach Rumänien zu erleichtern und aktiv zur wirtschaftlichen Entwicklung und verantwortungsvollen Integration von Nicht-EU-Bürgern beizutragen.",
      points: [
        "100% Konformität mit geltendem Recht",
        "Totale Transparenz im Rekrutierungsprozess",
        "Vollständige Unterstützung bei der Integration"
      ]
    },
    purpose: {
      label: "Unser Zweck",
      title: "Ein Vertrauenswürdiger Strategischer Partner",
      text: "Unser Zweck ist es, ein vertrauenswürdiger strategischer Partner für alle Akteure im internationalen Arbeitskräftemobilitätsprozess zu werden:",
      targets: [
        { icon: "building", title: "Rumänische Unternehmen", description: "Die mit Personalmangel konfrontiert sind und schnelle und legale Lösungen brauchen" },
        { icon: "graduation", title: "Internationale Studenten", description: "Die Rumänien für ihre Ausbildung wählen und hier eine Karriere aufbauen möchten" },
        { icon: "briefcase", title: "Nicht-EU-Arbeiter", description: "Die berufliche Stabilität und eine bessere Zukunft in Europa suchen" },
        { icon: "heart", title: "Familien", description: "Die Familienzusammenführung und legale Integration in Rumänien anstreben" }
      ]
    },
    objectives: {
      label: "Strategische Ziele",
      title: "Unsere Vision für die Zukunft",
      items: [
        { number: "01", title: "Rechtliche Konformität", description: "Erhöhung der rechtlichen Konformität bei der internationalen Rekrutierung" },
        { number: "02", title: "Verarbeitungseffizienz", description: "Reduzierung der Bearbeitungszeiten durch korrekte Dokumentenverwaltung" },
        { number: "03", title: "Integriertes Ökosystem", description: "Schaffung eines integrierten Dienstleistungsökosystems für Migranten und Arbeitgeber" },
        { number: "04", title: "Digitalisierung", description: "Digitalisierung der Prozesse für schnellen und transparenten Zugang" },
        { number: "05", title: "Internationales Netzwerk", description: "Entwicklung eines internationalen Partnernetzwerks in Asien und der EU" }
      ]
    },
    stats: {
      partners: { value: "11+", label: "Partner in Asien & Afrika" },
      experience: { value: "4+", label: "Jahre Erfahrung" },
      countries: { value: "3", label: "Europäische Märkte" },
      candidates: { value: "500+", label: "Vermittelte Kandidaten" }
    },
    cta: {
      title: "Bereit zu Starten?",
      description: "Kontaktieren Sie uns für eine kostenlose Beratung.",
      buttonEmployer: "Ich bin Arbeitgeber",
      buttonCandidate: "Ich bin Kandidat"
    }
  },
  sr: {
    meta: { 
      title: "O Nama | Global Jobs Consulting", 
      description: "U Global Jobs Consulting, naša misija je da olakšamo legalnu, sigurnu i transparentnu mobilnost radne snage i međunarodnih studenata u Rumuniju." 
    },
    hero: {
      label: "O Global Jobs Consulting",
      title: "Vaš Strateški Partner za Međunarodnu Mobilnost Radne Snage",
      description: "Sa sedištem u Oradei, Rumunija, mi smo sveobuhvatna agencija za zapošljavanje specijalizovana za plasiranje radne snage iz Azije i Afrike na evropska tržišta."
    },
    mission: {
      label: "Naša Misija",
      title: "Olakšavamo Legalnu i Sigurnu Mobilnost",
      text: "U Global Jobs Consulting, naša misija je da olakšamo legalnu, sigurnu i transparentnu mobilnost radne snage i međunarodnih studenata u Rumuniju, aktivno doprinoseći ekonomskom razvoju i odgovornoj integraciji državljana koji nisu iz EU.",
      points: [
        "100% usklađenost sa važećim zakonodavstvom",
        "Potpuna transparentnost u procesu regrutacije",
        "Kompletna podrška za integraciju"
      ]
    },
    purpose: {
      label: "Naš Cilj",
      title: "Pouzdan Strateški Partner",
      text: "Naš cilj je da postanemo pouzdan strateški partner za sve aktere uključene u proces međunarodne mobilnosti radne snage:",
      targets: [
        { icon: "building", title: "Rumunske Kompanije", description: "Koje se suočavaju sa nedostatkom osoblja i trebaju brza i legalna rešenja" },
        { icon: "graduation", title: "Međunarodni Studenti", description: "Koji biraju Rumuniju za obrazovanje i žele da izgrade karijeru ovde" },
        { icon: "briefcase", title: "Radnici van EU", description: "Koji traže profesionalnu stabilnost i bolju budućnost u Evropi" },
        { icon: "heart", title: "Porodice", description: "Koje teže spajanju porodice i legalnoj integraciji u Rumuniji" }
      ]
    },
    objectives: {
      label: "Strateški Ciljevi",
      title: "Naša Vizija za Budućnost",
      items: [
        { number: "01", title: "Pravna Usklađenost", description: "Povećanje pravne usklađenosti u međunarodnoj regrutaciji" },
        { number: "02", title: "Efikasnost Obrade", description: "Smanjenje vremena obrade kroz pravilno upravljanje dokumentacijom" },
        { number: "03", title: "Integrisani Ekosistem", description: "Kreiranje integrisanog ekosistema usluga za migrante i poslodavce" },
        { number: "04", title: "Digitalizacija", description: "Digitalizacija procesa za brz i transparentan pristup" },
        { number: "05", title: "Međunarodna Mreža", description: "Razvoj međunarodne mreže partnera u Aziji i EU" }
      ]
    },
    stats: {
      partners: { value: "11+", label: "Partneri u Aziji i Africi" },
      experience: { value: "4+", label: "Godina Iskustva" },
      countries: { value: "3", label: "Evropska Tržišta" },
      candidates: { value: "500+", label: "Plasiranih Kandidata" }
    },
    cta: {
      title: "Spremni za Početak?",
      description: "Kontaktirajte nas za besplatnu konsultaciju.",
      buttonEmployer: "Ja sam Poslodavac",
      buttonCandidate: "Ja sam Kandidat"
    }
  },
  ne: {
    meta: { 
      title: "हाम्रो बारेमा | Global Jobs Consulting", 
      description: "Global Jobs Consulting मा, हाम्रो मिशन भनेको कार्यबल र अन्तर्राष्ट्रिय विद्यार्थीहरूको कानूनी, सुरक्षित र पारदर्शी गतिशीलता रोमानियामा सहज बनाउनु हो।" 
    },
    hero: {
      label: "Global Jobs Consulting बारे",
      title: "अन्तर्राष्ट्रिय कार्यबल गतिशीलताको लागि तपाईंको रणनीतिक साझेदार",
      description: "रोमानियाको ओराडियामा अवस्थित, हामी एशिया र अफ्रिकाबाट युरोपेली बजारहरूमा कार्यबल राख्नमा विशेषज्ञ सर्व-समावेशी भर्ती एजेन्सी हौं।"
    },
    mission: {
      label: "हाम्रो मिशन",
      title: "कानूनी र सुरक्षित गतिशीलता सहज बनाउने",
      text: "Global Jobs Consulting मा, हाम्रो मिशन भनेको कार्यबल र अन्तर्राष्ट्रिय विद्यार्थीहरूको कानूनी, सुरक्षित र पारदर्शी गतिशीलता रोमानियामा सहज बनाउनु हो, आर्थिक विकास र गैर-EU नागरिकहरूको जिम्मेवार एकीकरणमा सक्रिय योगदान पुर्‍याउनु हो।",
      points: [
        "वर्तमान कानूनसँग १००% अनुपालन",
        "भर्ती प्रक्रियामा पूर्ण पारदर्शिता",
        "एकीकरणको लागि पूर्ण समर्थन"
      ]
    },
    purpose: {
      label: "हाम्रो उद्देश्य",
      title: "एक विश्वसनीय रणनीतिक साझेदार",
      text: "हाम्रो उद्देश्य भनेको अन्तर्राष्ट्रिय कार्यबल गतिशीलता प्रक्रियामा संलग्न सबै पक्षहरूको लागि विश्वसनीय रणनीतिक साझेदार बन्नु हो:",
      targets: [
        { icon: "building", title: "रोमानियाली कम्पनीहरू", description: "कर्मचारी अभाव सामना गर्ने र छिटो र कानूनी समाधान चाहिने" },
        { icon: "graduation", title: "अन्तर्राष्ट्रिय विद्यार्थीहरू", description: "शिक्षाको लागि रोमानिया छान्ने र यहाँ करियर बनाउन चाहने" },
        { icon: "briefcase", title: "गैर-EU कामदारहरू", description: "युरोपमा व्यावसायिक स्थिरता र राम्रो भविष्य खोज्ने" },
        { icon: "heart", title: "परिवारहरू", description: "रोमानियामा पुनर्मिलन र कानूनी एकीकरण खोज्ने" }
      ]
    },
    objectives: {
      label: "रणनीतिक उद्देश्यहरू",
      title: "भविष्यको लागि हाम्रो दृष्टिकोण",
      items: [
        { number: "०१", title: "कानूनी अनुपालन", description: "अन्तर्राष्ट्रिय भर्तीमा कानूनी अनुपालन बढाउने" },
        { number: "०२", title: "प्रशोधन दक्षता", description: "सही कागजात व्यवस्थापन मार्फत प्रशोधन समय घटाउने" },
        { number: "०३", title: "एकीकृत इकोसिस्टम", description: "आप्रवासी र रोजगारदाताहरूको लागि एकीकृत सेवा इकोसिस्टम सिर्जना गर्ने" },
        { number: "०४", title: "डिजिटलाइजेसन", description: "छिटो र पारदर्शी पहुँचको लागि प्रक्रियाहरू डिजिटलाइज गर्ने" },
        { number: "०५", title: "अन्तर्राष्ट्रिय नेटवर्क", description: "एशिया र EU मा अन्तर्राष्ट्रिय साझेदार नेटवर्क विकास गर्ने" }
      ]
    },
    stats: {
      partners: { value: "११+", label: "एशिया र अफ्रिकामा साझेदारहरू" },
      experience: { value: "४+", label: "वर्षको अनुभव" },
      countries: { value: "३", label: "युरोपेली बजारहरू" },
      candidates: { value: "५००+", label: "राखिएका उम्मेदवारहरू" }
    },
    cta: {
      title: "सुरु गर्न तयार?",
      description: "नि:शुल्क परामर्शको लागि हामीलाई सम्पर्क गर्नुहोस्।",
      buttonEmployer: "म रोजगारदाता हुँ",
      buttonCandidate: "म उम्मेदवार हुँ"
    }
  },
  bn: {
    meta: { 
      title: "আমাদের সম্পর্কে | Global Jobs Consulting", 
      description: "Global Jobs Consulting-এ, আমাদের মিশন হল রোমানিয়ায় কর্মশক্তি এবং আন্তর্জাতিক শিক্ষার্থীদের আইনি, নিরাপদ এবং স্বচ্ছ গতিশীলতা সহজতর করা।" 
    },
    hero: {
      label: "Global Jobs Consulting সম্পর্কে",
      title: "আন্তর্জাতিক কর্মশক্তি গতিশীলতার জন্য আপনার কৌশলগত অংশীদার",
      description: "রোমানিয়ার ওরাডিয়ায় অবস্থিত, আমরা এশিয়া এবং আফ্রিকা থেকে ইউরোপীয় বাজারে কর্মশক্তি স্থাপনে বিশেষজ্ঞ একটি সর্ব-অন্তর্ভুক্ত নিয়োগ সংস্থা।"
    },
    mission: {
      label: "আমাদের মিশন",
      title: "আইনি এবং নিরাপদ গতিশীলতা সহজতর করা",
      text: "Global Jobs Consulting-এ, আমাদের মিশন হল রোমানিয়ায় কর্মশক্তি এবং আন্তর্জাতিক শিক্ষার্থীদের আইনি, নিরাপদ এবং স্বচ্ছ গতিশীলতা সহজতর করা, অর্থনৈতিক উন্নয়ন এবং অ-EU নাগরিকদের দায়িত্বশীল একীকরণে সক্রিয়ভাবে অবদান রাখা।",
      points: [
        "বর্তমান আইনের সাথে ১০০% সম্মতি",
        "নিয়োগ প্রক্রিয়ায় সম্পূর্ণ স্বচ্ছতা",
        "একীকরণের জন্য সম্পূর্ণ সমর্থন"
      ]
    },
    purpose: {
      label: "আমাদের উদ্দেশ্য",
      title: "একজন বিশ্বস্ত কৌশলগত অংশীদার",
      text: "আমাদের উদ্দেশ্য হল আন্তর্জাতিক কর্মশক্তি গতিশীলতা প্রক্রিয়ায় জড়িত সকল অংশীদারদের জন্য একজন বিশ্বস্ত কৌশলগত অংশীদার হওয়া:",
      targets: [
        { icon: "building", title: "রোমানিয়ান কোম্পানি", description: "কর্মী সংকটের সম্মুখীন এবং দ্রুত ও আইনি সমাধান প্রয়োজন" },
        { icon: "graduation", title: "আন্তর্জাতিক শিক্ষার্থী", description: "শিক্ষার জন্য রোমানিয়া বেছে নেওয়া এবং এখানে ক্যারিয়ার গড়তে চাওয়া" },
        { icon: "briefcase", title: "অ-EU কর্মী", description: "ইউরোপে পেশাদার স্থিতিশীলতা এবং একটি ভালো ভবিষ্যত খোঁজা" },
        { icon: "heart", title: "পরিবার", description: "রোমানিয়ায় পুনর্মিলন এবং আইনি একীকরণ অনুসরণ করা" }
      ]
    },
    objectives: {
      label: "কৌশলগত উদ্দেশ্য",
      title: "ভবিষ্যতের জন্য আমাদের দৃষ্টিভঙ্গি",
      items: [
        { number: "০১", title: "আইনি সম্মতি", description: "আন্তর্জাতিক নিয়োগে আইনি সম্মতি বাড়ানো" },
        { number: "০২", title: "প্রক্রিয়াকরণ দক্ষতা", description: "সঠিক ডকুমেন্ট ব্যবস্থাপনার মাধ্যমে প্রক্রিয়াকরণ সময় হ্রাস" },
        { number: "০৩", title: "সমন্বিত ইকোসিস্টেম", description: "অভিবাসী এবং নিয়োগকর্তাদের জন্য একটি সমন্বিত পরিষেবা ইকোসিস্টেম তৈরি" },
        { number: "০৪", title: "ডিজিটালাইজেশন", description: "দ্রুত এবং স্বচ্ছ অ্যাক্সেসের জন্য প্রক্রিয়া ডিজিটালাইজ করা" },
        { number: "০৫", title: "আন্তর্জাতিক নেটওয়ার্ক", description: "এশিয়া এবং EU-তে আন্তর্জাতিক অংশীদার নেটওয়ার্ক বিকাশ" }
      ]
    },
    stats: {
      partners: { value: "১১+", label: "এশিয়া ও আফ্রিকায় অংশীদার" },
      experience: { value: "৪+", label: "বছরের অভিজ্ঞতা" },
      countries: { value: "৩", label: "ইউরোপীয় বাজার" },
      candidates: { value: "৫০০+", label: "নিযুক্ত প্রার্থী" }
    },
    cta: {
      title: "শুরু করতে প্রস্তুত?",
      description: "বিনামূল্যে পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।",
      buttonEmployer: "আমি একজন নিয়োগকর্তা",
      buttonCandidate: "আমি একজন প্রার্থী"
    }
  },
  hi: {
    meta: { 
      title: "हमारे बारे में | Global Jobs Consulting", 
      description: "Global Jobs Consulting में, हमारा मिशन रोमानिया में कार्यबल और अंतर्राष्ट्रीय छात्रों की कानूनी, सुरक्षित और पारदर्शी गतिशीलता को सुविधाजनक बनाना है।" 
    },
    hero: {
      label: "Global Jobs Consulting के बारे में",
      title: "अंतर्राष्ट्रीय कार्यबल गतिशीलता के लिए आपका रणनीतिक भागीदार",
      description: "रोमानिया के ओरादेया में स्थित, हम एशिया और अफ्रीका से यूरोपीय बाजारों में कार्यबल रखने में विशेषज्ञ एक सर्व-समावेशी भर्ती एजेंसी हैं।"
    },
    mission: {
      label: "हमारा मिशन",
      title: "कानूनी और सुरक्षित गतिशीलता को सुविधाजनक बनाना",
      text: "Global Jobs Consulting में, हमारा मिशन रोमानिया में कार्यबल और अंतर्राष्ट्रीय छात्रों की कानूनी, सुरक्षित और पारदर्शी गतिशीलता को सुविधाजनक बनाना है, आर्थिक विकास और गैर-EU नागरिकों के जिम्मेदार एकीकरण में सक्रिय रूप से योगदान देना है।",
      points: [
        "वर्तमान कानून के साथ 100% अनुपालन",
        "भर्ती प्रक्रिया में पूर्ण पारदर्शिता",
        "एकीकरण के लिए पूर्ण समर्थन"
      ]
    },
    purpose: {
      label: "हमारा उद्देश्य",
      title: "एक विश्वसनीय रणनीतिक भागीदार",
      text: "हमारा उद्देश्य अंतर्राष्ट्रीय कार्यबल गतिशीलता प्रक्रिया में शामिल सभी हितधारकों के लिए एक विश्वसनीय रणनीतिक भागीदार बनना है:",
      targets: [
        { icon: "building", title: "रोमानियाई कंपनियां", description: "स्टाफ की कमी का सामना करने वाली और तेज़ और कानूनी समाधान की जरूरत" },
        { icon: "graduation", title: "अंतर्राष्ट्रीय छात्र", description: "शिक्षा के लिए रोमानिया चुनने वाले और यहां करियर बनाना चाहने वाले" },
        { icon: "briefcase", title: "गैर-EU कर्मचारी", description: "यूरोप में पेशेवर स्थिरता और बेहतर भविष्य की तलाश" },
        { icon: "heart", title: "परिवार", description: "रोमानिया में पुनर्मिलन और कानूनी एकीकरण की तलाश" }
      ]
    },
    objectives: {
      label: "रणनीतिक उद्देश्य",
      title: "भविष्य के लिए हमारी दृष्टि",
      items: [
        { number: "01", title: "कानूनी अनुपालन", description: "अंतर्राष्ट्रीय भर्ती में कानूनी अनुपालन बढ़ाना" },
        { number: "02", title: "प्रसंस्करण दक्षता", description: "सही दस्तावेज़ प्रबंधन के माध्यम से प्रसंस्करण समय कम करना" },
        { number: "03", title: "एकीकृत इकोसिस्टम", description: "प्रवासियों और नियोक्ताओं के लिए एक एकीकृत सेवा इकोसिस्टम बनाना" },
        { number: "04", title: "डिजिटलीकरण", description: "तेज़ और पारदर्शी पहुंच के लिए प्रक्रियाओं का डिजिटलीकरण" },
        { number: "05", title: "अंतर्राष्ट्रीय नेटवर्क", description: "एशिया और EU में अंतर्राष्ट्रीय भागीदार नेटवर्क विकसित करना" }
      ]
    },
    stats: {
      partners: { value: "11+", label: "एशिया और अफ्रीका में भागीदार" },
      experience: { value: "4+", label: "वर्षों का अनुभव" },
      countries: { value: "3", label: "यूरोपीय बाज़ार" },
      candidates: { value: "500+", label: "नियुक्त उम्मीदवार" }
    },
    cta: {
      title: "शुरू करने के लिए तैयार?",
      description: "मुफ्त परामर्श के लिए हमसे संपर्क करें।",
      buttonEmployer: "मैं एक नियोक्ता हूं",
      buttonCandidate: "मैं एक उम्मीदवार हूं"
    }
  },
  si: {
    meta: { 
      title: "අප ගැන | Global Jobs Consulting", 
      description: "Global Jobs Consulting හි, අපගේ මෙහෙවර වන්නේ රොමේනියාවට ශ්‍රම බලකාය සහ ජාත්‍යන්තර සිසුන්ගේ නීත්‍යානුකූල, ආරක්ෂිත සහ විනිවිද පෙනෙන ගතිශීලතාව පහසු කිරීමයි." 
    },
    hero: {
      label: "Global Jobs Consulting ගැන",
      title: "ජාත්‍යන්තර ශ්‍රම බලකාය ගතිශීලතාව සඳහා ඔබේ උපායමාර්ගික හවුල්කරු",
      description: "රොමේනියාවේ ඔරාඩියා හි පිහිටි, අපි ආසියාවෙන් සහ අප්‍රිකාවෙන් යුරෝපීය වෙළඳපොළවල් සඳහා ශ්‍රම බලකාය තැබීමට විශේෂඥ වූ සර්ව-ඇතුළත් බඳවා ගැනීමේ ආයතනයකි."
    },
    mission: {
      label: "අපගේ මෙහෙවර",
      title: "නීත්‍යානුකූල සහ ආරක්ෂිත ගතිශීලතාව පහසු කිරීම",
      text: "Global Jobs Consulting හි, අපගේ මෙහෙවර වන්නේ රොමේනියාවට ශ්‍රම බලකාය සහ ජාත්‍යන්තර සිසුන්ගේ නීත්‍යානුකූල, ආරක්ෂිත සහ විනිවිද පෙනෙන ගතිශීලතාව පහසු කිරීම, ආර්ථික සංවර්ධනයට සහ EU නොවන පුරවැසියන්ගේ වගකීම්සහගත ඒකාබද්ධතාවයට ක්‍රියාශීලීව දායක වීමයි.",
      points: [
        "වත්මන් නීති සමඟ 100% අනුකූලතාව",
        "බඳවා ගැනීමේ ක්‍රියාවලියේ සම්පූර්ණ විනිවිදභාවය",
        "ඒකාබද්ධතාව සඳහා සම්පූර්ණ සහාය"
      ]
    },
    purpose: {
      label: "අපගේ අරමුණ",
      title: "විශ්වාසදායක උපායමාර්ගික හවුල්කරුවෙක්",
      text: "අපගේ අරමුණ වන්නේ ජාත්‍යන්තර ශ්‍රම බලකාය ගතිශීලතා ක්‍රියාවලියට සම්බන්ධ සියලුම පාර්ශවකරුවන් සඳහා විශ්වාසදායක උපායමාර්ගික හවුල්කරුවෙක් වීමයි:",
      targets: [
        { icon: "building", title: "රොමේනියානු සමාගම්", description: "කාර්ය මණ්ඩල හිඟයට මුහුණ දෙන සහ වේගවත් හා නීත්‍යානුකූල විසඳුම් අවශ්‍ය" },
        { icon: "graduation", title: "ජාත්‍යන්තර සිසුන්", description: "අධ්‍යාපනය සඳහා රොමේනියාව තෝරා ගන්නා සහ මෙහි වෘත්තියක් ගොඩනැගීමට කැමති" },
        { icon: "briefcase", title: "EU නොවන සේවකයින්", description: "යුරෝපයේ වෘත්තීය ස්ථාවරත්වය සහ හොඳ අනාගතයක් සොයන" },
        { icon: "heart", title: "පවුල්", description: "රොමේනියාවේ පවුල් එක්වීම සහ නීත්‍යානුකූල ඒකාබද්ධතාව අනුගමනය කරන" }
      ]
    },
    objectives: {
      label: "උපායමාර්ගික අරමුණු",
      title: "අනාගතය සඳහා අපගේ දැක්ම",
      items: [
        { number: "01", title: "නීතිමය අනුකූලතාව", description: "ජාත්‍යන්තර බඳවා ගැනීමේ නීතිමය අනුකූලතාව වැඩි කිරීම" },
        { number: "02", title: "සැකසුම් කාර්යක්ෂමතාව", description: "නිවැරදි ලේඛන කළමනාකරණය හරහා සැකසුම් කාලය අඩු කිරීම" },
        { number: "03", title: "ඒකාබද්ධ පරිසර පද්ධතිය", description: "සංක්‍රමණිකයින් සහ සේවායෝජකයින් සඳහා ඒකාබද්ධ සේවා පරිසර පද්ධතියක් නිර්මාණය" },
        { number: "04", title: "ඩිජිටල්කරණය", description: "වේගවත් සහ විනිවිද පෙනෙන ප්‍රවේශය සඳහා ක්‍රියාවලි ඩිජිටල්කරණය" },
        { number: "05", title: "ජාත්‍යන්තර ජාලය", description: "ආසියාවේ සහ EU හි ජාත්‍යන්තර හවුල්කාර ජාලයක් සංවර්ධනය" }
      ]
    },
    stats: {
      partners: { value: "11+", label: "ආසියාවේ සහ අප්‍රිකාවේ හවුල්කරුවන්" },
      experience: { value: "4+", label: "වසරවල පළපුරුද්ද" },
      countries: { value: "3", label: "යුරෝපීය වෙළඳපොළ" },
      candidates: { value: "500+", label: "තබන ලද අපේක්ෂකයින්" }
    },
    cta: {
      title: "ආරම්භ කිරීමට සූදානම්ද?",
      description: "නොමිලේ උපදේශනයක් සඳහා අප හා සම්බන්ධ වන්න.",
      buttonEmployer: "මම සේවා යෝජකයෙක්",
      buttonCandidate: "මම අපේක්ෂකයෙක්"
    }
  }
};

const iconMap = {
  building: Target,
  graduation: Award,
  briefcase: Globe,
  heart: Users
};

export default function DespreNoiPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />

      <div className="min-h-screen" data-testid="despre-noi-page">
        {/* Hero Section */}
        <div className="bg-navy-900 text-white pt-40 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <span className="text-coral font-semibold text-sm tracking-wider uppercase">{t.hero.label}</span>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mt-3 mb-6">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg md:text-xl leading-relaxed">{t.hero.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-coral py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              <div>
                <div className="text-3xl md:text-4xl font-bold">{t.stats.partners.value}</div>
                <div className="text-sm md:text-base opacity-90">{t.stats.partners.label}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">{t.stats.experience.value}</div>
                <div className="text-sm md:text-base opacity-90">{t.stats.experience.label}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">{t.stats.countries.value}</div>
                <div className="text-sm md:text-base opacity-90">{t.stats.countries.label}</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">{t.stats.candidates.value}</div>
                <div className="text-sm md:text-base opacity-90">{t.stats.candidates.label}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-coral font-semibold text-sm tracking-wider uppercase">{t.mission.label}</span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-6">{t.mission.title}</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">{t.mission.text}</p>
                <ul className="space-y-4">
                  {t.mission.points.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-coral flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="bg-navy-900 rounded-2xl p-8 text-white">
                  <Compass className="h-16 w-16 text-coral mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Global Jobs Consulting SRL</h3>
                  <div className="space-y-2 text-navy-200">
                    <p>CUI: 48270947</p>
                    <p>J05/1458/2023</p>
                    <p>Str. Parcul Traian nr. 1, ap. 10</p>
                    <p>Oradea, România</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Purpose Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-coral font-semibold text-sm tracking-wider uppercase">{t.purpose.label}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">{t.purpose.title}</h2>
              <p className="text-gray-600 text-lg">{t.purpose.text}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.purpose.targets.map((target, idx) => {
                const Icon = iconMap[target.icon] || Users;
                return (
                  <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-coral" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy-900 mb-2">{target.title}</h3>
                      <p className="text-gray-600 text-sm">{target.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Objectives Section */}
        <section className="py-20 bg-navy-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-coral font-semibold text-sm tracking-wider uppercase">{t.objectives.label}</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2">{t.objectives.title}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {t.objectives.items.map((item, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                  <div className="text-coral text-4xl font-bold mb-4">{item.number}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-navy-200">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-coral to-red-600 rounded-3xl p-8 md:p-12 text-center text-white">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">{t.cta.title}</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">{t.cta.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-coral hover:bg-gray-100 rounded-full px-8">
                  <Link to={getLocalizedPath('/formular-angajator')}>
                    {t.cta.buttonEmployer}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                  <Link to={getLocalizedPath('/candidati')}>
                    {t.cta.buttonCandidate}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
