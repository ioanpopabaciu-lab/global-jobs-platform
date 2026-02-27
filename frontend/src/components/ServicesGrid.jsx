import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  UtensilsCrossed, 
  Tractor, 
  Warehouse, 
  Factory, 
  Wrench,
  ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Construcții",
    description: "Muncitori calificați și necalificați pentru șantiere, infrastructură și renovări.",
    features: ["Zidari", "Fierari Betonişti", "Dulgheri", "Instalatori"],
    span: "col-span-1 md:col-span-2 row-span-1"
  },
  {
    icon: UtensilsCrossed,
    title: "HoReCa",
    description: "Personal dedicat pentru hoteluri, restaurante și servicii de catering.",
    features: ["Bucătari", "Ospătari", "Recepționeri", "Cameriste"],
    span: "col-span-1 row-span-1"
  },
  {
    icon: Tractor,
    title: "Agricultură",
    description: "Lucrători sezonieri sau permanenți pentru ferme și procesare agricolă.",
    features: ["Muncitori Sezonieri", "Operatori Utilaje", "Sortatori"],
    span: "col-span-1 row-span-1"
  },
  {
    icon: Warehouse,
    title: "Depozite & Logistică",
    description: "Personal pentru operațiuni de depozitare, sortare și distribuție.",
    features: ["Stivuitorişti", "Ambalatori", "Picking", "Inventory"],
    span: "col-span-1 row-span-1"
  },
  {
    icon: Factory,
    title: "Producție",
    description: "Operatori pentru linii de producție, asamblare și control calitate.",
    features: ["Operatori CNC", "Asamblori", "Controlori Calitate"],
    span: "col-span-1 md:col-span-2 row-span-1"
  }
];

export default function ServicesGrid() {
  return (
    <section className="py-20 bg-gray-50" data-testid="services-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-coral font-semibold text-sm tracking-wider">
            Domenii de Activitate
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
            Industrii Acoperite
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Recrutăm forță de muncă calificată și necalificată pentru multiple 
            sectoare industriale din România, Austria și Serbia.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className={`${service.span} group bg-white border-gray-200 hover:border-coral/50 transition-all duration-300 service-card cursor-pointer rounded-xl`}
                data-testid={`service-card-${service.title.toLowerCase()}`}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-coral rounded-xl text-white group-hover:bg-navy-900 transition-colors">
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
