/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://gjc.ro',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  
  // Exclude private routes
  exclude: [
    '/portal/*',
    '/admin/*',
    '/login',
    '/register',
    '/register/*',
    '/my-account',
    '/auth/*',
  ],

  // Alternate languages
  alternateRefs: [
    { href: 'https://gjc.ro', hreflang: 'ro' },
    { href: 'https://gjc.ro/en', hreflang: 'en' },
    { href: 'https://gjc.ro/de', hreflang: 'de' },
    { href: 'https://gjc.ro/sr', hreflang: 'sr' },
    { href: 'https://gjc.ro/ne', hreflang: 'ne' },
    { href: 'https://gjc.ro/bn', hreflang: 'bn' },
    { href: 'https://gjc.ro/hi', hreflang: 'hi' },
    { href: 'https://gjc.ro/si', hreflang: 'si' },
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal/', '/admin/', '/api/', '/login', '/register', '/my-account'],
      },
    ],
    additionalSitemaps: [],
  },

  transform: async (config, path) => {
    // Custom priority for important pages
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/' || path === '/en' || path === '/de' || path === '/sr') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/industries/') || path.includes('/workers/')) {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path.includes('/employers') || path.includes('/candidates')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
