import { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Briefcase, Search, Filter, MoreVertical, Edit, Trash2, 
  Eye, Users, MapPin, Clock, CheckCircle, XCircle, Loader2,
  Building2, DollarSign, Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  open: { label: 'Deschis', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'În Progres', color: 'bg-blue-100 text-blue-700', icon: Users },
  filled: { label: 'Completat', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function JobRequestsList() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [profileValidated, setProfileValidated] = useState(false);

  useEffect(() => {
    fetchJobs();
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfileValidated(data.profile?.status === 'validated');
      }
    } catch (error) {
      console.error('Failed to check profile status:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/jobs`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Eroare la încărcarea joburilor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/jobs/${jobToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Job anulat cu succes');
        fetchJobs();
      } else {
        toast.error('Eroare la anularea jobului');
      }
    } catch (error) {
      toast.error('Eroare la anularea jobului');
    } finally {
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.cor_code?.includes(searchTerm) ||
    job.work_location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
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

  return (
    <div className="space-y-6" data-testid="job-requests-list">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Cereri de Personal</h1>
          <p className="text-gray-500">Gestionează pozițiile deschise pentru recrutare</p>
        </div>
        
        {profileValidated ? (
          <Button 
            onClick={() => navigate('/portal/employer/jobs/new')}
            className="bg-navy-600 hover:bg-navy-700"
            data-testid="btn-create-job"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Poziție Nouă
          </Button>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            ⚠️ Profilul companiei trebuie validat pentru a crea joburi
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Caută după titlu, cod COR sau locație..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="search-jobs"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {jobs.length === 0 ? 'Nicio poziție creată' : 'Niciun rezultat găsit'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {jobs.length === 0 
                ? 'Creați prima cerere de personal pentru a începe recrutarea'
                : 'Încercați alte criterii de căutare'}
            </p>
            {profileValidated && jobs.length === 0 && (
              <Button onClick={() => navigate('/portal/employer/jobs/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Creează Prima Poziție
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => {
            const status = statusConfig[job.status] || statusConfig.draft;
            const StatusIcon = status.icon;
            
            return (
              <Card 
                key={job.job_id} 
                className="hover:shadow-md transition-shadow"
                data-testid={`job-card-${job.job_id}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-navy-50 rounded-lg">
                          <Briefcase className="h-5 w-5 text-navy-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {job.title}
                            </h3>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                            {job.cor_code && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                COR: {job.cor_code}
                              </span>
                            )}
                            {job.work_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.work_location}
                              </span>
                            )}
                            {job.salary_gross && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.salary_gross}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {job.positions_count || 1} poziții
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Creat: {formatDate(job.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/portal/employer/jobs/${job.job_id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalii
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/portal/employer/jobs/${job.job_id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editează
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setJobToDelete(job.job_id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Anulează
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anulați această poziție?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va marca jobul ca anulat. Candidații potriviți nu vor mai fi notificați pentru această poziție.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nu, păstrează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Da, anulează
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
