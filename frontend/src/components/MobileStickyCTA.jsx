import { Link } from "react-router-dom";
import { MessageCircle, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const translations = {
  ro: { consult: "Solicită Consultanță", recruit: "Recrutare Non-UE" },
  en: { consult: "Request Consultation", recruit: "Non-EU Recruitment" },
  de: { consult: "Beratung Anfordern", recruit: "Nicht-EU Rekrutierung" },
  sr: { consult: "Zatražite Konsultaciju", recruit: "Non-EU Regrutacija" }
};

export default function MobileStickyCTA() {
  const { language, getLocalizedPath } = useLanguage();
  const t = translations[language] || translations.ro;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden" data-testid="mobile-sticky-cta">
      <div className="grid grid-cols-2 gap-0">
        <Link
          to={getLocalizedPath('/contact')}
          className="flex items-center justify-center gap-2 bg-navy-900 text-white py-4 text-sm font-semibold hover:bg-navy-800 transition-colors"
          data-testid="sticky-consult-btn"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="truncate">{t.consult}</span>
        </Link>
        <Link
          to={getLocalizedPath('/formular-angajator')}
          className="flex items-center justify-center gap-2 bg-coral text-white py-4 text-sm font-semibold hover:bg-red-600 transition-colors"
          data-testid="sticky-recruit-btn"
        >
          <Users className="h-4 w-4" />
          <span className="truncate">{t.recruit}</span>
        </Link>
      </div>
    </div>
  );
}
