import { useState, useRef, useEffect } from 'react';

/**
 * OptimizedImage - Performance-optimized image component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Responsive srcset for mobile/tablet/desktop
 * - WebP format with fallback
 * - Explicit width/height to prevent CLS
 * - Blur-up placeholder effect
 */

// Base path for optimized images
const OPTIMIZED_BASE = '/images/optimized';

// Image configuration map
const IMAGE_CONFIG = {
  about_team: {
    src: `${OPTIMIZED_BASE}/about_team.webp`,
    srcset: {
      mobile: `${OPTIMIZED_BASE}/about_team_mobile.webp 640w`,
      tablet: `${OPTIMIZED_BASE}/about_team_tablet.webp 960w`,
      desktop: `${OPTIMIZED_BASE}/about_team.webp 1200w`
    },
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px",
    width: 1200,
    height: 936,
    alt: "Global Jobs Consulting Team"
  },
  chat_ai: {
    src: `${OPTIMIZED_BASE}/chat_ai.webp`,
    width: 400,
    height: 535,
    alt: "AI Assistant Maria"
  },
  hero_poster1: {
    src: `${OPTIMIZED_BASE}/hero_poster1.webp`,
    srcset: {
      mobile: `${OPTIMIZED_BASE}/hero_poster1_mobile.webp 640w`,
      tablet: `${OPTIMIZED_BASE}/hero_poster1_tablet.webp 960w`,
      desktop: `${OPTIMIZED_BASE}/hero_poster1.webp 1920w`
    },
    sizes: "100vw",
    width: 1024,
    height: 1024,
    alt: "International Workforce Recruitment"
  },
  hero_poster2: {
    src: `${OPTIMIZED_BASE}/hero_poster2.webp`,
    srcset: {
      mobile: `${OPTIMIZED_BASE}/hero_poster2_mobile.webp 640w`,
      tablet: `${OPTIMIZED_BASE}/hero_poster2_tablet.webp 960w`,
      desktop: `${OPTIMIZED_BASE}/hero_poster2.webp 1920w`
    },
    sizes: "100vw",
    width: 1600,
    height: 1200,
    alt: "Construction Workers"
  },
  hero_poster3: {
    src: `${OPTIMIZED_BASE}/hero_poster3.webp`,
    srcset: {
      mobile: `${OPTIMIZED_BASE}/hero_poster3_mobile.webp 640w`,
      tablet: `${OPTIMIZED_BASE}/hero_poster3_tablet.webp 960w`,
      desktop: `${OPTIMIZED_BASE}/hero_poster3.webp 1920w`
    },
    sizes: "100vw",
    width: 1024,
    height: 1024,
    alt: "Recruitment Partnership"
  },
  logo_colored: {
    src: `${OPTIMIZED_BASE}/logo_colored.webp`,
    width: 300,
    height: 300,
    alt: "GJC Logo"
  },
  logo_white: {
    src: `${OPTIMIZED_BASE}/logo_white.webp`,
    width: 300,
    height: 300,
    alt: "GJC Logo White"
  }
};

export function OptimizedImage({
  imageKey,
  className = '',
  loading = 'lazy',
  priority = false,
  onLoad,
  style,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  const config = IMAGE_CONFIG[imageKey];
  if (!config) {
    console.warn(`OptimizedImage: Unknown imageKey "${imageKey}"`);
    return null;
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading !== 'lazy') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  // Build srcset string
  const srcsetString = config.srcset
    ? Object.values(config.srcset).join(', ')
    : undefined;

  return (
    <div
      ref={imgRef}
      className={`optimized-image-wrapper ${className}`}
      style={{
        aspectRatio: `${config.width} / ${config.height}`,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        ...style
      }}
    >
      {isInView && (
        <img
          src={config.src}
          srcSet={srcsetString}
          sizes={config.sizes}
          alt={config.alt}
          width={config.width}
          height={config.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}

// Export individual image URLs for direct use
export const OPTIMIZED_IMAGES = {
  ABOUT_TEAM: `${OPTIMIZED_BASE}/about_team.webp`,
  ABOUT_TEAM_MOBILE: `${OPTIMIZED_BASE}/about_team_mobile.webp`,
  CHAT_AI: `${OPTIMIZED_BASE}/chat_ai.webp`,
  HERO_POSTER_1: `${OPTIMIZED_BASE}/hero_poster1.webp`,
  HERO_POSTER_1_MOBILE: `${OPTIMIZED_BASE}/hero_poster1_mobile.webp`,
  HERO_POSTER_2: `${OPTIMIZED_BASE}/hero_poster2.webp`,
  HERO_POSTER_2_MOBILE: `${OPTIMIZED_BASE}/hero_poster2_mobile.webp`,
  HERO_POSTER_3: `${OPTIMIZED_BASE}/hero_poster3.webp`,
  HERO_POSTER_3_MOBILE: `${OPTIMIZED_BASE}/hero_poster3_mobile.webp`,
  LOGO_COLORED: `${OPTIMIZED_BASE}/logo_colored.webp`,
  LOGO_WHITE: `${OPTIMIZED_BASE}/logo_white.webp`
};

// Responsive image srcset helper
export function getResponsiveSrcSet(imageKey) {
  const config = IMAGE_CONFIG[imageKey];
  if (!config?.srcset) return '';
  return Object.values(config.srcset).join(', ');
}

// Image dimensions helper (for preventing CLS)
export function getImageDimensions(imageKey) {
  const config = IMAGE_CONFIG[imageKey];
  if (!config) return { width: 0, height: 0 };
  return { width: config.width, height: config.height };
}

export default OptimizedImage;
