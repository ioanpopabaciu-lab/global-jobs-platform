import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Phone, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Acasă", labelDE: "Startseite", labelSR: "Početna" },
  { href: "/angajatori", label: "Angajatori", labelDE: "Arbeitgeber", labelSR: "Poslodavci" },
  { href: "/servicii", label: "Servicii", labelDE: "Dienstleistungen", labelSR: "Usluge" },
  { href: "/candidati", label: "Portal Candidați", labelDE: "Bewerberportal", labelSR: "Portal kandidata" },
  { href: "/blog", label: "Blog", labelDE: "Blog", labelSR: "Blog" },
  { href: "/contact", label: "Contact", labelDE: "Kontakt", labelSR: "Kontakt" },
];

// Logo URLs from assets
const LOGO_COLORED = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/0h45ug4f_logo%20global.png";
const LOGO_TRANSPARENT = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/ekuvpyca_logo%20transparent.png";

export default function Navbar({ language = "ro", onLanguageChange }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const getLabel = (link) => {
    if (language === "de") return link.labelDE;
    if (language === "sr") return link.labelSR;
    return link.label;
  };

  const getCtaText = () => {
    if (language === "de") return "Angebot anfordern";
    if (language === "sr") return "Zatražite ponudu";
    return "Solicită Ofertă";
  };

  const languageLabels = {
    ro: "RO",
    de: "DE",
    sr: "SR"
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
            {onLanguageChange && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-coral transition-colors">
                  <Globe className="h-3 w-3" />
                  {languageLabels[language]}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onLanguageChange("ro")}>
                    🇷🇴 Română
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLanguageChange("de")}>
                    🇦🇹 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLanguageChange("sr")}>
                    🇷🇸 Srpski
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
              src={isScrolled ? LOGO_COLORED : LOGO_TRANSPARENT} 
              alt="Global Jobs Consulting" 
              className="h-16 md:h-20 w-auto transition-all duration-300"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`font-medium text-sm transition-colors hover:text-coral ${
                  isActive(link.href)
                    ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
                    : isScrolled ? "text-gray-700" : "text-white/90"
                }`}
              >
                {getLabel(link)}
              </Link>
            ))}
            <Button
              asChild
              data-testid="nav-cta-button"
              className="bg-coral hover:bg-red-600 text-white rounded-full px-6"
            >
              <Link to="/angajatori">{getCtaText()}</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                <Menu className={`h-6 w-6 ${isScrolled ? 'text-navy-900' : 'text-white'}`} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]" data-testid="mobile-menu">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation links</SheetDescription>
              <div className="flex flex-col gap-4 mt-8">
                <img src={LOGO_COLORED} alt="Global Jobs Consulting" className="h-14 w-auto mb-4" />
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                    className={`text-lg font-medium py-2 border-b border-gray-100 ${
                      isActive(link.href) ? "text-navy-900" : "text-gray-600"
                    }`}
                  >
                    {getLabel(link)}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 bg-coral hover:bg-red-600 text-white rounded-full"
                  data-testid="mobile-cta-button"
                >
                  <Link to="/angajatori" onClick={() => setIsOpen(false)}>
                    {getCtaText()}
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
