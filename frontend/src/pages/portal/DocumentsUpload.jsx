import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Upload, FileText, Trash2, Eye, CheckCircle, Clock, 
  AlertCircle, Loader2, X, File, Image, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const documentTypes = [
  { type: 'passport', label: 'Passport', required: true, description: 'Clear copy of your passport (all pages)' },
  { type: 'cv', label: 'CV / Resume', required: true, description: 'Your updated CV in PDF format' },
  { type: 'diploma', label: 'Diploma / Certificate', required: false, description: 'Education certificates and diplomas' },
  { type: 'criminal_record', label: 'Criminal Record', required: true, description: 'Police clearance certificate from your country' },
  { type: 'medical_certificate', label: 'Medical Certificate', required: false, description: 'Recent medical fitness certificate' },
  { type: 'other', label: 'Other Documents', required: false, description: 'Any other relevant documents' }
];

const statusColors = {
  uploaded: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-yellow-100 text-yellow-700'
};

const statusIcons = {
  uploaded: Clock,
  verified: CheckCircle,
  rejected: AlertCircle,
  expired: AlertCircle
};

// Document type labels in Romanian
const documentTypeLabels = {
  passport: 'Pașaport',
  cv: 'CV',
  diploma: 'Diplomă',
  criminal_record: 'Cazier judiciar',
  medical_certificate: 'Certificat medical',
  passport_photo: 'Foto pașaport',
  profile_photo: 'Foto profil',
  video_presentation: 'Video prezentare',
  other: 'Alte documente'
};

export default function DocumentsUpload({ ownerType = 'candidate' }) {
  const { user } = useOutletContext();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [dragOver, setDragOver] = useState(null);
  
  // State for replace confirmation dialog
  const [replaceDialog, setReplaceDialog] = useState({
    open: false,
    documentType: null,
    existingDoc: null,
    pendingFile: null
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/${ownerType}/documents`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (documentType, files, replaceExisting = false) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }
    
    setUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('owner_type', ownerType);
      formData.append('replace_existing', replaceExisting ? 'true' : 'false');
      
      const response = await fetch(`${API_URL}/api/portal/${ownerType}/documents/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if backend is asking for confirmation
        if (data.exists && data.existing_document) {
          // Show confirmation dialog
          setReplaceDialog({
            open: true,
            documentType: documentType,
            existingDoc: data.existing_document,
            pendingFile: file
          });
        } else {
          toast.success('Documentul a fost încărcat cu succes!');
          fetchDocuments();
        }
      } else {
        toast.error(data.detail || 'Eroare la încărcarea documentului');
      }
    } catch (error) {
      toast.error('Eroare la încărcarea documentului');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };
  
  // Handle replace confirmation
  const handleReplaceConfirm = async () => {
    if (!replaceDialog.pendingFile || !replaceDialog.documentType) return;
    
    setReplaceDialog(prev => ({ ...prev, open: false }));
    
    // Upload with replace flag
    await handleFileSelect(replaceDialog.documentType, [replaceDialog.pendingFile], true);
    
    // Reset dialog state
    setReplaceDialog({
      open: false,
      documentType: null,
      existingDoc: null,
      pendingFile: null
    });
  };
  
  // Handle replace cancel
  const handleReplaceCancel = () => {
    setReplaceDialog({
      open: false,
      documentType: null,
      existingDoc: null,
      pendingFile: null
    });
    toast.info('Documentul existent a fost păstrat');
  };

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/portal/${ownerType}/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Document deleted');
        fetchDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    handleFileSelect(type, files);
  };

  const getDocumentsByType = (type) => {
    return documents.filter(d => d.document_type === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500">Upload your required documents for verification</p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Accepted formats:</strong> PDF, JPG, PNG (max 10MB per file)
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {documentTypes.map((docType) => {
          const existingDocs = getDocumentsByType(docType.type);
          const isUploading = uploading[docType.type];
          
          return (
            <Card 
              key={docType.type}
              className={`transition-all ${dragOver === docType.type ? 'border-navy-500 bg-navy-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, docType.type)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, docType.type)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {docType.label}
                      {docType.required && <span className="text-red-500 text-sm">*</span>}
                    </CardTitle>
                    <CardDescription className="text-sm">{docType.description}</CardDescription>
                  </div>
                  {existingDocs.length > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">{existingDocs.length} uploaded</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Existing documents */}
                {existingDocs.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {existingDocs.map((doc) => {
                      const StatusIcon = statusIcons[doc.status] || Clock;
                      return (
                        <div 
                          key={doc.doc_id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {doc.file_type?.includes('image') ? (
                              <Image className="h-5 w-5 text-gray-400" />
                            ) : (
                              <File className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {doc.original_filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(doc.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[doc.status]}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {doc.status}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(doc.doc_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload area */}
                <div className="relative">
                  <input
                    type="file"
                    id={`file-${docType.type}`}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => handleFileSelect(docType.type, e.target.files)}
                    disabled={isUploading}
                  />
                  <div className={`
                    border-2 border-dashed rounded-lg p-4 text-center transition-colors
                    ${dragOver === docType.type ? 'border-navy-500 bg-navy-50' : 'border-gray-200 hover:border-gray-300'}
                    ${isUploading ? 'opacity-50' : ''}
                  `}>
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-navy-600" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-navy-600">Click to upload</span> or drag and drop
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Rejection note */}
                {existingDocs.some(d => d.status === 'rejected' && d.verification_notes) && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {existingDocs.find(d => d.status === 'rejected')?.verification_notes}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Documents Summary</p>
              <p className="text-sm text-gray-500">
                {documents.length} document(s) uploaded, {documents.filter(d => d.status === 'verified').length} verified
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Required documents</p>
              <p className="font-medium">
                {documentTypes.filter(dt => dt.required && getDocumentsByType(dt.type).length > 0).length} / {documentTypes.filter(dt => dt.required).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
