"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, Globe, Briefcase,
  GitMerge, FileText, Plane, UserCog, Menu, X, LogOut,
  ChevronRight, Bell, Mail,
} from "lucide-react";
import GlobalSearch from "./GlobalSearch";

const LOGO = "https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/f53cvkek_logo%20transparent.png";

const nav = [
  { href: "/admin",             label: "Dashboard",         icon: LayoutDashboard },
  { href: "/admin/candidates",  label: "Candidați",         icon: Users },
  { href: "/admin/employers",   label: "Angajatori",        icon: Building2 },
  { href: "/admin/agencies",    label: "Agenții",           icon: Globe },
  { href: "/admin/jobs",        label: "Cereri Recrutare",  icon: Briefcase },
  { href: "/admin/placements",  label: "Plasamente",        icon: GitMerge },
  { href: "/admin/documents",   label: "Documente",         icon: FileText },
  { href: "/admin/migration",   label: "Dosare Migrație",   icon: Plane },
  { href: "/admin/contacts",    label: "Mesaje Contact",    icon: Mail },
  { href: "/admin/users",       label: "Utilizatori",       icon: UserCog },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=" + pathname);
    }
  }, [loading, isAuthenticated, pathname, router]);

  // Role guard — must be admin (check both role and account_type)
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const r = (user.role || user.account_type || "").toLowerCase();
      if (r !== "admin") {
        router.push("/my-account");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? "fixed inset-0 z-50 bg-navy-900" : "hidden lg:flex"}
      flex-col w-64 bg-navy-900 text-white h-screen sticky top-0
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-navy-700">
        <Link href="/admin" onClick={() => setOpen(false)}>
          <img src={LOGO} alt="GJC" className="h-9 w-auto brightness-0 invert" />
        </Link>
        {mobile && (
          <button onClick={() => setOpen(false)} className="text-white p-1">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 border-b border-navy-700">
        <p className="text-xs text-navy-300 uppercase tracking-wider">Administrator</p>
        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors group
                ${active
                  ? "bg-coral text-white"
                  : "text-navy-200 hover:bg-navy-800 hover:text-white"
                }
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-navy-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm
            text-navy-200 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Deconectare
        </button>
      </div>
    </aside>
  );

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {open && <Sidebar mobile />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setOpen(true)} className="text-gray-600">
            <Menu className="h-6 w-6" />
          </button>
          <img src={LOGO} alt="GJC" className="h-8 w-auto" />
          <div className="w-6" />
        </header>

        {/* Search bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-6 py-3 hidden lg:block">
          <GlobalSearch />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
