import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { 
  Search, 
  FileCheck, 
  Plane, 
  Users,
  ArrowRight,
  Building2,
  UtensilsCrossed,
  Tractor,
  Warehouse,
  Factory,
  Anchor,
  Shield,
  Clock,
  Globe,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const content = {
  ro: {
    meta: { title: "Servicii All-Inclusive | Global Jobs Consulting", description: "Servicii complete de recrutare internațională: selecție, documentație, vize, transport și integrare pentru angajatorii din România, Austria și Serbia." },
    hero: { label: "Servicii All-Inclusive", title: "Servicii Complete de Recrutare Internațională", description: "De la identificarea candidaților potriviți până la integrarea lor completă în echipa dumneavoastră, oferim o gamă completă de servicii pentru a vă ajuta să găsiți forța de muncă de care aveți nevoie." },
    cta: { requestStaff: "Solicită Personal", contactUs: "Contactează-ne" },
    process: {
      label: "Procesul Nostru", title: "Cum Funcționează", description: "Un proces structurat în 6 pași care asigură transparența și succesul fiecărui proiect de recrutare.",
      steps: [
        { step: "01", title: "Analiză Cerințe", description: "Înțelegem în detaliu nevoile specifice ale companiei dumneavoastră: număr de angajați, calificări, termen de livrare și condiții oferite." },
        { step: "02", title: "Selecție Candidați", description: "Folosim rețeaua noastră de 11 agenții partenere din Asia și Africa pentru a identifica și intervieva candidații potriviți." },
        { step: "03", title: "Documentație Completă", description: "Pregătim toate documentele necesare: contracte, vize de muncă, permise de ședere, traduceri legalizate și autorizații." },
        { step: "04", title: "Logistică & Transport", description: "Organizăm transportul candidaților, cazarea inițială și toate detaliile logistice pentru o sosire fără probleme." },
        { step: "05", title: "Integrare", description: "Asigurăm orientarea culturală, suportul lingvistic și adaptarea la noul mediu de lucru pentru o tranziție lină." },
        { step: "06", title: "Monitorizare", description: "Oferim suport continuu pe primele 6 luni, cu verificări periodice pentru a asigura satisfacția ambelor părți." }
      ]
    },
    industries: {
      label: "Domenii de Activitate", title: "INDUSTRII ACOPERITE",
      items: [
        { title: "Construcții", description: "Muncitori calificați și necalificați pentru șantiere, infrastructură, renovări și construcții industriale.", roles: ["Zidari", "Fierari Betonişti", "Dulgheri", "Instalatori", "Electricieni", "Muncitori Necalificați"] },
        { title: "HoReCa", description: "Personal dedicat pentru hoteluri, restaurante, catering și servicii de ospitalitate.", roles: ["Bucătari", "Ajutori Bucătar", "Ospătari", "Barmani", "Cameriste", "Recepționeri"] },
        { title: "Nave de Croazieră", description: "Personal înalt calificat pentru industria maritimă și nave de croazieră internaționale.", roles: ["Bucătari Șef", "Ospătari", "Tehnicieni", "Personal Spa", "Barmani", "Recepționeri"] },
        { title: "Agricultură", description: "Lucrători sezonieri sau permanenți pentru ferme, plantații și procesare agricolă.", roles: ["Culegători", "Muncitori Sezonieri", "Operatori Utilaje", "Sortatori", "Ambalatori"] },
        { title: "Depozite & Logistică", description: "Personal pentru operațiuni de depozitare, sortare, ambalare și distribuție.", roles: ["Stivuitorişti", "Picker-i", "Ambalatori", "Operatori Scanare", "Sortatori"] },
        { title: "Producție", description: "Operatori pentru linii de producție, asamblare, control calitate și întreținere.", roles: ["Operatori CNC", "Asamblori", "Sudori", "Controlori Calitate", "Operatori Mașini"] }
      ],
      moreRoles: "mai multe"
    },
    advantages: {
      label: "De Ce Noi", title: "AVANTAJE CHEIE",
      items: [
        { title: "Acoperire Globală", stat: "11 Parteneri", description: "Accesăm candidați din cele mai mari rezerve de forță de muncă din Asia și Africa." },
        { title: "Conformitate 100%", stat: "Legală", description: "Gestionăm integral documentația pentru conformitatea cu legislația din RO, AT și RS." },
        { title: "Timp de Livrare", stat: "30-90 Zile", description: "De la solicitare până la sosirea candidaților, în funcție de țara de destinație." },
        { title: "Garanție", stat: "6 Luni", description: "Monitorizare și suport continuu, cu înlocuire gratuită dacă este necesar." }
      ]
    },
    finalCta: { title: "Gata să Începeți?", description: "Contactați-ne astăzi pentru o consultație gratuită și aflați cum vă putem ajuta să găsiți forța de muncă de care aveți nevoie.", requestQuote: "Solicită Ofertă" }
  },
  en: {
    meta: { title: "All-Inclusive Services | Global Jobs Consulting", description: "Complete international recruitment services: selection, documentation, visas, transport and integration for employers in Romania, Austria and Serbia." },
    hero: { label: "All-Inclusive Services", title: "Complete International Recruitment Services", description: "From identifying suitable candidates to their complete integration into your team, we offer a full range of services to help you find the workforce you need." },
    cta: { requestStaff: "Request Staff", contactUs: "Contact Us" },
    process: {
      label: "Our Process", title: "How It Works", description: "A structured 6-step process that ensures transparency and success for each recruitment project.",
      steps: [
        { step: "01", title: "Requirements Analysis", description: "We understand in detail your company's specific needs: number of employees, qualifications, delivery timeline and conditions offered." },
        { step: "02", title: "Candidate Selection", description: "We use our network of 11 partner agencies in Asia and Africa to identify and interview suitable candidates." },
        { step: "03", title: "Complete Documentation", description: "We prepare all necessary documents: contracts, work visas, residence permits, legalized translations and authorizations." },
        { step: "04", title: "Logistics & Transport", description: "We organize candidate transport, initial accommodation and all logistical details for a smooth arrival." },
        { step: "05", title: "Integration", description: "We ensure cultural orientation, language support and adaptation to the new work environment for a smooth transition." },
        { step: "06", title: "Monitoring", description: "We provide continuous support for the first 6 months, with regular checks to ensure satisfaction for both parties." }
      ]
    },
    industries: {
      label: "Industries", title: "INDUSTRIES COVERED",
      items: [
        { title: "Construction", description: "Skilled and unskilled workers for construction sites, infrastructure, renovations and industrial buildings.", roles: ["Masons", "Rebar Workers", "Carpenters", "Plumbers", "Electricians", "Unskilled Workers"] },
        { title: "HoReCa", description: "Dedicated staff for hotels, restaurants, catering and hospitality services.", roles: ["Chefs", "Kitchen Helpers", "Waiters", "Bartenders", "Housekeepers", "Receptionists"] },
        { title: "Cruise Ships", description: "Highly qualified personnel for the maritime industry and international cruise ships.", roles: ["Head Chefs", "Waiters", "Technicians", "Spa Staff", "Bartenders", "Receptionists"] },
        { title: "Agriculture", description: "Seasonal or permanent workers for farms, plantations and agricultural processing.", roles: ["Pickers", "Seasonal Workers", "Equipment Operators", "Sorters", "Packers"] },
        { title: "Warehousing & Logistics", description: "Staff for warehousing, sorting, packaging and distribution operations.", roles: ["Forklift Operators", "Pickers", "Packers", "Scanning Operators", "Sorters"] },
        { title: "Manufacturing", description: "Operators for production lines, assembly, quality control and maintenance.", roles: ["CNC Operators", "Assemblers", "Welders", "QC Inspectors", "Machine Operators"] }
      ],
      moreRoles: "more"
    },
    advantages: {
      label: "Why Us", title: "KEY ADVANTAGES",
      items: [
        { title: "Global Coverage", stat: "11 Partners", description: "We access candidates from the largest workforce reserves in Asia and Africa." },
        { title: "100% Compliance", stat: "Legal", description: "We fully manage documentation for compliance with legislation in RO, AT and RS." },
        { title: "Delivery Time", stat: "30-90 Days", description: "From request to candidate arrival, depending on the destination country." },
        { title: "Guarantee", stat: "6 Months", description: "Continuous monitoring and support, with free replacement if needed." }
      ]
    },
    finalCta: { title: "Ready to Start?", description: "Contact us today for a free consultation and learn how we can help you find the workforce you need.", requestQuote: "Request Quote" }
  },
  de: {
    meta: { title: "All-Inclusive Dienstleistungen | Global Jobs Consulting", description: "Komplette internationale Rekrutierungsdienste: Auswahl, Dokumentation, Visa, Transport und Integration für Arbeitgeber in Rumänien, Österreich und Serbien." },
    hero: { label: "All-Inclusive Dienstleistungen", title: "Komplette internationale Rekrutierungsdienste", description: "Von der Identifizierung geeigneter Kandidaten bis zu ihrer vollständigen Integration in Ihr Team bieten wir eine komplette Palette von Dienstleistungen, um Ihnen zu helfen, die Arbeitskräfte zu finden, die Sie benötigen." },
    cta: { requestStaff: "Personal anfordern", contactUs: "Kontakt" },
    process: {
      label: "Unser Prozess", title: "So funktioniert es", description: "Ein strukturierter 6-Schritte-Prozess, der Transparenz und Erfolg für jedes Rekrutierungsprojekt gewährleistet.",
      steps: [
        { step: "01", title: "Anforderungsanalyse", description: "Wir verstehen detailliert die spezifischen Bedürfnisse Ihres Unternehmens: Anzahl der Mitarbeiter, Qualifikationen, Lieferzeitrahmen und angebotene Konditionen." },
        { step: "02", title: "Kandidatenauswahl", description: "Wir nutzen unser Netzwerk von 11 Partneragenturen in Asien und Afrika, um geeignete Kandidaten zu identifizieren und zu interviewen." },
        { step: "03", title: "Vollständige Dokumentation", description: "Wir bereiten alle erforderlichen Dokumente vor: Verträge, Arbeitsvisa, Aufenthaltsgenehmigungen, legalisierte Übersetzungen und Genehmigungen." },
        { step: "04", title: "Logistik & Transport", description: "Wir organisieren den Kandidatentransport, die erste Unterkunft und alle logistischen Details für eine reibungslose Ankunft." },
        { step: "05", title: "Integration", description: "Wir sorgen für kulturelle Orientierung, Sprachunterstützung und Anpassung an das neue Arbeitsumfeld für einen reibungslosen Übergang." },
        { step: "06", title: "Überwachung", description: "Wir bieten kontinuierliche Unterstützung für die ersten 6 Monate mit regelmäßigen Kontrollen, um die Zufriedenheit beider Parteien zu gewährleisten." }
      ]
    },
    industries: {
      label: "Tätigkeitsbereiche", title: "ABGEDECKTE BRANCHEN",
      items: [
        { title: "Bauwesen", description: "Qualifizierte und ungelernte Arbeiter für Baustellen, Infrastruktur, Renovierungen und Industriebauten.", roles: ["Maurer", "Bewehrungsarbeiter", "Zimmerer", "Installateure", "Elektriker", "Ungelernte Arbeiter"] },
        { title: "HoReCa", description: "Engagiertes Personal für Hotels, Restaurants, Catering und Gastgewerbe.", roles: ["Köche", "Küchenhilfen", "Kellner", "Barkeeper", "Hausdamen", "Rezeptionisten"] },
        { title: "Kreuzfahrtschiffe", description: "Hochqualifiziertes Personal für die maritime Industrie und internationale Kreuzfahrtschiffe.", roles: ["Chefköche", "Kellner", "Techniker", "Spa-Personal", "Barkeeper", "Rezeptionisten"] },
        { title: "Landwirtschaft", description: "Saisonale oder permanente Arbeiter für Farmen, Plantagen und landwirtschaftliche Verarbeitung.", roles: ["Pflücker", "Saisonarbeiter", "Maschinenführer", "Sortierer", "Packer"] },
        { title: "Lager & Logistik", description: "Personal für Lager-, Sortier-, Verpackungs- und Vertriebsoperationen.", roles: ["Staplerfahrer", "Picker", "Packer", "Scan-Operatoren", "Sortierer"] },
        { title: "Produktion", description: "Bediener für Produktionslinien, Montage, Qualitätskontrolle und Wartung.", roles: ["CNC-Operatoren", "Monteure", "Schweißer", "QK-Prüfer", "Maschinenbediener"] }
      ],
      moreRoles: "mehr"
    },
    advantages: {
      label: "Warum wir", title: "SCHLÜSSELVORTEILE",
      items: [
        { title: "Globale Abdeckung", stat: "11 Partner", description: "Wir greifen auf Kandidaten aus den größten Arbeitskräftereserven in Asien und Afrika zu." },
        { title: "100% Konformität", stat: "Legal", description: "Wir verwalten vollständig die Dokumentation für die Einhaltung der Gesetzgebung in RO, AT und RS." },
        { title: "Lieferzeit", stat: "30-90 Tage", description: "Von der Anfrage bis zur Ankunft der Kandidaten, abhängig vom Zielland." },
        { title: "Garantie", stat: "6 Monate", description: "Kontinuierliche Überwachung und Unterstützung, mit kostenlosem Ersatz bei Bedarf." }
      ]
    },
    finalCta: { title: "Bereit zu starten?", description: "Kontaktieren Sie uns noch heute für eine kostenlose Beratung und erfahren Sie, wie wir Ihnen helfen können, die Arbeitskräfte zu finden, die Sie benötigen.", requestQuote: "Angebot anfordern" }
  },
  sr: {
    meta: { title: "Sveobuhvatne usluge | Global Jobs Consulting", description: "Kompletne usluge međunarodnog zapošljavanja: selekcija, dokumentacija, vize, transport i integracija za poslodavce u Rumuniji, Austriji i Srbiji." },
    hero: { label: "Sveobuhvatne usluge", title: "Kompletne usluge međunarodnog zapošljavanja", description: "Od identifikacije odgovarajućih kandidata do njihove potpune integracije u vaš tim, nudimo kompletan spektar usluga kako bismo vam pomogli da pronađete radnu snagu koja vam je potrebna." },
    cta: { requestStaff: "Zatražite osoblje", contactUs: "Kontaktirajte nas" },
    process: {
      label: "Naš proces", title: "Kako funkcioniše", description: "Strukturirani proces u 6 koraka koji osigurava transparentnost i uspeh za svaki projekat zapošljavanja.",
      steps: [
        { step: "01", title: "Analiza zahteva", description: "Detaljno razumemo specifične potrebe vaše kompanije: broj zaposlenih, kvalifikacije, rok isporuke i ponuđene uslove." },
        { step: "02", title: "Selekcija kandidata", description: "Koristimo našu mrežu od 11 partnerskih agencija u Aziji i Africi za identifikaciju i intervjuisanje odgovarajućih kandidata." },
        { step: "03", title: "Kompletna dokumentacija", description: "Pripremamo sve potrebne dokumente: ugovore, radne vize, dozvole boravka, legalizovane prevode i ovlašćenja." },
        { step: "04", title: "Logistika i transport", description: "Organizujemo transport kandidata, početni smeštaj i sve logističke detalje za nesmetani dolazak." },
        { step: "05", title: "Integracija", description: "Osiguravamo kulturnu orijentaciju, jezičku podršku i adaptaciju na novo radno okruženje za glatku tranziciju." },
        { step: "06", title: "Praćenje", description: "Pružamo kontinuiranu podršku prvih 6 meseci, sa redovnim proverama kako bismo osigurali zadovoljstvo obe strane." }
      ]
    },
    industries: {
      label: "Oblasti delovanja", title: "POKRIVENE INDUSTRIJE",
      items: [
        { title: "Građevinarstvo", description: "Kvalifikovani i nekvalifikovani radnici za gradilišta, infrastrukturu, renovacije i industrijske objekte.", roles: ["Zidari", "Armirači", "Tesari", "Vodoinstalateri", "Električari", "Nekvalifikovani radnici"] },
        { title: "HoReCa", description: "Posvećeno osoblje za hotele, restorane, ketering i ugostiteljske usluge.", roles: ["Kuvari", "Pomoćni kuvari", "Konobari", "Barmeni", "Sobarice", "Recepcioneri"] },
        { title: "Kruzeri", description: "Visokokvalifikovano osoblje za pomorsku industriju i međunarodne kruzere.", roles: ["Glavni kuvari", "Konobari", "Tehničari", "Spa osoblje", "Barmeni", "Recepcioneri"] },
        { title: "Poljoprivreda", description: "Sezonski ili stalni radnici za farme, plantaže i poljoprivrednu preradu.", roles: ["Berači", "Sezonski radnici", "Operateri mašina", "Sorteri", "Pakeri"] },
        { title: "Skladištenje i logistika", description: "Osoblje za skladištenje, sortiranje, pakovanje i distribuciju.", roles: ["Viljuškaristi", "Pikeri", "Pakeri", "Operateri skenera", "Sorteri"] },
        { title: "Proizvodnja", description: "Operateri za proizvodne linije, montažu, kontrolu kvaliteta i održavanje.", roles: ["CNC operateri", "Monteri", "Varioci", "QC inspektori", "Operateri mašina"] }
      ],
      moreRoles: "više"
    },
    advantages: {
      label: "Zašto mi", title: "KLJUČNE PREDNOSTI",
      items: [
        { title: "Globalna pokrivenost", stat: "11 partnera", description: "Pristupamo kandidatima iz najvećih rezervi radne snage u Aziji i Africi." },
        { title: "100% usklađenost", stat: "Legalno", description: "U potpunosti upravljamo dokumentacijom za usklađenost sa zakonodavstvom u RO, AT i RS." },
        { title: "Vreme isporuke", stat: "30-90 dana", description: "Od zahteva do dolaska kandidata, u zavisnosti od odredišne zemlje." },
        { title: "Garancija", stat: "6 meseci", description: "Kontinuirano praćenje i podrška, sa besplatnom zamenom ako je potrebno." }
      ]
    },
    finalCta: { title: "Spremni da počnete?", description: "Kontaktirajte nas danas za besplatnu konsultaciju i saznajte kako vam možemo pomoći da pronađete radnu snagu koja vam je potrebna.", requestQuote: "Zatražite ponudu" }
  }
};

const processIcons = [Search, Users, FileCheck, Plane, Shield, Award];
const industryIcons = [Building2, UtensilsCrossed, Anchor, Tractor, Warehouse, Factory];
const advantageIcons = [Globe, Shield, Clock, Award];

export default function ServicesPage() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;

  return (
    <>
      <Helmet>
        <title>Servicii | Global Jobs Consulting</title>
        <meta name="description" content={(t && t.meta && t.meta.description) || ''} />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20" data-testid="services-page">
        {/* Hero */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white py-20 mb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-coral font-semibold text-sm tracking-wider">
                {t.hero.label}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-6">
                {t.hero.title}
              </h1>
              <p className="text-navy-200 text-lg mb-8">
                {t.hero.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-coral hover:bg-red-600 text-white rounded-full font-semibold">
                  <Link to="/angajatori" data-testid="services-cta-employer">
                    {t.cta.requestStaff}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full font-semibold">
                  <Link to="/contact" data-testid="services-cta-contact">
                    {t.cta.contactUs}
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
              <span className="text-coral font-semibold text-sm tracking-wider">
                {t.process.label}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                {t.process.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t.process.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.process.steps.map((step, index) => {
                const Icon = processIcons[index];
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
                  {t.industries.label}
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                  {t.industries.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.industries.items.map((industry, index) => {
                  const Icon = industryIcons[index];
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
                              +{industry.roles.length - 4} {t.industries.moreRoles}
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
                {t.advantages.label}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy-900 mt-2 mb-4">
                {t.advantages.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.advantages.items.map((adv, index) => {
                const Icon = advantageIcons[index];
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
              {t.finalCta.title}
            </h2>
            <p className="text-navy-200 max-w-2xl mx-auto mb-8">
              {t.finalCta.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100 rounded-full font-semibold">
                <Link to="/angajatori">
                  {t.finalCta.requestQuote}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full font-semibold">
                <Link to="/contact">
                  {t.cta.contactUs}
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
