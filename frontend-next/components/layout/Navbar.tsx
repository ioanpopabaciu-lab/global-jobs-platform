"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Phone, Globe, ChevronDown, ChevronRight, Facebook, Instagram, Linkedin, User, LogIn } from "lucide-react";
import type { Locale } from "@/types";

// Logo URLs - Local assets
const LOGO_WHITE = "/images/optimized/logo_fundal_transparent.png";
const LOGO_COLORED = "/images/optimized/logo_transparent.png";

// Social Media Links
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/globaljobsconsulting",
  instagram: "https://www.instagram.com/globaljobsconsulting",
  linkedin: "https://www.linkedin.com/company/global-jobs-consulting"
};

interface NavbarProps {
  locale: Locale;
  dict: {
    nav: {
      home: string;
      employers: string;
      candidates: string;
      industries: string;
      howItWorks: string;
      about: string;
      blog: string;
      contact: string;
      login: string;
      myAccount: string;
      requestWorkers: string;
    };
    industries: {
      construction: string;
      horeca: string;
      agriculture: string;
      manufacturing: string;
      logistics: string;
    };
  };
}

const languageLabels: Record<Locale, { short: string; full: string; flag: string }> = {
  ro: { short: "RO", full: "Română", flag: "🇷🇴" },
  en: { short: "EN", full: "English", flag: "🇬🇧" },
  de: { short: "DE", full: "Deutsch", flag: "🇦🇹" },
  sr: { short: "SR", full: "Srpski", flag: "🇷🇸" },
  ne: { short: "NE", full: "नेपाली", flag: "🇳🇵" },
  bn: { short: "BN", full: "বাংলা", flag: "🇧🇩" },
  hi: { short: "HI", full: "हिन्दी", flag: "🇮🇳" },
  si: { short: "SI", full: "සිංහල", flag: "🇱🇰" },
};

export default function Navbar({ locale, dict }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const pathname = usePathname();

  // Helper to get locale-prefixed path
  const getPath = (path: string) => {
    if (locale === "ro") return path;
    return `/${locale}${path}`;
  };

  // Industries dropdown items
  const industriesSubmenu = [
    { label: dict.industries.construction, href: getPath("/industries/construction") },
    { label: dict.industries.horeca, href: getPath("/industries/horeca") },
    { label: dict.industries.agriculture, href: getPath("/industries/agriculture") },
    { label: dict.industries.manufacturing, href: getPath("/industries/manufacturing") },
    { label: dict.industries.logistics, href: getPath("/industries/logistics") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`font-medium text-sm transition-colors hover:text-coral ${
          isActive
            ? isScrolled ? "text-navy-900 font-semibold" : "text-white font-semibold"
            : isScrolled ? "text-gray-700" : "text-white/90"
        }`}
      >
        {children}
      </Link>
    );
  };

  // Language change - switch locale in URL
  const handleLanguageChange = (newLocale: Locale) => {
    // Get the current path without locale
    let pathWithoutLocale = pathname;
    const locales: Locale[] = ["ro", "en", "de", "sr", "ne", "bn", "hi", "si"];
    for (const loc of locales) {
      if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
        pathWithoutLocale = pathname.replace(`/${loc}`, "") || "/";
        break;
      }
    }
    
    // Build new path
    const newPath = newLocale === "ro" ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
    window.location.href = newPath;
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-navy-900/80 backdrop-blur-sm"
      }`}
    >
      {/* Top Bar */}
      <div className={`py-2 px-4 text-sm transition-all ${isScrolled ? "hidden" : "bg-navy-900 text-white"}`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:+40732403464" className="flex items-center gap-1 hover:text-coral transition-colors" data-testid="header-phone-link">
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
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-coral transition-colors cursor-pointer">
                <Globe className="h-3 w-3" />
                {languageLabels[locale].flag} {languageLabels[locale].short}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[160px]">
                {(Object.keys(languageLabels) as Locale[]).map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => handleLanguageChange(lang)} className="cursor-pointer">
                    {languageLabels[lang].flag} {languageLabels[lang].full}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={getPath("/")} className="flex items-center flex-shrink-0 mr-8" data-testid="logo-link">
            <Image
              src={isScrolled ? LOGO_COLORED : LOGO_WHITE}
              alt="Global Jobs Consulting"
              width={180}
              height={70}
              className="h-[50px] md:h-[60px] lg:h-[70px] w-auto transition-all duration-300 object-contain"
              priority
            />
          </Link>

          {/* Center: Main Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <NavLink href={getPath("/")}>{dict.nav.home}</NavLink>
            <NavLink href={getPath("/employers")}>{dict.nav.employers}</NavLink>
            <NavLink href={getPath("/candidates")}>{dict.nav.candidates}</NavLink>

            {/* Industries Dropdown */}
            <div className="relative" onMouseEnter={() => setIndustriesOpen(true)} onMouseLeave={() => setIndustriesOpen(false)}>
              <button
                className={`flex items-center gap-1 font-medium text-sm transition-colors hover:text-coral ${
                  isScrolled ? "text-gray-700" : "text-white/90"
                }`}
              >
                {dict.nav.industries}
                <ChevronDown className={`h-4 w-4 transition-transform ${industriesOpen ? "rotate-180" : ""}`} />
              </button>
              {industriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  {industriesSubmenu.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy-900 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink href={getPath("/how-it-works")}>{dict.nav.howItWorks}</NavLink>
            <NavLink href={getPath("/about")}>{dict.nav.about}</NavLink>
            <NavLink href={getPath("/blog")}>{dict.nav.blog}</NavLink>
            <NavLink href={getPath("/contact")}>{dict.nav.contact}</NavLink>
          </div>

          {/* Right: User Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Selector when scrolled */}
            {isScrolled && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-coral transition-colors cursor-pointer text-sm">
                  <Globe className="h-4 w-4" />
                  {languageLabels[locale].flag} {languageLabels[locale].short}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[160px]">
                  {(Object.keys(languageLabels) as Locale[]).map((lang) => (
                    <DropdownMenuItem key={lang} onClick={() => handleLanguageChange(lang)} className="cursor-pointer">
                      {languageLabels[lang].flag} {languageLabels[lang].full}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Login Button */}
            <Button asChild variant="ghost" size="sm" data-testid="nav-login-button"
              className={`font-medium ${isScrolled ? "text-gray-700 hover:text-navy-900" : "text-white/90 hover:text-white hover:bg-white/10"}`}
            >
              <Link href="/login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                {dict.nav.login}
              </Link>
            </Button>

            {/* My Account Button */}
            <Button asChild variant="outline" size="sm" data-testid="nav-myaccount-button"
              className={`rounded-full font-medium ${isScrolled ? "border-navy-600 text-navy-600 hover:bg-navy-50" : "border-white text-white hover:bg-white/10"}`}
            >
              <Link href="/my-account" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {dict.nav.myAccount}
              </Link>
            </Button>

            {/* Primary CTA: Request Workers */}
            <Button asChild size="sm" data-testid="nav-cta-button" className="bg-coral hover:bg-red-600 text-white rounded-full px-5 font-semibold shadow-md">
              <Link href={getPath("/request-workers")}>{dict.nav.requestWorkers}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu-button" aria-label="Open navigation menu">
                <Menu className={`h-6 w-6 ${isScrolled ? "text-navy-900" : "text-white"}`} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] overflow-y-auto" data-testid="mobile-menu">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation links</SheetDescription>
              <div className="flex flex-col gap-2 mt-6">
                <Image src={LOGO_COLORED} alt="Global Jobs Consulting" width={180} height={64} className="h-16 w-auto mb-4 object-contain" />

                {/* Mobile Language Selector */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                  {(Object.keys(languageLabels) as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { handleLanguageChange(lang); setIsOpen(false); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${locale === lang ? "bg-coral text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {languageLabels[lang].flag} {languageLabels[lang].short}
                    </button>
                  ))}
                </div>

                {/* Mobile Navigation Links */}
                <Link href={getPath("/")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.home}
                </Link>
                <Link href={getPath("/employers")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.employers}
                </Link>
                <Link href={getPath("/candidates")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.candidates}
                </Link>

                {/* Industries Accordion */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setIndustriesOpen(!industriesOpen)}
                    className="w-full flex items-center justify-between py-3 text-lg font-medium text-gray-700"
                  >
                    {dict.nav.industries}
                    <ChevronRight className={`h-5 w-5 transition-transform ${industriesOpen ? "rotate-90" : ""}`} />
                  </button>
                  {industriesOpen && (
                    <div className="pl-4 pb-3 space-y-2">
                      {industriesSubmenu.map((item, index) => (
                        <Link key={index} href={item.href} onClick={() => setIsOpen(false)} className="block py-2 text-base text-gray-600 hover:text-navy-900">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href={getPath("/how-it-works")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.howItWorks}
                </Link>
                <Link href={getPath("/about")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.about}
                </Link>
                <Link href={getPath("/blog")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.blog}
                </Link>
                <Link href={getPath("/contact")} onClick={() => setIsOpen(false)} className="py-3 text-lg font-medium text-gray-700 border-b border-gray-100">
                  {dict.nav.contact}
                </Link>

                {/* Mobile Action Buttons */}
                <div className="mt-4 space-y-3">
                  <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 rounded-full">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {dict.nav.login}
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full border-navy-600 text-navy-600 rounded-full">
                    <Link href="/my-account" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
                      {dict.nav.myAccount}
                    </Link>
                  </Button>

                  <Button asChild className="w-full bg-coral hover:bg-red-600 text-white rounded-full font-semibold">
                    <Link href={getPath("/request-workers")} onClick={() => setIsOpen(false)}>
                      {dict.nav.requestWorkers}
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
