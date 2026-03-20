import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, FileText, Briefcase, Bell, ArrowRight, 
  CheckCircle, Clock, AlertCircle, TrendingUp 
} from 'lucide-react';

export default function CandidateDashboard() {
  const { dashboardData, user } = useOutletContext();

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'Draft' },
      pending_validation: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'În validare' },
      validated: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Validat' },
      rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle, text: 'Respins' }
    };
    return badges[status] || badges.draft;
  };

  const profileStatus = dashboardData?.profile_status;
  const statusBadge = getStatusBadge(profileStatus);
  const StatusIcon = statusBadge.icon;

  // Calculate profile completion
  const getProfileCompletion = () => {
    if (!dashboardData?.has_profile) return 0;
    if (profileStatus === 'validated') return 100;
    if (profileStatus === 'pending_validation') return 80;
    return 40;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-heading font-bold mb-2">
          Bun venit, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-navy-100">
          {dashboardData?.has_profile 
            ? 'Urmărește-ți aplicațiile și progresul proiectelor tale.'
            : 'Începe prin a-ți completa profilul pentru a putea aplica la joburi.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status Profil</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusBadge.text}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-navy-50 rounded-full">
                <User className="h-6 w-6 text-navy-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Proiecte Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData?.active_projects || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Notificări Necitite</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData?.unread_notifications || 0}
                </p>
              </div>
              <div className="p-3 bg-coral/10 rounded-full">
                <Bell className="h-6 w-6 text-coral" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Progress */}
      {!dashboardData?.has_profile || profileStatus === 'draft' ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Completează-ți Profilul
            </CardTitle>
            <CardDescription>
              Pentru a putea aplica la joburi și a fi vizibil pentru angajatori, 
              trebuie să îți completezi profilul și să încarci documentele necesare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progres completare</span>
                  <span className="font-medium">{getProfileCompletion()}%</span>
                </div>
                <Progress value={getProfileCompletion()} className="h-2" />
              </div>
              <Link to="/portal/candidate/profile">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Completează Profilul
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Profilul Tău
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Nume</p>
                <p className="font-medium">{dashboardData?.profile_summary?.full_name || user?.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Naționalitate</p>
                <p className="font-medium">{dashboardData?.profile_summary?.nationality || '-'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Profesie</p>
                <p className="font-medium">{dashboardData?.profile_summary?.profession || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/portal/candidate/profile">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-navy-50 rounded-lg">
                  <User className="h-6 w-6 text-navy-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Editează Profilul</h3>
                  <p className="text-sm text-gray-500">Actualizează informațiile personale</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/portal/candidate/documents">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Documente</h3>
                  <p className="text-sm text-gray-500">Încarcă pașaport, CV, diplome</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Ai nevoie de ajutor?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Contactează echipa noastră pentru orice întrebare
              </p>
            </div>
            <a href="mailto:office@gjc.ro">
              <Button variant="outline">
                Contactează-ne
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
