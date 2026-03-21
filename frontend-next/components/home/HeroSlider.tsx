"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    type: "video",
    src: "/images/optimized/constructii.mp4",
  },
  {
    type: "video",
    src: "/images/optimized/depozite.mp4",
  },
];

export default function HeroSlider({ headline, subheadline, cta1, cta2, locale }: { headline: string, subheadline: string, cta1: string, cta2: string, locale: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000); // Increased interval to 8s for better video pacing
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const getPath = (path: string) => {
    if (locale === "ro") return path;
    return `/${locale}${path}`;
  };

  return (
    <section className="relative min-h-[75vh] lg:min-h-[85vh] flex items-center bg-navy-900 overflow-hidden" data-testid="hero-section">
      {/* Background Videos with AnimatePresence */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <video
              src={slides[current].src}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Constant Dark Overlay */}
        <div className="absolute inset-0 bg-black/55 z-10 pointer-events-none"></div>
      </div>

      {/* Static Content Overlay */}
      <div className="container mx-auto px-4 relative z-20 text-white mt-12 md:mt-0">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
            {headline}
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90 drop-shadow-md">
            {subheadline}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={getPath("/request-workers")}
              className="inline-flex items-center gap-2 bg-coral text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-xl"
              data-testid="hero-cta-primary"
            >
              {cta1}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={getPath("/about")}
              className="inline-flex items-center gap-2 border-2 border-white/80 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-colors shadow-lg"
              data-testid="hero-cta-secondary"
            >
              {cta2}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/30 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/30 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === index ? "bg-coral w-8 shadow-sm" : "bg-white/50 w-2.5 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
