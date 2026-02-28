import { useState, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Upload, CheckCircle2, Loader2, FileText, Video } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const citizenships = [
  { value: "bangladesh", label: "Bangladesh" },
  { value: "nepal", label: "Nepal" },
  { value: "india", label: "India" },
  { value: "pakistan", label: "Pakistan" },
  { value: "sri_lanka", label: "Sri Lanka" },
  { value: "philippines", label: "Filipine" },
  { value: "vietnam", label: "Vietnam" },
  { value: "indonesia", label: "Indonezia" },
  { value: "kenya", label: "Kenya" },
  { value: "ethiopia", label: "Etiopia" },
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "morocco", label: "Maroc" },
  { value: "egypt", label: "Egipt" },
  { value: "tunisia", label: "Tunisia" },
  { value: "altele", label: "Altă țară" },
];

const englishLevels = [
  { value: "incepator", label: "Începător" },
  { value: "mediu", label: "Mediu" },
  { value: "avansat", label: "Avansat" },
];

const industries = [
  { value: "horeca", label: "HoReCa" },
  { value: "constructii", label: "Construcții" },
  { value: "agricultura", label: "Agricultură" },
  { value: "depozite", label: "Depozite & Logistică" },
  { value: "productie", label: "Producție" },
  { value: "servicii", label: "Servicii" },
  { value: "oricare", label: "Orice domeniu" },
];

export default function CandidatesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      
      if (cvFile) {
        formData.append("cv_file", cvFile);
      }

      const response = await fetch(`${API}/candidates/submit`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || "Eroare la trimitere");
      }

      toast.success("Aplicația a fost trimisă cu succes!");
      setSubmitted(true);
      reset();
      setCvFile(null);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "A apărut o eroare. Vă rugăm încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Fișierul este prea mare. Dimensiunea maximă este 10MB.");
        return;
      }
      setCvFile(file);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-12 shadow-sm">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-navy-900  mb-4">
                Aplicația a fost Trimisă!
              </h1>
              <p className="text-gray-600 mb-8">
                Am primit CV-ul și informațiile dumneavoastră. Veți fi contactat 
                în cazul în care profilul corespunde oportunităților disponibile.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-coral hover:bg-red-600"
                data-testid="submit-another-btn"
              >
                Trimite o altă aplicație
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Portal Candidați | Global Jobs Consulting</title>
        <meta name="description" content="Înscrie-te în baza noastră de candidați și găsește oportunități de muncă în România, Austria sau Serbia." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="candidates-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-navy-300 font-medium text-sm  tracking-wider">
                Portal Candidați
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold  mt-2 mb-4">
                APLICĂ PENTRU UN JOB ÎN EUROPA
              </h1>
              <p className="text-navy-200 text-lg">
                Completați formularul și încărcați CV-ul pentru a fi inclus în baza noastră 
                de candidați. Vă vom contacta când apare o oportunitate potrivită.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-navy-900 ">
                    Formular de Aplicare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informații Personale
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Nume Complet *</Label>
                          <Input
                            id="full_name"
                            {...register("full_name", { required: "Câmp obligatoriu" })}
                            data-testid="input-full-name"
                          />
                          {errors.full_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="citizenship">Cetățenie *</Label>
                          <Select onValueChange={(value) => setValue("citizenship", value)}>
                            <SelectTrigger data-testid="select-citizenship">
                              <SelectValue placeholder="Selectați țara" />
                            </SelectTrigger>
                            <SelectContent>
                              {citizenships.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register("citizenship", { required: true })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email", { 
                              required: "Câmp obligatoriu",
                              pattern: { value: /^\S+@\S+$/i, message: "Email invalid" }
                            })}
                            data-testid="input-email"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefon *</Label>
                          <Input
                            id="phone"
                            {...register("phone", { required: "Câmp obligatoriu" })}
                            placeholder="+XX XXX XXX XXX"
                            data-testid="input-phone"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="whatsapp">WhatsApp *</Label>
                        <Input
                          id="whatsapp"
                          {...register("whatsapp", { required: "Câmp obligatoriu" })}
                          placeholder="+XX XXX XXX XXX"
                          data-testid="input-whatsapp"
                        />
                        {errors.whatsapp && (
                          <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Experiență Profesională
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="experience_years">Ani de Experiență *</Label>
                          <Input
                            id="experience_years"
                            type="number"
                            min="0"
                            {...register("experience_years", { 
                              required: "Câmp obligatoriu",
                              valueAsNumber: true,
                              min: { value: 0, message: "Valoare invalidă" }
                            })}
                            data-testid="input-experience"
                          />
                          {errors.experience_years && (
                            <p className="text-red-500 text-sm mt-1">{errors.experience_years.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="english_level">Nivel Limba Engleză *</Label>
                          <Select onValueChange={(value) => setValue("english_level", value)}>
                            <SelectTrigger data-testid="select-english-level">
                              <SelectValue placeholder="Selectați nivelul" />
                            </SelectTrigger>
                            <SelectContent>
                              {englishLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register("english_level", { required: true })} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="industry_preference">Domeniu Preferat *</Label>
                        <Select onValueChange={(value) => setValue("industry_preference", value)}>
                          <SelectTrigger data-testid="select-industry">
                            <SelectValue placeholder="Selectați domeniul" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((ind) => (
                              <SelectItem key={ind.value} value={ind.value}>
                                {ind.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <input type="hidden" {...register("industry_preference", { required: true })} />
                      </div>
                    </div>

                    {/* Upload Section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Documente
                      </h3>

                      <div>
                        <Label>Upload CV (PDF, DOC, DOCX - max 10MB)</Label>
                        <div 
                          className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-400 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="cv-upload-area"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          {cvFile ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <FileText className="h-6 w-6" />
                              <span>{cvFile.name}</span>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              <Upload className="h-8 w-8 mx-auto mb-2" />
                              <p>Click pentru a încărca CV-ul</p>
                              <p className="text-sm text-gray-400">sau drag & drop</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="video_cv_url" className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Link Video CV (opțional)
                        </Label>
                        <Input
                          id="video_cv_url"
                          placeholder="https://youtube.com/watch?v=..."
                          {...register("video_cv_url")}
                          data-testid="input-video-cv"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Adăugați un link către un video scurt de prezentare (YouTube, Vimeo, etc.)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="message">Mesaj Adițional</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder="Descrieți experiența și motivația dumneavoastră..."
                          {...register("message")}
                          data-testid="textarea-message"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-coral hover:bg-red-600 text-white h-12 font-semibold"
                      data-testid="submit-candidate-form"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Se trimite...
                        </>
                      ) : (
                        "Trimite Aplicația"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-sm bg-navy-900 text-white">
                <CardContent className="pt-6">
                  <h3 className="font-heading text-xl font-bold  mb-4">
                    Țări de Destinație
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded">
                      <span className="text-2xl">🇷🇴</span>
                      <div>
                        <div className="font-semibold">România</div>
                        <div className="text-sm text-navy-200">Oportunități în toate domeniile</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded">
                      <span className="text-2xl">🇦🇹</span>
                      <div>
                        <div className="font-semibold">Austria</div>
                        <div className="text-sm text-navy-200">Salarii competitive în EUR</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded">
                      <span className="text-2xl">🇷🇸</span>
                      <div>
                        <div className="font-semibold">Serbia</div>
                        <div className="text-sm text-navy-200">Piață în creștere</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-heading text-xl font-bold text-navy-900  mb-4">
                    Ce urmează?
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                      <span>Primim și analizăm aplicația ta</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                      <span>Te contactăm pentru un interviu video</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                      <span>Te prezentăm angajatorilor potriviți</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-navy-100 text-navy-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
                      <span>Te ajutăm cu documentele de imigrare</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
