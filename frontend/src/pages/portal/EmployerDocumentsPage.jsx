import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, CheckCircle2, AlertTriangle, XCircle, Clock,
  Calendar, Eye, Upload, RefreshCw, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Document type labels
const DOC_TYPE_LABELS = {
  administrator_id: "CI Administrator",
  cazier_judiciar: "Cazier Judiciar",
  certificat_constatator: "Certificat Constatator",
  cui_certificate: "Certificat CUI",
  certificat_fiscal: "Certificat Fiscal",
  company_criminal_record: "Cazier Firmă",
  other: "Alt Document"
};

// Status config
const STATUS_CONFIG = {
  valid: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100" },
  urgent: { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-100" },
  critical: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  expired: { icon: XCircle, color: "text-gray-900", bg: "bg-gray-900 text-white" },
  expires_today: { icon: XCircle, color: "text-gray-900", bg: "bg-gray-900 text-white" }
};

export default function EmployerDocumentsPage() {
  const { user } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({ valid: 0, warning: 0, urgent: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [expiringSoon, setExpiringSoon] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/documents/expiring?days=60`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setSummary(data.summary || { valid: 0, warning: 0, urgent: 0, expired: 0 });
        setExpiringSoon(data.expiring_soon || []);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea documentelor');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const config = STATUS_CONFIG[status.status] || STATUS_CONFIG.valid;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.bg} ${status.status === 'expired' || status.status === 'expires_today' ? '' : config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.message}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="employer-documents-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Documentele Mele</h1>
          <p className="text-gray-500">Gestionează documentele companiei și verifică valabilitatea</p>
        </div>
        <Button onClick={() => window.location.href = '/portal/employer/profile'}>
          <Upload className="h-4 w-4 mr-2" />
          Încarcă Document Nou
        </Button>
      </div>

      {/* Alerts for expiring documents */}
      {summary.expired > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Documente expirate!</AlertTitle>
          <AlertDescription>
            Aveți {summary.expired} document(e) expirat(e). Contul poate fi suspendat. 
            Vă rugăm să reînnoiți documentele urgent.
          </AlertDescription>
        </Alert>
      )}

      {summary.urgent > 0 && summary.expired === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Atenție!</AlertTitle>
          <AlertDescription className="text-orange-700">
            Aveți {summary.urgent} document(e) care expiră în curând (sub 14 zile).
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{summary.valid}</p>
                <p className="text-sm text-gray-500">Documente valide</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{summary.warning}</p>
                <p className="text-sm text-gray-500">Expiră curând</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{summary.urgent}</p>
                <p className="text-sm text-gray-500">Urgente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{summary.expired}</p>
                <p className="text-sm text-gray-500">Expirate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toate Documentele</CardTitle>
          <CardDescription>Lista completă a documentelor companiei cu status de valabilitate</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tip Document</TableHead>
                <TableHead>Serie/Număr</TableHead>
                <TableHead>Data Încărcare</TableHead>
                <TableHead>Data Expirării</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zile Rămase</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Niciun document încărcat</p>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => {
                  const expiryStatus = doc.expiry_status;
                  const daysRemaining = expiryStatus?.days_remaining;
                  
                  return (
                    <TableRow key={doc.doc_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {doc.document_number || doc.ocr_data?.serie_ci && doc.ocr_data?.numar_ci 
                          ? `${doc.ocr_data.serie_ci} ${doc.ocr_data.numar_ci}` 
                          : '-'}
                      </TableCell>
                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell>
                        {doc.expiry_date || expiryStatus?.expiry_date 
                          ? formatDate(doc.expiry_date || expiryStatus?.expiry_date)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {expiryStatus ? getStatusBadge(expiryStatus) : (
                          <Badge variant="outline">Permanent</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {daysRemaining !== null && daysRemaining !== undefined ? (
                          <span className={`font-medium ${
                            daysRemaining <= 0 ? 'text-red-600' :
                            daysRemaining <= 7 ? 'text-orange-600' :
                            daysRemaining <= 14 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {daysRemaining <= 0 ? 'Expirat' : `${daysRemaining} zile`}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`${API_URL}/api/portal/documents/${doc.doc_id}/download`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {daysRemaining !== null && daysRemaining <= 30 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-amber-600 border-amber-300 hover:bg-amber-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reînnoiește
                            </Button>
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
    </div>
  );
}
