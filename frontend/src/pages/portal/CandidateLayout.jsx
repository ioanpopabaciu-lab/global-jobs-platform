import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, FileText, Briefcase, Bell, LogOut, Menu, X, 
  Home, ChevronRight, Settings, HelpCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/portal/candidate', icon: Home },
  { name: 'Profilul Meu', href: '/portal/candidate/profile', icon: User },
  { name: 'Documente', href: '/portal/candidate/documents', icon: FileText },
  { name: 'Aplicațiile Mele', href: '/portal/candidate/applications', icon: Briefcase },
  { name: 'Notificări', href: '/portal/candidate/notifications', icon: Bell },
];

export default function CandidateLayout() {
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

    if (user && user.role !== 'candidate' && user.role !== 'admin') {
      toast.error('Acces nepermis');
      navigate('/', { replace: true });
    }
  }, [user, isAuthenticated, loading, navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/portal/candidate/dashboard`, {
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

    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [API_URL, isAuthenticated]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <span className="font-semibold text-navy-900">Portal Candidat</span>
        <div className="w-10" />
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/en2yk94c_Design%20f%C4%83r%C4%83%20titlu%20%281%29.png" 
                alt="GJC" 
                className="h-10"
              />
              <div>
                <p className="font-semibold text-navy-900 text-sm">Global Jobs</p>
                <p className="text-xs text-gray-500">Portal Candidat</p>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-navy-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            {dashboardData && !dashboardData.has_profile && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  ⚠️ Completează-ți profilul pentru a aplica la joburi
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-navy-50 text-navy-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {item.name === 'Notificări' && dashboardData?.unread_notifications > 0 && (
                    <span className="ml-auto bg-coral text-white text-xs rounded-full px-2 py-0.5">
                      {dashboardData.unread_notifications}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              <Home className="h-5 w-5" />
              Site Principal
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
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
