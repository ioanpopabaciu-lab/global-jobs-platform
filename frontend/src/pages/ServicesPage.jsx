import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { 
  Search, 
  FileCheck, 
  Plane, 
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  UtensilsCrossed,
  Tractor,
  Warehouse,
  Factory,
  Shield,
  Clock,
  Globe,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const processSteps = [
  {
    icon: Search,
    step: "01",
    title: "Analiză Cerințe",
    description: "Înțelegem în detaliu nevoile specifice ale companiei dumneavoastră: număr de angajați, calificări, termen de livrare și condiții oferite."
  },
  {
    icon: Users,
    step: "02",
    title: "Selecție Candidați",
    description: "Folosim rețeaua noastră de 30+ agenții partenere pentru a identifica și intervieva candidații potriviți din 18 țări."
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Documentație Completă",
    description: "Pregătim toate documentele necesare: contracte, vize de muncă, permise de ședere, traduceri legalizate și autorizații."
  },
  {
    icon: Plane,
    step: "04",
    title: "Logistică & Transport",
    description: "Organizăm transportul candidaților, cazarea inițială și toate detaliile logistice pentru o sosire fără probleme."
  },
  {
    icon: Shield,
    step: "05",
    title: "Integrare",
    description: "Asigurăm orientarea culturală, suportul lingvistic și adaptarea la noul mediu de lucru pentru o tranziție lină."
  },
  {
    icon: Award,
    step: "06",
    title: "Monitorizare",
    description: "Oferim suport continuu pe primele 6 luni, cu verificări periodice pentru a asigura satisfacția ambelor părți."
  }
];

const industries = [
  {
    icon: Building2,
    title: "Construcții",
    description: "Muncitori calificați și necalificați pentru șantiere, infrastructură, renovări și construcții industriale.",
    roles: ["Zidari", "Fierari Betonişti", "Dulgheri", "Instalatori", "Electricieni", "Muncitori Necalificați"]
  },
  {
    icon: UtensilsCrossed,
    title: "HoReCa",
    description: "Personal dedicat pentru hoteluri, restaurante, catering și servicii de ospitalitate.",
    roles: ["Bucătari", "Ajutori Bucătar", "Ospătari", "Barmani", "Cameriste", "Recepționeri"]
  },
  {
    icon: Tractor,
    title: "Agricultură",
    description: "Lucrători sezonieri sau permanenți pentru ferme, plantații și procesare agricolă.",
    roles: ["Culegători", "Muncitori Sezonieri", "Operatori Utilaje", "Sortatori", "Ambalatori"]
  },
  {
    icon: Warehouse,
    title: "Depozite & Logistică",
    description: "Personal pentru operațiuni de depozitare, sortare, ambalare și distribuție.",
    roles: ["Stivuitorişti", "Picker-i", "Ambalatori", "Operatori Scanare", "Sortatori"]
  },
  {
    icon: Factory,
    title: "Producție",
    description: "Operatori pentru linii de producție, asamblare, control calitate și întreținere.",
    roles: ["Operatori CNC", "Asamblori", "Sudori", "Controlori Calitate", "Operatori Mașini"]
  }
];

const advantages = [
  {
    icon: Globe,
    title: "Acoperire Globală",
    stat: "18 Țări",
    description: "Accesăm candidați din cele mai mari rezerve de forță de muncă din Asia și Africa."
  },
  {
    icon: Shield,
    title: "Conformitate 100%",
    stat: "Legală",
    description: "Gestionăm integral documentația pentru conformitatea cu legislația din RO, AT și RS."
  },
  {
    icon: Clock,
    title: "Timp de Livrare",
    stat: "30-90 Zile",
    description: "De la solicitare până la sosirea candidaților, în funcție de țara de destinație."
  },
  {
    icon: Award,
    title: "Garanție",
    stat: "6 Luni",
    description: "Monitorizare și suport continuu, cu înlocuire gratuită dacă este necesar."
  }
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Servicii All-Inclusive | Global Jobs Consulting</title>
        <meta name="description" content="Servicii complete de recrutare internațională: selecție, documentație, vize, transport și integrare pentru angajatorii din România, Austria și Serbia." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20" data-testid="services-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-20 mb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-navy-300 font-medium text-sm  tracking-wider">
                Servicii All-Inclusive
              </span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-6xl font-bold  mt-2 mb-6">
                SOLUȚII COMPLETE DE RECRUTARE
              </h1>
              <p className="text-navy-200 text-lg mb-8">
                De la identificarea candidatului perfect până la integrarea cu succes în 
                echipa dumneavoastră - ne ocupăm de fiecare detaliu pentru ca dumneavoastră 
                să vă concentrați pe afacere.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100 rounded-full font-semibold">
                  <Link to="/angajatori" data-testid="services-cta-employer">
                    Solicită Personal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full font-semibold">
                  <Link to="/contact" data-testid="services-cta-contact">
                    Contactează-ne
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Process Steps */}
          <section className="mb-20" data-testid="process-steps">
            <div className="text-center mb-12">
              <span className="text-navy-600 font-medium text-sm  tracking-wider">
                Procesul Nostru
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                CUM FUNCȚIONEAZĂ
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Un proces structurat în 6 pași care asigură transparența și succesul 
                fiecărui proiect de recrutare.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="border-gray-200 hover:border-navy-300 transition-colors" data-testid={`process-step-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="bg-navy-900 text-white font-heading font-bold text-lg px-3 py-1 rounded-full">
                          {step.step}
                        </div>
                        <div className="p-2 bg-navy-50 rounded-lg">
                          <Icon className="h-6 w-6 text-navy-700" />
                        </div>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-navy-900  mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Industries */}
          <section className="mb-20 bg-gray-50 -mx-4 px-4 py-16" data-testid="industries-section">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <span className="text-navy-600 font-medium text-sm  tracking-wider">
                  Domenii de Activitate
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                  INDUSTRII ACOPERITE
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {industries.map((industry, index) => {
                  const Icon = industry.icon;
                  return (
                    <Card key={index} className="bg-white" data-testid={`industry-${index}`}>
                      <CardContent className="p-6">
                        <div className="p-3 bg-navy-900 rounded-lg text-white inline-block mb-4">
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="font-heading text-xl font-bold text-navy-900  mb-2">
                          {industry.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {industry.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {industry.roles.slice(0, 4).map((role, idx) => (
                            <span key={idx} className="text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded">
                              {role}
                            </span>
                          ))}
                          {industry.roles.length > 4 && (
                            <span className="text-xs bg-navy-100 text-navy-700 px-2 py-1 rounded">
                              +{industry.roles.length - 4} mai multe
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Advantages */}
          <section className="mb-20" data-testid="advantages-section">
            <div className="text-center mb-12">
              <span className="text-navy-600 font-medium text-sm  tracking-wider">
                De Ce Noi
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                AVANTAJE CHEIE
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((adv, index) => {
                const Icon = adv.icon;
                return (
                  <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:border-navy-300 transition-colors" data-testid={`advantage-${index}`}>
                    <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-navy-700" />
                    </div>
                    <div className="font-heading text-3xl font-bold text-navy-900 mb-1">
                      {adv.stat}
                    </div>
                    <h3 className="font-semibold text-navy-800 mb-2">{adv.title}</h3>
                    <p className="text-gray-500 text-sm">{adv.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-navy-900 rounded-lg p-8 md:p-12 text-center text-white" data-testid="services-final-cta">
            <h2 className="font-heading text-3xl md:text-4xl font-bold  mb-4">
              Gata să Începeți?
            </h2>
            <p className="text-navy-200 max-w-2xl mx-auto mb-8">
              Contactați-ne astăzi pentru o consultație gratuită și aflați cum vă putem 
              ajuta să găsiți forța de muncă de care aveți nevoie.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100 rounded-full font-semibold">
                <Link to="/angajatori">
                  Solicită Ofertă
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full font-semibold">
                <Link to="/contact">
                  Contactează-ne
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
