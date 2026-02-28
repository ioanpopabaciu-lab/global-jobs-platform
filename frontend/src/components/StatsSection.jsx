import { useEffect, useState } from "react";
import { Globe, Users, Building, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const defaultStats = {
  partner_agencies: 11,
  experience_years: 4,
  continents: 2,
  target_markets: 3
};

const content = {
  ro: {
    items: [
      { label: "Agenții Partenere", description: "În Asia și Africa" },
      { label: "Ani de Experiență", description: "În recrutare internațională" },
      { label: "Continente", description: "Acoperire globală" },
      { label: "Piețe Europene", description: "RO | AT | RS" }
    ]
  },
  en: {
    items: [
      { label: "Partner Agencies", description: "In Asia and Africa" },
      { label: "Years of Experience", description: "In international recruitment" },
      { label: "Continents", description: "Global coverage" },
      { label: "European Markets", description: "RO | AT | RS" }
    ]
  },
  de: {
    items: [
      { label: "Partneragenturen", description: "In Asien und Afrika" },
      { label: "Jahre Erfahrung", description: "Im internationalen Recruiting" },
      { label: "Kontinente", description: "Globale Abdeckung" },
      { label: "Europäische Märkte", description: "RO | AT | RS" }
    ]
  },
  sr: {
    items: [
      { label: "Partnerske agencije", description: "U Aziji i Africi" },
      { label: "Godina iskustva", description: "U međunarodnom zapošljavanju" },
      { label: "Kontinenta", description: "Globalna pokrivenost" },
      { label: "Evropska tržišta", description: "RO | AT | RS" }
    ]
  }
};

const icons = [Building, Calendar, Globe, Users];

export default function StatsSection() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({
          partner_agencies: 11,
          experience_years: 4,
          continents: data.continents || 2,
          target_markets: 3
        });
      })
      .catch(() => {});
  }, []);

  const values = [stats.partner_agencies, stats.experience_years, stats.continents, stats.target_markets];

  return (
    <section className="py-16 bg-gradient-to-r from-navy-900 to-navy-800" data-testid="stats-section">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <div 
                key={index}
                className="text-center group"
                data-testid={`stat-item-${index}`}
              >
                <div className="inline-flex items-center justify-center p-3 bg-coral/20 rounded-full mb-4 group-hover:bg-coral/30 transition-colors">
                  <Icon className="h-6 w-6 text-coral" />
                </div>
                <div className="font-heading text-4xl md:text-5xl font-bold text-white mb-1">
                  {values[index]}
                </div>
                <div className="text-white font-semibold mb-1">{item.label}</div>
                <div className="text-navy-300 text-sm">{item.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
