import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  UtensilsCrossed, 
  Tractor, 
  Warehouse, 
  Factory, 
  Anchor,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const content = {
  ro: {
    label: "Domenii de Activitate",
    title: "Servicii Complete de Recrutare Internațională",
    description: "De la identificarea candidaților potriviți până la integrarea lor completă în echipa dumneavoastră, oferim o gamă completă de servicii pentru a vă ajuta să găsiți forța de muncă de care aveți nevoie.",
    cta: "Solicită Personal Acum",
    learnMore: "Află mai multe",
    new: "NOU",
    highlyQualified: "Personal Înalt Calificat",
    services: [
      { title: "Construcții", description: "Muncitori calificați și necalificați pentru șantiere, infrastructură și renovări.", features: ["Zidari", "Fierari Betonişti", "Dulgheri", "Instalatori"] },
      { title: "HoReCa", description: "Personal dedicat pentru hoteluri, restaurante și servicii de catering.", features: ["Bucătari", "Ospătari", "Recepționeri", "Cameriste"] },
      { title: "Nave de Croazieră", description: "Personal înalt calificat pentru industria maritimă și nave de croazieră internaționale.", features: ["Bucătari Șef", "Ospătari", "Tehnicieni", "Personal Spa"] },
      { title: "Agricultură", description: "Lucrători sezonieri sau permanenți pentru ferme și procesare agricolă.", features: ["Muncitori Sezonieri", "Operatori Utilaje", "Sortatori"] },
      { title: "Depozite & Logistică", description: "Personal pentru operațiuni de depozitare, sortare și distribuție.", features: ["Stivuitorişti", "Ambalatori", "Picking", "Inventory"] },
      { title: "Producție", description: "Operatori pentru linii de producție, asamblare și control calitate.", features: ["Operatori CNC", "Asamblori", "Controlori Calitate"] }
    ]
  },
  en: {
    label: "Industries",
    title: "Complete International Recruitment Services",
    description: "From identifying suitable candidates to their complete integration into your team, we offer a full range of services to help you find the workforce you need.",
    cta: "Request Staff Now",
    learnMore: "Learn more",
    new: "NEW",
    highlyQualified: "Highly Qualified Staff",
    services: [
      { title: "Construction", description: "Skilled and unskilled workers for construction sites, infrastructure, and renovations.", features: ["Masons", "Reinforcement Workers", "Carpenters", "Plumbers"] },
      { title: "HoReCa", description: "Dedicated staff for hotels, restaurants, and catering services.", features: ["Chefs", "Waiters", "Receptionists", "Housekeepers"] },
      { title: "Cruise Ships", description: "Highly qualified staff for the maritime industry and international cruise ships.", features: ["Head Chefs", "Waiters", "Technicians", "Spa Staff"] },
      { title: "Agriculture", description: "Seasonal or permanent workers for farms and agricultural processing.", features: ["Seasonal Workers", "Equipment Operators", "Sorters"] },
      { title: "Warehousing & Logistics", description: "Staff for warehousing, sorting, and distribution operations.", features: ["Forklift Operators", "Packers", "Picking", "Inventory"] },
      { title: "Manufacturing", description: "Operators for production lines, assembly, and quality control.", features: ["CNC Operators", "Assemblers", "Quality Controllers"] }
    ]
  },
  de: {
    label: "Tätigkeitsbereiche",
    title: "Komplette internationale Recruiting-Dienstleistungen",
    description: "Von der Identifizierung geeigneter Kandidaten bis zu ihrer vollständigen Integration in Ihr Team bieten wir eine komplette Palette von Dienstleistungen.",
    cta: "Personal jetzt anfordern",
    learnMore: "Mehr erfahren",
    new: "NEU",
    highlyQualified: "Hochqualifiziertes Personal",
    services: [
      { title: "Bauwesen", description: "Qualifizierte und ungelernte Arbeiter für Baustellen, Infrastruktur und Renovierungen.", features: ["Maurer", "Eisenbieger", "Zimmerer", "Installateure"] },
      { title: "HoReCa", description: "Engagiertes Personal für Hotels, Restaurants und Catering-Services.", features: ["Köche", "Kellner", "Rezeptionisten", "Zimmermädchen"] },
      { title: "Kreuzfahrtschiffe", description: "Hochqualifiziertes Personal für die maritime Industrie und internationale Kreuzfahrtschiffe.", features: ["Chefköche", "Kellner", "Techniker", "Spa-Personal"] },
      { title: "Landwirtschaft", description: "Saisonale oder dauerhafte Arbeiter für Bauernhöfe und landwirtschaftliche Verarbeitung.", features: ["Saisonarbeiter", "Maschinenbediener", "Sortierer"] },
      { title: "Lager & Logistik", description: "Personal für Lager-, Sortier- und Vertriebsoperationen.", features: ["Staplerfahrer", "Verpacker", "Kommissionierer", "Inventar"] },
      { title: "Produktion", description: "Bediener für Produktionslinien, Montage und Qualitätskontrolle.", features: ["CNC-Bediener", "Monteure", "Qualitätsprüfer"] }
    ]
  },
  sr: {
    label: "Oblasti delovanja",
    title: "Kompletne usluge međunarodnog zapošljavanja",
    description: "Od identifikacije odgovarajućih kandidata do njihove potpune integracije u vaš tim, nudimo kompletan spektar usluga kako bismo vam pomogli da pronađete radnu snagu.",
    cta: "Zatražite osoblje sada",
    learnMore: "Saznaj više",
    new: "NOVO",
    highlyQualified: "Visokokvalifikovano osoblje",
    services: [
      { title: "Građevinarstvo", description: "Kvalifikovani i nekvalifikovani radnici za gradilišta, infrastrukturu i renoviranja.", features: ["Zidari", "Armirači", "Tesari", "Vodoinstalateri"] },
      { title: "HoReCa", description: "Posvećeno osoblje za hotele, restorane i ketering usluge.", features: ["Kuvari", "Konobari", "Recepcioneri", "Sobarice"] },
      { title: "Kruzeri", description: "Visokokvalifikovano osoblje za pomorsku industriju i međunarodne kruzere.", features: ["Glavni kuvari", "Konobari", "Tehničari", "Spa osoblje"] },
      { title: "Poljoprivreda", description: "Sezonski ili stalni radnici za farme i poljoprivrednu preradu.", features: ["Sezonski radnici", "Operateri mašina", "Sorteri"] },
      { title: "Skladišta i logistika", description: "Osoblje za skladištenje, sortiranje i distribuciju.", features: ["Viljuškari", "Pakeri", "Komisioniranje", "Inventar"] },
      { title: "Proizvodnja", description: "Operateri za proizvodne linije, montažu i kontrolu kvaliteta.", features: ["CNC operateri", "Monteri", "Kontrolori kvaliteta"] }
    ]
  }
};

const icons = [Building2, UtensilsCrossed, Anchor, Tractor, Warehouse, Factory];
const images = [
  "https://images.unsplash.com/photo-1628146023674-ede6049609b1?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1740990620245-33a275e53d30?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1576723663021-50f22f3d2578?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1769412447940-0932db51a5bf?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1768796373360-95d80c5830fb?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  "https://images.unsplash.com/photo-1687422810663-c316494f725a?crop=entropy&cs=srgb&fm=jpg&w=400&q=80"
];
const spans = [
  "col-span-1 md:col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 md:col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1"
];

export default function ServicesGrid() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <section className="py-20 bg-gray-50" data-testid="services-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-coral font-semibold text-sm tracking-wider">
            {t.label}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
            {t.title}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.services.map((service, index) => {
            const Icon = icons[index];
            const isHighlighted = index === 2; // Cruise Ships
            return (
              <Card 
                key={index}
                className={`${spans[index]} group bg-white border-gray-200 hover:border-coral/50 transition-all duration-300 service-card cursor-pointer rounded-xl overflow-hidden ${
                  isHighlighted ? "ring-2 ring-coral/20" : ""
                }`}
                data-testid={`service-card-${index}`}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Image Header for highlighted services */}
                  {isHighlighted && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={images[index]} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        width={400}
                        height={160}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <span className="bg-coral text-white text-xs px-2 py-1 rounded-full font-semibold">
                          {t.new}
                        </span>
                        <span className="text-white text-sm font-medium">{t.highlyQualified}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl text-white transition-colors ${
                        isHighlighted ? "bg-coral group-hover:bg-red-600" : "bg-coral group-hover:bg-navy-900"
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-xl font-bold text-navy-900">
                          {service.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Link 
                      to="/servicii"
                      className="inline-flex items-center text-coral font-medium text-sm hover:text-navy-900 transition-colors"
                    >
                      {t.learnMore}
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/angajatori"
            className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-semibold hover:bg-red-600 transition-colors shadow-lg"
            data-testid="services-cta"
          >
            {t.cta}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
