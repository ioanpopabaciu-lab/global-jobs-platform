import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
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
  Search, Filter, Eye, CheckCircle, XCircle, Loader2, Building2,
  MapPin, Phone, Mail, Globe, FileText, Users, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  pending_validation: { label: 'În Așteptare', color: 'bg-yellow-100 text-yellow-700' },
  validated: { label: 'Validat', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Respins', color: 'bg-red-100 text-red-700' }
};

// Helper function to extract city from employer data
const getEmployerLocation = (employer) => {
  // First try the city field
  if (employer.city && employer.city.trim()) {
    return employer.city;
  }
  
  // Try to extract city from address (typically at the end after comma)
  if (employer.address) {
    const parts = employer.address.split(',');
    if (parts.length >= 2) {
      // Get the last part which usually contains the city
      const lastPart = parts[parts.length - 1].trim();
      // Remove any sector info like "Sector 1"
      if (!lastPart.toLowerCase().includes('sector') && !lastPart.toLowerCase().includes('str.') && !lastPart.toLowerCase().includes('nr.')) {
        return lastPart;
      }
      // If last part is sector, get the one before
      if (parts.length >= 3) {
        const secondLastPart = parts[parts.length - 2].trim();
        if (!secondLastPart.toLowerCase().includes('str.') && !secondLastPart.toLowerCase().includes('nr.')) {
          return secondLastPart;
        }
      }
    }
  }
  
  // Fallback to country code
  return employer.country || 'N/A';
};

export default function AdminEmployers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [employerDetail, setEmployerDetail] = useState(null);
  
  const [validationModal, setValidationModal] = useState({ open: false, action: null, employer: null });
  const [validationNotes, setValidationNotes] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchEmployers();
  }, [statusFilter]);

  const fetchEmployers = async () => {
    try {
      let url = `${API_URL}/api/admin/employers`;
      if (statusFilter && statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setEmployers(data.employers || []);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea angajatorilor');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerDetail = async (profileId) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/employers/${profileId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setEmployerDetail(data);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea detaliilor');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (employer) => {
    setSelectedEmployer(employer);
    fetchEmployerDetail(employer.profile_id);
  };

  const handleValidation = async () => {
    if (!validationModal.employer) return;
    
    setValidating(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/employers/${validationModal.employer.profile_id}/validate`,
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
            ? 'Angajator validat cu succes!' 
            : 'Angajator respins'
        );
        fetchEmployers();
        setValidationModal({ open: false, action: null, employer: null });
        setValidationNotes('');
        setSelectedEmployer(null);
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

  const filteredEmployers = employers.filter(e => {
    const searchLower = searchTerm.toLowerCase();
    return (
      e.company_name?.toLowerCase().includes(searchLower) ||
      e.company_cui?.toLowerCase().includes(searchLower) ||
      e.city?.toLowerCase().includes(searchLower) ||
      e.industry?.toLowerCase().includes(searchLower)
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
    <div className="space-y-6" data-testid="admin-employers-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gestionare Angajatori</h1>
          <p className="text-gray-500">Validează și gestionează profilurile companiilor</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {employers.length} angajatori
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută după nume, CUI, oraș, industrie..."
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
                <TableHead>Companie</TableHead>
                <TableHead>CUI</TableHead>
                <TableHead>Locație</TableHead>
                <TableHead>Industrie</TableHead>
                <TableHead>Angajați</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Niciun angajator găsit
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployers.map((employer) => {
                  const status = statusConfig[employer.status] || statusConfig.draft;
                  return (
                    <TableRow key={employer.profile_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{employer.company_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{employer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{employer.company_cui || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {employer.city || employer.country || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{employer.industry || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {employer.employees_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(employer)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalii
                          </Button>
                          {employer.status === 'pending_validation' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => setValidationModal({ 
                                  open: true, 
                                  action: 'validate', 
                                  employer 
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
                                  employer 
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
      <Dialog open={!!selectedEmployer} onOpenChange={() => setSelectedEmployer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalii Angajator</DialogTitle>
            <DialogDescription>
              Profil complet și documente încărcate
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : employerDetail ? (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Denumire companie</p>
                  <p className="font-medium">{employerDetail.employer?.company_name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">CUI</p>
                  <p className="font-medium font-mono">{employerDetail.employer?.company_cui || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nr. Reg. Comerț</p>
                  <p className="font-medium">{employerDetail.employer?.company_j_number || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Administrator</p>
                  <p className="font-medium">{employerDetail.employer?.administrator_name || 'N/A'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Adresă</p>
                  <p className="font-medium">{employerDetail.employer?.address || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{employerDetail.employer?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{employerDetail.employer?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Industrie</p>
                  <p className="font-medium">{employerDetail.employer?.industry || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nr. Angajați</p>
                  <p className="font-medium">{employerDetail.employer?.employees_count || 0}</p>
                </div>
              </div>

              {/* IGI Eligibility */}
              {employerDetail.employer?.country === 'RO' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Eligibilitate IGI</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {employerDetail.employer?.has_no_debts ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      Fără datorii fiscale
                    </div>
                    <div className="flex items-center gap-2">
                      {employerDetail.employer?.has_no_sanctions ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      Fără sancțiuni
                    </div>
                    <div className="flex items-center gap-2">
                      {employerDetail.employer?.has_min_employees ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      Min. 2 angajați
                    </div>
                    <div className="flex items-center gap-2">
                      {employerDetail.employer?.company_age_over_1_year ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      Vechime peste 1 an
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h4 className="font-medium mb-3">Documente încărcate ({employerDetail.documents?.length || 0})</h4>
                {employerDetail.documents?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {employerDetail.documents.map((doc) => (
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
              {employerDetail.employer?.status === 'pending_validation' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedEmployer(null);
                      setValidationModal({ 
                        open: true, 
                        action: 'validate', 
                        employer: employerDetail.employer 
                      });
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validează Compania
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedEmployer(null);
                      setValidationModal({ 
                        open: true, 
                        action: 'reject', 
                        employer: employerDetail.employer 
                      });
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Respinge Compania
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Validation Confirmation Modal */}
      <Dialog open={validationModal.open} onOpenChange={(open) => !open && setValidationModal({ open: false, action: null, employer: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationModal.action === 'validate' ? 'Validează Angajatorul' : 'Respinge Angajatorul'}
            </DialogTitle>
            <DialogDescription>
              {validationModal.action === 'validate' 
                ? 'Confirmați validarea companiei? Va putea crea cereri de personal.'
                : 'Confirmați respingerea companiei? Vă rugăm să adăugați un motiv.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Companie:</p>
              <p className="text-gray-600">{validationModal.employer?.company_name}</p>
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
            <Button variant="outline" onClick={() => setValidationModal({ open: false, action: null, employer: null })}>
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
