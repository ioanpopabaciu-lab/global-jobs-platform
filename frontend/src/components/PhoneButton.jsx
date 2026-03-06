import { Phone } from "lucide-react";

export default function PhoneButton() {
  return (
    <a
      href="tel:+40732403464"
      className="fixed bottom-52 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
      aria-label="Sună acum: +40 732 403 464"
      data-testid="phone-button"
    >
      <Phone className="h-6 w-6" />
    </a>
  );
}
