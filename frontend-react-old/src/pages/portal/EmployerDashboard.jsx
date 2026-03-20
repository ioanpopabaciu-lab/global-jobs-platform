import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, FileText, Briefcase, Bell, ArrowRight, Users,
  CheckCircle, Clock, AlertCircle, TrendingUp, Plus
} from 'lucide-react';

export default function EmployerDashboard() {
  const { dashboardData, user } = useOutletContext();

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, text: 'Draft' },
      pending_validation: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'În validare' },
      validated: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Validată' },
      rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle, text: 'Respinsă' }
    };
    return badges[status] || badges.draft;
  };

  const profileStatus = dashboardData?.profile_status;
  const statusBadge = getStatusBadge(profileStatus);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-heading font-bold mb-2">
          Bun venit! 👋
        </h1>
        <p className="text-navy-100">
          {dashboardData?.has_profile 
            ? `Gestionează recrutările pentru ${dashboardData.company_name}`
            : 'Începe prin a completa profilul companiei pentru a putea crea cereri de personal.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status Companie</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusBadge.text}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-navy-50 rounded-full">
                <Building2 className="h-6 w-6 text-navy-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Joburi Deschise</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {dashboardData?.open_jobs || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Notificări</p>
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

      {/* Profile Alert */}
      {!dashboardData?.has_profile || profileStatus === 'draft' ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Completează Profilul Companiei
            </CardTitle>
            <CardDescription>
              Pentru a crea cereri de personal și a primi candidați potriviți, 
              completează profilul companiei și trimite-l pentru validare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/portal/employer/profile">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                Completează Profilul
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : profileStatus === 'pending_validation' ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Profilul companiei este în curs de validare</h3>
                <p className="text-sm text-blue-700">
                  Vei fi notificat când compania va fi aprobată. Durată estimată: 24-48 ore.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : profileStatus === 'validated' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Companie Validată
              </CardTitle>
              <CardDescription>
                Poți crea cereri de personal și primi candidați potriviți
              </CardDescription>
            </div>
            <Link to="/portal/employer/jobs">
              <Button className="bg-navy-600 hover:bg-navy-700">
                <Plus className="mr-2 h-4 w-4" />
                Cerere Nouă
              </Button>
            </Link>
          </CardHeader>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/portal/employer/profile">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-navy-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-navy-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Profilul Companiei</h3>
                  <p className="text-sm text-gray-500">Editează detaliile companiei</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/portal/employer/jobs">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Cereri de Personal</h3>
                  <p className="text-sm text-gray-500">Gestionează pozițiile deschise</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/portal/employer/projects">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Proiecte Active</h3>
                  <p className="text-sm text-gray-500">Urmărește progresul recrutărilor</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Cum funcționează?</h3>
              <p className="text-sm text-gray-500 mt-1">
                1. Completezi profilul → 2. Creezi cereri de personal → 3. Primești candidați potriviți → 4. Urmărești procesul de imigrare
              </p>
            </div>
            <a href="mailto:office@gjc.ro">
              <Button variant="outline">
                Întrebări?
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
