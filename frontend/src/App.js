import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import HomePage from "@/pages/HomePage";
import EmployersPage from "@/pages/EmployersPage";
import ServicesPage from "@/pages/ServicesPage";
import CandidatesPage from "@/pages/CandidatesPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ContactPage from "@/pages/ContactPage";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function App() {
  useEffect(() => {
    // Initialize blog posts on first load
    const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
    fetch(`${API}/blog/init-sample`, { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/angajatori" element={<EmployersPage />} />
            <Route path="/servicii" element={<ServicesPage />} />
            <Route path="/candidati" element={<CandidatesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
