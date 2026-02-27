import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1760009436767-d154e930e55c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxjb25zdHJ1Y3Rpb24lMjB3b3JrZXIlMjBidWlsZGluZyUyMHNpdGUlMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzcyMjE4NTk4fDA&ixlib=rb-4.1.0&q=85",
    category: "Construcții",
    title: "FORȚĂ DE MUNCĂ CALIFICATĂ",
    subtitle: "Pentru Proiecte de Succes",
    description: "Recrutăm muncitori experimentați din Asia și Africa pentru sectorul construcțiilor din România, Austria și Serbia."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1765735049473-7cb6466e5b3f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMHJlc3RhdXJhbnQlMjBraXRjaGVuJTIwcHJvZmVzc2lvbmFsfGVufDB8fHx8MTc3MjIxODYzOXww&ixlib=rb-4.1.0&q=85",
    category: "HoReCa",
    title: "PERSONAL HOTELIER",
    subtitle: "Dedicat și Profesionist",
    description: "Bucătari, ospătari și personal de curățenie pentru hoteluri și restaurante din întreaga regiune."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1622385161916-27f0c8746f4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwd29ya2VyJTIwcHJvZHVjdGlvbiUyMGxpbmUlMjBpbmR1c3RyaWFsfGVufDB8fHx8MTc3MjIxODY0Nnww&ixlib=rb-4.1.0&q=85",
    category: "Agricultură",
    title: "LUCRĂTORI AGRICOLI",
    subtitle: "Experimentați și Rezistenți",
    description: "Personal pentru ferme, plantații și procesare agricolă, disponibil sezonier sau permanent."
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1764114908655-9a26d32750a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwyfHxmYWN0b3J5JTIwd29ya2VyJTIwcHJvZHVjdGlvbiUyMGxpbmUlMjBpbmR1c3RyaWFsfGVufDB8fHx8MTc3MjIxODYyNnww&ixlib=rb-4.1.0&q=85",
    category: "Producție",
    title: "OPERATORI PRODUCȚIE",
    subtitle: "Precizie și Eficiență",
    description: "Muncitori pentru linii de producție, asamblare și control calitate în fabrici din Europa Centrală."
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1672552226669-f6c3041972ea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjB3b3JrZXIlMjBsb2dpc3RpY3MlMjBwYWNrYWdlJTIwc2Nhbm5pbmd8ZW58MHx8fHwxNzcyMjE4NjEyfDA&ixlib=rb-4.1.0&q=85",
    category: "Logistică",
    title: "PERSONAL DEPOZITE",
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

      {/* Overlay */}
      <div className="absolute inset-0 hero-overlay" />

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
            <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-medium rounded-sm uppercase tracking-wider">
              {slide.category}
            </span>
          </div>

          {/* Title */}
          <h1 
            className={`font-heading text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 text-shadow-hero transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "200ms" }}
            data-testid="hero-title"
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <h2 
            className={`font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-navy-200 mb-6 transition-all duration-500 ${
              isAnimating ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {slide.subtitle}
          </h2>

          {/* Description */}
          <p 
            className={`text-white/90 text-lg md:text-xl max-w-xl mb-8 transition-all duration-500 ${
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
              className="bg-white text-navy-900 hover:bg-gray-100 rounded-sm font-semibold text-base px-8"
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
              className="border-2 border-white text-white hover:bg-white/10 rounded-sm font-semibold text-base px-8"
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
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-sm transition"
          data-testid="hero-prev-button"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      </div>
      <div className="absolute bottom-1/2 translate-y-1/2 right-4 z-20">
        <button
          onClick={nextSlide}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-sm transition"
          data-testid="hero-next-button"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
              index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            data-testid={`hero-indicator-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-navy-900/80 backdrop-blur-sm py-4 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
            <div data-testid="stat-partners">
              <div className="font-heading text-3xl md:text-4xl font-black">30+</div>
              <div className="text-sm text-white/70">Parteneri Globali</div>
            </div>
            <div data-testid="stat-countries">
              <div className="font-heading text-3xl md:text-4xl font-black">18</div>
              <div className="text-sm text-white/70">Țări Sursă</div>
            </div>
            <div data-testid="stat-continents">
              <div className="font-heading text-3xl md:text-4xl font-black">2</div>
              <div className="text-sm text-white/70">Continente</div>
            </div>
            <div data-testid="stat-markets">
              <div className="font-heading text-3xl md:text-4xl font-black">3</div>
              <div className="text-sm text-white/70">Piețe Europene</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
