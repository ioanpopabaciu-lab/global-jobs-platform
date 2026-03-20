import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Building2, Briefcase, FolderKanban, 
  FileText, Bell, Settings, LogOut, Menu, X, Home, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Candidați', href: '/admin/candidates', icon: Users },
  { name: 'Angajatori', href: '/admin/employers', icon: Building2 },
  { name: 'Joburi', href: '/admin/jobs', icon: Briefcase },
  { name: 'Proiecte', href: '/admin/projects', icon: FolderKanban },
  { name: 'Documente', href: '/admin/documents', icon: FileText },
  { name: 'Utilizatori', href: '/admin/users', icon: Shield },
];

export default function AdminLayout() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (user && user.role !== 'admin') {
      toast.error('Acces nepermis - doar administratori');
      navigate('/', { replace: true });
    }
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboard();
    }
  }, [API_URL, isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-navy-900 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <span className="font-semibold text-white">Admin Dashboard</span>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-navy-800">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/en2yk94c_Design%20f%C4%83r%C4%83%20titlu%20%281%29.png" 
                alt="GJC" 
                className="h-10"
              />
              <div>
                <p className="font-semibold text-white text-sm">Global Jobs</p>
                <p className="text-xs text-navy-300">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Admin info */}
          <div className="p-4 border-b border-navy-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-navy-300 truncate">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-navy-700 text-white' 
                      : 'text-navy-300 hover:bg-navy-800 hover:text-white'}
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {dashboardData && (
            <div className="p-4 border-t border-navy-800">
              <p className="text-xs text-navy-400 uppercase tracking-wider mb-3">Rezumat</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-navy-800 rounded-lg p-2">
                  <p className="text-lg font-bold text-white">{dashboardData.profiles?.pending_candidates || 0}</p>
                  <p className="text-xs text-navy-400">Candidați noi</p>
                </div>
                <div className="bg-navy-800 rounded-lg p-2">
                  <p className="text-lg font-bold text-white">{dashboardData.profiles?.pending_employers || 0}</p>
                  <p className="text-xs text-navy-400">Angajatori noi</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-navy-800 space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-300 hover:bg-navy-800 hover:text-white"
            >
              <Home className="h-5 w-5" />
              Site Principal
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              Deconectare
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6">
          <Outlet context={{ dashboardData, user }} />
        </div>
      </main>
    </div>
  );
}
