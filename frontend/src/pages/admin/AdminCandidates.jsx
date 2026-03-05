import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Search, Filter, Eye, CheckCircle, XCircle, Loader2, User,
  MapPin, Briefcase, Calendar, FileText, Globe, Phone
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  pending_validation: { label: 'În Așteptare', color: 'bg-yellow-100 text-yellow-700' },
  validated: { label: 'Validat', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Respins', color: 'bg-red-100 text-red-700' }
};

export default function AdminCandidates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  
  // Detail modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [candidateDetail, setCandidateDetail] = useState(null);
  
  // Validation modal
  const [validationModal, setValidationModal] = useState({ open: false, action: null, candidate: null });
  const [validationNotes, setValidationNotes] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter]);

  const fetchCandidates = async () => {
    try {
      let url = `${API_URL}/api/admin/candidates`;
      if (statusFilter && statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea candidaților');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateDetail = async (profileId) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/candidates/${profileId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCandidateDetail(data);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea detaliilor');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (candidate) => {
    setSelectedCandidate(candidate);
    fetchCandidateDetail(candidate.profile_id);
  };

  const handleValidation = async () => {
    if (!validationModal.candidate) return;
    
    setValidating(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/candidates/${validationModal.candidate.profile_id}/validate`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: validationModal.action,
            notes: validationNotes
          })
        }
      );

      if (response.ok) {
        toast.success(
          validationModal.action === 'validate' 
            ? 'Candidat validat cu succes!' 
            : 'Candidat respins'
        );
        fetchCandidates();
        setValidationModal({ open: false, action: null, candidate: null });
        setValidationNotes('');
        setSelectedCandidate(null);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la validare');
      }
    } catch (error) {
      toast.error('Eroare la procesare');
    } finally {
      setValidating(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.first_name?.toLowerCase().includes(searchLower) ||
      c.last_name?.toLowerCase().includes(searchLower) ||
      c.citizenship?.toLowerCase().includes(searchLower) ||
      c.current_profession?.toLowerCase().includes(searchLower)
    );
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
    <div className="space-y-6" data-testid="admin-candidates-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gestionare Candidați</h1>
          <p className="text-gray-500">Validează și gestionează profilurile candidaților</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {candidates.length} candidați
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută după nume, naționalitate, profesie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v);
              setSearchParams(v !== 'all' ? { status: v } : {});
            }}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrează status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="pending_validation">În Așteptare</SelectItem>
                <SelectItem value="validated">Validate</SelectItem>
                <SelectItem value="rejected">Respinse</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
                <TableHead>Candidat</TableHead>
                <TableHead>Naționalitate</TableHead>
                <TableHead>Profesie</TableHead>
                <TableHead>Experiență</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Niciun candidat găsit
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => {
                  const status = statusConfig[candidate.status] || statusConfig.draft;
                  return (
                    <TableRow key={candidate.profile_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-navy-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {candidate.first_name} {candidate.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{candidate.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4 text-gray-400" />
                          {candidate.citizenship || candidate.country_of_origin || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.current_profession || 'N/A'}</TableCell>
                      <TableCell>{candidate.experience_years || 0} ani</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(candidate.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(candidate)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalii
                          </Button>
                          {candidate.status === 'pending_validation' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => setValidationModal({ 
                                  open: true, 
                                  action: 'validate', 
                                  candidate 
                                })}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setValidationModal({ 
                                  open: true, 
                                  action: 'reject', 
                                  candidate 
                                })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalii Candidat</DialogTitle>
            <DialogDescription>
              Profil complet și documente încărcate
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : candidateDetail ? (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nume complet</p>
                  <p className="font-medium">
                    {candidateDetail.candidate?.first_name} {candidateDetail.candidate?.last_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Cetățenie</p>
                  <p className="font-medium">{candidateDetail.candidate?.citizenship || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Data nașterii</p>
                  <p className="font-medium">{candidateDetail.candidate?.date_of_birth || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{candidateDetail.candidate?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Profesie</p>
                  <p className="font-medium">{candidateDetail.candidate?.current_profession || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Experiență</p>
                  <p className="font-medium">{candidateDetail.candidate?.experience_years || 0} ani</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nivel engleză</p>
                  <p className="font-medium">{candidateDetail.candidate?.english_level || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Țări în care a lucrat</p>
                  <p className="font-medium">
                    {candidateDetail.candidate?.countries_worked_in?.join(', ') || 'Niciuna'}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-medium mb-3">Documente încărcate ({candidateDetail.documents?.length || 0})</h4>
                {candidateDetail.documents?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {candidateDetail.documents.map((doc) => (
                      <div key={doc.doc_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.original_filename}</p>
                          <p className="text-xs text-gray-500">{doc.document_type}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`${API_URL}/api/portal/documents/${doc.doc_id}/download`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Niciun document încărcat</p>
                )}
              </div>

              {/* Validation Actions */}
              {candidateDetail.candidate?.status === 'pending_validation' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setValidationModal({ 
                        open: true, 
                        action: 'validate', 
                        candidate: candidateDetail.candidate 
                      });
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validează Profilul
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedCandidate(null);
                      setValidationModal({ 
                        open: true, 
                        action: 'reject', 
                        candidate: candidateDetail.candidate 
                      });
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Respinge Profilul
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Validation Confirmation Modal */}
      <Dialog open={validationModal.open} onOpenChange={(open) => !open && setValidationModal({ open: false, action: null, candidate: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationModal.action === 'validate' ? 'Validează Candidatul' : 'Respinge Candidatul'}
            </DialogTitle>
            <DialogDescription>
              {validationModal.action === 'validate' 
                ? 'Confirmați validarea profilului? Candidatul va fi notificat și va putea fi potrivit cu joburi.'
                : 'Confirmați respingerea profilului? Vă rugăm să adăugați un motiv.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Candidat:</p>
              <p className="text-gray-600">
                {validationModal.candidate?.first_name} {validationModal.candidate?.last_name}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">
                {validationModal.action === 'validate' ? 'Note (opțional):' : 'Motiv respingere:'}
              </p>
              <Textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                placeholder={validationModal.action === 'validate' 
                  ? 'Adăugați note opționale...' 
                  : 'Explicați motivul respingerii...'}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationModal({ open: false, action: null, candidate: null })}>
              Anulează
            </Button>
            <Button
              onClick={handleValidation}
              disabled={validating || (validationModal.action === 'reject' && !validationNotes)}
              className={validationModal.action === 'validate' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={validationModal.action === 'reject' ? 'destructive' : 'default'}
            >
              {validating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {validationModal.action === 'validate' ? 'Validează' : 'Respinge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
