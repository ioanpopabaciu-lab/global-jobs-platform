import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Loader2,
  CreditCard, Calendar, MapPin, User, Hash, Building, Clock,
  Sparkles, Eye, RefreshCw, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Document type labels
const DOCUMENT_TYPES = {
  administrator_id: {
    label: "Cartea de Identitate Administrator",
    description: "CI-ul administratorului companiei (față)",
    subtext: "Datele vor fi completate automat",
    ocr: true,
    validity: null,
    icon: CreditCard
  },
  cazier_judiciar: {
    label: "Cazier Judiciar Firmă",
    description: "Cazierul judiciar al societății",
    subtext: "Valabil 30 zile de la data eliberării",
    ocr: true,
    validity: 30,
    icon: FileText
  },
  certificat_constatator: {
    label: "Certificat Constatator",
    description: "Certificat constatator de la Registrul Comerțului",
    subtext: "Valabil 30 zile pentru procedura IGI",
    ocr: true,
    validity: 30,
    icon: FileText
  },
  cui_certificate: {
    label: "Certificat de Înregistrare CUI",
    description: "Certificatul de înregistrare fiscală",
    subtext: "Document permanent",
    ocr: false,
    validity: null,
    icon: FileText
  }
};

// Status badge component
const ExpiryBadge = ({ status }) => {
  if (!status) return null;
  
  const colorClasses = {
    green: "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red: "bg-red-100 text-red-700 border-red-200",
    black: "bg-gray-900 text-white border-gray-900",
    gray: "bg-gray-100 text-gray-600 border-gray-200"
  };
  
  return (
    <Badge className={`${colorClasses[status.color] || colorClasses.gray} border`}>
      {status.icon} {status.message}
    </Badge>
  );
};

export default function EmployerDocumentsUpload({ onComplete, initialData = {} }) {
  // Document states
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState({});
  const [ocrResults, setOcrResults] = useState({});
  const [expiryStatuses, setExpiryStatuses] = useState({});
  
  // ID card OCR extracted data
  const [idCardData, setIdCardData] = useState(null);
  const [showIdCardConfirm, setShowIdCardConfirm] = useState(false);
  const [idCardEditing, setIdCardEditing] = useState(false);
  
  // Replace confirmation dialog
  const [replaceDialog, setReplaceDialog] = useState({
    open: false,
    documentType: null,
    existingDoc: null,
    pendingFile: null
  });

  // Handle file upload with OCR
  const handleFileUpload = useCallback(async (documentType, file, replaceExisting = false) => {
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipuri acceptate: PDF, JPG, PNG, WEBP');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dimensiune maximă: 10MB');
      return;
    }
    
    setUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('apply_ocr', DOCUMENT_TYPES[documentType]?.ocr ? 'true' : 'false');
      formData.append('replace_existing', replaceExisting ? 'true' : 'false');
      
      const response = await fetch(`${API_URL}/api/portal/employer/documents/upload-with-ocr`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if existing document needs confirmation
        if (data.exists) {
          setReplaceDialog({
            open: true,
            documentType,
            existingDoc: data.existing_document,
            pendingFile: file
          });
          return;
        }
        
        // Success - update states
        setDocuments(prev => ({
          ...prev,
          [documentType]: data.document
        }));
        
        if (data.ocr_result?.success) {
          setOcrResults(prev => ({
            ...prev,
            [documentType]: data.ocr_result.data
          }));
          
          // Special handling for ID card
          if (documentType === 'administrator_id' && data.ocr_result.data) {
            setIdCardData(data.ocr_result.data);
            setShowIdCardConfirm(true);
          }
        }
        
        if (data.expiry_status) {
          setExpiryStatuses(prev => ({
            ...prev,
            [documentType]: data.expiry_status
          }));
        }
        
        toast.success('Document încărcat cu succes!');
        
      } else {
        toast.error(data.detail || 'Eroare la încărcare');
      }
    } catch (error) {
      toast.error('Eroare la încărcarea documentului');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  }, []);

  // Handle replace confirmation
  const handleReplaceConfirm = async () => {
    if (!replaceDialog.pendingFile || !replaceDialog.documentType) return;
    
    setReplaceDialog(prev => ({ ...prev, open: false }));
    await handleFileUpload(replaceDialog.documentType, replaceDialog.pendingFile, true);
    setReplaceDialog({ open: false, documentType: null, existingDoc: null, pendingFile: null });
  };

  // Confirm ID card data
  const handleIdCardConfirm = () => {
    setShowIdCardConfirm(false);
    toast.success('Date administrator confirmate!');
    // Pass data to parent if needed
    if (onComplete && idCardData) {
      onComplete({ administratorData: idCardData });
    }
  };

  // Render upload zone for a document type
  const renderUploadZone = (docType) => {
    const config = DOCUMENT_TYPES[docType];
    if (!config) return null;
    
    const Icon = config.icon;
    const isUploading = uploading[docType];
    const uploadedDoc = documents[docType];
    const expiryStatus = expiryStatuses[docType];
    
    return (
      <Card key={docType} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">{config.label}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            {config.ocr && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                Completare automată AI
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">{config.subtext}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!uploadedDoc ? (
            // Upload zone
            <label className={`
              relative flex flex-col items-center justify-center p-8 
              border-2 border-dashed rounded-lg cursor-pointer transition-colors
              ${isUploading ? 'border-blue-300 bg-blue-50' : 'border-blue-300 hover:bg-blue-50'}
            `}>
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-sm text-blue-600">Se încarcă și se procesează...</p>
                  {config.ocr && (
                    <p className="text-xs text-blue-500 mt-1">Extragere date automată în curs</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Trageți fișierul aici sau click pentru a selecta
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Acceptăm: JPG, PNG, PDF — max 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileUpload(docType, e.target.files?.[0])}
                disabled={isUploading}
              />
            </label>
          ) : (
            // Uploaded document display
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{uploadedDoc.original_filename}</p>
                    <p className="text-xs text-green-600">
                      Încărcat la {new Date(uploadedDoc.created_at).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`${API_URL}/api/portal/documents/${uploadedDoc.doc_id}/download`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocuments(prev => {
                        const newDocs = { ...prev };
                        delete newDocs[docType];
                        return newDocs;
                      });
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Expiry status */}
              {expiryStatus && (
                <div className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${expiryStatus.color === 'green' ? 'bg-green-50 border-green-200' :
                    expiryStatus.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    expiryStatus.color === 'red' || expiryStatus.color === 'orange' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'}
                `}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Valabil până la: <strong>{expiryStatus.expiry_date}</strong>
                    </span>
                  </div>
                  <ExpiryBadge status={expiryStatus} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <FileText className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Documente Companie</h2>
          <p className="text-gray-500">Încărcați documentele necesare pentru înregistrare</p>
        </div>
      </div>
      
      {/* ID Card Upload - Special */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Cartea de Identitate Administrator</CardTitle>
                <CardDescription>Încarcă CI-ul administratorului companiei (față)</CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Completare automată AI
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Datele vor fi completate automat din cartea de identitate
          </p>
        </CardHeader>
        
        <CardContent>
          {!documents.administrator_id ? (
            <label className={`
              relative flex flex-col items-center justify-center p-10
              border-2 border-dashed rounded-lg cursor-pointer transition-all
              ${uploading.administrator_id ? 'border-blue-400 bg-blue-100' : 'border-blue-400 hover:bg-blue-100'}
            `}>
              {uploading.administrator_id ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-blue-700 mt-3">
                    Se procesează cu AI...
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Extragere date din CI în curs
                  </p>
                  <Progress value={66} className="w-48 mt-3" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <CreditCard className="h-12 w-12 text-blue-500 mb-3" />
                  <p className="text-base font-medium text-gray-700">
                    Încarcă CI-ul administratorului
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Acceptăm: JPG, PNG, PDF — max 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileUpload('administrator_id', e.target.files?.[0])}
                disabled={uploading.administrator_id}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* Uploaded file indicator */}
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {documents.administrator_id.original_filename}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDocuments(prev => {
                    const newDocs = { ...prev };
                    delete newDocs.administrator_id;
                    return newDocs;
                  })}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Expiry status */}
              {expiryStatuses.administrator_id && (
                <div className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${expiryStatuses.administrator_id.color === 'green' ? 'bg-green-50 border-green-200' :
                    expiryStatuses.administrator_id.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'}
                `}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>CI valabil până la: <strong>{expiryStatuses.administrator_id.expiry_date}</strong></span>
                  </div>
                  <ExpiryBadge status={expiryStatuses.administrator_id} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Other documents */}
      <div className="grid gap-4">
        {renderUploadZone('cazier_judiciar')}
        {renderUploadZone('certificat_constatator')}
        {renderUploadZone('cui_certificate')}
      </div>
      
      {/* ID Card Data Confirmation Dialog */}
      <Dialog open={showIdCardConfirm} onOpenChange={setShowIdCardConfirm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Date extrase automat din CI
            </DialogTitle>
            <DialogDescription>
              Verificați datele extrase din cartea de identitate
            </DialogDescription>
          </DialogHeader>
          
          {idCardData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">Nume Administrator</Label>
                  </div>
                  <p className="font-medium">{idCardData.nume || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">Prenume Administrator</Label>
                  </div>
                  <p className="font-medium">{idCardData.prenume || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">CNP Administrator</Label>
                  </div>
                  <p className="font-medium font-mono">{idCardData.cnp || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">Data Nașterii</Label>
                  </div>
                  <p className="font-medium">{idCardData.data_nasterii || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">Adresa Administrator</Label>
                  </div>
                  <p className="font-medium">{idCardData.adresa || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">CI Serie și Număr</Label>
                  </div>
                  <p className="font-medium font-mono">
                    {idCardData.serie_ci} {idCardData.numar_ci}
                  </p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">CI Emis de</Label>
                  </div>
                  <p className="font-medium">{idCardData.emitent || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">CI Valabil până la</Label>
                  </div>
                  <p className="font-medium">{idCardData.data_expirare || 'N/A'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-gray-500">Cetățenie</Label>
                  </div>
                  <p className="font-medium">{idCardData.cetatenie || 'ROMÂNĂ'}</p>
                  <p className="text-xs text-green-600">Completat automat din CI</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIdCardEditing(true);
                setShowIdCardConfirm(false);
              }}
            >
              Modifică manual
            </Button>
            <Button
              onClick={handleIdCardConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Datele sunt corecte ✓
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Replace confirmation dialog */}
      <Dialog open={replaceDialog.open} onOpenChange={(open) => !open && setReplaceDialog({ open: false, documentType: null, existingDoc: null, pendingFile: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-500" />
              Înlocuire Document
            </DialogTitle>
            <DialogDescription>
              Ai deja un document de acest tip încărcat.
            </DialogDescription>
          </DialogHeader>
          
          {replaceDialog.existingDoc && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Document existent:</p>
              <p className="text-sm text-gray-600">{replaceDialog.existingDoc.original_filename}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Dacă înlocuiești, documentul vechi va fi arhivat.
          </p>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplaceDialog({ open: false, documentType: null, existingDoc: null, pendingFile: null })}
            >
              Nu, păstrează
            </Button>
            <Button
              onClick={handleReplaceConfirm}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Da, înlocuiește
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
