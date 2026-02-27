import { useEffect, useState } from "react";
import { Globe, Users, Building, MapPin } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const defaultStats = {
  partner_agencies: 30,
  partner_countries: 18,
  continents: 2,
  target_markets: 3
};

export default function StatsSection() {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    fetch(`${API}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats({
          partner_agencies: data.partner_agencies || 30,
          partner_countries: data.partner_countries || 18,
          continents: data.continents || 2,
          target_markets: 3
        });
      })
      .catch(() => {});
  }, []);

  const statItems = [
    {
      icon: Building,
      value: `${stats.partner_agencies}+`,
      label: "Agenții Partenere",
      description: "Rețea globală de recrutare"
    },
    {
      icon: Globe,
      value: stats.partner_countries,
      label: "Țări Sursă",
      description: "Din Asia și Africa"
    },
    {
      icon: MapPin,
      value: stats.continents,
      label: "Continente",
      description: "Acoperire globală"
    },
    {
      icon: Users,
      value: stats.target_markets,
      label: "Piețe Europene",
      description: "RO | AT | RS"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-navy-900 to-navy-800" data-testid="stats-section">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((item, index) => {
            const Icon = item.icon;
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
                  {item.value}
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
