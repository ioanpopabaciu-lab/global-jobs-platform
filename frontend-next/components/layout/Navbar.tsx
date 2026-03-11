import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/types';
import { localeNames } from '@/i18n/config';
import { MobileNav } from './MobileNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  locale: Locale;
  dictionary: {
    nav: {
      home: string;
      employers: string;
      candidates: string;
      industries: string;
      howItWorks: string;
      about: string;
      blog: string;
      contact: string;
      requestWorkers: string;
    };
  };
}

// Navigation links configuration
const getNavLinks = (locale: Locale) => {
  const prefix = locale === 'ro' ? '' : `/${locale}`;
  return [
    { href: `${prefix}/employers`, label: 'employers' },
    { href: `${prefix}/candidates`, label: 'candidates' },
    { 
      href: '#',
      label: 'industries',
      children: [
        { href: `${prefix}/industries/construction`, label: 'Construction' },
        { href: `${prefix}/industries/horeca`, label: 'Hospitality' },
        { href: `${prefix}/industries/agriculture`, label: 'Agriculture' },
        { href: `${prefix}/industries/manufacturing`, label: 'Manufacturing' },
        { href: `${prefix}/industries/logistics`, label: 'Logistics' },
      ]
    },
    { href: `${prefix}/how-it-works`, label: 'howItWorks' },
    { href: `${prefix}/about`, label: 'about' },
    { href: `${prefix}/blog`, label: 'blog' },
    { href: `${prefix}/contact`, label: 'contact' },
  ];
};

export function Navbar({ locale, dictionary }: NavbarProps) {
  const prefix = locale === 'ro' ? '' : `/${locale}`;
  const navLinks = getNavLinks(locale);
  const { nav } = dictionary;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={prefix || '/'} className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="Global Jobs Consulting"
            width={180}
            height={50}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => (
            <div key={link.label} className="relative group">
              {link.children ? (
                <>
                  <button className="flex items-center text-sm font-medium text-gray-700 hover:text-coral transition-colors">
                    {nav[link.label as keyof typeof nav]}
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-coral"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-coral transition-colors"
                >
                  {nav[link.label as keyof typeof nav]}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* CTA Button - Desktop */}
          <Link
            href={`${prefix}/request-workers`}
            className="hidden md:inline-flex items-center justify-center rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-600 transition-colors"
          >
            {nav.requestWorkers}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher locale={locale} />

          {/* User Menu */}
          <UserMenu locale={locale} dictionary={dictionary} />

          {/* Mobile Menu */}
          <MobileNav locale={locale} dictionary={dictionary} />
        </div>
      </div>
    </header>
  );
}
