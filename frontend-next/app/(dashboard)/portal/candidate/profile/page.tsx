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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://immigration-saas-2.preview.emergentagent.com/api";

// Wizard steps
const STEPS = [
  { id: 1, title: "Date Personale", icon: User, description: "Informații de bază" },
  { id: 2, title: "Pașaport", icon: FileText, description: "Încarcă pașaportul" },
  { id: 3, title: "Experiență", icon: Briefcase, description: "CV și experiență" },
  { id: 4, title: "Foto & Video", icon: Camera, description: "Foto și prezentare video" },
  { id: 5, title: "Finalizare", icon: CheckCircle2, description: "Verificare și trimitere" },
];

// Country codes for citizenship
const COUNTRIES = [
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
];

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
  first_name: string;
  last_name: string;
  date_of_birth: string;
  citizenship: string;
  phone: string;
  email: string;
  current_country: string;
  current_city: string;
  
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
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    citizenship: "",
    phone: "",
    email: user?.email || "",
    current_country: "",
    current_city: "",
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
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.profile_id) {
          setProfileData((prev) => ({
            ...prev,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            date_of_birth: data.date_of_birth || "",
            citizenship: data.citizenship || "",
            phone: data.phone || "",
            email: data.email || user?.email || "",
            current_country: data.current_country || "",
            current_city: data.current_city || "",
            passport_number: data.passport_number || "",
            passport_issue_date: data.passport_issue_date || "",
            passport_expiry_date: data.passport_expiry_date || "",
            preferred_industries: data.preferred_industries || [],
            years_experience: data.years_experience || "",
            education_level: data.education_level || "",
            languages: data.languages || [],
            skills: data.skills || "",
            passport_doc_id: data.passport_doc_id || "",
            cv_doc_id: data.cv_doc_id || "",
            passport_photo_doc_id: data.passport_photo_doc_id || "",
            video_presentation_url: data.video_presentation_url || "",
          }));
        }
      }

      // Load existing documents
      const docsResponse = await fetch(`${API_URL}/portal/candidate/documents`, {
        credentials: "include",
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
      citizenship: data.citizenship || prev.citizenship,
      passport_number: data.passport_number || prev.passport_number,
      passport_issue_date: data.issue_date || prev.passport_issue_date,
      passport_expiry_date: data.expiry_date || prev.passport_expiry_date,
    }));
    toast.success("Datele din pașaport au fost completate automat!");
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!profileData.first_name) newErrors.first_name = "Prenumele este obligatoriu";
      if (!profileData.last_name) newErrors.last_name = "Numele de familie este obligatoriu";
      if (!profileData.date_of_birth) newErrors.date_of_birth = "Data nașterii este obligatorie";
      if (!profileData.citizenship) newErrors.citizenship = "Cetățenia este obligatorie";
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
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
        credentials: "include",
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
    if (profileData.date_of_birth && profileData.citizenship) completed += 1;
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prenume *</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="Ion"
                    className={errors.first_name ? "border-red-500" : ""}
                  />
                  {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nume de Familie *</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Popescu"
                    className={errors.last_name ? "border-red-500" : ""}
                  />
                  {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
                </div>
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
                  <Label htmlFor="citizenship">Cetățenie *</Label>
                  <select
                    id="citizenship"
                    value={profileData.citizenship}
                    onChange={(e) => handleInputChange("citizenship", e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border ${
                      errors.citizenship ? "border-red-500" : "border-input"
                    } bg-background`}
                  >
                    <option value="">Selectează țara</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.citizenship && <p className="text-red-500 text-xs">{errors.citizenship}</p>}
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
                  <Label htmlFor="current_country">Țara Curentă</Label>
                  <Input
                    id="current_country"
                    value={profileData.current_country}
                    onChange={(e) => handleInputChange("current_country", e.target.value)}
                    placeholder="Nepal"
                  />
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
                    <p><span className="text-gray-500">Nume:</span> {profileData.first_name} {profileData.last_name}</p>
                    <p><span className="text-gray-500">Data nașterii:</span> {profileData.date_of_birth}</p>
                    <p><span className="text-gray-500">Cetățenie:</span> {profileData.citizenship}</p>
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
