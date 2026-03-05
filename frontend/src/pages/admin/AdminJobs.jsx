import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, Filter, Eye, Loader2, Briefcase, MapPin, Users,
  DollarSign, Building2, Calendar, CheckCircle, Clock, XCircle,
  Play, Pause, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  open: { label: 'Deschis', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'În Progres', color: 'bg-blue-100 text-blue-700', icon: Play },
  filled: { label: 'Completat', color: 'bg-purple-100 text-purple-700', icon: UserCheck },
  cancelled: { label: 'Anulat', color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/jobs`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea joburilor');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingCandidates = async (jobId) => {
    setMatchingLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/matching/candidates/${jobId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMatchingCandidates(data.matches || []);
      }
    } catch (error) {
      toast.error('Eroare la căutarea candidaților');
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Status actualizat!');
        fetchJobs();
      } else {
        toast.error('Eroare la actualizare');
      }
    } catch (error) {
      toast.error('Eroare la actualizare');
    }
  };

  const handleViewMatching = (job) => {
    setSelectedJob(job);
    fetchMatchingCandidates(job.job_id);
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      job.title?.toLowerCase().includes(searchLower) ||
      job.cor_code?.includes(searchLower) ||
      job.work_location?.toLowerCase().includes(searchLower) ||
      job.industry?.toLowerCase().includes(searchLower)
    );
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6" data-testid="admin-jobs-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gestionare Joburi</h1>
          <p className="text-gray-500">Vizualizează și gestionează cererile de personal</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {jobs.filter(j => j.status === 'open').length} deschise
          </Badge>
          <Badge variant="outline" className="text-sm">
            {jobs.length} total
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = jobs.filter(j => j.status === key).length;
          const Icon = config.icon;
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === key ? 'ring-2 ring-navy-500' : ''}`}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-gray-500">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută după titlu, cod COR, locație..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrează status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="open">Deschis</SelectItem>
                <SelectItem value="in_progress">În Progres</SelectItem>
                <SelectItem value="filled">Completat</SelectItem>
                <SelectItem value="cancelled">Anulat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Poziție</TableHead>
                <TableHead>Angajator</TableHead>
                <TableHead>Locație</TableHead>
                <TableHead>Poziții</TableHead>
                <TableHead>Salariu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Niciun job găsit
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => {
                  const status = statusConfig[job.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={job.job_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-500">COR: {job.cor_code || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm truncate max-w-[150px]">
                            {job.employer_name || job.employer_id?.slice(0, 12)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {job.work_location || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {job.positions_count || 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {job.salary_gross || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(job.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMatching(job)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Matching
                          </Button>
                          <Select
                            value={job.status}
                            onValueChange={(v) => handleStatusChange(job.job_id, v)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="open">Deschis</SelectItem>
                              <SelectItem value="in_progress">În Progres</SelectItem>
                              <SelectItem value="filled">Completat</SelectItem>
                              <SelectItem value="cancelled">Anulat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Matching Candidates Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidați Potriviți</DialogTitle>
            <DialogDescription>
              Candidați care corespund cerințelor pentru "{selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {matchingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : matchingCandidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Niciun candidat potrivit găsit</p>
              <p className="text-sm">Verificați dacă există candidați validați cu profiluri complete</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingCandidates.map((match) => (
                <Card key={match.candidate.profile_id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-navy-600">
                            {match.score}%
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {match.candidate.first_name} {match.candidate.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {match.candidate.current_profession} • {match.candidate.experience_years} ani exp.
                          </p>
                          <p className="text-xs text-gray-400">
                            {match.candidate.citizenship}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={
                            match.score >= 80 ? 'bg-green-100 text-green-700' :
                            match.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {match.score >= 80 ? 'Excelent' : match.score >= 60 ? 'Bun' : 'Potrivit'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
