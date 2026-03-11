# 🚀 MIGRATION PLAN: React SPA → Next.js 14+ App Router

**Project:** Global Jobs Consulting (gjc.ro)  
**Date:** March 2026  
**Migration Type:** Full Architecture Migration (In Stages)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Analysis](#2-current-architecture-analysis)
3. [Target Architecture](#3-target-architecture)
4. [URL Structure Mapping](#4-url-structure-mapping)
5. [301 Redirect Strategy](#5-301-redirect-strategy)
6. [Migration Phases](#6-migration-phases)
7. [Technical Decisions](#7-technical-decisions)
8. [Risk Mitigation](#8-risk-mitigation)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Goals
- ✅ Improve SEO with Server-Side Rendering (SSR) and Static Site Generation (SSG)
- ✅ Enhance performance with Next.js optimizations
- ✅ Maintain all existing functionality
- ✅ Preserve all current URLs for SEO equity
- ✅ Full TypeScript migration for maintainability

### 1.2 Scope
- **In Scope:** Frontend migration, SEO optimization, TypeScript conversion
- **Out of Scope:** Backend migration (FastAPI remains separate)

### 1.3 Timeline Strategy
Migration will be done in **5 phases** across multiple sessions:
1. Phase 1: Base Architecture + Homepage
2. Phase 2: Industry & Country Pages (SEO Priority)
3. Phase 3: Remaining Public Pages
4. Phase 4: Authentication & Portals
5. Phase 5: Admin Dashboard & Final Polish

---

## 2. CURRENT ARCHITECTURE ANALYSIS

### 2.1 Technology Stack
```
Current Stack:
├── React 18 (Create React App)
├── React Router DOM v6
├── TailwindCSS + Shadcn/UI
├── Context API (Auth, Language)
├── Sonner (Toast notifications)
└── Lucide React (Icons)

Backend (Unchanged):
├── FastAPI (Python)
├── MongoDB
└── JWT Authentication
```

### 2.2 Current File Structure
```
/app/frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── HeroSlider.jsx
│   │   ├── MariaChat.jsx
│   │   └── ...
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── i18n/
│   │   ├── translations.js
│   │   └── LanguageContext.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DespreNoiPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── portal/
│   │   └── admin/
│   ├── App.js
│   └── index.js
├── public/
└── package.json
```

### 2.3 State Management
| Context | Purpose | Migration Strategy |
|---------|---------|-------------------|
| AuthContext | JWT auth, user state | Keep as Client Context |
| LanguageContext | i18n, locale | Migrate to Next.js i18n |

### 2.4 Current Languages (8)
| Code | Language | URL Prefix |
|------|----------|------------|
| ro | Română (default) | `/` |
| en | English | `/en` |
| de | Deutsch | `/de` |
| sr | Srpski | `/sr` |
| ne | नेपाली | `/ne` |
| bn | বাংলা | `/bn` |
| hi | हिन्दी | `/hi` |
| si | සිංහල | `/si` |

---

## 3. TARGET ARCHITECTURE

### 3.1 New Technology Stack
```
Target Stack:
├── Next.js 14.2+ (App Router)
├── TypeScript 5+
├── TailwindCSS + Shadcn/UI (unchanged)
├── next-intl (i18n)
├── next-sitemap (SEO)
├── next-auth (future, prepared)
└── Server Components (default)
```

### 3.2 New File Structure
```
/app/frontend/
├── app/
│   ├── [locale]/                    # i18n wrapper
│   │   ├── (public)/                # Public pages with marketing layout
│   │   │   ├── layout.tsx           # Navbar + Footer
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── candidates/page.tsx
│   │   │   ├── employers/page.tsx
│   │   │   ├── industries/
│   │   │   │   └── [industry]/page.tsx
│   │   │   ├── workers/
│   │   │   │   └── [country]/page.tsx
│   │   │   ├── jobs/
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── blog/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/page.tsx
│   │   ├── (dashboard)/             # Protected portal routes
│   │   │   ├── layout.tsx
│   │   │   ├── portal/
│   │   │   │   ├── candidate/
│   │   │   │   ├── employer/
│   │   │   │   ├── student/
│   │   │   │   └── immigration/
│   │   │   └── my-account/page.tsx
│   │   └── (admin)/                 # Admin routes
│   │       ├── layout.tsx
│   │       └── admin/
│   │           ├── page.tsx
│   │           ├── candidates/
│   │           ├── employers/
│   │           └── ...
│   ├── api/                         # API Route Handlers (minimal)
│   │   └── revalidate/route.ts
│   ├── layout.tsx                   # Root layout
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # Shadcn (unchanged)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── sections/
│   │   ├── HeroSlider.tsx
│   │   ├── StatsSection.tsx
│   │   └── ...
│   └── forms/
│       ├── ContactForm.tsx
│       └── ...
├── lib/
│   ├── api.ts                       # FastAPI client
│   ├── auth.ts                      # Auth utilities
│   └── utils.ts
├── hooks/
│   └── useAuth.ts
├── types/
│   ├── index.ts
│   └── api.ts
├── i18n/
│   ├── config.ts
│   └── dictionaries/
│       ├── ro.json
│       ├── en.json
│       └── ...
├── middleware.ts                    # Auth + i18n middleware
├── next.config.js
├── next-sitemap.config.js
└── tsconfig.json
```

### 3.3 Rendering Strategy
| Page Type | Strategy | Cache |
|-----------|----------|-------|
| Homepage | SSG + ISR | 1 hour |
| Industry pages | SSG | Build time |
| Country pages | SSG | Build time |
| Blog posts | SSG + ISR | 24 hours |
| Contact | SSR | No cache |
| Candidates form | CSR | No cache |
| Dashboard pages | CSR | No cache |
| Admin pages | CSR | No cache |

---

## 4. URL STRUCTURE MAPPING

### 4.1 Romanian (Default Locale) URLs

| Current URL | New URL | Status |
|-------------|---------|--------|
| `/` | `/` | ✅ Same |
| `/despre-noi` | `/about` | 🔄 Redirect |
| `/angajatori` | `/employers` | 🔄 Redirect |
| `/angajatori/procedura` | `/employers/procedure` | 🔄 Redirect |
| `/angajatori/eligibilitate` | `/employers/eligibility` | 🔄 Redirect |
| `/angajatori/costuri` | `/employers/costs` | 🔄 Redirect |
| `/servicii` | `/services` | 🔄 Redirect |
| `/servicii/student-advisor` | `/services/student-advisor` | 🔄 Redirect |
| `/servicii/work-career` | `/services/work-career` | 🔄 Redirect |
| `/servicii/family-reunion` | `/services/family-reunion` | 🔄 Redirect |
| `/servicii/settlement-citizenship` | `/services/settlement-citizenship` | 🔄 Redirect |
| `/servicii/administrative` | `/services/administrative` | 🔄 Redirect |
| `/candidati` | `/candidates` | 🔄 Redirect |
| `/blog` | `/blog` | ✅ Same |
| `/blog/:slug` | `/blog/:slug` | ✅ Same |
| `/contact` | `/contact` | ✅ Same |
| `/politica-confidentialitate` | `/privacy-policy` | 🔄 Redirect |
| `/formular-angajator` | `/employer-form` | 🔄 Redirect |
| `/solicita-muncitori` | `/request-workers` | 🔄 Redirect |
| `/cum-functioneaza` | `/how-it-works` | 🔄 Redirect |
| `/industrii/:industry` | `/industries/:industry` | 🔄 Redirect |

### 4.2 International URLs (Preserved)

| Language | Pattern | Example |
|----------|---------|---------|
| English | `/en/*` | `/en/about`, `/en/employers` |
| German | `/de/*` | `/de/about`, `/de/employers` |
| Serbian | `/sr/*` | `/sr/about`, `/sr/employers` |
| Nepali | `/ne/*` | `/ne/about`, `/ne/employers` |
| Bengali | `/bn/*` | `/bn/about`, `/bn/employers` |
| Hindi | `/hi/*` | `/hi/about`, `/hi/employers` |
| Sinhala | `/si/*` | `/si/about`, `/si/employers` |

### 4.3 NEW Dynamic Routes for SEO

| Route | Purpose | Example URLs |
|-------|---------|--------------|
| `/industries/[industry]` | Industry landing pages | `/industries/construction`, `/industries/horeca` |
| `/workers/[country]` | Country recruitment pages | `/workers/nepal`, `/workers/bangladesh`, `/workers/india` |
| `/jobs/[slug]` | Individual job listings | `/jobs/welder-romania-2024` |

### 4.4 Dashboard & Admin Routes (Unchanged)

| Current | New | Notes |
|---------|-----|-------|
| `/login` | `/login` | ✅ Same |
| `/register` | `/register` | ✅ Same |
| `/my-account` | `/my-account` | ✅ Same |
| `/portal/candidate/*` | `/portal/candidate/*` | ✅ Same |
| `/portal/employer/*` | `/portal/employer/*` | ✅ Same |
| `/portal/student/*` | `/portal/student/*` | ✅ Same |
| `/portal/immigration/*` | `/portal/immigration/*` | ✅ Same |
| `/admin/*` | `/admin/*` | ✅ Same |

---

## 5. 301 REDIRECT STRATEGY

### 5.1 Redirects Configuration (next.config.js)

```typescript
// next.config.js
const nextConfig = {
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
      { source: '/de/kandidaten', destination: '/de/candidates', permanent: true },
      { source: '/de/kontakt', destination: '/de/contact', permanent: true },
      { source: '/de/branchen/:industry', destination: '/de/industries/:industry', permanent: true },
      
      // Serbian old URLs
      { source: '/sr/o-nama', destination: '/sr/about', permanent: true },
      { source: '/sr/poslodavci', destination: '/sr/employers', permanent: true },
      { source: '/sr/kandidati', destination: '/sr/candidates', permanent: true },
      { source: '/sr/kontakt', destination: '/sr/contact', permanent: true },
      { source: '/sr/industrije/:industry', destination: '/sr/industries/:industry', permanent: true },
    ];
  },
};
```

### 5.2 SEO Preservation Checklist
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor 301 redirects in GSC
- [ ] Update any external backlinks if possible
- [ ] Verify canonical URLs are correct
- [ ] Test all hreflang tags

---

## 6. MIGRATION PHASES

### Phase 1: Base Architecture + Homepage (Current Session)
**Duration:** ~2 hours

**Tasks:**
- [x] Create MIGRATION_PLAN.md
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure TailwindCSS + Shadcn/UI
- [ ] Set up i18n with next-intl
- [ ] Migrate Navbar component (Server Component)
- [ ] Migrate Footer component (Server Component)
- [ ] Migrate Homepage with SSG
- [ ] Configure next-sitemap
- [ ] Test deployment

**Deliverables:**
- Working homepage with SSR/SSG
- Basic navigation
- sitemap.xml generated

---

### Phase 2: Industry & Country Pages (SEO Priority)
**Duration:** ~2 hours

**Tasks:**
- [ ] Create `/industries/[industry]` dynamic route
- [ ] Implement generateStaticParams for industries
- [ ] Create `/workers/[country]` dynamic route
- [ ] Implement generateStaticParams for countries
- [ ] Add JSON-LD structured data
- [ ] Implement generateMetadata for all pages
- [ ] Add OpenGraph images

**Deliverables:**
- All industry pages with SSG
- All country recruitment pages with SSG
- Full SEO metadata

---

### Phase 3: Remaining Public Pages
**Duration:** ~2 hours

**Tasks:**
- [ ] Migrate About page
- [ ] Migrate Contact page (with form)
- [ ] Migrate Candidates page (with form)
- [ ] Migrate Employers pages
- [ ] Migrate Services pages
- [ ] Migrate Blog pages
- [ ] Migrate How It Works page
- [ ] Migrate Privacy Policy

**Deliverables:**
- All public pages functional
- Forms working with FastAPI

---

### Phase 4: Authentication & Portals
**Duration:** ~3 hours

**Tasks:**
- [ ] Set up auth middleware
- [ ] Migrate AuthContext to client hook
- [ ] Migrate Login page
- [ ] Migrate Register pages
- [ ] Migrate Candidate Portal
- [ ] Migrate Employer Portal
- [ ] Migrate Student Portal
- [ ] Migrate Immigration Portal

**Deliverables:**
- Full authentication flow
- All portals functional

---

### Phase 5: Admin Dashboard & Final Polish
**Duration:** ~2 hours

**Tasks:**
- [ ] Migrate Admin Dashboard
- [ ] Migrate Admin pages
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Performance optimization
- [ ] Final testing
- [ ] Documentation update

**Deliverables:**
- Complete migration
- Production-ready application

---

## 7. TECHNICAL DECISIONS

### 7.1 Server vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| Navbar | Server | Static content, SEO |
| Footer | Server | Static content, SEO |
| HeroSlider | Client | Animations, interactions |
| ContactForm | Client | Form state, validation |
| CandidateForm | Client | Form state, file upload |
| LanguageSwitcher | Client | Client-side navigation |
| MobileMenu | Client | Toggle state |
| MariaChat | Client | WebSocket, state |
| Dashboard pages | Client | Real-time data, auth |
| Admin pages | Client | CRUD operations |

### 7.2 Data Fetching Patterns

```typescript
// Server Component - Direct fetch
async function IndustryPage({ params }: { params: { industry: string } }) {
  const data = await fetch(`${API_URL}/api/industries/${params.industry}`, {
    next: { revalidate: 3600 } // ISR: 1 hour
  });
  return <IndustryContent data={data} />;
}

// Client Component - useEffect or SWR
'use client';
function DashboardPage() {
  const { data, isLoading } = useSWR('/api/dashboard', fetcher);
  // ...
}
```

### 7.3 Authentication Flow

```
1. User visits protected route
2. Middleware checks JWT cookie
3. If no token → redirect to /login
4. If token expired → redirect to /login
5. If valid → allow access

Token Storage:
- HttpOnly cookie (secure)
- Managed by FastAPI backend
- Frontend reads user state from /api/auth/me
```

### 7.4 i18n Strategy

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ro', 'en', 'de', 'sr', 'ne', 'bn', 'hi', 'si'],
  defaultLocale: 'ro',
  localePrefix: 'as-needed' // No prefix for default locale
});
```

---

## 8. RISK MITIGATION

### 8.1 Potential Issues & Solutions

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Broken URLs | Medium | High | 301 redirects + monitoring |
| SEO ranking drop | Low | High | Proper redirects + sitemap |
| Auth issues | Medium | High | Thorough testing |
| Performance regression | Low | Medium | Lighthouse audits |
| i18n bugs | Medium | Medium | Extensive testing |

### 8.2 Rollback Plan
1. Keep original CRA build as backup
2. DNS can be switched back if critical issues
3. Feature flags for gradual rollout

### 8.3 Testing Checklist
- [ ] All pages render correctly
- [ ] All forms submit to FastAPI
- [ ] Authentication flow works
- [ ] Language switching works
- [ ] SEO meta tags present
- [ ] sitemap.xml valid
- [ ] robots.txt correct
- [ ] Mobile responsive
- [ ] Performance > 90 Lighthouse
- [ ] No console errors

---

## 📊 PROGRESS TRACKING

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| Phase 1 | 🟡 In Progress | March 2026 | - |
| Phase 2 | ⚪ Not Started | - | - |
| Phase 3 | ⚪ Not Started | - | - |
| Phase 4 | ⚪ Not Started | - | - |
| Phase 5 | ⚪ Not Started | - | - |

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Next Review:** After Phase 1 completion
