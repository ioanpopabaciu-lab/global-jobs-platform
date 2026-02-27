import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Globe, Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/angajatori", label: "Angajatori" },
  { href: "/servicii", label: "Servicii" },
  { href: "/candidati", label: "Portal Candidați" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

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
            <Globe className="h-3 w-3" />
            <span>RO | AT | RS</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className={`font-heading font-black text-2xl tracking-tight ${isScrolled ? 'text-navy-900' : 'text-white'}`}>
              <span className="text-navy-900 bg-white px-2 py-1 rounded">GJC</span>
              <span className={`ml-2 ${isScrolled ? 'text-navy-900' : 'text-white'}`}>Global Jobs</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`font-medium text-sm transition-colors hover:text-navy-600 ${
                  isActive(link.href)
                    ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
                    : isScrolled ? "text-gray-600" : "text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button
              asChild
              data-testid="nav-cta-button"
              className="bg-navy-900 hover:bg-navy-800 text-white rounded-sm"
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
                  className="mt-4 bg-navy-900 hover:bg-navy-800 text-white rounded-sm"
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
