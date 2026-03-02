import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Phone, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";

// Base paths (Romanian)
const navLinksBase = [
  { href: "/", key: "nav.home" },
  { href: "/angajatori", key: "nav.employers" },
  { href: "/servicii", key: "nav.services" },
  { href: "/candidati", key: "nav.candidates" },
  { href: "/blog", key: "nav.blog" },
  { href: "/contact", key: "nav.contact" },
];

// Logo URLs - Updated with new transparent logo
const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/8oq3cjun_GJC%20alb%20transparent%20Logo.png";
const LOGO_COLORED = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/0h45ug4f_logo%20global.png";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, getLocalizedPath, routePaths } = useLanguage();

  // Generate nav links with localized paths
  const navLinks = navLinksBase.map(link => ({
    ...link,
    localizedHref: getLocalizedPath(link.href)
  }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    const currentPath = location.pathname;
    // Check all language versions of this route
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
    // Find current base route and navigate to the new language version
    const currentPath = location.pathname;
    for (const [basePath, translations] of Object.entries(routePaths)) {
      if (Object.values(translations).includes(currentPath)) {
        navigate(translations[newLang]);
        return;
      }
    }
    // Default: navigate to home in new language
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
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              +40 732 403 464
            </span>
            <span className="hidden sm:block">office@gjc.ro</span>
          </div>
          <div className="flex items-center gap-4">
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
          {/* Logo - Made bigger */}
          <Link to="/" className="flex items-center" data-testid="logo-link">
            <img 
              src={isScrolled ? LOGO_COLORED : LOGO_WHITE} 
              alt="Global Jobs Consulting" 
              className="h-24 md:h-28 w-auto transition-all duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.localizedHref}
                data-testid={`nav-link-${link.href.replace('/', '') || 'home'}`}
                className={`font-medium text-sm transition-colors hover:text-coral ${
                  isActive(link.href)
                    ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
                    : isScrolled ? "text-gray-700" : "text-white/90"
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
            
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
            
            <Button
              asChild
              data-testid="nav-cta-button"
              className="bg-coral hover:bg-red-600 text-white rounded-full px-6"
            >
              <Link to={getLocalizedPath("/angajatori")}>{t('nav.cta')}</Link>
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
              className="w-[300px]" 
              data-testid="mobile-menu"
              id="mobile-nav-menu"
              role="dialog"
              aria-label="Navigation menu"
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation links</SheetDescription>
              <div className="flex flex-col gap-4 mt-8">
                <img src={LOGO_COLORED} alt="Global Jobs Consulting" className="h-14 w-auto mb-4" />
                
                {/* Mobile Language Selector */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100" role="group" aria-label="Language selection">
                  <button 
                    onClick={() => { handleLanguageChange("ro"); setIsOpen(false); }}
                    aria-label="Switch to Romanian"
                    aria-pressed={language === 'ro'}
                    className={`px-3 py-1 rounded-full text-sm ${language === 'ro' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    🇷🇴 RO
                  </button>
                  <button 
                    onClick={() => { handleLanguageChange("en"); setIsOpen(false); }}
                    aria-label="Switch to English"
                    aria-pressed={language === 'en'}
                    className={`px-3 py-1 rounded-full text-sm ${language === 'en' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    🇬🇧 EN
                  </button>
                  <button 
                    onClick={() => { handleLanguageChange("de"); setIsOpen(false); }}
                    aria-label="Switch to German"
                    aria-pressed={language === 'de'}
                    className={`px-3 py-1 rounded-full text-sm ${language === 'de' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    🇦🇹 DE
                  </button>
                  <button 
                    onClick={() => { handleLanguageChange("sr"); setIsOpen(false); }}
                    aria-label="Switch to Serbian"
                    aria-pressed={language === 'sr'}
                    className={`px-3 py-1 rounded-full text-sm ${language === 'sr' ? 'bg-coral text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    🇷🇸 SR
                  </button>
                </div>
                
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.localizedHref}
                    onClick={() => setIsOpen(false)}
                    data-testid={`mobile-nav-link-${link.href.replace('/', '') || 'home'}`}
                    className={`text-lg font-medium py-2 border-b border-gray-100 ${
                      isActive(link.href) ? "text-navy-900" : "text-gray-600"
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 bg-coral hover:bg-red-600 text-white rounded-full"
                  data-testid="mobile-cta-button"
                >
                  <Link to={getLocalizedPath("/angajatori")} onClick={() => setIsOpen(false)}>
                    {t('nav.cta')}
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
