"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DocumentUploader from "@/components/candidate/DocumentUploader";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Plus,
  RefreshCw,
} from "lucide-react";

const API_URL = "/api";

interface Document {
  doc_id: string;
  document_type: string;
  original_filename: string;
  file_size: number;
  created_at: string;
  status: string;
  expiry_date?: string;
  expiry_status?: {
    status: string;
    days_remaining: number;
    message: string;
  };
}

const DOCUMENT_TYPES = [
  { type: "passport", title: "Pașaport", required: true, enableOCR: true },
  { type: "passport_photo", title: "Fotografie tip Pașaport", required: true, enableOCR: false },
  { type: "cv", title: "CV / Curriculum Vitae", required: true, enableOCR: false },
  { type: "criminal_record", title: "Cazier Judiciar", required: false, enableOCR: false },
  { type: "medical_certificate", title: "Certificat Medical", required: false, enableOCR: false },
  { type: "diploma", title: "Diplomă / Certificat Studii", required: false, enableOCR: false },
  { type: "video_presentation", title: "Video de Prezentare", required: false, enableOCR: false },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "În așteptare", color: "text-amber-600 bg-amber-50", icon: Clock },
  verified: { label: "Verificat", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  rejected: { label: "Respins", color: "text-red-600 bg-red-50", icon: AlertTriangle },
  archived: { label: "Arhivat", color: "text-gray-500 bg-gray-100", icon: FileText },
};

export default function CandidateDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/portal/candidate/documents`, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize: backend returns "id", frontend expects "doc_id"
        const normalized = (data.documents || []).map((doc: any) => ({
          ...doc,
          doc_id: doc.doc_id || doc.id,
        }));
        // Filter out archived documents for display
        setDocuments(normalized.filter((doc: Document) => doc.status !== "archived"));
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
      toast.error("Eroare la încărcarea documentelor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Sigur dorești să ștergi acest document?")) return;

    try {
      const response = await fetch(`${API_URL}/portal/candidate/documents?doc_id=${docId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });

      if (response.ok) {
        toast.success("Document șters");
        loadDocuments();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast.error("Eroare la ștergere");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDocumentsByType = (type: string): Document[] => {
    return documents.filter((doc) => doc.document_type === type);
  };

  const getExpiryStatusBadge = (doc: Document) => {
    if (!doc.expiry_status) return null;

    const { status, days_remaining } = doc.expiry_status;
    
    if (status === "expired" || status === "expires_today") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Expirat
        </span>
      );
    }
    if (status === "critical" || status === "urgent") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          Expiră în {days_remaining} zile
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Expiră în {days_remaining} zile
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/portal/candidate">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Documentele Mele</h1>
            <p className="text-gray-600">Gestionează documentele din dosarul tău</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadDocuments} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reîncarcă
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Documente</p>
                <p className="text-2xl font-bold text-navy-900">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verificate</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter((d) => d.status === "verified").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">În Așteptare</p>
                <p className="text-2xl font-bold text-amber-600">
                  {documents.filter((d) => d.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Obligatorii Lipsă</p>
                <p className="text-2xl font-bold text-red-600">
                  {DOCUMENT_TYPES.filter(
                    (dt) => dt.required && !documents.find((d) => d.document_type === dt.type)
                  ).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents by Type */}
      <div className="space-y-6">
        {DOCUMENT_TYPES.map((docType) => {
          const typeDocs = getDocumentsByType(docType.type);
          const hasDocument = typeDocs.length > 0;
          const isUploaderOpen = showUploader === docType.type;

          return (
            <Card key={docType.type} className={!hasDocument && docType.required ? "border-amber-200" : ""}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        hasDocument ? "bg-green-100" : docType.required ? "bg-amber-100" : "bg-gray-100"
                      }`}
                    >
                      <FileText
                        className={`h-5 w-5 ${
                          hasDocument ? "text-green-600" : docType.required ? "text-amber-600" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {docType.title}
                        {docType.required && (
                          <span className="text-xs font-normal text-red-500">*obligatoriu</span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {hasDocument
                          ? `${typeDocs.length} document${typeDocs.length > 1 ? "e" : ""} încărcat${typeDocs.length > 1 ? "e" : ""}`
                          : "Niciun document încărcat"}
                      </CardDescription>
                    </div>
                  </div>

                  {!isUploaderOpen && (
                    <Button
                      variant={hasDocument ? "outline" : "default"}
                      size="sm"
                      onClick={() => setShowUploader(docType.type)}
                      className={hasDocument ? "" : "bg-coral hover:bg-red-600"}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {hasDocument ? "Adaugă" : "Încarcă"}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Uploader */}
                {isUploaderOpen && (
                  <div className="mb-4">
                    <DocumentUploader
                      documentType={docType.type}
                      title={`Încarcă ${docType.title}`}
                      description={docType.enableOCR ? "Datele vor fi extrase automat cu AI" : ""}
                      enableOCR={docType.enableOCR}
                      accept={docType.type === "video_presentation" ? "video/*" : "image/*,.pdf"}
                      maxSize={docType.type === "video_presentation" ? 50 * 1024 * 1024 : 10 * 1024 * 1024}
                      onUploadComplete={() => {
                        setShowUploader(null);
                        loadDocuments();
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUploader(null)}
                      className="mt-2"
                    >
                      Anulează
                    </Button>
                  </div>
                )}

                {/* Document List */}
                {typeDocs.map((doc) => {
                  const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={doc.doc_id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-navy-900">{doc.original_filename}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getExpiryStatusBadge(doc)}
                        
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              window.open(`${API_URL}/portal/documents/${doc.doc_id}/download`, "_blank")
                            }
                            title="Vizualizează"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              window.open(`${API_URL}/portal/documents/${doc.doc_id}/download?attachment=true`, "_blank")
                            }
                            title="Descarcă"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.doc_id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Șterge"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state for required documents */}
                {!hasDocument && docType.required && !isUploaderOpen && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      Acest document este obligatoriu pentru finalizarea dosarului.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
