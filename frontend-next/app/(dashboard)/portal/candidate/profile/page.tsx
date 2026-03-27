"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import DocumentUploader from "@/components/candidate/DocumentUploader";
import { toast } from "sonner";
import {
  User,
  FileText,
  Camera,
  Video,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Languages,
  AlertTriangle,
} from "lucide-react";

const API_URL = "/api";

function buildAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("gjc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const cleaned = (fullName || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return { first_name: "", last_name: "" };
  const parts = cleaned.split(" ");
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  const last_name = parts[parts.length - 1];
  const first_name = parts.slice(0, -1).join(" ");
  return { first_name, last_name };
}

// Wizard steps
const STEPS = [
  { id: 1, title: "Date Personale", icon: User, description: "Informații de bază" },
  { id: 2, title: "Pașaport", icon: FileText, description: "Încarcă pașaportul" },
  { id: 3, title: "Experiență", icon: Briefcase, description: "CV și experiență" },
  { id: 4, title: "Foto & Video", icon: Camera, description: "Foto și prezentare video" },
  { id: 5, title: "Finalizare", icon: CheckCircle2, description: "Verificare și trimitere" },
];

import { COUNTRIES } from "@/lib/countries";

// Industries
const INDUSTRIES = [
  { id: "construction", name: "Construcții" },
  { id: "horeca", name: "HoReCa (Hoteluri, Restaurante)" },
  { id: "agriculture", name: "Agricultură" },
  { id: "manufacturing", name: "Producție / Fabrici" },
  { id: "logistics", name: "Logistică / Depozite" },
  { id: "healthcare", name: "Sănătate" },
  { id: "cleaning", name: "Curățenie" },
  { id: "other", name: "Altele" },
];

// Languages
const LANGUAGE_OPTIONS = [
  { code: "en", name: "Engleză" },
  { code: "ro", name: "Română" },
  { code: "de", name: "Germană" },
  { code: "it", name: "Italiană" },
  { code: "es", name: "Spaniolă" },
  { code: "fr", name: "Franceză" },
  { code: "ar", name: "Arabă" },
  { code: "hi", name: "Hindi" },
  { code: "ne", name: "Nepaleză" },
  { code: "bn", name: "Bengali" },
];

interface ProfileData {
  // Personal info
  candidate_category: "abroad" | "in_romania" | "";
  first_name: string;
  last_name: string;
  date_of_birth: string;
  country_of_origin: string;
  current_country: string;
  phone: string;
  email: string;
  current_city: string;
  
  // Transfer details (in_romania only)
  previous_job_end_date: string;
  
  // Passport info (auto-filled from OCR)
  passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  
  // Experience
  preferred_industries: string[];
  years_experience: string;
  education_level: string;
  languages: string[];
  skills: string;
  
  // Documents (doc_ids)
  passport_doc_id: string;
  cv_doc_id: string;
  passport_photo_doc_id: string;
  video_presentation_url: string;
}

export default function CandidateProfileWizard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({
    candidate_category: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    country_of_origin: "",
    current_country: "",
    phone: "",
    email: user?.email || "",
    current_city: "",
    previous_job_end_date: "",
    passport_number: "",
    passport_issue_date: "",
    passport_expiry_date: "",
    preferred_industries: [],
    years_experience: "",
    education_level: "",
    languages: [],
    skills: "",
    passport_doc_id: "",
    cv_doc_id: "",
    passport_photo_doc_id: "",
    video_presentation_url: "",
  });
  const [existingDocuments, setExistingDocuments] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/portal/candidate/profile`, {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data?.profile;

        if (profile && profile.profile_id) {
          const derivedFullName =
            (profile.full_name as string) ||
            `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
          setFullName(derivedFullName);

          setProfileData((prev) => ({
            ...prev,
            candidate_category: profile.candidate_category || "",
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            date_of_birth: profile.date_of_birth || "",
            country_of_origin: profile.country_of_origin || profile.citizenship || "",
            current_country: profile.current_country || "",
            phone: profile.phone || "",
            email: profile.email || user?.email || "",
            current_city: profile.current_city || "",
            previous_job_end_date: profile.previous_job_end_date || "",
            passport_number: profile.passport_number || "",
            passport_issue_date: profile.passport_issue_date || "",
            passport_expiry_date: profile.passport_expiry_date || "",
            preferred_industries: profile.preferred_industries || [],
            years_experience: profile.years_experience || "",
            education_level: profile.education_level || "",
            languages: profile.languages || [],
            skills: profile.skills || "",
            passport_doc_id: profile.passport_doc_id || "",
            cv_doc_id: profile.cv_doc_id || "",
            passport_photo_doc_id: profile.passport_photo_doc_id || "",
            video_presentation_url: profile.video_presentation_url || "",
          }));
        } else {
          setFullName(user?.name || "");
          if (user?.name) {
            const parts = splitFullName(user.name);
            setProfileData((prev) => ({ ...prev, ...parts }));
          }
        }
      }

      // Load existing documents
      const docsResponse = await fetch(`${API_URL}/portal/candidate/documents`, {
        headers: buildAuthHeaders(),
      });
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        const docsMap: Record<string, any> = {};
        (docsData.documents || []).forEach((doc: any) => {
          if (!docsMap[doc.document_type] || doc.status !== "archived") {
            docsMap[doc.document_type] = doc;
          }
        });
        setExistingDocuments(docsMap);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    const parts = splitFullName(value);
    setProfileData((prev) => ({ ...prev, ...parts }));
    if (errors.full_name) {
      setErrors((prev) => ({ ...prev, full_name: "" }));
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleIndustryToggle = (industryId: string) => {
    setProfileData((prev) => {
      const current = prev.preferred_industries;
      if (current.includes(industryId)) {
        return { ...prev, preferred_industries: current.filter((id) => id !== industryId) };
      }
      return { ...prev, preferred_industries: [...current, industryId] };
    });
  };

  const handleLanguageToggle = (langCode: string) => {
    setProfileData((prev) => {
      const current = prev.languages;
      if (current.includes(langCode)) {
        return { ...prev, languages: current.filter((code) => code !== langCode) };
      }
      return { ...prev, languages: [...current, langCode] };
    });
  };

  const handlePassportOCR = (data: any) => {
    // Auto-fill form with OCR data
    setProfileData((prev) => ({
      ...prev,
      first_name: data.first_name || prev.first_name,
      last_name: data.last_name || prev.last_name,
      date_of_birth: data.date_of_birth || prev.date_of_birth,
      country_of_origin: data.citizenship || prev.country_of_origin,
      passport_number: data.passport_number || prev.passport_number,
      passport_issue_date: data.issue_date || prev.passport_issue_date,
      passport_expiry_date: data.expiry_date || prev.passport_expiry_date,
    }));
    toast.success("Datele din pașaport au fost completate automat!");
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!profileData.candidate_category) newErrors.candidate_category = "Selectează statutul tău curent (Străinătate / România)";
      if (!fullName.trim()) newErrors.full_name = "Numele complet este obligatoriu";
      if (!profileData.date_of_birth) newErrors.date_of_birth = "Data nașterii este obligatorie";
      if (!profileData.country_of_origin) newErrors.country_of_origin = "Țara de origine este obligatorie";
      if (!profileData.phone) newErrors.phone = "Telefonul este obligatoriu";
    }

    if (step === 2) {
      if (!profileData.passport_doc_id && !existingDocuments.passport) {
        newErrors.passport = "Încărcați pașaportul pentru a continua";
      }
    }

    if (step === 3) {
      if (profileData.preferred_industries.length === 0) {
        newErrors.industries = "Selectați cel puțin o industrie preferată";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/portal/candidate/profile`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          ...profileData,
          ...splitFullName(fullName),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to save");
      }

      toast.success("Progresul a fost salvat!");
    } catch (err: any) {
      toast.error(err.message || "Eroare la salvare");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Completează câmpurile obligatorii");
      return;
    }

    await saveProgress();

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await saveProgress();
    
    try {
      const response = await fetch(`${API_URL}/portal/candidate/profile/submit`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to submit");
      }

      toast.success("Profilul a fost trimis pentru verificare!");
      router.push("/portal/candidate");
    } catch (err: any) {
      toast.error(err.message || "Eroare la trimitere");
    }
  };

  // Calculate progress
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 10;

    if (profileData.first_name && profileData.last_name) completed += 1;
    if (profileData.date_of_birth && profileData.country_of_origin) completed += 1;
    if (profileData.phone && profileData.email) completed += 1;
    if (profileData.passport_doc_id || existingDocuments.passport) completed += 2;
    if (profileData.preferred_industries.length > 0) completed += 1;
    if (profileData.cv_doc_id || existingDocuments.cv) completed += 2;
    if (profileData.passport_photo_doc_id || existingDocuments.passport_photo) completed += 1;
    if (profileData.video_presentation_url || existingDocuments.video_presentation) completed += 1;

    return Math.round((completed / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-navy-900">Completare Profil Candidat</h1>
          <span className="text-sm text-gray-500">{calculateProgress()}% completat</span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => currentStep > step.id && setCurrentStep(step.id)}
            className={`flex flex-col items-center min-w-[80px] ${
              currentStep === step.id
                ? "text-coral"
                : currentStep > step.id
                ? "text-green-600 cursor-pointer"
                : "text-gray-400"
            }`}
            disabled={currentStep < step.id}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep === step.id
                  ? "bg-coral text-white"
                  : currentStep > step.id
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs font-medium hidden sm:block">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Personal Data */}
          {currentStep === 1 && (
            <div className="space-y-6">
              
              {/* Category Selection */}
              <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                <Label className="text-base font-medium text-navy-900">Statut Curent *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange("candidate_category", "abroad")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      profileData.candidate_category === "abroad"
                        ? "border-coral bg-coral/5 shadow-md"
                        : "border-gray-200 bg-white hover:border-coral/30"
                    }`}
                  >
                    <div className="font-semibold mb-1">🌍 În străinătate</div>
                    <div className="text-sm text-gray-600">Aplic pentru un loc de muncă din afara României</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("candidate_category", "in_romania")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      profileData.candidate_category === "in_romania"
                        ? "border-coral bg-coral/5 shadow-md"
                        : "border-gray-200 bg-white hover:border-coral/30"
                    }`}
                  >
                    <div className="font-semibold mb-1">🇷🇴 În România</div>
                    <div className="text-sm text-gray-600">Sunt deja în România și doresc să schimb angajatorul</div>
                  </button>
                </div>
                {errors.candidate_category && <p className="text-red-500 text-xs font-medium">{errors.candidate_category}</p>}
                
                {profileData.candidate_category === "in_romania" && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg animate-in fade-in slide-in-from-top-4">
                    <Label htmlFor="previous_job_end_date" className="text-orange-900 font-semibold mb-2 block">
                      Data încetării ultimului contract (Opțional)
                    </Label>
                    <p className="text-sm text-orange-800 mb-3">
                      Conform legii, ai la dispoziție <strong>90 de zile</strong> pentru a-ți găsi un nou angajator de la această dată.
                    </p>
                    <Input
                      id="previous_job_end_date"
                      type="date"
                      value={profileData.previous_job_end_date}
                      onChange={(e) => handleInputChange("previous_job_end_date", e.target.value)}
                      className="max-w-[200px] border-orange-300 focus-visible:ring-orange-500 bg-white"
                    />
                    {profileData.previous_job_end_date && (() => {
                      const endDate = new Date(profileData.previous_job_end_date);
                      const today = new Date();
                      const diffTime = endDate.getTime() + (90 * 24 * 60 * 60 * 1000) - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const isExpired = diffDays < 0;
                      return (
                        <div className={`mt-3 font-medium flex items-center gap-2 ${isExpired ? "text-red-600" : diffDays < 15 ? "text-orange-600" : "text-green-600"}`}>
                          <AlertTriangle className="h-4 w-4" />
                          {isExpired ? "Perioada legală de grație a expirat!" : `Au mai rămas ${diffDays} zile legale de ședere.`}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nume complet *</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  placeholder="Ion Popescu"
                  className={errors.full_name ? "border-red-500" : ""}
                />
                {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Data Nașterii *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    className={errors.date_of_birth ? "border-red-500" : ""}
                  />
                  {errors.date_of_birth && <p className="text-red-500 text-xs">{errors.date_of_birth}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country_of_origin">Țara de Origine *</Label>
                  <select
                    id="country_of_origin"
                    value={profileData.country_of_origin}
                    onChange={(e) => handleInputChange("country_of_origin", e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border ${
                      errors.country_of_origin ? "border-red-500" : "border-input"
                    } bg-background`}
                  >
                    <option value="">Selectează țara de naștere</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country_of_origin && <p className="text-red-500 text-xs">{errors.country_of_origin}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_country">Țara Curentă (Unde locuiești acum)</Label>
                  <select
                    id="current_country"
                    value={profileData.current_country}
                    onChange={(e) => handleInputChange("current_country", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selectează țara de reședință</option>
                    <option value="Romania">🇷🇴 Romania</option>
                    <option disabled>──────────</option>
                    {COUNTRIES.map((country) => (
                      <option key={`res_${country.code}`} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_city">Orașul Curent</Label>
                  <Input
                    id="current_city"
                    value={profileData.current_city}
                    onChange={(e) => handleInputChange("current_city", e.target.value)}
                    placeholder="Kathmandu"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Passport */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>AI OCR:</strong> Încarcă o poză clară a pașaportului și vom extrage automat datele folosind inteligență artificială.
                </AlertDescription>
              </Alert>

              <DocumentUploader
                documentType="passport"
                title="Pașaport"
                description="Încarcă o poză clară a primei pagini a pașaportului"
                accept="image/*"
                enableOCR={true}
                onUploadComplete={(result) => handleInputChange("passport_doc_id", result.doc_id)}
                onOCRComplete={handlePassportOCR}
                existingDocument={existingDocuments.passport}
              />

              {errors.passport && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.passport}</AlertDescription>
                </Alert>
              )}

              {/* Auto-filled passport data */}
              {profileData.passport_number && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <Label className="text-gray-500 text-xs">Nr. Pașaport</Label>
                    <p className="font-medium">{profileData.passport_number}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs">Data Emiterii</Label>
                    <p className="font-medium">{profileData.passport_issue_date || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-xs">Data Expirării</Label>
                    <p className="font-medium">{profileData.passport_expiry_date || "-"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Industrii Preferate *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry.id}
                      type="button"
                      onClick={() => handleIndustryToggle(industry.id)}
                      className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                        profileData.preferred_industries.includes(industry.id)
                          ? "bg-coral text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {industry.name}
                    </button>
                  ))}
                </div>
                {errors.industries && <p className="text-red-500 text-xs mt-2">{errors.industries}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Ani de Experiență</Label>
                  <select
                    id="years_experience"
                    value={profileData.years_experience}
                    onChange={(e) => handleInputChange("years_experience", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selectează</option>
                    <option value="0-1">0-1 ani</option>
                    <option value="1-3">1-3 ani</option>
                    <option value="3-5">3-5 ani</option>
                    <option value="5-10">5-10 ani</option>
                    <option value="10+">Peste 10 ani</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_level">Nivel Educație</Label>
                  <select
                    id="education_level"
                    value={profileData.education_level}
                    onChange={(e) => handleInputChange("education_level", e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="">Selectează</option>
                    <option value="primary">Școală Primară</option>
                    <option value="secondary">Liceu</option>
                    <option value="vocational">Școală Profesională</option>
                    <option value="bachelor">Licență</option>
                    <option value="master">Master</option>
                    <option value="phd">Doctorat</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Limbi Vorbite</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageToggle(lang.code)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        profileData.languages.includes(lang.code)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <DocumentUploader
                documentType="cv"
                title="CV / Curriculum Vitae"
                description="Încarcă CV-ul tău în format PDF sau imagine"
                accept="image/*,.pdf"
                enableOCR={false}
                onUploadComplete={(result) => handleInputChange("cv_doc_id", result.doc_id)}
                existingDocument={existingDocuments.cv}
              />

              <div className="space-y-2">
                <Label htmlFor="skills">Alte Abilități</Label>
                <textarea
                  id="skills"
                  value={profileData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="Descrie alte abilități sau certificări relevante..."
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Photo & Video */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <DocumentUploader
                documentType="passport_photo"
                title="Fotografie tip Pașaport"
                description="Fotografie recentă, pe fundal alb, fără ochelari"
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                onUploadComplete={(result) => handleInputChange("passport_photo_doc_id", result.doc_id)}
                existingDocument={existingDocuments.passport_photo}
              />

              <DocumentUploader
                documentType="video_presentation"
                title="Video de Prezentare (Opțional)"
                description="Video scurt (max 60 secunde) în care te prezinți în engleză sau română"
                accept="video/*"
                maxSize={50 * 1024 * 1024}
                onUploadComplete={(result) => handleInputChange("video_presentation_url", result.doc_id)}
                existingDocument={existingDocuments.video_presentation}
              />

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Un video de prezentare crește semnificativ șansele de a fi selectat de angajatori!
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Verifică informațiile de mai jos și apasă "Trimite Profilul" pentru a finaliza.
                </AlertDescription>
              </Alert>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-navy-900">Date Personale</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Statut Curent:</span> {profileData.candidate_category === "abroad" ? "În străinătate" : "În România"}</p>
                    <p><span className="text-gray-500">Nume:</span> {profileData.first_name} {profileData.last_name}</p>
                    <p><span className="text-gray-500">Data nașterii:</span> {profileData.date_of_birth}</p>
                    <p><span className="text-gray-500">Țară de Origine:</span> {profileData.country_of_origin}</p>
                    <p><span className="text-gray-500">Țară Curentă:</span> {profileData.current_country}</p>
                    <p><span className="text-gray-500">Telefon:</span> {profileData.phone}</p>
                    <p><span className="text-gray-500">Email:</span> {profileData.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-navy-900">Documente</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      {profileData.passport_doc_id || existingDocuments.passport ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      Pașaport
                    </p>
                    <p className="flex items-center gap-2">
                      {profileData.cv_doc_id || existingDocuments.cv ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      CV
                    </p>
                    <p className="flex items-center gap-2">
                      {profileData.passport_photo_doc_id || existingDocuments.passport_photo ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      Fotografie
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-navy-900">Experiență</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Industrii:</span> {profileData.preferred_industries.join(", ") || "-"}</p>
                    <p><span className="text-gray-500">Experiență:</span> {profileData.years_experience || "-"}</p>
                    <p><span className="text-gray-500">Educație:</span> {profileData.education_level || "-"}</p>
                    <p><span className="text-gray-500">Limbi:</span> {profileData.languages.join(", ") || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Button>

        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-coral hover:bg-red-600 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                Continuă
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Se trimite...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Trimite Profilul
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
