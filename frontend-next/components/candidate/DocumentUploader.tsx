"use client";

import { useState, useCallback } from "react";
import { Upload, Loader2, CheckCircle2, AlertTriangle, X, FileText, Camera, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const API_URL = "/api";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Aliniat la ALLOWED_DOCUMENT_TYPES din backend (portal_routes). */
const MIME_FOR_VIDEO = new Set(["video/mp4", "video/quicktime", "video/x-msvideo"]);
const MIME_GENERAL = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isAllowedMime(documentType: string, mime: string): boolean {
  const m = (mime || "").toLowerCase() || "application/octet-stream";
  if (documentType === "video_presentation") return MIME_FOR_VIDEO.has(m);
  return MIME_GENERAL.has(m);
}

function detailMessage(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((x) => JSON.stringify(x)).join("; ");
  if (detail && typeof detail === "object" && "msg" in detail)
    return String((detail as { msg: string }).msg);
  return "Eroare necunoscută";
}

interface DocumentUploaderProps {
  documentType: string;
  title: string;
  description: string;
  accept?: string;
  maxSize?: number;
  enableOCR?: boolean;
  onUploadComplete?: (result: any) => void;
  onOCRComplete?: (data: any) => void;
  existingDocument?: {
    doc_id: string;
    original_filename: string;
    created_at: string;
  } | null;
}

export default function DocumentUploader({
  documentType,
  title,
  description,
  accept = "image/*,.pdf",
  maxSize = 10 * 1024 * 1024, // 10MB default
  enableOCR = false,
  onUploadComplete,
  onOCRComplete,
  existingDocument,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    doc_id: string;
  } | null>(existingDocument ? { name: existingDocument.original_filename, doc_id: existingDocument.doc_id } : null);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`Fișierul este prea mare. Dimensiunea maximă este ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    const ct = file.type || "application/octet-stream";
    if (!isAllowedMime(documentType, ct)) {
      setError(
        "Tip de fișier neacceptat. Folosiți PDF sau imagini (JPEG, PNG, WebP) sau, pentru video, MP4/MOV/AVI."
      );
      return;
    }

    // Check if document already exists
    if (uploadedFile) {
      setPendingFile(file);
      setShowReplaceConfirm(true);
      return;
    }

    await uploadFile(file, false);
  };

  const uploadFile = async (file: File, replaceExisting: boolean) => {
    setIsUploading(true);
    setUploadProgress(0);
    setShowReplaceConfirm(false);
    setPendingFile(null);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 8, 85));
    }, 250);

    try {
      const contentType = file.type || "application/octet-stream";

      const sessionRes = await fetch(`${API_URL}/portal/candidate/documents/upload-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          document_type: documentType,
          filename: file.name,
          content_type: contentType,
          replace_existing: replaceExisting,
        }),
      });
      const session = await sessionRes.json();

      if (!sessionRes.ok) {
        throw new Error(detailMessage(session.detail) || "Nu s-a putut porni încărcarea");
      }

      if (session.exists && !replaceExisting) {
        clearInterval(progressInterval);
        setPendingFile(file);
        setShowReplaceConfirm(true);
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      const uploadUrl = session.upload_url as string;
      const storagePath = session.storage_path as string;
      if (!uploadUrl || !storagePath) {
        throw new Error("Răspuns invalid de la server (lipsește upload_url)");
      }

      const putHeaders: Record<string, string> = {
        "Content-Type": (session.content_type as string) || contentType,
      };

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: putHeaders,
      });

      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => "");
        throw new Error(
          `Stocare eșuată (${putRes.status}). ${errText ? errText.slice(0, 200) : "Verifică bucket-ul Supabase și CORS."}`
        );
      }

      const regRes = await fetch(`${API_URL}/portal/candidate/documents/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          document_type: documentType,
          storage_path: storagePath,
          original_filename: file.name,
          file_size: file.size,
          file_type: contentType,
          replace_existing: replaceExisting,
        }),
      });
      const result = await regRes.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!regRes.ok) {
        throw new Error(detailMessage(result.detail) || "Înregistrare document eșuată");
      }

      setUploadedFile({ name: file.name, doc_id: result.doc_id });
      toast.success("Document încărcat cu succes!");

      if (onUploadComplete) {
        onUploadComplete(result);
      }

      if (enableOCR && file.type.startsWith("image/")) {
        await processOCR(file);
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
      console.error("Upload error:", err);
      const msg = err instanceof Error ? err.message : "A apărut o eroare la încărcare";
      setError(msg);
      toast.error("Eroare la încărcare");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  const processOCR = async (file: File) => {
    setIsProcessingOCR(true);
    setOcrResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      let endpoint = "";
      if (documentType === "passport") {
        endpoint = "/auth/candidate/ocr/passport";
      } else if (documentType === "cv") {
        endpoint = "/auth/candidate/ocr/cv";
      }

      if (!endpoint) {
        setIsProcessingOCR(false);
        return;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(
          documentType === "cv"
            ? { file_base64: base64, mime_type: file.type || "application/pdf" }
            : { image_base64: base64, mime_type: file.type }
        ),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setOcrResult(result.data);
        toast.success("Datele au fost extrase cu succes!");

        if (onOCRComplete) {
          onOCRComplete(result.data);
        }
      } else {
        toast.error(result.error || "Nu am putut extrage datele");
      }
    } catch (err: any) {
      console.error("OCR error:", err);
      toast.error("Eroare la procesarea OCR");
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleConfirmReplace = () => {
    if (pendingFile) {
      uploadFile(pendingFile, true);
    }
  };

  const handleCancelReplace = () => {
    setShowReplaceConfirm(false);
    setPendingFile(null);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setOcrResult(null);
    setError(null);
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {documentType === "passport" && <FileText className="h-5 w-5 text-blue-500" />}
              {documentType === "passport_photo" && <Camera className="h-5 w-5 text-green-500" />}
              {documentType === "cv" && <FileText className="h-5 w-5 text-purple-500" />}
              {!["passport", "passport_photo", "cv"].includes(documentType) && (
                <FileText className="h-5 w-5 text-gray-500" />
              )}
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {uploadedFile && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Încărcat</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Replace Confirmation */}
        {showReplaceConfirm && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              <p className="font-medium mb-2">Ai deja un document de acest tip încărcat.</p>
              <p className="text-sm mb-3">Dorești să înlocuiești documentul existent?</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleConfirmReplace} className="bg-amber-600 hover:bg-amber-700">
                  Înlocuiește
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelReplace}>
                  Anulează
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        {!uploadedFile && !showReplaceConfirm && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-coral bg-coral/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-coral" />
                <p className="text-gray-600">Se încarcă...</p>
                <Progress value={uploadProgress} className="max-w-xs mx-auto" />
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Trage și plasează fișierul aici sau
                </p>
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileSelect}
                    data-testid={`upload-input-${documentType}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    Selectează fișier
                  </Button>
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Formate acceptate: JPG, PNG, PDF. Max {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </>
            )}
          </div>
        )}

        {/* Uploaded File Display */}
        {uploadedFile && !showReplaceConfirm && (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{uploadedFile.name}</p>
                <p className="text-sm text-green-600">Document încărcat cu succes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800"
                onClick={() => {
                  window.open(`${API_URL}/portal/documents/${uploadedFile.doc_id}/download`, "_blank");
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Vezi
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* OCR Processing */}
        {isProcessingOCR && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Se analizează documentul cu AI...</p>
              <p className="text-sm text-blue-600">Extragem automat datele din document</p>
            </div>
          </div>
        )}

        {/* OCR Results Preview */}
        {ocrResult && enableOCR && (
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="font-medium text-purple-800 mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Date extrase automat
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {ocrResult.full_name && (
                <div>
                  <span className="text-purple-600">Nume:</span>{" "}
                  <span className="font-medium text-purple-900">{ocrResult.full_name}</span>
                </div>
              )}
              {ocrResult.passport_number && (
                <div>
                  <span className="text-purple-600">Nr. Pașaport:</span>{" "}
                  <span className="font-medium text-purple-900">{ocrResult.passport_number}</span>
                </div>
              )}
              {ocrResult.date_of_birth_display && (
                <div>
                  <span className="text-purple-600">Data nașterii:</span>{" "}
                  <span className="font-medium text-purple-900">{ocrResult.date_of_birth_display}</span>
                </div>
              )}
              {ocrResult.citizenship && (
                <div>
                  <span className="text-purple-600">Cetățenie:</span>{" "}
                  <span className="font-medium text-purple-900">{ocrResult.citizenship}</span>
                </div>
              )}
              {ocrResult.expiry_date_display && (
                <div>
                  <span className="text-purple-600">Expiră:</span>{" "}
                  <span className="font-medium text-purple-900">{ocrResult.expiry_date_display}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
