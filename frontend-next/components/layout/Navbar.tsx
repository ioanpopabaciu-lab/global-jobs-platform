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

// Logo URLs
const LOGO_WHITE = "/images/optimized/logo_white_v2.webp";
const LOGO_COLORED = "/images/optimized/logo_colored_v2.webp";

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

const languageLabels: Record<Locale, { short: string; full: string; countryCode: string }> = {
  ro: { short: "RO", full: "Română", countryCode: "ro" },
  en: { short: "EN", full: "English", countryCode: "gb" },
  de: { short: "DE", full: "Deutsch", countryCode: "at" },
  sr: { short: "SR", full: "Srpski", countryCode: "rs" },
  ne: { short: "NE", full: "नेपाली", countryCode: "np" },
  bn: { short: "BN", full: "বাংলা", countryCode: "bd" },
  hi: { short: "HI", full: "हिन्दी", countryCode: "in" },
  si: { short: "SI", full: "සිංහල", countryCode: "lk" },
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
        className={`font-medium text-[13px] xl:text-[14px] whitespace-nowrap transition-colors hover:text-coral tracking-tight ${
          isActive
            ? isScrolled ? "text-navy-900 font-bold" : "text-white font-bold"
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-navy-900/80 backdrop-blur-sm"
      }`}
    >
      {/* Main Nav */}
      <nav className="w-full max-w-[1536px] mx-auto px-4 xl:px-6 py-3 relative">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link href={getPath("/")} className="flex items-center flex-shrink-0" data-testid="logo-link">
            <Image
              src={isScrolled ? LOGO_COLORED : LOGO_WHITE}
              alt="Global Jobs Consulting"
              width={160}
              height={50}
              className="transition-all duration-300 object-contain block"
              priority
            />
          </Link>

          {/* Center: Main Navigation */}
          <div className="hidden xl:flex items-center justify-center gap-6 xl:gap-10 flex-1 shrink-0 px-4 translate-y-[1px]">
            <NavLink href={getPath("/")}>{dict.nav.home}</NavLink>
            <NavLink href={getPath("/employers")}>{dict.nav.employers}</NavLink>
            <NavLink href={getPath("/candidates")}>{dict.nav.candidates}</NavLink>

            {/* Industries Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 font-medium text-[13px] xl:text-[14px] whitespace-nowrap transition-colors hover:text-coral tracking-tight ${pathname.includes('/industries') ? (isScrolled ? 'text-navy-900 font-bold' : 'text-white font-bold') : (isScrolled ? 'text-gray-700' : 'text-white/90')}`}>
                {dict.nav.industries}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[180px] z-[120] py-2">
                {industriesSubmenu.map((item, index) => (
                  <DropdownMenuItem key={index} asChild className="cursor-pointer">
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-[14px] xl:text-[15px] text-gray-700 hover:bg-gray-50 hover:text-navy-900 transition-colors whitespace-normal"
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink href={getPath("/how-it-works")}>{dict.nav.howItWorks}</NavLink>
            <NavLink href={getPath("/about")}>{dict.nav.about}</NavLink>
            <NavLink href={getPath("/blog")}>{dict.nav.blog}</NavLink>
            <NavLink href={getPath("/contact")}>{dict.nav.contact}</NavLink>
          </div>

          {/* Right: User Actions */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
            {/* Login Button */}
            <Button asChild variant="ghost" size="sm" data-testid="nav-login-button"
              className={`text-[13px] px-2.5 whitespace-nowrap font-medium tracking-tight ${isScrolled ? "text-gray-700 hover:text-navy-900" : "text-white/90 hover:text-white hover:bg-white/10"}`}
            >
              <Link href="/login" className="flex items-center gap-1.5">
                <LogIn className="h-4 w-4 hidden xl:block" />
                {dict.nav.login}
              </Link>
            </Button>

            {/* My Account Button */}
            <Button asChild variant="outline" size="sm" data-testid="nav-myaccount-button"
              className="gjc-new-account-btn border-white/30 rounded-full text-[13px] px-4 whitespace-nowrap font-medium tracking-tight"
            >
              <Link href="/my-account" className="flex items-center gap-1.5">
                <User className="h-4 w-4 hidden xl:block" />
                {dict.nav.myAccount}
              </Link>
            </Button>

            {/* Primary CTA: Request Workers */}
            <Button asChild size="sm" data-testid="nav-cta-button" className="bg-coral hover:bg-red-600 text-white rounded-full px-5 py-1.5 h-auto text-[13px] whitespace-nowrap font-bold shadow-md tracking-tight ml-1">
              <Link href={getPath("/request-workers")}>{dict.nav.requestWorkers}</Link>
            </Button>

            {/* Language Selector in Navbar */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1.5 transition-colors cursor-pointer text-[13px] whitespace-nowrap font-bold px-3 py-1.5 h-auto rounded-md hover:bg-white/10 border-l border-white/20 pl-3 ml-2 ${isScrolled ? 'text-gray-700 hover:text-coral border-gray-300' : 'text-white/90 hover:text-white'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://flagcdn.com/w20/${languageLabels[locale].countryCode}.png`} alt={languageLabels[locale].short} className="w-5 rounded-[2px]" />
                <span>{languageLabels[locale].short}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] z-[60]">
                {(Object.keys(languageLabels) as Locale[]).map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => handleLanguageChange(lang)} className="cursor-pointer text-[14px] font-medium flex items-center gap-2 py-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://flagcdn.com/w20/${languageLabels[lang].countryCode}.png`} alt={languageLabels[lang].short} className="w-5 rounded-[2px]" />
                    <span>{languageLabels[lang].full}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu-button" aria-label="Open navigation menu">
                <Menu className={`h-6 w-6 ${isScrolled ? "text-navy-900" : "text-white"}`} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] overflow-y-auto" data-testid="mobile-menu">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation links</SheetDescription>
              <div className="flex flex-col gap-2 mt-6">
                <Image src={LOGO_COLORED} alt="Global Jobs Consulting" width={180} height={64} className="h-16 w-auto mb-4 object-contain" />

                  {/* Logo has been kept at the top */}

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

                {/* Mobile Language Selector */}
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                  {(Object.keys(languageLabels) as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { handleLanguageChange(lang); setIsOpen(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${locale === lang ? "bg-coral text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w20/${languageLabels[lang].countryCode}.png`} alt={languageLabels[lang].short} className="w-4 rounded-[2px]" />
                      {languageLabels[lang].short}
                    </button>
                  ))}
                </div>

                {/* Mobile Action Buttons */}
                <div className="mt-4 space-y-3">
                  <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 rounded-full">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {dict.nav.login}
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="gjc-new-account-btn w-full rounded-full font-medium">
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
