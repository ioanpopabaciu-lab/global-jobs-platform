import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Phone, Globe, ChevronDown, ChevronRight, Facebook, Instagram, Linkedin, User, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";

// Logo URLs - Updated with new high-visibility logos
const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/99mub5h3_logo%20fundal%20transparent.png";
const LOGO_COLORED = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/f53cvkek_logo%20transparent.png";

// Social Media Links
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/globaljobsconsulting",
  instagram: "https://www.instagram.com/globaljobsconsulting",
  linkedin: "https://www.linkedin.com/company/global-jobs-consulting"
};

// Menu translations for all languages
const menuTranslations = {
  ro: {
    home: "Acasă",
    employers: "Angajatori",
    candidates: "Candidați",
    industries: "Industrii",
    howItWorks: "Cum Funcționează",
    aboutUs: "Despre Noi",
    blog: "Blog",
    contact: "Contact",
    login: "Autentificare",
    myAccount: "Contul Meu",
    requestWorkers: "Solicită Muncitori",
    // Industries dropdown
    construction: "Construcții",
    hospitality: "HoReCa",
    agriculture: "Agricultură",
    manufacturing: "Producție",
    logistics: "Logistică"
  },
  en: {
    home: "Home",
    employers: "Employers",
    candidates: "Candidates",
    industries: "Industries",
    howItWorks: "How It Works",
    aboutUs: "About Us",
    blog: "Blog",
    contact: "Contact",
    login: "Login",
    myAccount: "My Account",
    requestWorkers: "Request Workers",
    // Industries dropdown
    construction: "Construction",
    hospitality: "Hospitality (HoReCa)",
    agriculture: "Agriculture",
    manufacturing: "Manufacturing",
    logistics: "Logistics"
  },
  de: {
    home: "Startseite",
    employers: "Arbeitgeber",
    candidates: "Kandidaten",
    industries: "Branchen",
    howItWorks: "So funktioniert's",
    aboutUs: "Über Uns",
    blog: "Blog",
    contact: "Kontakt",
    login: "Anmelden",
    myAccount: "Mein Konto",
    requestWorkers: "Arbeiter Anfordern",
    // Industries dropdown
    construction: "Bauwesen",
    hospitality: "Gastgewerbe (HoReCa)",
    agriculture: "Landwirtschaft",
    manufacturing: "Produktion",
    logistics: "Logistik"
  },
  sr: {
    home: "Početna",
    employers: "Poslodavci",
    candidates: "Kandidati",
    industries: "Industrije",
    howItWorks: "Kako Funkcioniše",
    aboutUs: "O Nama",
    blog: "Blog",
    contact: "Kontakt",
    login: "Prijava",
    myAccount: "Moj Nalog",
    requestWorkers: "Zatražite Radnike",
    // Industries dropdown
    construction: "Građevinarstvo",
    hospitality: "Ugostiteljstvo (HoReCa)",
    agriculture: "Poljoprivreda",
    manufacturing: "Proizvodnja",
    logistics: "Logistika"
  },
  ne: {
    home: "गृहपृष्ठ",
    employers: "रोजगारदाता",
    candidates: "उम्मेदवार",
    industries: "उद्योग",
    howItWorks: "कसरी काम गर्छ",
    aboutUs: "हाम्रो बारेमा",
    blog: "ब्लग",
    contact: "सम्पर्क",
    login: "लग इन",
    myAccount: "मेरो खाता",
    requestWorkers: "कामदार अनुरोध",
    // Industries dropdown
    construction: "निर्माण",
    hospitality: "होटल र रेस्टुरेन्ट",
    agriculture: "कृषि",
    manufacturing: "उत्पादन",
    logistics: "ढुवानी"
  },
  bn: {
    home: "হোম",
    employers: "নিয়োগকর্তা",
    candidates: "প্রার্থী",
    industries: "শিল্প",
    howItWorks: "কিভাবে কাজ করে",
    aboutUs: "আমাদের সম্পর্কে",
    blog: "ব্লগ",
    contact: "যোগাযোগ",
    login: "লগইন",
    myAccount: "আমার অ্যাকাউন্ট",
    requestWorkers: "কর্মী অনুরোধ",
    // Industries dropdown
    construction: "নির্মাণ",
    hospitality: "হোটেল ও রেস্তোরাঁ",
    agriculture: "কৃষি",
    manufacturing: "উৎপাদন",
    logistics: "পরিবহন"
  },
  hi: {
    home: "होम",
    employers: "नियोक्ता",
    candidates: "उम्मीदवार",
    industries: "उद्योग",
    howItWorks: "यह कैसे काम करता है",
    aboutUs: "हमारे बारे में",
    blog: "ब्लॉग",
    contact: "संपर्क",
    login: "लॉगिन",
    myAccount: "मेरा खाता",
    requestWorkers: "कर्मचारी अनुरोध",
    // Industries dropdown
    construction: "निर्माण",
    hospitality: "होटल और रेस्टोरेंट",
    agriculture: "कृषि",
    manufacturing: "विनिर्माण",
    logistics: "परिवहन"
  },
  si: {
    home: "මුල් පිටුව",
    employers: "සේවා යෝජකයින්",
    candidates: "අපේක්ෂකයින්",
    industries: "කර්මාන්ත",
    howItWorks: "එය ක්‍රියා කරන ආකාරය",
    aboutUs: "අපි ගැන",
    blog: "බ්ලොග්",
    contact: "සම්බන්ධ වන්න",
    login: "පිවිසුම",
    myAccount: "මගේ ගිණුම",
    requestWorkers: "සේවකයින් ඉල්ලන්න",
    // Industries dropdown
    construction: "ඉදිකිරීම්",
    hospitality: "හෝටල් සහ ආපන ශාලා",
    agriculture: "කෘෂිකර්මය",
    manufacturing: "නිෂ්පාදනය",
    logistics: "ප්‍රවාහනය"
  }
};

// Route paths for localization
const routePathsMap = {
  '/': { ro: '/', en: '/en', de: '/de', sr: '/sr', ne: '/ne', bn: '/bn', hi: '/hi', si: '/si' },
  '/employers': { ro: '/angajatori', en: '/en/employers', de: '/de/arbeitgeber', sr: '/sr/poslodavci', ne: '/ne/employers', bn: '/bn/employers', hi: '/hi/employers', si: '/si/employers' },
  '/candidates': { ro: '/candidati', en: '/en/candidates', de: '/de/kandidaten', sr: '/sr/kandidati', ne: '/ne/candidates', bn: '/bn/candidates', hi: '/hi/candidates', si: '/si/candidates' },
  '/industries/construction': { ro: '/industrii/constructii', en: '/en/industries/construction', de: '/de/branchen/bauwesen', sr: '/sr/industrije/gradjevinarstvo', ne: '/ne/industries/construction', bn: '/bn/industries/construction', hi: '/hi/industries/construction', si: '/si/industries/construction' },
  '/industries/hospitality': { ro: '/industrii/horeca', en: '/en/industries/hospitality', de: '/de/branchen/gastgewerbe', sr: '/sr/industrije/ugostiteljstvo', ne: '/ne/industries/hospitality', bn: '/bn/industries/hospitality', hi: '/hi/industries/hospitality', si: '/si/industries/hospitality' },
  '/industries/agriculture': { ro: '/industrii/agricultura', en: '/en/industries/agriculture', de: '/de/branchen/landwirtschaft', sr: '/sr/industrije/poljoprivreda', ne: '/ne/industries/agriculture', bn: '/bn/industries/agriculture', hi: '/hi/industries/agriculture', si: '/si/industries/agriculture' },
  '/industries/manufacturing': { ro: '/industrii/productie', en: '/en/industries/manufacturing', de: '/de/branchen/produktion', sr: '/sr/industrije/proizvodnja', ne: '/ne/industries/manufacturing', bn: '/bn/industries/manufacturing', hi: '/hi/industries/manufacturing', si: '/si/industries/manufacturing' },
  '/industries/logistics': { ro: '/industrii/logistica', en: '/en/industries/logistics', de: '/de/branchen/logistik', sr: '/sr/industrije/logistika', ne: '/ne/industries/logistics', bn: '/bn/industries/logistics', hi: '/hi/industries/logistics', si: '/si/industries/logistics' },
  '/how-it-works': { ro: '/cum-functioneaza', en: '/en/how-it-works', de: '/de/so-funktioniert-es', sr: '/sr/kako-funkcionise', ne: '/ne/how-it-works', bn: '/bn/how-it-works', hi: '/hi/how-it-works', si: '/si/how-it-works' },
  '/about-us': { ro: '/despre-noi', en: '/en/about-us', de: '/de/uber-uns', sr: '/sr/o-nama', ne: '/ne/about-us', bn: '/bn/about-us', hi: '/hi/about-us', si: '/si/about-us' },
  '/blog': { ro: '/blog', en: '/en/blog', de: '/de/blog', sr: '/sr/blog', ne: '/ne/blog', bn: '/bn/blog', hi: '/hi/blog', si: '/si/blog' },
  '/contact': { ro: '/contact', en: '/en/contact', de: '/de/kontakt', sr: '/sr/kontakt', ne: '/ne/contact', bn: '/bn/contact', hi: '/hi/contact', si: '/si/contact' },
  '/request-workers': { ro: '/solicita-muncitori', en: '/en/request-workers', de: '/de/arbeiter-anfordern', sr: '/sr/zatrazite-radnike', ne: '/ne/request-workers', bn: '/bn/request-workers', hi: '/hi/request-workers', si: '/si/request-workers' }
};

// Desktop dropdown component
function NavDropdown({ label, items, isScrolled }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`flex items-center gap-1 font-medium text-sm transition-colors hover:text-coral ${
          isScrolled ? "text-gray-700" : "text-white/90"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile accordion menu item
function MobileAccordion({ label, items, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-lg font-medium text-gray-700"
      >
        {label}
        <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      {isExpanded && (
        <div className="pl-4 pb-3 space-y-2">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={onClose}
              className="block py-2 text-base text-gray-600 hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, routePaths } = useLanguage();

  const t = menuTranslations[language] || menuTranslations.ro;

  // Helper to get localized path
  const getPath = (basePath) => {
    const paths = routePathsMap[basePath];
    return paths ? paths[language] : basePath;
  };

  // Industries dropdown items
  const industriesSubmenu = [
    { label: t.construction, href: getPath('/industries/construction') },
    { label: t.hospitality, href: getPath('/industries/hospitality') },
    { label: t.agriculture, href: getPath('/industries/agriculture') },
    { label: t.manufacturing, href: getPath('/industries/manufacturing') },
    { label: t.logistics, href: getPath('/industries/logistics') }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    const currentPath = location.pathname;
    const paths = routePathsMap[href];
    if (paths) {
      return Object.values(paths).some(p => currentPath === p || (p !== '/' && currentPath.startsWith(p)));
    }
    if (href === "/") return currentPath === "/" || currentPath === "/en" || currentPath === "/de" || currentPath === "/sr";
    return currentPath.startsWith(href);
  };

  // Handle language change with URL update
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const currentPath = location.pathname;
    
    for (const [basePath, translations] of Object.entries(routePathsMap)) {
      if (Object.values(translations).includes(currentPath)) {
        navigate(translations[newLang]);
        return;
      }
    }
    for (const [basePath, translations] of Object.entries(routePaths)) {
      if (Object.values(translations).includes(currentPath)) {
        navigate(translations[newLang]);
        return;
      }
    }
    navigate(newLang === 'ro' ? '/' : `/${newLang}`);
  };

  const languageLabels = {
    ro: "🇷🇴 Română",
    en: "🇬🇧 English",
    de: "🇦🇹 Deutsch",
    sr: "🇷🇸 Srpski",
    ne: "🇳🇵 नेपाली",
    bn: "🇧🇩 বাংলা",
    hi: "🇮🇳 हिन्दी",
    si: "🇱🇰 සිංහල"
  };

  const languageShortLabels = {
    ro: "🇷🇴 RO",
    en: "🇬🇧 EN",
    de: "🇦🇹 DE",
    sr: "🇷🇸 SR",
    ne: "🇳🇵 NE",
    bn: "🇧🇩 BN",
    hi: "🇮🇳 HI",
    si: "🇱🇰 SI"
  };

  // Navigation link component
  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`font-medium text-sm transition-colors hover:text-coral ${
        isActive(to)
          ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
          : isScrolled ? "text-gray-700" : "text-white/90"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-navy-900/80 backdrop-blur-sm"
      }`}
    >
      {/* Top Bar - Only visible when not scrolled */}
      <div className={`py-2 px-4 text-sm transition-all ${isScrolled ? 'hidden' : 'bg-navy-900 text-white'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a 
              href="tel:+40732403464" 
              className="flex items-center gap-1 hover:text-coral transition-colors"
              data-testid="header-phone-link"
            >
              <Phone className="h-3 w-3" />
              +40 732 403 464
            </a>
            <span className="hidden sm:block">office@gjc.ro</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Social Media Icons */}
            <div className="flex items-center gap-2">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <span className="hidden sm:block text-white/50">|</span>
            {/* Language Selector - Only in top bar */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-coral transition-colors cursor-pointer">
                <Globe className="h-3 w-3" />
                {languageShortLabels[language]}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[160px]">
                <DropdownMenuItem onClick={() => handleLanguageChange("ro")} className="cursor-pointer">🇷🇴 Română</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="cursor-pointer">🇬🇧 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("de")} className="cursor-pointer">🇦🇹 Deutsch</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("sr")} className="cursor-pointer">🇷🇸 Srpski</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("ne")} className="cursor-pointer">🇳🇵 नेपाली (Nepali)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("bn")} className="cursor-pointer">🇧🇩 বাংলা (Bengali)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("hi")} className="cursor-pointer">🇮🇳 हिन्दी (Hindi)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("si")} className="cursor-pointer">🇱🇰 සිංහල (Sinhala)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 mr-8" data-testid="logo-link">
            <img 
              src={isScrolled ? LOGO_COLORED : LOGO_WHITE} 
              alt="Global Jobs Consulting" 
              className="h-[50px] md:h-[60px] lg:h-[70px] w-auto transition-all duration-300 object-contain"
            />
          </Link>

          {/* CENTER: Main Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <NavLink to={getPath('/')}>{t.home}</NavLink>
            <NavLink to={getPath('/employers')}>{t.employers}</NavLink>
            <NavLink to={getPath('/candidates')}>{t.candidates}</NavLink>
            
            {/* Industries Dropdown */}
            <NavDropdown 
              label={t.industries}
              items={industriesSubmenu}
              isScrolled={isScrolled}
            />
            
            <NavLink to={getPath('/how-it-works')}>{t.howItWorks}</NavLink>
            <NavLink to={getPath('/about-us')}>{t.aboutUs}</NavLink>
            <NavLink to={getPath('/blog')}>{t.blog}</NavLink>
            <NavLink to={getPath('/contact')}>{t.contact}</NavLink>
          </div>

          {/* RIGHT: User Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Selector when scrolled */}
            {isScrolled && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-coral transition-colors cursor-pointer text-sm">
                  <Globe className="h-4 w-4" />
                  {languageShortLabels[language]}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[160px]">
                  <DropdownMenuItem onClick={() => handleLanguageChange("ro")} className="cursor-pointer">🇷🇴 Română</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="cursor-pointer">🇬🇧 English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("de")} className="cursor-pointer">🇦🇹 Deutsch</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("sr")} className="cursor-pointer">🇷🇸 Srpski</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("ne")} className="cursor-pointer">🇳🇵 नेपाली (Nepali)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("bn")} className="cursor-pointer">🇧🇩 বাংলা (Bengali)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("hi")} className="cursor-pointer">🇮🇳 हिन्दी (Hindi)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("si")} className="cursor-pointer">🇱🇰 සිංහල (Sinhala)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Login Button */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              data-testid="nav-login-button"
              className={`font-medium ${
                isScrolled ? "text-gray-700 hover:text-navy-900" : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Link to="/login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                {t.login}
              </Link>
            </Button>

            {/* My Account Button */}
            <Button
              asChild
              variant="outline"
              size="sm"
              data-testid="nav-myaccount-button"
              className={`rounded-full font-medium ${
                isScrolled 
                  ? "border-navy-600 text-navy-600 hover:bg-navy-50" 
                  : "border-white text-white hover:bg-white/10"
              }`}
            >
              <Link to="/my-account" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {t.myAccount}
              </Link>
            </Button>
            
            {/* Primary CTA: Request Workers */}
            <Button
              asChild
              size="sm"
              data-testid="nav-cta-button"
              className="bg-coral hover:bg-red-600 text-white rounded-full px-5 font-semibold shadow-md"
            >
              <Link to={getPath('/request-workers')}>{t.requestWorkers}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                data-testid="mobile-menu-button"
                aria-label="Open navigation menu"
              >
                <Menu className={`h-6 w-6 ${isScrolled ? 'text-navy-900' : 'text-white'}`} />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[320px] overflow-y-auto" 
              data-testid="mobile-menu"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation links</SheetDescription>
              <div className="flex flex-col gap-2 mt-6">
                <img src={LOGO_COLORED} alt="Global Jobs Consulting" className="h-16 w-auto mb-4 object-contain" />
                
                {/* Mobile Language Selector */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                  {['ro', 'en', 'ne', 'bn', 'hi', 'si'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => { handleLanguageChange(lang); setIsOpen(false); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${language === lang ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {languageShortLabels[lang]}
                    </button>
                  ))}
                </div>
                
                {/* Mobile Navigation Links */}
                <Link to={getPath('/')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.home}
                </Link>
                <Link to={getPath('/employers')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.employers}
                </Link>
                <Link to={getPath('/candidates')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.candidates}
                </Link>
                
                {/* Industries Accordion */}
                <MobileAccordion 
                  label={t.industries}
                  items={industriesSubmenu}
                  onClose={() => setIsOpen(false)}
                />
                
                <Link to={getPath('/how-it-works')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.howItWorks}
                </Link>
                <Link to={getPath('/about-us')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.aboutUs}
                </Link>
                <Link to={getPath('/blog')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.blog}
                </Link>
                <Link to={getPath('/contact')} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {t.contact}
                </Link>

                {/* Mobile Action Buttons */}
                <div className="mt-4 space-y-3">
                  <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 rounded-full">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t.login}
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full border-navy-600 text-navy-600 rounded-full">
                    <Link to="/my-account" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
                      {t.myAccount}
                    </Link>
                  </Button>
                  
                  <Button asChild className="w-full bg-coral hover:bg-red-600 text-white rounded-full font-semibold">
                    <Link to={getPath('/request-workers')} onClick={() => setIsOpen(false)}>
                      {t.requestWorkers}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
