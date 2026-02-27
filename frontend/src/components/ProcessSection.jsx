import { Link } from "react-router-dom";
import { 
  Search, 
  FileCheck, 
  Plane, 
  Users,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Selecție Riguroasă",
    description: "Identificăm candidații potriviți prin rețeaua noastră de 30+ agenții partenere din 18 țări.",
    features: ["Verificare documente", "Testare aptitudini", "Interviuri video"]
  },
  {
    icon: FileCheck,
    step: "02",
    title: "Documentație Completă",
    description: "Gestionăm integral procesul de imigrare: vize, permise de muncă și autorizații.",
    features: ["Dosare vize", "Permise de muncă", "Traduceri legalizate"]
  },
  {
    icon: Plane,
    step: "03",
    title: "Logistică & Transport",
    description: "Organizăm transportul, cazarea inițială și toate aspectele logistice.",
    features: ["Bilete avion", "Cazare temporară", "Transfer aeroport"]
  },
  {
    icon: Users,
    step: "04",
    title: "Integrare în Echipă",
    description: "Asigurăm o tranziție lină și suport continuu pentru angajat și angajator.",
    features: ["Orientare culturală", "Suport HR", "Monitorizare 6 luni"]
  }
];

export default function ProcessSection() {
  return (
    <section className="py-20 bg-white" data-testid="process-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-navy-600 font-medium text-sm uppercase tracking-wider">
            Servicii All-Inclusive
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-navy-900 mt-2 mb-4">
            PROCESUL NOSTRU
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            De la identificarea candidatului până la integrarea în echipa dumneavoastră, 
            gestionăm fiecare etapă cu profesionalism.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="relative group"
                data-testid={`process-step-${index + 1}`}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-navy-100 z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-navy-300 rounded-full" />
                  </div>
                )}

                <div className="relative z-10 bg-white p-6 rounded-lg border border-gray-100 hover:border-navy-200 hover:shadow-lg transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 bg-navy-900 text-white font-heading font-black text-lg px-3 py-1 rounded-sm">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="mt-4 mb-4 p-3 bg-navy-50 rounded-lg inline-block group-hover:bg-navy-100 transition-colors">
                    <Icon className="h-8 w-8 text-navy-700" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-xl font-bold text-navy-900 uppercase mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-navy-900 rounded-lg p-8 md:p-12 text-center text-white">
          <h3 className="font-heading text-2xl md:text-3xl font-bold uppercase mb-4">
            Soluții Complete de Recrutare
          </h3>
          <p className="text-navy-200 max-w-2xl mx-auto mb-8">
            Nu vă faceți griji cu birocrația și logistica. Noi ne ocupăm de tot, 
            de la selecție până la integrare, astfel încât să vă puteți concentra pe afacerea dumneavoastră.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/servicii"
              className="inline-flex items-center gap-2 bg-white text-navy-900 px-6 py-3 rounded-sm font-semibold hover:bg-gray-100 transition-colors"
              data-testid="process-cta-services"
            >
              Vezi Toate Serviciile
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-sm font-semibold hover:bg-white/10 transition-colors"
              data-testid="process-cta-contact"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
