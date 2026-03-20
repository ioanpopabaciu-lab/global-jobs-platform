import { Link } from "react-router-dom";
import { Phone, FileText } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const translations = {
  ro: { call: "Sună Acum", offer: "Solicită Ofertă" },
  en: { call: "Call Now", offer: "Request Quote" },
  de: { call: "Jetzt Anrufen", offer: "Angebot Anfordern" },
  sr: { call: "Pozovite Sada", offer: "Zatražite Ponudu" }
};

export default function MobileStickyCTA() {
  const { language, getLocalizedPath } = useLanguage();
  const t = translations[language] || translations.ro;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden" data-testid="mobile-sticky-cta">
      <div className="grid grid-cols-2 gap-0">
        <a
          href="tel:+40732403464"
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-4 text-sm font-semibold hover:bg-green-700 transition-colors"
          data-testid="sticky-call-btn"
        >
          <Phone className="h-5 w-5" />
          <span>{t.call}</span>
        </a>
        <Link
          to={getLocalizedPath('/formular-angajator')}
          className="flex items-center justify-center gap-2 bg-coral text-white py-4 text-sm font-semibold hover:bg-red-600 transition-colors"
          data-testid="sticky-offer-btn"
        >
          <FileText className="h-5 w-5" />
          <span>{t.offer}</span>
        </Link>
      </div>
    </div>
  );
}
