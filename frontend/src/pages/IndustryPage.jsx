import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, CheckCircle, Users, Clock, Shield, Building2 } from 'lucide-react';

// Industry-specific content
const industriesData = {
  construction: {
    ro: {
      title: "Muncitori în Construcții",
      subtitle: "Personal calificat și necalificat pentru proiecte de construcții",
      metaTitle: "Muncitori în Construcții | Global Jobs Consulting",
      metaDescription: "Recrutăm muncitori calificați și necalificați pentru sectorul construcțiilor din România, Austria și Serbia.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200",
      positions: ["Dulgheri", "Zidari", "Fierari betonisti", "Instalatori", "Electricieni", "Operatori utilaje", "Muncitori necalificați"],
      benefits: ["Experiență dovedită în proiecte mari", "Certificări și calificări verificate", "Capacitate fizică testată", "Disponibilitate pentru ore suplimentare"],
      stats: { workers: "500+", projects: "50+", satisfaction: "98%" }
    },
    en: {
      title: "Construction Workers",
      subtitle: "Skilled and unskilled workers for construction projects",
      metaTitle: "Construction Workers | Global Jobs Consulting",
      metaDescription: "We recruit skilled and unskilled workers for the construction sector in Romania, Austria and Serbia.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200",
      positions: ["Carpenters", "Masons", "Concrete Workers", "Plumbers", "Electricians", "Equipment Operators", "General Laborers"],
      benefits: ["Proven experience in large projects", "Verified certifications", "Tested physical capacity", "Availability for overtime"],
      stats: { workers: "500+", projects: "50+", satisfaction: "98%" }
    }
  },
  hospitality: {
    ro: {
      title: "Personal HoReCa",
      subtitle: "Profesioniști pentru hoteluri, restaurante și turism",
      metaTitle: "Personal HoReCa | Global Jobs Consulting",
      metaDescription: "Recrutăm bucătari, ospătari și personal hotelier pentru industria HoReCa din Europa.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
      positions: ["Bucătari", "Ajutori bucătar", "Ospătari", "Barmani", "Personal curățenie", "Recepționeri", "Personal cameriste"],
      benefits: ["Experiență în restaurante și hoteluri", "Abilități multilingve", "Orientare către client", "Flexibilitate program"],
      stats: { workers: "300+", projects: "40+", satisfaction: "97%" }
    },
    en: {
      title: "HoReCa Staff",
      subtitle: "Professionals for hotels, restaurants and tourism",
      metaTitle: "HoReCa Staff | Global Jobs Consulting",
      metaDescription: "We recruit chefs, waiters and hotel staff for the HoReCa industry in Europe.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200",
      positions: ["Chefs", "Kitchen Helpers", "Waiters", "Bartenders", "Cleaning Staff", "Receptionists", "Housekeepers"],
      benefits: ["Restaurant and hotel experience", "Multilingual skills", "Customer orientation", "Schedule flexibility"],
      stats: { workers: "300+", projects: "40+", satisfaction: "97%" }
    }
  },
  agriculture: {
    ro: {
      title: "Lucrători Agricoli",
      subtitle: "Personal pentru ferme, plantații și procesare agricolă",
      metaTitle: "Lucrători Agricoli | Global Jobs Consulting",
      metaDescription: "Recrutăm lucrători agricoli experimentați pentru ferme și plantații din Europa.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200",
      positions: ["Culegători", "Operatori utilaje agricole", "Îngrijitori animale", "Serristi", "Muncitori sezonieri", "Supraveghetori"],
      benefits: ["Experiență în agricultură", "Rezistență fizică", "Disponibilitate sezonieră", "Adaptabilitate la condiții de muncă"],
      stats: { workers: "400+", projects: "30+", satisfaction: "96%" }
    },
    en: {
      title: "Agricultural Workers",
      subtitle: "Staff for farms, plantations and agricultural processing",
      metaTitle: "Agricultural Workers | Global Jobs Consulting",
      metaDescription: "We recruit experienced agricultural workers for farms and plantations in Europe.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200",
      positions: ["Harvesters", "Agricultural Equipment Operators", "Animal Caretakers", "Greenhouse Workers", "Seasonal Workers", "Supervisors"],
      benefits: ["Agricultural experience", "Physical endurance", "Seasonal availability", "Adaptability to working conditions"],
      stats: { workers: "400+", projects: "30+", satisfaction: "96%" }
    }
  },
  manufacturing: {
    ro: {
      title: "Personal Producție",
      subtitle: "Operatori și muncitori pentru fabrici și linii de producție",
      metaTitle: "Personal Producție | Global Jobs Consulting",
      metaDescription: "Recrutăm operatori și muncitori calificați pentru sectorul de producție din Europa.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200",
      positions: ["Operatori mașini CNC", "Sudori", "Asamblori", "Controlori calitate", "Operatori linii producție", "Tehnicieni"],
      benefits: ["Experiență în producție industrială", "Cunoștințe tehnice", "Atenție la detalii", "Respectarea normelor de siguranță"],
      stats: { workers: "350+", projects: "45+", satisfaction: "97%" }
    },
    en: {
      title: "Manufacturing Staff",
      subtitle: "Operators and workers for factories and production lines",
      metaTitle: "Manufacturing Staff | Global Jobs Consulting",
      metaDescription: "We recruit operators and skilled workers for the manufacturing sector in Europe.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200",
      positions: ["CNC Machine Operators", "Welders", "Assemblers", "Quality Controllers", "Production Line Operators", "Technicians"],
      benefits: ["Industrial production experience", "Technical knowledge", "Attention to detail", "Safety compliance"],
      stats: { workers: "350+", projects: "45+", satisfaction: "97%" }
    }
  },
  logistics: {
    ro: {
      title: "Personal Logistică",
      subtitle: "Muncitori pentru depozite, sortare și operațiuni logistice",
      metaTitle: "Personal Logistică | Global Jobs Consulting",
      metaDescription: "Recrutăm personal pentru depozite și centre logistice din Europa.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200",
      positions: ["Operatori stivuitor", "Sortatori", "Ambalatori", "Manipulanți marfă", "Controlori stocuri", "Șoferi livrare"],
      benefits: ["Experiență în logistică", "Permise stivuitor", "Eficiență și rapiditate", "Lucru în echipă"],
      stats: { workers: "250+", projects: "35+", satisfaction: "98%" }
    },
    en: {
      title: "Logistics Staff",
      subtitle: "Workers for warehouses, sorting and logistics operations",
      metaTitle: "Logistics Staff | Global Jobs Consulting",
      metaDescription: "We recruit staff for warehouses and logistics centers in Europe.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200",
      positions: ["Forklift Operators", "Sorters", "Packers", "Cargo Handlers", "Inventory Controllers", "Delivery Drivers"],
      benefits: ["Logistics experience", "Forklift licenses", "Efficiency and speed", "Teamwork"],
      stats: { workers: "250+", projects: "35+", satisfaction: "98%" }
    }
  }
};

export default function IndustryPage() {
  const { industry } = useParams();
  const { language } = useLanguage();
  
  const industryKey = industry || 'construction';
  const data = industriesData[industryKey];
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Industry not found</p>
      </div>
    );
  }
  
  const t = data[language] || data.ro || data.en;
  
  const ctaPath = language === 'ro' ? '/solicita-muncitori' : 
                  language === 'en' ? '/en/request-workers' :
                  language === 'de' ? '/de/arbeiter-anfordern' : '/sr/zatrazite-radnike';

  return (
    <>
      <Helmet>
        <title>{t?.metaTitle || "Industrie | Global Jobs Consulting"}</title>
        <meta name="description" content={t?.metaDescription || ""} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section 
          className="relative pt-32 pb-20 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,51,102,0.85), rgba(0,51,102,0.85)), url(${t.image})` }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">{t.subtitle}</p>
            <Button 
              asChild 
              size="lg" 
              className="bg-coral hover:bg-red-600 text-white rounded-full px-8 font-semibold"
            >
              <Link to={ctaPath}>
                {language === 'ro' ? 'Solicită Muncitori' : 'Request Workers'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-3xl font-bold text-coral">{t.stats.workers}</div>
                <div className="text-sm text-gray-600">{language === 'ro' ? 'Muncitori Plasați' : 'Workers Placed'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-coral">{t.stats.projects}</div>
                <div className="text-sm text-gray-600">{language === 'ro' ? 'Proiecte' : 'Projects'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-coral">{t.stats.satisfaction}</div>
                <div className="text-sm text-gray-600">{language === 'ro' ? 'Satisfacție' : 'Satisfaction'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Positions */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-900 text-center mb-10">
              {language === 'ro' ? 'Poziții Disponibile' : 'Available Positions'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {t.positions.map((position, index) => (
                <Card key={index} className="border-l-4 border-l-coral">
                  <CardContent className="py-4 px-5 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-coral flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{position}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-900 text-center mb-10">
              {language === 'ro' ? 'De Ce Să Ne Alegeți' : 'Why Choose Us'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {t.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 bg-white p-5 rounded-lg shadow">
                  <div className="p-2 bg-coral/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-coral" />
                  </div>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-navy-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {language === 'ro' ? 'Găsiți Muncitori Acum' : 'Find Workers Now'}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {language === 'ro' 
                ? 'Completați formularul și vă contactăm în 24 de ore' 
                : 'Fill out the form and we will contact you within 24 hours'}
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-coral hover:bg-red-600 text-white rounded-full px-8 font-semibold"
            >
              <Link to={ctaPath}>
                {language === 'ro' ? 'Solicită Ofertă' : 'Request Quote'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
