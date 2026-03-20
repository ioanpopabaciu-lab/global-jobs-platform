import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const content = {
  ro: {
    title: "Utilizăm cookie-uri",
    text: "Acest website utilizează cookie-uri esențiale pentru funcționarea corectă a site-ului și pentru a vă oferi o experiență optimă de navigare.",
    learnMore: "Aflați mai multe",
    essential: "Doar esențiale",
    acceptAll: "Accept toate",
    close: "Închide"
  },
  en: {
    title: "We use cookies",
    text: "This website uses essential cookies for the proper functioning of the site and to provide you with an optimal browsing experience.",
    learnMore: "Learn more",
    essential: "Essential only",
    acceptAll: "Accept all",
    close: "Close"
  },
  de: {
    title: "Wir verwenden Cookies",
    text: "Diese Website verwendet essentielle Cookies für die ordnungsgemäße Funktion der Website und um Ihnen ein optimales Surferlebnis zu bieten.",
    learnMore: "Mehr erfahren",
    essential: "Nur essenzielle",
    acceptAll: "Alle akzeptieren",
    close: "Schließen"
  },
  sr: {
    title: "Koristimo kolačiće",
    text: "Ova web stranica koristi esencijalne kolačiće za pravilno funkcionisanje sajta i kako bi vam pružila optimalno iskustvo pregledanja.",
    learnMore: "Saznaj više",
    essential: "Samo esencijalni",
    acceptAll: "Prihvati sve",
    close: "Zatvori"
  }
};

export default function CookieBanner() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem("gjc_cookies_accepted");
    if (!cookiesAccepted) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gjc_cookies_accepted", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("gjc_cookies_accepted", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-bottom duration-300"
      data-testid="cookie-banner"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-coral flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-navy-900 mb-1">
                {t.title}
              </h3>
              <p className="text-sm text-gray-600">
                {t.text}{" "}
                <Link 
                  to="/politica-confidentialitate" 
                  className="text-coral hover:underline"
                >
                  {t.learnMore}
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="text-gray-600 border-gray-300 hover:bg-gray-100"
              data-testid="cookie-decline-btn"
            >
              {t.essential}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-coral hover:bg-red-600 text-white"
              data-testid="cookie-accept-btn"
            >
              {t.acceptAll}
            </Button>
            <button
              onClick={handleDecline}
              className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
