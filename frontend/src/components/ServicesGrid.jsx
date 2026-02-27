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

const services = [
  {
    icon: Building2,
    title: "Construcții",
    description: "Muncitori calificați și necalificați pentru șantiere, infrastructură și renovări.",
    features: ["Zidari", "Fierari Betonişti", "Dulgheri", "Instalatori"],
    image: "https://images.unsplash.com/photo-1628146023674-ede6049609b1?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    span: "col-span-1 md:col-span-2 row-span-1"
  },
  {
    icon: UtensilsCrossed,
    title: "HoReCa",
    description: "Personal dedicat pentru hoteluri, restaurante și servicii de catering.",
    features: ["Bucătari", "Ospătari", "Recepționeri", "Cameriste"],
    image: "https://images.unsplash.com/photo-1740990620245-33a275e53d30?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    span: "col-span-1 row-span-1"
  },
  {
    icon: Anchor,
    title: "Nave de Croazieră",
    description: "Personal înalt calificat pentru industria maritimă și nave de croazieră internaționale.",
    features: ["Bucătari Șef", "Ospătari", "Tehnicieni", "Personal Spa"],
    image: "https://images.unsplash.com/photo-1576723663021-50f22f3d2578?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    span: "col-span-1 md:col-span-2 row-span-1",
    highlighted: true
  },
  {
    icon: Tractor,
    title: "Agricultură",
    description: "Lucrători sezonieri sau permanenți pentru ferme și procesare agricolă.",
    features: ["Muncitori Sezonieri", "Operatori Utilaje", "Sortatori"],
    image: "https://images.unsplash.com/photo-1769412447940-0932db51a5bf?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    span: "col-span-1 row-span-1"
  },
  {
    icon: Warehouse,
    title: "Depozite & Logistică",
    description: "Personal pentru operațiuni de depozitare, sortare și distribuție.",
    features: ["Stivuitorişti", "Ambalatori", "Picking", "Inventory"],
    image: "https://images.unsplash.com/photo-1768796373360-95d80c5830fb?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    span: "col-span-1 row-span-1"
  },
  {
    icon: Factory,
    title: "Producție",
    description: "Operatori pentru linii de producție, asamblare și control calitate.",
    features: ["Operatori CNC", "Asamblori", "Controlori Calitate"],
    image: "https://images.unsplash.com/photo-1687422810663-c316494f725a?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    span: "col-span-1 row-span-1"
  }
];

export default function ServicesGrid() {
  return (
    <section className="py-20 bg-gray-50" data-testid="services-section">
      <div className="container mx-auto px-4">
        {/* Section Header - Updated text */}
        <div className="text-center mb-12">
          <span className="text-coral font-semibold text-sm tracking-wider">
            Domenii de Activitate
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
            Servicii Complete de Recrutare Internațională
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            De la identificarea candidaților potriviți până la integrarea lor completă în echipa 
            dumneavoastră, oferim o gamă completă de servicii pentru a vă ajuta să găsiți 
            forța de muncă de care aveți nevoie.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className={`${service.span} group bg-white border-gray-200 hover:border-coral/50 transition-all duration-300 service-card cursor-pointer rounded-xl overflow-hidden ${
                  service.highlighted ? "ring-2 ring-coral/20" : ""
                }`}
                data-testid={`service-card-${service.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Image Header for highlighted services */}
                  {service.highlighted && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={service.image} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <span className="bg-coral text-white text-xs px-2 py-1 rounded-full font-semibold">
                          NOU
                        </span>
                        <span className="text-white text-sm font-medium">Personal Înalt Calificat</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl text-white transition-colors ${
                        service.highlighted ? "bg-coral group-hover:bg-red-600" : "bg-coral group-hover:bg-navy-900"
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
                      Află mai multe
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
            Solicită Personal Acum
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
