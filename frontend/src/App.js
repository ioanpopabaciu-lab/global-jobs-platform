import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";

// Pages
import HomePage from "@/pages/HomePage";
import EmployersPage from "@/pages/EmployersPage";
import ServicesPage from "@/pages/ServicesPage";
import CandidatesPage from "@/pages/CandidatesPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import MariaChat from "@/components/MariaChat";

// Language route wrapper - sets language based on URL prefix
function LanguageRoute({ children }) {
  const { lang } = useParams();
  const { setLanguage } = useLanguage();
  
  useEffect(() => {
    if (lang && ['en', 'de', 'sr'].includes(lang)) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);
  
  return children;
}

// Redirect component for language-prefixed URLs
function LanguageRedirect() {
  const { lang } = useParams();
  const location = useLocation();
  const { setLanguage } = useLanguage();
  
  useEffect(() => {
    if (lang && ['en', 'de', 'sr'].includes(lang)) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);
  
  // Get the path after language prefix
  const pathAfterLang = location.pathname.replace(`/${lang}`, '') || '/';
  
  return <Navigate to={pathAfterLang} replace />;
}

function AppContent() {
  const location = useLocation();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    // Initialize blog posts on first load
    const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
    fetch(`${API}/blog/init-sample`, { method: 'POST' }).catch(() => {});
  }, []);

  // Handle language from URL on initial load
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/en')) {
      setLanguage('en');
    } else if (path.startsWith('/de')) {
      setLanguage('de');
    } else if (path.startsWith('/sr')) {
      setLanguage('sr');
    }
  }, [location.pathname, setLanguage]);

  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Default Romanian routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/angajatori" element={<EmployersPage />} />
          <Route path="/servicii" element={<ServicesPage />} />
          <Route path="/candidati" element={<CandidatesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/politica-confidentialitate" element={<PrivacyPolicyPage />} />
          
          {/* English routes */}
          <Route path="/en" element={<LanguageRoute><HomePage /></LanguageRoute>} />
          <Route path="/en/employers" element={<LanguageRoute><EmployersPage /></LanguageRoute>} />
          <Route path="/en/services" element={<LanguageRoute><ServicesPage /></LanguageRoute>} />
          <Route path="/en/candidates" element={<LanguageRoute><CandidatesPage /></LanguageRoute>} />
          <Route path="/en/blog" element={<LanguageRoute><BlogPage /></LanguageRoute>} />
          <Route path="/en/blog/:slug" element={<LanguageRoute><BlogPostPage /></LanguageRoute>} />
          <Route path="/en/contact" element={<LanguageRoute><ContactPage /></LanguageRoute>} />
          <Route path="/en/privacy-policy" element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>} />
          
          {/* German routes */}
          <Route path="/de" element={<LanguageRoute><HomePage /></LanguageRoute>} />
          <Route path="/de/arbeitgeber" element={<LanguageRoute><EmployersPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen" element={<LanguageRoute><ServicesPage /></LanguageRoute>} />
          <Route path="/de/kandidaten" element={<LanguageRoute><CandidatesPage /></LanguageRoute>} />
          <Route path="/de/blog" element={<LanguageRoute><BlogPage /></LanguageRoute>} />
          <Route path="/de/blog/:slug" element={<LanguageRoute><BlogPostPage /></LanguageRoute>} />
          <Route path="/de/kontakt" element={<LanguageRoute><ContactPage /></LanguageRoute>} />
          <Route path="/de/datenschutz" element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>} />
          
          {/* Serbian routes */}
          <Route path="/sr" element={<LanguageRoute><HomePage /></LanguageRoute>} />
          <Route path="/sr/poslodavci" element={<LanguageRoute><EmployersPage /></LanguageRoute>} />
          <Route path="/sr/usluge" element={<LanguageRoute><ServicesPage /></LanguageRoute>} />
          <Route path="/sr/kandidati" element={<LanguageRoute><CandidatesPage /></LanguageRoute>} />
          <Route path="/sr/blog" element={<LanguageRoute><BlogPage /></LanguageRoute>} />
          <Route path="/sr/blog/:slug" element={<LanguageRoute><BlogPostPage /></LanguageRoute>} />
          <Route path="/sr/kontakt" element={<LanguageRoute><ContactPage /></LanguageRoute>} />
          <Route path="/sr/politika-privatnosti" element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>} />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
      <MariaChat />
      <Toaster position="top-right" richColors />
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  );
}

export default App;
