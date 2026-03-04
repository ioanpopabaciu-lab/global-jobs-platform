import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, Building2, Briefcase, FolderKanban, ArrowRight,
  TrendingUp, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const { dashboardData } = useOutletContext();

  const stats = [
    {
      name: 'Total Utilizatori',
      value: dashboardData?.users?.total || 0,
      subtext: `${dashboardData?.users?.candidates || 0} candidați, ${dashboardData?.users?.employers || 0} angajatori`,
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      name: 'Candidați Validați',
      value: dashboardData?.profiles?.validated_candidates || 0,
      subtext: `${dashboardData?.profiles?.pending_candidates || 0} în așteptare`,
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/candidates'
    },
    {
      name: 'Angajatori Validați',
      value: dashboardData?.profiles?.validated_employers || 0,
      subtext: `${dashboardData?.profiles?.pending_employers || 0} în așteptare`,
      icon: Building2,
      color: 'bg-purple-500',
      href: '/admin/employers'
    },
    {
      name: 'Proiecte Active',
      value: dashboardData?.projects?.active || 0,
      subtext: `${dashboardData?.projects?.completed || 0} finalizate`,
      icon: FolderKanban,
      color: 'bg-coral',
      href: '/admin/projects'
    },
  ];

  // Get projects by stage for the pipeline view
  const stages = dashboardData?.projects?.by_stage || {};

  const pipelineStages = [
    { key: 'candidate_matched', label: 'Matching', color: 'bg-blue-100 text-blue-700' },
    { key: 'contract_generated', label: 'Contract', color: 'bg-purple-100 text-purple-700' },
    { key: 'payment_received', label: 'Plată', color: 'bg-green-100 text-green-700' },
    { key: 'igi_work_permit_submitted', label: 'IGI Depus', color: 'bg-yellow-100 text-yellow-700' },
    { key: 'igi_work_permit_approved', label: 'IGI Aprobat', color: 'bg-emerald-100 text-emerald-700' },
    { key: 'visa_issued', label: 'Viză', color: 'bg-indigo-100 text-indigo-700' },
    { key: 'arrival_romania', label: 'Sosire', color: 'bg-pink-100 text-pink-700' },
    { key: 'completed', label: 'Finalizat', color: 'bg-gray-100 text-gray-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500">Vizualizare generală a platformei</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/candidates?status=pending_validation">
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {dashboardData?.profiles?.pending_candidates || 0} Candidați Noi
            </Button>
          </Link>
          <Link to="/admin/employers?status=pending_validation">
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {dashboardData?.profiles?.pending_employers || 0} Angajatori Noi
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <Link to={stat.href}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`p-3 ${stat.color} rounded-full`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Pending Validations Alert */}
      {((dashboardData?.profiles?.pending_candidates || 0) > 0 || 
        (dashboardData?.profiles?.pending_employers || 0) > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900">Profile în așteptare pentru validare</h3>
                <p className="text-sm text-yellow-700">
                  {dashboardData?.profiles?.pending_candidates || 0} candidați și{' '}
                  {dashboardData?.profiles?.pending_employers || 0} angajatori așteaptă validare.
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/admin/candidates?status=pending_validation">
                  <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                    Vezi Candidați
                  </Button>
                </Link>
                <Link to="/admin/employers?status=pending_validation">
                  <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                    Vezi Angajatori
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-navy-600" />
            Pipeline Proiecte
          </CardTitle>
          <CardDescription>
            Distribuția proiectelor pe etape de imigrare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {pipelineStages.map((stage) => (
              <div key={stage.key} className="text-center">
                <div className={`${stage.color} rounded-lg p-3 mb-2`}>
                  <p className="text-2xl font-bold">{stages[stage.key] || 0}</p>
                </div>
                <p className="text-xs text-gray-600">{stage.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/admin/projects">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-navy-50 rounded-lg">
                  <FolderKanban className="h-6 w-6 text-navy-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Gestionează Proiecte</h3>
                  <p className="text-sm text-gray-500">Vezi toate proiectele de recrutare</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/admin/jobs">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Cereri de Personal</h3>
                  <p className="text-sm text-gray-500">{dashboardData?.jobs?.open || 0} joburi deschise</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/admin/users">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Utilizatori</h3>
                  <p className="text-sm text-gray-500">Gestionează conturile</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
