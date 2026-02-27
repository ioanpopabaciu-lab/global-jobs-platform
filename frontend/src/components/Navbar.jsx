import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/angajatori", label: "Angajatori" },
  { href: "/servicii", label: "Servicii" },
  { href: "/candidati", label: "Portal Candidați" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

// Logo URLs from assets
const LOGO_COLORED = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/0h45ug4f_logo%20global.png";
const LOGO_TRANSPARENT = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/ekuvpyca_logo%20transparent.png";

export default function Navbar() {
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

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 glass-nav shadow-md"
          : "bg-transparent"
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
          <div className="flex items-center gap-2">
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
              src={isScrolled ? LOGO_COLORED : LOGO_TRANSPARENT} 
              alt="Global Jobs Consulting" 
              className="h-14 md:h-16 w-auto transition-all duration-300"
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
                    : isScrolled ? "text-gray-600" : "text-white/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button
              asChild
              data-testid="nav-cta-button"
              className="bg-coral hover:bg-red-600 text-white rounded-full px-6"
            >
              <Link to="/angajatori">Solicită Ofertă</Link>
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
              <div className="flex flex-col gap-4 mt-8">
                <img src={LOGO_COLORED} alt="Global Jobs Consulting" className="h-12 w-auto mb-4" />
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
                    {link.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 bg-coral hover:bg-red-600 text-white rounded-full"
                  data-testid="mobile-cta-button"
                >
                  <Link to="/angajatori" onClick={() => setIsOpen(false)}>
                    Solicită Ofertă
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
