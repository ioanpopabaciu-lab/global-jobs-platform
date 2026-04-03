"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  File,
  Clock,
  XCircle,
} from "lucide-react";

const API_URL = "/api";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: "contract_colaborare", label: "Contract Colaborare" },
  { value: "certificat_inregistrare", label: "Certificat Înregistrare" },
  { value: "autorizatie_igi", label: "Autorizație IGI" },
  { value: "cazier_fiscal", label: "Cazier Fiscal" },
  { value: "bilant_financiar", label: "Bilanț Financiar" },
  { value: "other", label: "Alt Document" },
];

const DOC_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPES.map((d) => [d.value, d.label])
);

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  verified: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "În verificare",
  verified: "Verificat",
  rejected: "Respins",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "verified") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "rejected") return <XCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployerDocument {
  id: string;
  document_type: string;
  display_name: string;
  original_filename: string;
  status: string;
  file_size: number;
  created_at: string;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// ─── Document row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc }: { doc: EmployerDocument }) {
  const statusStyle = STATUS_STYLES[doc.status] ?? "bg-gray-100 text-gray-700";
  const statusLabel = STATUS_LABELS[doc.status] ?? doc.status;
  const typeLabel = DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type;

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
        <File className="h-4 w-4 text-blue-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[#0f1f3d] text-sm truncate">{typeLabel}</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}
          >
            <StatusIcon status={doc.status} />
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400 truncate max-w-xs">
            {doc.original_filename}
          </span>
          <span className="text-xs text-gray-400">{formatFileSize(doc.file_size)}</span>
          <span className="text-xs text-gray-400">
            {new Date(doc.created_at).toLocaleDateString("ro-RO")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EmployerDocumentsPage() {
  const [documents, setDocuments] = useState<EmployerDocument[]>([]);
  const [employerId, setEmployerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Upload state
  const [selectedType, setSelectedType] = useState("contract_colaborare");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/portal/employer/documents`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.employer_id) setEmployerId(data.employer_id);
      } else {
        setLoadError("Nu s-au putut încărca documentele. Încercați din nou.");
      }
    } catch {
      setLoadError("Eroare de conexiune. Verificați conexiunea la internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage({ type: "error", text: "Selectați un fișier înainte de a încărca." });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      // Step 1: get signed upload URL
      const sessionRes = await fetch(`${API_URL}/portal/documents/upload-session`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: selectedType,
          filename: selectedFile.name,
          content_type: selectedFile.type || "application/octet-stream",
        }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json().catch(() => ({}));
        throw new Error(err.detail || "Nu s-a putut obține sesiunea de upload.");
      }

      const { upload_url, storage_path } = await sessionRes.json();

      // Step 2: PUT file to signed URL
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
        body: selectedFile,
      });

      if (!putRes.ok) {
        throw new Error("Eroare la încărcarea fișierului în storage.");
      }

      // Step 3: register document metadata
      const typeLabel = DOC_TYPE_LABELS[selectedType] ?? selectedType;
      const registerRes = await fetch(`${API_URL}/portal/documents/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner_type: "employer",
          owner_id: employerId,
          document_type: selectedType,
          storage_path,
          original_filename: selectedFile.name,
          display_name: typeLabel,
          content_type: selectedFile.type || "application/octet-stream",
          file_size: selectedFile.size,
        }),
      });

      if (!registerRes.ok) {
        const err = await registerRes.json().catch(() => ({}));
        throw new Error(err.detail || "Eroare la înregistrarea documentului.");
      }

      setUploadMessage({
        type: "success",
        text: "Documentul a fost încărcat cu succes și este în curs de verificare.",
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDocuments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Eroare la încărcarea documentului.";
      setUploadMessage({ type: "error", text: message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal/employer">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0f1f3d]">Documentele Companiei</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gestionați documentele necesare pentru validarea companiei dvs.
          </p>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Documentele sunt verificate de echipa GJC. Vă vom notifica prin email când sunt validate.
        </p>
      </div>

      {/* Upload section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Încarcă Document Nou</CardTitle>
          <CardDescription>
            Formate acceptate: PDF, JPG, JPEG, PNG. Dimensiunea maximă recomandată: 10 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tip document *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={uploading}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fișier *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSelectedFile(file);
                  setUploadMessage(null);
                }}
                className="w-full h-10 px-3 py-1.5 rounded-md border border-input bg-background text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#E8553E] cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Upload button */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="h-10"
              style={
                !uploading && selectedFile
                  ? { backgroundColor: "#E8553E" }
                  : undefined
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Se încarcă...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Încarcă Document
                </>
              )}
            </Button>
          </div>

          {/* Selected file preview */}
          {selectedFile && !uploading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-md px-3 py-2">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-gray-400 flex-shrink-0">({formatFileSize(selectedFile.size)})</span>
            </div>
          )}

          {/* Upload result message */}
          {uploadMessage && (
            <div
              className={`mt-3 flex items-center gap-2 p-3 rounded-lg text-sm ${
                uploadMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {uploadMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {uploadMessage.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Documente Încărcate</CardTitle>
            {!loading && (
              <Badge variant="outline" className="font-normal text-gray-500">
                {documents.length} {documents.length === 1 ? "document" : "documente"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#E8553E" }} />
            </div>
          )}

          {/* Load error */}
          {!loading && loadError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {loadError}
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={loadDocuments}
              >
                Reîncearcă
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !loadError && documents.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium mb-1">
                Niciun document încărcat încă
              </p>
              <p className="text-gray-400 text-xs">
                Încărcați documentele necesare pentru validarea companiei dvs.
              </p>
            </div>
          )}

          {/* Documents */}
          {!loading && !loadError && documents.length > 0 && (
            <div>
              {documents.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
