import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("gjc_cookies_accepted");
    if (!cookiesAccepted) {
      // Show banner after a small delay
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
                Utilizăm cookie-uri
              </h3>
              <p className="text-sm text-gray-600">
                Acest website utilizează cookie-uri esențiale pentru funcționarea corectă a site-ului și 
                pentru a vă oferi o experiență optimă de navigare.{" "}
                <Link 
                  to="/politica-confidentialitate" 
                  className="text-coral hover:underline"
                >
                  Aflați mai multe
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
              Doar esențiale
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-coral hover:bg-red-600 text-white"
              data-testid="cookie-accept-btn"
            >
              Accept toate
            </Button>
            <button
              onClick={handleDecline}
              className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
              aria-label="Închide"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
