import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, Facebook, Linkedin, Instagram } from "lucide-react";

// Logo URL from assets
const LOGO_TRANSPARENT = "https://customer-assets.emergentagent.com/job_3ade7b65-825c-4505-b111-d566b5f264a1/artifacts/ekuvpyca_logo%20transparent.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white" data-testid="footer">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src={LOGO_TRANSPARENT} 
              alt="Global Jobs Consulting" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Agenție de recrutare All-Inclusive în România, Austria și Serbia. 
              Peste 30 de parteneri în 18 țări din Asia și Africa.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="p-2 bg-white/10 rounded-full hover:bg-coral transition"
                 data-testid="footer-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/10 rounded-full hover:bg-coral transition"
                 data-testid="footer-linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-white/10 rounded-full hover:bg-coral transition"
                 data-testid="footer-instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Link-uri Rapide</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/angajatori" className="text-gray-300 hover:text-coral transition text-sm" data-testid="footer-link-angajatori">
                  Pentru Angajatori
                </Link>
              </li>
              <li>
                <Link to="/candidati" className="text-gray-300 hover:text-coral transition text-sm" data-testid="footer-link-candidati">
                  Portal Candidați
                </Link>
              </li>
              <li>
                <Link to="/servicii" className="text-gray-300 hover:text-coral transition text-sm" data-testid="footer-link-servicii">
                  Servicii All-Inclusive
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-coral transition text-sm" data-testid="footer-link-blog">
                  Blog & Noutăți
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-coral transition text-sm" data-testid="footer-link-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Domenii</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>HoReCa</li>
              <li>Construcții</li>
              <li>Agricultură</li>
              <li>Depozite & Logistică</li>
              <li>Producție</li>
              <li>Servicii</li>
            </ul>
          </div>

          {/* Contact Info - SEO Local */}
          <div itemScope itemType="http://schema.org/Organization">
            <h4 className="font-heading text-lg font-semibold mb-4">Contact</h4>
            <address className="not-italic space-y-3 text-sm">
              <p className="flex items-start gap-2 text-gray-300" itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
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
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} Global Jobs Consulting. Toate drepturile rezervate.</p>
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
