import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// Video URL - new promotional video from user
const VIDEO_URL = "https://customer-assets.emergentagent.com/job_a9022c94-df7a-4b1a-903b-3a5a006d4a40/artifacts/v1pulfhw_Design%20f%C4%83r%C4%83%20titlu.mp4";

// Video for Agriculture slide
const AGRICULTURE_VIDEO_URL = "https://customer-assets.emergentagent.com/job_a9022c94-df7a-4b1a-903b-3a5a006d4a40/artifacts/bztmgx84_download.mp4";

// Uploaded images
const UPLOADED_IMAGES = {
  workers_airport_1: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/aangudct_IMG-20250921-WA0000.jpg",
  workers_airport_2: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/o0zrw3gc_IMG-20250921-WA0016.jpg",
  workers_departures: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/hlb5r7g0_IMG-20250926-WA0015%281%29.jpg",
  workers_waiting: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/4gkomm4p_IMG-20251014-WA0037.jpg",
  design_1: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/en2yk94c_Design%20f%C4%83r%C4%83%20titlu%20%281%29.png",
  design_2: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/uko86kal_Design%20f%C4%83r%C4%83%20titlu%20%282%29.png",
  design_3: "https://customer-assets.emergentagent.com/job_8604c03f-19f0-4831-97c4-2be3c85c8b29/artifacts/w1d2nuuo_Design%20f%C4%83r%C4%83%20titlu%20%283%29.png"
};

const slides = [
  {
    id: 0,
    type: "video",
    video: VIDEO_URL,
    poster: UPLOADED_IMAGES.design_1,
    category: "Nave de Croazieră",
    titleKey: "cruise_title",
    subtitleKey: "cruise_subtitle",
    descriptionKey: "cruise_description"
  },
  {
    id: 1,
    type: "image",
    image: UPLOADED_IMAGES.workers_airport_1,
    category: "Construcții",
    titleKey: "construction_title",
    subtitleKey: "construction_subtitle",
    descriptionKey: "construction_description"
  },
  {
    id: 2,
    type: "image",
    image: UPLOADED_IMAGES.workers_airport_2,
    category: "HoReCa",
    titleKey: "horeca_title",
    subtitleKey: "horeca_subtitle",
    descriptionKey: "horeca_description"
  },
  {
    id: 3,
    type: "image",
    image: UPLOADED_IMAGES.workers_departures,
    category: "Agricultură",
    titleKey: "agriculture_title",
    subtitleKey: "agriculture_subtitle",
    descriptionKey: "agriculture_description"
  },
  {
    id: 4,
    type: "image",
    image: UPLOADED_IMAGES.design_2,
    category: "Producție",
    titleKey: "production_title",
    subtitleKey: "production_subtitle",
    descriptionKey: "production_description"
  },
  {
    id: 5,
    type: "image",
    image: UPLOADED_IMAGES.workers_waiting,
    category: "Logistică",
    titleKey: "logistics_title",
    subtitleKey: "logistics_subtitle",
    descriptionKey: "logistics_description"
  }
];

const slideContent = {
  ro: {
    headline: "Soluții Globale pentru Deficitul de Forță de Muncă",
    cruise_title: "Personal Înalt Calificat",
    cruise_subtitle: "Pentru Industria Maritimă",
    cruise_description: "Bucătari, ospătari, tehnicieni și personal hotelier pentru nave de croazieră internaționale.",
    construction_title: "Forță de Muncă Calificată",
    construction_subtitle: "Pentru Proiecte de Succes",
    construction_description: "Recrutăm muncitori experimentați din Asia și Africa pentru sectorul construcțiilor din România, Austria și Serbia.",
    horeca_title: "Personal Hotelier",
    horeca_subtitle: "Dedicat și Profesionist",
    horeca_description: "Bucătari, ospătari și personal de curățenie pentru hoteluri și restaurante din întreaga regiune.",
    agriculture_title: "Lucrători Agricoli",
    agriculture_subtitle: "Experimentați și Rezistenți",
    agriculture_description: "Personal pentru ferme, plantații și procesare agricolă, disponibil sezonier sau permanent.",
    production_title: "Meșteșugari & Operatori",
    production_subtitle: "Precizie și Dedicare",
    production_description: "Muncitori calificați pentru linii de producție, ateliere și fabrici din Europa Centrală.",
    logistics_title: "Personal Depozite",
    logistics_subtitle: "Organizare și Rapiditate",
    logistics_description: "Muncitori pentru depozite, sortare, ambalare și operațiuni logistice.",
    cta_employer: "Sunt Angajator",
    cta_candidate: "Caut un Job",
    stat_partners: "Parteneri în Asia & Africa",
    stat_years: "Ani de Experiență",
    stat_continents: "Continente",
    stat_markets: "Piețe Europene"
  },
  en: {
    headline: "Global Solutions for Workforce Shortage",
    cruise_title: "Highly Qualified Staff",
    cruise_subtitle: "For the Maritime Industry",
    cruise_description: "Chefs, waiters, technicians and hospitality staff for international cruise ships.",
    construction_title: "Qualified Workforce",
    construction_subtitle: "For Successful Projects",
    construction_description: "We recruit experienced workers from Asia and Africa for the construction sector in Romania, Austria and Serbia.",
    horeca_title: "Hotel Staff",
    horeca_subtitle: "Dedicated and Professional",
    horeca_description: "Chefs, waiters and cleaning staff for hotels and restaurants across the region.",
    agriculture_title: "Agricultural Workers",
    agriculture_subtitle: "Experienced and Resilient",
    agriculture_description: "Staff for farms, plantations and agricultural processing, available seasonally or permanently.",
    production_title: "Craftsmen & Operators",
    production_subtitle: "Precision and Dedication",
    production_description: "Skilled workers for production lines, workshops and factories in Central Europe.",
    logistics_title: "Warehouse Staff",
    logistics_subtitle: "Organization and Speed",
    logistics_description: "Workers for warehouses, sorting, packaging and logistics operations.",
    cta_employer: "I'm an Employer",
    cta_candidate: "Looking for a Job",
    stat_partners: "Partners in Asia & Africa",
    stat_years: "Years of Experience",
    stat_continents: "Continents",
    stat_markets: "European Markets"
  },
  de: {
    headline: "Globale Lösungen für den Arbeitskräftemangel",
    cruise_title: "Hochqualifiziertes Personal",
    cruise_subtitle: "Für die Maritime Industrie",
    cruise_description: "Köche, Kellner, Techniker und Hotelpersonal für internationale Kreuzfahrtschiffe.",
    construction_title: "Qualifizierte Arbeitskräfte",
    construction_subtitle: "Für erfolgreiche Projekte",
    construction_description: "Wir rekrutieren erfahrene Arbeiter aus Asien und Afrika für den Bausektor in Rumänien, Österreich und Serbien.",
    horeca_title: "Hotelpersonal",
    horeca_subtitle: "Engagiert und Professionell",
    horeca_description: "Köche, Kellner und Reinigungspersonal für Hotels und Restaurants in der gesamten Region.",
    agriculture_title: "Landarbeiter",
    agriculture_subtitle: "Erfahren und Belastbar",
    agriculture_description: "Personal für Bauernhöfe, Plantagen und landwirtschaftliche Verarbeitung, saisonal oder dauerhaft verfügbar.",
    production_title: "Handwerker & Bediener",
    production_subtitle: "Präzision und Hingabe",
    production_description: "Qualifizierte Arbeiter für Produktionslinien, Werkstätten und Fabriken in Mitteleuropa.",
    logistics_title: "Lagerpersonal",
    logistics_subtitle: "Organisation und Schnelligkeit",
    logistics_description: "Arbeiter für Lager, Sortierung, Verpackung und Logistikoperationen.",
    cta_employer: "Ich bin Arbeitgeber",
    cta_candidate: "Jobsuche",
    stat_partners: "Partner in Asien & Afrika",
    stat_years: "Jahre Erfahrung",
    stat_continents: "Kontinente",
    stat_markets: "Europäische Märkte"
  },
  sr: {
    headline: "Globalna Rešenja za Nedostatak Radne Snage",
    cruise_title: "Visokokvalifikovano Osoblje",
    cruise_subtitle: "Za Pomorsku Industriju",
    cruise_description: "Kuvari, konobari, tehničari i hotelsko osoblje za međunarodne kruzere.",
    construction_title: "Kvalifikovana Radna Snaga",
    construction_subtitle: "Za Uspešne Projekte",
    construction_description: "Regrutujemo iskusne radnike iz Azije i Afrike za građevinski sektor u Rumuniji, Austriji i Srbiji.",
    horeca_title: "Hotelsko Osoblje",
    horeca_subtitle: "Posvećeno i Profesionalno",
    horeca_description: "Kuvari, konobari i osoblje za čišćenje za hotele i restorane u celom regionu.",
    agriculture_title: "Poljoprivredni Radnici",
    agriculture_subtitle: "Iskusni i Otporni",
    agriculture_description: "Osoblje za farme, plantaže i poljoprivrednu preradu, dostupno sezonski ili trajno.",
    production_title: "Zanatlije i Operateri",
    production_subtitle: "Preciznost i Posvećenost",
    production_description: "Kvalifikovani radnici za proizvodne linije, radionice i fabrike u Centralnoj Evropi.",
    logistics_title: "Skladišno Osoblje",
    logistics_subtitle: "Organizacija i Brzina",
    logistics_description: "Radnici za skladišta, sortiranje, pakovanje i logističke operacije.",
    cta_employer: "Ja sam Poslodavac",
    cta_candidate: "Tražim Posao",
    stat_partners: "Partneri u Aziji i Africi",
    stat_years: "Godina Iskustva",
    stat_continents: "Kontinenta",
    stat_markets: "Evropska Tržišta"
  }
};

export default function HeroSlider() {
  const { language } = useLanguage();
  const t = slideContent[language] || slideContent.ro;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden" data-testid="hero-slider">
      {/* Background Images/Video */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {s.type === "video" ? (
            <video
              ref={index === currentSlide ? videoRef : null}
              autoPlay
              muted
              loop
              playsInline
              poster={s.poster}
              className="w-full h-full object-cover"
            >
              <source src={s.video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={s.image}
              alt={s.category}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          )}
        </div>
      ))}

      {/* Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/30" />

      {/* Video Controls */}
      {slide.type === "video" && (
        <button
          onClick={toggleVideo}
          className="absolute top-24 right-6 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition"
          aria-label={isVideoPlaying ? "Pause video" : "Play video"}
        >
          {isVideoPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white" />
          )}
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 flex items-center">
        <div className="max-w-3xl">
          {/* Category Badge */}
          <div 
            className={`inline-block mb-4 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="bg-coral text-white px-4 py-2 text-sm font-semibold rounded-full">
              {slide.category}
            </span>
          </div>

          {/* Main Headline */}
          <p 
            className={`text-gold font-medium text-lg mb-2 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            {t.headline}
          </p>

          {/* Title */}
          <h1 
            className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "200ms", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
            data-testid="hero-title"
          >
            {t[slide.titleKey]}
          </h1>

          {/* Subtitle */}
          <h2 
            className={`font-heading text-xl md:text-2xl lg:text-3xl font-medium text-gold mb-6 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {t[slide.subtitleKey]}
          </h2>

          {/* Description */}
          <p 
            className={`text-white/90 text-lg md:text-xl max-w-xl mb-8 leading-relaxed transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {t[slide.descriptionKey]}
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-wrap gap-4 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-coral hover:bg-red-600 text-white rounded-full font-semibold text-base px-8 shadow-lg"
              data-testid="hero-cta-employer"
            >
              <Link to="/angajatori">
                {t.cta_employer}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 rounded-full font-semibold text-base px-8"
              data-testid="hero-cta-candidate"
            >
              <Link to="/candidati">
                {t.cta_candidate}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 z-20">
        <button
          onClick={prevSlide}
          className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition"
          data-testid="hero-prev-button"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="absolute bottom-1/2 translate-y-1/2 right-4 z-20">
        <button
          onClick={nextSlide}
          className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition"
          data-testid="hero-next-button"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentSlide(index);
                setTimeout(() => setIsAnimating(false), 600);
              }
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-coral" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            data-testid={`hero-indicator-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-5 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div data-testid="stat-partners">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">11</div>
              <div className="text-sm text-gray-600 font-medium">{t.stat_partners}</div>
            </div>
            <div data-testid="stat-years">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">4</div>
              <div className="text-sm text-gray-600 font-medium">{t.stat_years}</div>
            </div>
            <div data-testid="stat-continents">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">2</div>
              <div className="text-sm text-gray-600 font-medium">{t.stat_continents}</div>
            </div>
            <div data-testid="stat-markets">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">3</div>
              <div className="text-sm text-gray-600 font-medium">{t.stat_markets}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
