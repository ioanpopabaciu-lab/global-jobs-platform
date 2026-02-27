import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1628146023674-ede6049609b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXJzJTIwdGVhbSUyMHNhZmV0eSUyMGhlbG1ldCUyMGhhcHB5fGVufDB8fHx8MTc3MjIyMzM4Mnww&ixlib=rb-4.1.0&q=85",
    category: "Construcții",
    title: "Forță de Muncă Calificată",
    subtitle: "Pentru Proiecte de Succes",
    description: "Recrutăm muncitori experimentați din Asia și Africa pentru sectorul construcțiilor din România, Austria și Serbia."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1689351300479-8601124d4cba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMGtpdGNoZW4lMjBzbWlsaW5nJTIwcHJvZmVzc2lvbmFsJTIwYXNpYW58ZW58MHx8fHwxNzcyMjIzNDExfDA&ixlib=rb-4.1.0&q=85",
    category: "HoReCa",
    title: "Personal Hotelier",
    subtitle: "Dedicat și Profesionist",
    description: "Bucătari, ospătari și personal de curățenie pentru hoteluri și restaurante din întreaga regiune."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1769412447940-0932db51a5bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxmYXJtJTIwYWdyaWN1bHR1cmUlMjB3b3JrZXJzJTIwaGFydmVzdCUyMHNtaWxpbmclMjBhc2lhfGVufDB8fHx8MTc3MjIyMzQxNXww&ixlib=rb-4.1.0&q=85",
    category: "Agricultură",
    title: "Lucrători Agricoli",
    subtitle: "Experimentați și Rezistenți",
    description: "Personal pentru ferme, plantații și procesare agricolă, disponibil sezonier sau permanent."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1587728409203-97f284c580fe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxjcnVpc2UlMjBzaGlwJTIwY3JldyUyMHN0YWZmJTIwc21pbGluZyUyMHVuaWZvcm0lMjBob3NwaXRhbGl0eXxlbnwwfHx8fDE3NzIyMjMzNjR8MA&ixlib=rb-4.1.0&q=85",
    category: "Nave de Croazieră",
    title: "Personal Înalt Calificat",
    subtitle: "Pentru Industria Maritimă",
    description: "Bucătari, ospătari, tehnicieni și personal hotelier pentru nave de croazieră internaționale."
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1687422810663-c316494f725a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwyfHxhZnJpY2FuJTIwd29ya2VyJTIwc21pbGluZyUyMHByb2Zlc3Npb25hbCUyMHBvc2l0aXZlfGVufDB8fHx8MTc3MjIyMzM3M3ww&ixlib=rb-4.1.0&q=85",
    category: "Producție",
    title: "Meșteșugari & Operatori",
    subtitle: "Precizie și Dedicare",
    description: "Muncitori calificați pentru linii de producție, ateliere și fabrici din Europa Centrală."
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1768796373360-95d80c5830fb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjB3b3JrZXJzJTIwbG9naXN0aWNzJTIwZGl2ZXJzZSUyMHRlYW18ZW58MHx8fHwxNzcyMjIwOTgzfDA&ixlib=rb-4.1.0&q=85",
    category: "Logistică",
    title: "Personal Depozite",
    subtitle: "Organizare și Rapiditate",
    description: "Muncitori pentru depozite, sortare, ambalare și operațiuni logistice."
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden" data-testid="hero-slider">
      {/* Background Images */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image}
            alt={s.category}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/30" />

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
            Soluții Globale pentru Deficitul de Forță de Muncă
          </p>

          {/* Title */}
          <h1 
            className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "200ms", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
            data-testid="hero-title"
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <h2 
            className={`font-heading text-xl md:text-2xl lg:text-3xl font-medium text-gold mb-6 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {slide.subtitle}
          </h2>

          {/* Description */}
          <p 
            className={`text-white/90 text-lg md:text-xl max-w-xl mb-8 leading-relaxed transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {slide.description}
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
                Sunt Angajator
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
                Caut un Job
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

      {/* Stats Bar - Updated to 4 years and 11 agencies */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm py-5 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div data-testid="stat-partners">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">11</div>
              <div className="text-sm text-gray-600 font-medium">Parteneri în Asia & Africa</div>
            </div>
            <div data-testid="stat-countries">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">4</div>
              <div className="text-sm text-gray-600 font-medium">Ani de Experiență</div>
            </div>
            <div data-testid="stat-continents">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">2</div>
              <div className="text-sm text-gray-600 font-medium">Continente</div>
            </div>
            <div data-testid="stat-markets">
              <div className="font-heading text-3xl md:text-4xl font-bold text-navy-900">3</div>
              <div className="text-sm text-gray-600 font-medium">Piețe Europene</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
