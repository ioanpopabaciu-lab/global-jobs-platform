import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, ArrowLeft, Edit, Briefcase, Users, MapPin, 
  DollarSign, Calendar, CheckCircle, Clock, XCircle,
  Building2, Languages, Home, UtensilsCrossed, Car, User
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  open: { label: 'Deschis', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'În Progres', color: 'bg-blue-100 text-blue-700', icon: Users },
  filled: { label: 'Completat', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function JobRequestDetail() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { jobId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/jobs/${jobId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
        setProjects(data.projects || []);
      } else {
        toast.error('Job negăsit');
        navigate('/portal/employer/jobs');
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Eroare la încărcarea jobului');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  if (!job) return null;

  const status = statusConfig[job.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6" data-testid="job-detail">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/portal/employer/jobs')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                {job.title}
              </h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {job.cor_code && `COR: ${job.cor_code} • `}
              {job.positions_count || 1} poziții • Creat {formatDate(job.created_at)}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate(`/portal/employer/jobs/${jobId}/edit`)}
          variant="outline"
        >
          <Edit className="mr-2 h-4 w-4" />
          Editează
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-navy-600" />
                Detalii Poziție
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.description && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Descriere</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Domeniu</p>
                    <p className="font-medium">{job.industry || 'Nespecificat'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Locație</p>
                    <p className="font-medium">{job.work_location || 'Nespecificat'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salariu</p>
                    <p className="font-medium">{job.salary_gross || 'Nespecificat'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tip Contract</p>
                    <p className="font-medium capitalize">{job.contract_type || 'Permanent'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-navy-600" />
                Cerințe Candidat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Experiență</p>
                  <p className="font-medium">{job.required_experience_years || 0} ani</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gen Preferat</p>
                  <p className="font-medium capitalize">
                    {job.preferred_gender === 'any' ? 'Indiferent' : 
                     job.preferred_gender === 'male' ? 'Masculin' : 'Feminin'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nivel Engleză</p>
                  <p className="font-medium capitalize">{job.required_english_level || 'Nu este necesar'}</p>
                </div>
                {(job.age_range_min || job.age_range_max) && (
                  <div>
                    <p className="text-sm text-gray-500">Interval Vârstă</p>
                    <p className="font-medium">
                      {job.age_range_min || '18'} - {job.age_range_max || '65'} ani
                    </p>
                  </div>
                )}
              </div>
              
              {job.preferred_nationalities?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Naționalități Preferate</p>
                  <div className="flex flex-wrap gap-2">
                    {job.preferred_nationalities.map(nat => (
                      <Badge key={nat} variant="outline">{nat}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {job.required_languages?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Limbi Necesare</p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_languages.map(lang => (
                      <Badge key={lang} variant="outline">
                        <Languages className="h-3 w-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matched Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-navy-600" />
                Candidați Potriviți ({projects.length})
              </CardTitle>
              <CardDescription>
                Candidații care au fost asociați cu această poziție
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Niciun candidat potrivit încă.</p>
                  <p className="text-sm">Agenția GJC va asocia candidații potriviți în curând.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map(project => (
                    <div 
                      key={project.project_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-navy-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {project.candidate?.first_name} {project.candidate?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {project.candidate?.citizenship} • {project.candidate?.current_profession}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        {project.current_stage || 'În proces'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Beneficii Oferite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${job.accommodation_provided ? 'bg-green-50' : 'bg-gray-50'}`}>
                <Home className={`h-5 w-5 ${job.accommodation_provided ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${job.accommodation_provided ? 'text-green-700' : 'text-gray-500'}`}>
                    Cazare
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.accommodation_provided ? 'Asigurată' : 'Nu este oferită'}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${job.meals_provided ? 'bg-green-50' : 'bg-gray-50'}`}>
                <UtensilsCrossed className={`h-5 w-5 ${job.meals_provided ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${job.meals_provided ? 'text-green-700' : 'text-gray-500'}`}>
                    Masă
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.meals_provided ? 'Asigurată' : 'Nu este oferită'}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${job.transport_provided ? 'bg-green-50' : 'bg-gray-50'}`}>
                <Car className={`h-5 w-5 ${job.transport_provided ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${job.transport_provided ? 'text-green-700' : 'text-gray-500'}`}>
                    Transport
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.transport_provided ? 'Asigurat' : 'Nu este oferit'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Poziții totale</span>
                <span className="font-bold text-lg">{job.positions_count || 1}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Candidați asociați</span>
                <span className="font-bold text-lg">{projects.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Poziții rămase</span>
                <span className="font-bold text-lg text-green-600">
                  {Math.max(0, (job.positions_count || 1) - projects.length)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
