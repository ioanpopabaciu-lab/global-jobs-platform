/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.emergentagent.com',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 301 Redirects for SEO preservation
  async redirects() {
    return [
      // Romanian old URLs to new English-based URLs
      { source: '/despre-noi', destination: '/about', permanent: true },
      { source: '/angajatori', destination: '/employers', permanent: true },
      { source: '/angajatori/procedura', destination: '/employers/procedure', permanent: true },
      { source: '/angajatori/eligibilitate', destination: '/employers/eligibility', permanent: true },
      { source: '/angajatori/costuri', destination: '/employers/costs', permanent: true },
      { source: '/servicii', destination: '/services', permanent: true },
      { source: '/servicii/:path*', destination: '/services/:path*', permanent: true },
      { source: '/candidati', destination: '/candidates', permanent: true },
      { source: '/politica-confidentialitate', destination: '/privacy-policy', permanent: true },
      { source: '/formular-angajator', destination: '/employer-form', permanent: true },
      { source: '/solicita-muncitori', destination: '/request-workers', permanent: true },
      { source: '/cum-functioneaza', destination: '/how-it-works', permanent: true },
      { source: '/industrii/:industry', destination: '/industries/:industry', permanent: true },
      
      // German old URLs
      { source: '/de/uber-uns', destination: '/de/about', permanent: true },
      { source: '/de/arbeitgeber', destination: '/de/employers', permanent: true },
      { source: '/de/arbeitgeber/:path*', destination: '/de/employers/:path*', permanent: true },
      { source: '/de/dienstleistungen', destination: '/de/services', permanent: true },
      { source: '/de/dienstleistungen/:path*', destination: '/de/services/:path*', permanent: true },
      { source: '/de/kandidaten', destination: '/de/candidates', permanent: true },
      { source: '/de/kontakt', destination: '/de/contact', permanent: true },
      { source: '/de/datenschutz', destination: '/de/privacy-policy', permanent: true },
      { source: '/de/branchen/:industry', destination: '/de/industries/:industry', permanent: true },
      { source: '/de/so-funktioniert-es', destination: '/de/how-it-works', permanent: true },
      
      // Serbian old URLs
      { source: '/sr/o-nama', destination: '/sr/about', permanent: true },
      { source: '/sr/poslodavci', destination: '/sr/employers', permanent: true },
      { source: '/sr/poslodavci/:path*', destination: '/sr/employers/:path*', permanent: true },
      { source: '/sr/usluge', destination: '/sr/services', permanent: true },
      { source: '/sr/usluge/:path*', destination: '/sr/services/:path*', permanent: true },
      { source: '/sr/kandidati', destination: '/sr/candidates', permanent: true },
      { source: '/sr/kontakt', destination: '/sr/contact', permanent: true },
      { source: '/sr/politika-privatnosti', destination: '/sr/privacy-policy', permanent: true },
      { source: '/sr/industrije/:industry', destination: '/sr/industries/:industry', permanent: true },
      { source: '/sr/kako-funkcionise', destination: '/sr/how-it-works', permanent: true },
    ];
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
