import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe, Facebook, Linkedin, Instagram } from "lucide-react";
import type { Locale } from "@/types";

// Logo URL - transparent white logo
const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/8oq3cjun_GJC%20alb%20transparent%20Logo.png";

interface FooterProps {
  locale: Locale;
  dict: {
    nav: {
      employers: string;
      candidates: string;
      blog: string;
      contact: string;
    };
    industries: {
      construction: string;
      horeca: string;
      agriculture: string;
      manufacturing: string;
      logistics: string;
    };
    footer: {
      description: string;
      quickLinks: string;
      industries: string;
      contactInfo: string;
      rights: string;
      privacy: string;
    };
  };
}

const privacyLinks: Record<Locale, string> = {
  ro: "Politică de Confidențialitate",
  en: "Privacy Policy",
  de: "Datenschutzrichtlinie",
  sr: "Politika privatnosti",
  ne: "गोपनीयता नीति",
  bn: "গোপনীয়তা নীতি",
  hi: "गोपनीयता नीति",
  si: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය"
};

export default function Footer({ locale, dict }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Helper to get locale-prefixed path
  const getPath = (path: string) => {
    if (locale === "ro") return path;
    return `/${locale}${path}`;
  };

  return (
    <footer className="bg-navy-900 text-white" data-testid="footer">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Image
              src={LOGO_WHITE}
              alt="Global Jobs Consulting"
              width={180}
              height={64}
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {dict.footer.description}
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/globaljobsconsulting"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-coral transition"
                data-testid="footer-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/global-jobs-consulting"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-coral transition"
                data-testid="footer-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/globaljobsconsulting"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-coral transition"
                data-testid="footer-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{dict.footer.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={getPath("/employers")}
                  className="text-gray-300 hover:text-coral transition text-sm"
                  data-testid="footer-link-employers"
                >
                  {dict.nav.employers}
                </Link>
              </li>
              <li>
                <Link
                  href={getPath("/candidates")}
                  className="text-gray-300 hover:text-coral transition text-sm"
                  data-testid="footer-link-candidates"
                >
                  {dict.nav.candidates}
                </Link>
              </li>
              <li>
                <Link
                  href={getPath("/blog")}
                  className="text-gray-300 hover:text-coral transition text-sm"
                  data-testid="footer-link-blog"
                >
                  {dict.nav.blog}
                </Link>
              </li>
              <li>
                <Link
                  href={getPath("/contact")}
                  className="text-gray-300 hover:text-coral transition text-sm"
                  data-testid="footer-link-contact"
                >
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{dict.footer.industries}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href={getPath("/industries/horeca")} className="hover:text-coral transition">
                  {dict.industries.horeca}
                </Link>
              </li>
              <li>
                <Link href={getPath("/industries/construction")} className="hover:text-coral transition">
                  {dict.industries.construction}
                </Link>
              </li>
              <li>
                <Link href={getPath("/industries/agriculture")} className="hover:text-coral transition">
                  {dict.industries.agriculture}
                </Link>
              </li>
              <li>
                <Link href={getPath("/industries/manufacturing")} className="hover:text-coral transition">
                  {dict.industries.manufacturing}
                </Link>
              </li>
              <li>
                <Link href={getPath("/industries/logistics")} className="hover:text-coral transition">
                  {dict.industries.logistics}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - SEO Local */}
          <div itemScope itemType="http://schema.org/Organization">
            <h4 className="text-lg font-semibold mb-4">{dict.footer.contactInfo}</h4>
            <address className="not-italic space-y-3 text-sm">
              <p
                className="flex items-start gap-2 text-gray-300"
                itemProp="address"
                itemScope
                itemType="http://schema.org/PostalAddress"
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-coral" />
                <span>
                  <span itemProp="streetAddress">Str. Parcul Traian nr. 1, ap. 10</span>,{" "}
                  <span itemProp="addressLocality">Oradea</span>,{" "}
                  <span itemProp="addressCountry">România</span>
                </span>
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0 text-coral" />
                <a href="tel:+40732403464" itemProp="telephone" className="hover:text-white transition">
                  +40 732 403 464
                </a>
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4 flex-shrink-0 text-coral" />
                <a href="mailto:office@gjc.ro" itemProp="email" className="hover:text-white transition">
                  office@gjc.ro
                </a>
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Globe className="h-4 w-4 flex-shrink-0 text-coral" />
                <a href="https://www.gjc.ro" itemProp="url" className="hover:text-white transition">
                  www.gjc.ro
                </a>
              </p>
            </address>
            {/* Date Fiscale */}
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
              <p>CUI: 48270947</p>
              <p>J05/1458/2023</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p>© {currentYear} Global Jobs Consulting. {dict.footer.rights}</p>
              <span className="hidden md:inline">|</span>
              <Link
                href={getPath("/privacy-policy")}
                className="hover:text-coral transition"
                data-testid="footer-privacy-link"
              >
                {privacyLinks[locale] || privacyLinks.ro}
              </Link>
            </div>
            <div className="flex gap-4">
              <span>România</span>
              <span>|</span>
              <span>Austria</span>
              <span>|</span>
              <span>Serbia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
