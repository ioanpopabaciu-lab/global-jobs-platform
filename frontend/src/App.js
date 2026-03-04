import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import HomePage from "@/pages/HomePage";
import EmployersPage from "@/pages/EmployersPage";
import ServicesPage from "@/pages/ServicesPage";
import CandidatesPage from "@/pages/CandidatesPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import FormularAngajatorPage from "@/pages/FormularAngajatorPage";
import DespreNoiPage from "@/pages/DespreNoiPage";
import ProceduraPage from "@/pages/ProceduraPage";
import EligibilitatePage from "@/pages/EligibilitatePage";
import CosturiPage from "@/pages/CosturiPage";
import StudentAdvisorPage from "@/pages/StudentAdvisorPage";
import WorkCareerPage from "@/pages/WorkCareerPage";
import FamilyReunionPage from "@/pages/FamilyReunionPage";
import SettlementCitizenshipPage from "@/pages/SettlementCitizenshipPage";
import AdministrativePage from "@/pages/AdministrativePage";

// Auth & Account Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallback from "@/pages/AuthCallback";
import MyAccountPage from "@/pages/MyAccountPage";

// Portal Pages - Candidate
import CandidateLayout from "@/pages/portal/CandidateLayout";
import CandidateDashboard from "@/pages/portal/CandidateDashboard";
import CandidateProfileForm from "@/pages/portal/CandidateProfileForm";

// Portal Pages - Employer
import EmployerLayout from "@/pages/portal/EmployerLayout";
import EmployerDashboard from "@/pages/portal/EmployerDashboard";
import EmployerProfileForm from "@/pages/portal/EmployerProfileForm";
import JobRequestsList from "@/pages/portal/JobRequestsList";
import JobRequestForm from "@/pages/portal/JobRequestForm";

// Portal Pages - Student
import StudentLayout from "@/pages/portal/StudentLayout";
import StudentDashboard from "@/pages/portal/StudentDashboard";

// Portal Pages - Immigration
import ImmigrationLayout from "@/pages/portal/ImmigrationLayout";
import ImmigrationDashboard from "@/pages/portal/ImmigrationDashboard";

// Admin Pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import PhoneButton from "@/components/PhoneButton";
import MariaChat from "@/components/MariaChat";
import MobileStickyCTA from "@/components/MobileStickyCTA";

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
          <Route path="/despre-noi" element={<DespreNoiPage />} />
          <Route path="/angajatori" element={<EmployersPage />} />
          <Route path="/angajatori/procedura" element={<ProceduraPage />} />
          <Route path="/angajatori/eligibilitate" element={<EligibilitatePage />} />
          <Route path="/angajatori/costuri" element={<CosturiPage />} />
          <Route path="/servicii" element={<ServicesPage />} />
          <Route path="/servicii/student-advisor" element={<StudentAdvisorPage />} />
          <Route path="/servicii/work-career" element={<WorkCareerPage />} />
          <Route path="/servicii/family-reunion" element={<FamilyReunionPage />} />
          <Route path="/servicii/settlement-citizenship" element={<SettlementCitizenshipPage />} />
          <Route path="/servicii/administrative" element={<AdministrativePage />} />
          <Route path="/candidati" element={<CandidatesPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/politica-confidentialitate" element={<PrivacyPolicyPage />} />
          <Route path="/formular-angajator" element={<FormularAngajatorPage />} />
          
          {/* English routes */}
          <Route path="/en" element={<LanguageRoute><HomePage /></LanguageRoute>} />
          <Route path="/en/about-us" element={<LanguageRoute><DespreNoiPage /></LanguageRoute>} />
          <Route path="/en/employers" element={<LanguageRoute><EmployersPage /></LanguageRoute>} />
          <Route path="/en/employers/procedure" element={<LanguageRoute><ProceduraPage /></LanguageRoute>} />
          <Route path="/en/employers/eligibility" element={<LanguageRoute><EligibilitatePage /></LanguageRoute>} />
          <Route path="/en/employers/costs" element={<LanguageRoute><CosturiPage /></LanguageRoute>} />
          <Route path="/en/services" element={<LanguageRoute><ServicesPage /></LanguageRoute>} />
          <Route path="/en/services/student-advisor" element={<LanguageRoute><StudentAdvisorPage /></LanguageRoute>} />
          <Route path="/en/services/work-career" element={<LanguageRoute><WorkCareerPage /></LanguageRoute>} />
          <Route path="/en/services/family-reunion" element={<LanguageRoute><FamilyReunionPage /></LanguageRoute>} />
          <Route path="/en/services/settlement-citizenship" element={<LanguageRoute><SettlementCitizenshipPage /></LanguageRoute>} />
          <Route path="/en/services/administrative" element={<LanguageRoute><AdministrativePage /></LanguageRoute>} />
          <Route path="/en/candidates" element={<LanguageRoute><CandidatesPage /></LanguageRoute>} />
          <Route path="/en/blog" element={<LanguageRoute><BlogPage /></LanguageRoute>} />
          <Route path="/en/blog/:slug" element={<LanguageRoute><BlogPostPage /></LanguageRoute>} />
          <Route path="/en/contact" element={<LanguageRoute><ContactPage /></LanguageRoute>} />
          <Route path="/en/privacy-policy" element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>} />
          <Route path="/en/employer-form" element={<LanguageRoute><FormularAngajatorPage /></LanguageRoute>} />
          
          {/* German routes */}
          <Route path="/de" element={<LanguageRoute><HomePage /></LanguageRoute>} />
          <Route path="/de/uber-uns" element={<LanguageRoute><DespreNoiPage /></LanguageRoute>} />
          <Route path="/de/arbeitgeber" element={<LanguageRoute><EmployersPage /></LanguageRoute>} />
          <Route path="/de/arbeitgeber/verfahren" element={<LanguageRoute><ProceduraPage /></LanguageRoute>} />
          <Route path="/de/arbeitgeber/berechtigung" element={<LanguageRoute><EligibilitatePage /></LanguageRoute>} />
          <Route path="/de/arbeitgeber/kosten" element={<LanguageRoute><CosturiPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen" element={<LanguageRoute><ServicesPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen/student-advisor" element={<LanguageRoute><StudentAdvisorPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen/work-career" element={<LanguageRoute><WorkCareerPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen/family-reunion" element={<LanguageRoute><FamilyReunionPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen/settlement-citizenship" element={<LanguageRoute><SettlementCitizenshipPage /></LanguageRoute>} />
          <Route path="/de/dienstleistungen/administrative" element={<LanguageRoute><AdministrativePage /></LanguageRoute>} />
          <Route path="/de/kandidaten" element={<LanguageRoute><CandidatesPage /></LanguageRoute>} />
          <Route path="/de/blog" element={<LanguageRoute><BlogPage /></LanguageRoute>} />
          <Route path="/de/blog/:slug" element={<LanguageRoute><BlogPostPage /></LanguageRoute>} />
          <Route path="/de/kontakt" element={<LanguageRoute><ContactPage /></LanguageRoute>} />
          <Route path="/de/datenschutz" element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>} />
          <Route path="/de/arbeitgeber-formular" element={<LanguageRoute><FormularAngajatorPage /></LanguageRoute>} />
          
          {/* Serbian routes */}
          <Route path="/sr" element={<LanguageRoute><HomePage /></LanguageRoute>} />
          <Route path="/sr/o-nama" element={<LanguageRoute><DespreNoiPage /></LanguageRoute>} />
          <Route path="/sr/poslodavci" element={<LanguageRoute><EmployersPage /></LanguageRoute>} />
          <Route path="/sr/poslodavci/procedura" element={<LanguageRoute><ProceduraPage /></LanguageRoute>} />
          <Route path="/sr/poslodavci/podobnost" element={<LanguageRoute><EligibilitatePage /></LanguageRoute>} />
          <Route path="/sr/poslodavci/troskovi" element={<LanguageRoute><CosturiPage /></LanguageRoute>} />
          <Route path="/sr/usluge" element={<LanguageRoute><ServicesPage /></LanguageRoute>} />
          <Route path="/sr/usluge/student-advisor" element={<LanguageRoute><StudentAdvisorPage /></LanguageRoute>} />
          <Route path="/sr/usluge/work-career" element={<LanguageRoute><WorkCareerPage /></LanguageRoute>} />
          <Route path="/sr/usluge/family-reunion" element={<LanguageRoute><FamilyReunionPage /></LanguageRoute>} />
          <Route path="/sr/usluge/settlement-citizenship" element={<LanguageRoute><SettlementCitizenshipPage /></LanguageRoute>} />
          <Route path="/sr/usluge/administrative" element={<LanguageRoute><AdministrativePage /></LanguageRoute>} />
          <Route path="/sr/kandidati" element={<LanguageRoute><CandidatesPage /></LanguageRoute>} />
          <Route path="/sr/blog" element={<LanguageRoute><BlogPage /></LanguageRoute>} />
          <Route path="/sr/blog/:slug" element={<LanguageRoute><BlogPostPage /></LanguageRoute>} />
          <Route path="/sr/kontakt" element={<LanguageRoute><ContactPage /></LanguageRoute>} />
          <Route path="/sr/politika-privatnosti" element={<LanguageRoute><PrivacyPolicyPage /></LanguageRoute>} />
          <Route path="/sr/formular-poslodavac" element={<LanguageRoute><FormularAngajatorPage /></LanguageRoute>} />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
      <PhoneButton />
      <WhatsAppButton />
      <MariaChat />
      <MobileStickyCTA />
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment (not query params) for session_id - handle OAuth callback
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  // Check if we're in portal or admin area (no public layout)
  const isPortalRoute = location.pathname.startsWith('/portal') || 
                        location.pathname.startsWith('/admin') ||
                        location.pathname.startsWith('/login') ||
                        location.pathname.startsWith('/register') ||
                        location.pathname.startsWith('/auth') ||
                        location.pathname.startsWith('/my-account');
  
  if (isPortalRoute) {
    return (
      <Routes>
        {/* Auth routes */}
        <Route path="/my-account" element={<MyAccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Candidate Portal */}
        <Route path="/portal/candidate" element={<CandidateLayout />}>
          <Route index element={<CandidateDashboard />} />
          <Route path="profile" element={<CandidateProfileForm />} />
          <Route path="documents" element={<CandidateProfileForm />} />
          <Route path="applications" element={<div className="p-4">Applications - Coming Soon</div>} />
          <Route path="notifications" element={<div className="p-4">Notifications - Coming Soon</div>} />
        </Route>
        
        {/* Employer Portal */}
        <Route path="/portal/employer" element={<EmployerLayout />}>
          <Route index element={<EmployerDashboard />} />
          <Route path="profile" element={<EmployerProfileForm />} />
          <Route path="jobs" element={<JobRequestsList />} />
          <Route path="jobs/new" element={<JobRequestForm />} />
          <Route path="jobs/:jobId" element={<JobRequestForm />} />
          <Route path="jobs/:jobId/edit" element={<JobRequestForm />} />
          <Route path="projects" element={<div className="p-4">Projects - Coming Soon</div>} />
          <Route path="invoices" element={<div className="p-4">Invoices - Coming Soon</div>} />
          <Route path="notifications" element={<div className="p-4">Notifications - Coming Soon</div>} />
        </Route>
        
        {/* Student Portal */}
        <Route path="/portal/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="application" element={<div className="p-4">Application - Coming Soon</div>} />
          <Route path="documents" element={<div className="p-4">Documents - Coming Soon</div>} />
          <Route path="timeline" element={<div className="p-4">Timeline - Coming Soon</div>} />
          <Route path="notifications" element={<div className="p-4">Notifications - Coming Soon</div>} />
        </Route>
        
        {/* Immigration Services Portal */}
        <Route path="/portal/immigration" element={<ImmigrationLayout />}>
          <Route index element={<ImmigrationDashboard />} />
          <Route path="cases" element={<div className="p-4">My Cases - Coming Soon</div>} />
          <Route path="documents" element={<div className="p-4">Documents - Coming Soon</div>} />
          <Route path="notifications" element={<div className="p-4">Notifications - Coming Soon</div>} />
        </Route>
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="candidates" element={<div className="p-4">Candidates Admin - Coming Soon</div>} />
          <Route path="employers" element={<div className="p-4">Employers Admin - Coming Soon</div>} />
          <Route path="jobs" element={<div className="p-4">Jobs Admin - Coming Soon</div>} />
          <Route path="projects" element={<div className="p-4">Projects Admin - Coming Soon</div>} />
          <Route path="documents" element={<div className="p-4">Documents Admin - Coming Soon</div>} />
          <Route path="users" element={<div className="p-4">Users Admin - Coming Soon</div>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/my-account" replace />} />
      </Routes>
    );
  }
  
  // Public website with full layout
  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
