import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Phone, Globe, ChevronDown, ChevronRight, Facebook, Instagram, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";

// Social Media Links
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/globaljobsconsulting",
  instagram: "https://www.instagram.com/globaljobsconsulting",
  linkedin: "https://www.linkedin.com/company/global-jobs-consulting"
};

// Logo URLs
const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/8oq3cjun_GJC%20alb%20transparent%20Logo.png";
const LOGO_COLORED = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/0h45ug4f_logo%20global.png";

// Navigation structure with dropdowns - translations for menu labels
const menuTranslations = {
  ro: {
    home: "Acasă",
    aboutUs: "Despre Noi",
    services: "Servicii",
    internationalRecruitment: "Recrutare Internațională",
    studentAdvisor: "Pachet STUDENT ADVISOR",
    workCareer: "Pachet WORK & CAREER",
    familyReunion: "Pachet FAMILY REUNION",
    settlementCitizenship: "Pachet SETTLEMENT & CITIZENSHIP",
    administrativeServices: "Servicii Administrative & Juridice",
    employers: "Angajatori",
    procedureNonEU: "Procedură Recrutare Non-UE",
    companyEligibility: "Eligibilitate Companie",
    costsTimelines: "Costuri & Termene",
    requestOffer: "🔴 Solicită Ofertă Personalizată",
    candidates: "Portal Candidați",
    blog: "Blog",
    contact: "Contact",
    cta: "Solicită Ofertă",
    login: "Autentificare",
    portal: "Portal Clienți"
  },
  en: {
    home: "Home",
    aboutUs: "About Us",
    services: "Services",
    internationalRecruitment: "International Recruitment",
    studentAdvisor: "STUDENT ADVISOR Package",
    workCareer: "WORK & CAREER Package",
    familyReunion: "FAMILY REUNION Package",
    settlementCitizenship: "SETTLEMENT & CITIZENSHIP Package",
    administrativeServices: "Administrative & Legal Services",
    employers: "Employers",
    procedureNonEU: "Non-EU Recruitment Procedure",
    companyEligibility: "Company Eligibility",
    costsTimelines: "Costs & Timelines",
    requestOffer: "🔴 Request Personalized Offer",
    candidates: "Candidates Portal",
    blog: "Blog",
    contact: "Contact",
    cta: "Request Quote",
    login: "Login",
    portal: "Client Portal"
  },
  de: {
    home: "Startseite",
    aboutUs: "Über Uns",
    services: "Dienstleistungen",
    internationalRecruitment: "Internationale Rekrutierung",
    studentAdvisor: "STUDENT ADVISOR Paket",
    workCareer: "WORK & CAREER Paket",
    familyReunion: "FAMILY REUNION Paket",
    settlementCitizenship: "SETTLEMENT & CITIZENSHIP Paket",
    administrativeServices: "Administrative & Rechtliche Dienste",
    employers: "Arbeitgeber",
    procedureNonEU: "Nicht-EU-Rekrutierungsverfahren",
    companyEligibility: "Firmenberechtigung",
    costsTimelines: "Kosten & Fristen",
    requestOffer: "🔴 Personalisiertes Angebot anfordern",
    candidates: "Bewerberportal",
    blog: "Blog",
    contact: "Kontakt",
    cta: "Angebot anfordern",
    login: "Anmelden",
    portal: "Kundenportal"
  },
  sr: {
    home: "Početna",
    aboutUs: "O Nama",
    services: "Usluge",
    internationalRecruitment: "Međunarodna Regrutacija",
    studentAdvisor: "STUDENT ADVISOR Paket",
    workCareer: "WORK & CAREER Paket",
    familyReunion: "FAMILY REUNION Paket",
    settlementCitizenship: "SETTLEMENT & CITIZENSHIP Paket",
    administrativeServices: "Administrativne i Pravne Usluge",
    employers: "Poslodavci",
    procedureNonEU: "Procedura regrutacije Non-EU",
    companyEligibility: "Podobnost kompanije",
    costsTimelines: "Troškovi i rokovi",
    requestOffer: "🔴 Zatražite personalizovanu ponudu",
    candidates: "Portal kandidata",
    blog: "Blog",
    contact: "Kontakt",
    cta: "Zatražite ponudu",
    login: "Prijava",
    portal: "Portal klijenata"
  }
};

// Route paths for all languages
const routePathsMap = {
  '/': { ro: '/', en: '/en', de: '/de', sr: '/sr' },
  '/despre-noi': { ro: '/despre-noi', en: '/en/about-us', de: '/de/uber-uns', sr: '/sr/o-nama' },
  '/servicii': { ro: '/servicii', en: '/en/services', de: '/de/dienstleistungen', sr: '/sr/usluge' },
  '/servicii/student-advisor': { ro: '/servicii/student-advisor', en: '/en/services/student-advisor', de: '/de/dienstleistungen/student-advisor', sr: '/sr/usluge/student-advisor' },
  '/servicii/work-career': { ro: '/servicii/work-career', en: '/en/services/work-career', de: '/de/dienstleistungen/work-career', sr: '/sr/usluge/work-career' },
  '/servicii/family-reunion': { ro: '/servicii/family-reunion', en: '/en/services/family-reunion', de: '/de/dienstleistungen/family-reunion', sr: '/sr/usluge/family-reunion' },
  '/servicii/settlement-citizenship': { ro: '/servicii/settlement-citizenship', en: '/en/services/settlement-citizenship', de: '/de/dienstleistungen/settlement-citizenship', sr: '/sr/usluge/settlement-citizenship' },
  '/servicii/administrative': { ro: '/servicii/administrative', en: '/en/services/administrative', de: '/de/dienstleistungen/administrative', sr: '/sr/usluge/administrative' },
  '/angajatori': { ro: '/angajatori', en: '/en/employers', de: '/de/arbeitgeber', sr: '/sr/poslodavci' },
  '/angajatori/procedura': { ro: '/angajatori/procedura', en: '/en/employers/procedure', de: '/de/arbeitgeber/verfahren', sr: '/sr/poslodavci/procedura' },
  '/angajatori/eligibilitate': { ro: '/angajatori/eligibilitate', en: '/en/employers/eligibility', de: '/de/arbeitgeber/berechtigung', sr: '/sr/poslodavci/podobnost' },
  '/angajatori/costuri': { ro: '/angajatori/costuri', en: '/en/employers/costs', de: '/de/arbeitgeber/kosten', sr: '/sr/poslodavci/troskovi' },
  '/formular-angajator': { ro: '/formular-angajator', en: '/en/employer-form', de: '/de/arbeitgeber-formular', sr: '/sr/formular-poslodavac' },
  '/candidati': { ro: '/candidati', en: '/en/candidates', de: '/de/kandidaten', sr: '/sr/kandidati' },
  '/blog': { ro: '/blog', en: '/en/blog', de: '/de/blog', sr: '/sr/blog' },
  '/contact': { ro: '/contact', en: '/en/contact', de: '/de/kontakt', sr: '/sr/kontakt' },
  '/politica-confidentialitate': { ro: '/politica-confidentialitate', en: '/en/privacy-policy', de: '/de/datenschutz', sr: '/sr/politika-privatnosti' }
};

// Desktop dropdown component
function NavDropdown({ label, items, isScrolled, language }) {
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
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                item.highlight 
                  ? 'text-coral font-semibold hover:bg-coral/10' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-navy-900'
              }`}
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
              className={`block py-2 text-base ${
                item.highlight 
                  ? 'text-coral font-semibold' 
                  : 'text-gray-600 hover:text-navy-900'
              }`}
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
  const { language, setLanguage, getLocalizedPath, routePaths } = useLanguage();

  const menuLabels = menuTranslations[language] || menuTranslations.ro;

  // Helper to get localized path
  const getPath = (basePath) => {
    const paths = routePathsMap[basePath];
    return paths ? paths[language] : basePath;
  };

  // Build menu structure
  const homeSubmenu = [
    { label: menuLabels.aboutUs, href: getPath('/despre-noi') }
  ];

  const servicesSubmenu = [
    { label: menuLabels.internationalRecruitment, href: getPath('/servicii') },
    { label: menuLabels.studentAdvisor, href: getPath('/servicii/student-advisor') },
    { label: menuLabels.workCareer, href: getPath('/servicii/work-career') },
    { label: menuLabels.familyReunion, href: getPath('/servicii/family-reunion') },
    { label: menuLabels.settlementCitizenship, href: getPath('/servicii/settlement-citizenship') },
    { label: menuLabels.administrativeServices, href: getPath('/servicii/administrative') }
  ];

  const employersSubmenu = [
    { label: menuLabels.procedureNonEU, href: getPath('/angajatori/procedura') },
    { label: menuLabels.companyEligibility, href: getPath('/angajatori/eligibilitate') },
    { label: menuLabels.costsTimelines, href: getPath('/angajatori/costuri') },
    { label: menuLabels.requestOffer, href: getPath('/formular-angajator'), highlight: true }
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
    const paths = routePaths[href];
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
    
    // Find matching route and navigate to new language version
    for (const [basePath, translations] of Object.entries(routePathsMap)) {
      if (Object.values(translations).includes(currentPath)) {
        navigate(translations[newLang]);
        return;
      }
    }
    // Check original routePaths too
    for (const [basePath, translations] of Object.entries(routePaths)) {
      if (Object.values(translations).includes(currentPath)) {
        navigate(translations[newLang]);
        return;
      }
    }
    navigate(newLang === 'ro' ? '/' : `/${newLang}`);
  };

  const languageLabels = {
    ro: "🇷🇴 RO",
    en: "🇬🇧 EN",
    de: "🇦🇹 DE",
    sr: "🇷🇸 SR"
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg"
          : "bg-navy-900/80 backdrop-blur-sm"
      }`}
    >
      {/* Top Bar */}
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
              <a 
                href={SOCIAL_LINKS.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-coral transition-colors"
                aria-label="Facebook"
                data-testid="header-social-facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href={SOCIAL_LINKS.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-coral transition-colors"
                aria-label="Instagram"
                data-testid="header-social-instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href={SOCIAL_LINKS.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-coral transition-colors"
                aria-label="LinkedIn"
                data-testid="header-social-linkedin"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <span className="hidden sm:block text-white/50">|</span>
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-coral transition-colors cursor-pointer">
                <Globe className="h-3 w-3" />
                {languageLabels[language]}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLanguageChange("ro")} className="cursor-pointer">
                  🇷🇴 Română
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="cursor-pointer">
                  🇬🇧 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("de")} className="cursor-pointer">
                  🇦🇹 Deutsch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("sr")} className="cursor-pointer">
                  🇷🇸 Srpski
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="font-medium">RO | AT | RS</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <img 
              src={isScrolled ? LOGO_COLORED : LOGO_WHITE} 
              alt="Global Jobs Consulting" 
              className="h-40 md:h-44 w-auto transition-all duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {/* ACASĂ with dropdown */}
            <NavDropdown 
              label={menuLabels.home}
              items={homeSubmenu}
              isScrolled={isScrolled}
              language={language}
            />

            {/* SERVICII with dropdown */}
            <NavDropdown 
              label={menuLabels.services}
              items={servicesSubmenu}
              isScrolled={isScrolled}
              language={language}
            />

            {/* ANGAJATORI with dropdown */}
            <NavDropdown 
              label={menuLabels.employers}
              items={employersSubmenu}
              isScrolled={isScrolled}
              language={language}
            />

            {/* PORTAL CANDIDAȚI - simple link */}
            <Link
              to={getPath('/candidati')}
              data-testid="nav-link-candidati"
              className={`font-medium text-sm transition-colors hover:text-coral ${
                isActive('/candidati')
                  ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
                  : isScrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              {menuLabels.candidates}
            </Link>

            {/* BLOG - simple link */}
            <Link
              to={getPath('/blog')}
              data-testid="nav-link-blog"
              className={`font-medium text-sm transition-colors hover:text-coral ${
                isActive('/blog')
                  ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
                  : isScrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              {menuLabels.blog}
            </Link>

            {/* CONTACT - simple link */}
            <Link
              to={getPath('/contact')}
              data-testid="nav-link-contact"
              className={`font-medium text-sm transition-colors hover:text-coral ${
                isActive('/contact')
                  ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
                  : isScrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              {menuLabels.contact}
            </Link>
            
            {/* Language Selector Desktop (when scrolled) */}
            {isScrolled && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-coral transition-colors cursor-pointer">
                  <Globe className="h-4 w-4" />
                  {language.toUpperCase()}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleLanguageChange("ro")} className="cursor-pointer">
                    🇷🇴 Română
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="cursor-pointer">
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("de")} className="cursor-pointer">
                    🇦🇹 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange("sr")} className="cursor-pointer">
                    🇷🇸 Srpski
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Portal Login Button */}
            <Button
              asChild
              variant="outline"
              data-testid="nav-login-button"
              className={`rounded-full px-5 ${
                isScrolled 
                  ? "border-navy-600 text-navy-600 hover:bg-navy-50" 
                  : "border-white text-white hover:bg-white/10"
              }`}
            >
              <Link to="/login">{menuLabels.portal}</Link>
            </Button>
            
            <Button
              asChild
              data-testid="nav-cta-button"
              className="bg-coral hover:bg-red-600 text-white rounded-full px-6"
            >
              <Link to={getPath('/formular-angajator')}>{menuLabels.cta}</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                data-testid="mobile-menu-button"
                aria-label="Open navigation menu"
                aria-expanded={isOpen}
                aria-controls="mobile-nav-menu"
              >
                <Menu className={`h-6 w-6 ${isScrolled ? 'text-navy-900' : 'text-white'}`} />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[320px] overflow-y-auto" 
              data-testid="mobile-menu"
              id="mobile-nav-menu"
              role="dialog"
              aria-label="Navigation menu"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation links</SheetDescription>
              <div className="flex flex-col gap-2 mt-6">
                <img src={LOGO_COLORED} alt="Global Jobs Consulting" className="h-16 w-auto mb-4" />
                
                {/* Mobile Language Selector */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100" role="group" aria-label="Language selection">
                  {['ro', 'en', 'de', 'sr'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => { handleLanguageChange(lang); setIsOpen(false); }}
                      aria-label={`Switch to ${lang.toUpperCase()}`}
                      aria-pressed={language === lang}
                      className={`px-3 py-1 rounded-full text-sm ${language === lang ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {languageLabels[lang]}
                    </button>
                  ))}
                </div>
                
                {/* ACASĂ with submenu */}
                <MobileAccordion 
                  label={menuLabels.home}
                  items={homeSubmenu}
                  onClose={() => setIsOpen(false)}
                />

                {/* SERVICII with submenu */}
                <MobileAccordion 
                  label={menuLabels.services}
                  items={servicesSubmenu}
                  onClose={() => setIsOpen(false)}
                />

                {/* ANGAJATORI with submenu */}
                <MobileAccordion 
                  label={menuLabels.employers}
                  items={employersSubmenu}
                  onClose={() => setIsOpen(false)}
                />

                {/* Simple links */}
                <Link
                  to={getPath('/candidati')}
                  onClick={() => setIsOpen(false)}
                  data-testid="mobile-nav-link-candidati"
                  className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100"
                >
                  {menuLabels.candidates}
                </Link>

                <Link
                  to={getPath('/blog')}
                  onClick={() => setIsOpen(false)}
                  data-testid="mobile-nav-link-blog"
                  className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100"
                >
                  {menuLabels.blog}
                </Link>

                <Link
                  to={getPath('/contact')}
                  onClick={() => setIsOpen(false)}
                  data-testid="mobile-nav-link-contact"
                  className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100"
                >
                  {menuLabels.contact}
                </Link>

                <Button
                  asChild
                  className="mt-4 bg-coral hover:bg-red-600 text-white rounded-full"
                  data-testid="mobile-cta-button"
                >
                  <Link to={getPath('/formular-angajator')} onClick={() => setIsOpen(false)}>
                    {menuLabels.cta}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
