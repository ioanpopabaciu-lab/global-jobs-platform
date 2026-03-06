import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Loader2, Upload, FileText, Check, X, AlertCircle, 
  ArrowRight, ArrowLeft, Sparkles, Clock, Camera, Video,
  CheckCircle2, AlertTriangle, XCircle, Send, Save
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Marital status options
const maritalStatuses = [
  { value: 'single', label: 'Necăsătorit(ă)' },
  { value: 'married', label: 'Căsătorit(ă)' },
  { value: 'divorced', label: 'Divorțat(ă)' },
  { value: 'widowed', label: 'Văduv(ă)' }
];

// Religion options (optional)
const religions = [
  { value: '', label: 'Prefer să nu specific' },
  { value: 'christian', label: 'Creștin' },
  { value: 'muslim', label: 'Musulman' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddhist', label: 'Budist' },
  { value: 'other', label: 'Altă religie' }
];

// Availability options
const availabilityOptions = [
  { value: 'immediate', label: 'Imediat' },
  { value: '2_weeks', label: 'În 2 săptămâni' },
  { value: '1_month', label: 'Într-o lună' },
  { value: '2_months', label: 'În 2 luni' },
  { value: '3_months', label: 'În 3 luni sau mai mult' }
];

// Common professions
const commonProfessions = [
  'Sudor', 'Electrician', 'Instalator', 'Bucătar', 'Ospătar', 
  'Muncitor necalificat', 'Șofer', 'Mecanic auto', 'Tâmplar', 
  'Zidar', 'Operator CNC', 'Lăcătuș', 'Confecționer', 'Croitor'
];

export default function CandidateRegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null);
  const autoSaveTimerRef = useRef(null);
  
  // Document uploads
  const [uploads, setUploads] = useState({
    passport: null,
    cv: null,
    diploma: null,
    criminal_record: null,
    passport_photo: null,
    video_presentation: null
  });
  
  // Extracted data from OCR
  const [extractedData, setExtractedData] = useState({
    passport: null,
    cv: null
  });
  
  // Field statuses (green/yellow/red)
  const [fieldStatus, setFieldStatus] = useState({});
  
  // Form data for manual input
  const [formData, setFormData] = useState({
    // Account
    email: '',
    password: '',
    confirmPassword: '',
    
    // From passport
    first_name: '',
    last_name: '',
    date_of_birth: '',
    citizenship: '',
    nationality: '',
    passport_number: '',
    passport_expiry_date: '',
    gender: 'male',
    
    // From CV
    phone: '',
    current_profession: '',
    experience_years: 0,
    employers: [],
    countries_worked_in: [],
    languages_known: [],
    education_level: '',
    
    // Manual input (Step 5)
    marital_status: 'single',
    religion: '',
    address: '',
    target_position: '',
    salary_min: 800,
    salary_max: 1500,
    availability: 'immediate',
    
    // Special availability
    already_in_romania: false,
    work_permit_expiry: '',
    available_for_change: false,
    accept_part_time: false
  });
  
  // Profile score
  const [profileScore, setProfileScore] = useState(0);
  const [scoreSuggestions, setScoreSuggestions] = useState([]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formData.email) return;
    
    try {
      setAutoSaveStatus('saving');
      // Save to localStorage for persistence
      localStorage.setItem('candidate_registration_draft', JSON.stringify({
        formData,
        uploads: Object.keys(uploads).reduce((acc, key) => {
          if (uploads[key]) {
            acc[key] = { name: uploads[key].name, uploaded: true };
          }
          return acc;
        }, {}),
        currentStep,
        timestamp: new Date().toISOString()
      }));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [formData, uploads, currentStep]);

  // Set up auto-save timer
  useEffect(() => {
    if (currentStep > 1) {
      autoSaveTimerRef.current = setInterval(autoSave, 30000);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [currentStep, autoSave]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('candidate_registration_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Only restore if less than 24 hours old
        const age = Date.now() - new Date(parsed.timestamp).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          setFormData(prev => ({ ...prev, ...parsed.formData }));
          toast.info('Am restaurat datele salvate anterior');
        }
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, []);

  // Handle file upload
  const handleFileUpload = async (type, file) => {
    if (!file) return;
    
    // Validate file size
    const maxSize = type === 'video_presentation' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Fișierul este prea mare (max ${maxSize / 1024 / 1024}MB)`);
      return;
    }
    
    setUploads(prev => ({ ...prev, [type]: file }));
    toast.success(`${file.name} încărcat cu succes`);
  };

  // Process documents with AI
  const processDocuments = async () => {
    setProcessing(true);
    setProcessingProgress(0);
    
    try {
      const results = { passport: null, cv: null };
      
      // Process passport
      if (uploads.passport) {
        setProcessingProgress(10);
        const passportBase64 = await fileToBase64(uploads.passport);
        
        const passportResponse = await fetch(`${API_URL}/api/auth/candidate/ocr/passport`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: passportBase64,
            mime_type: uploads.passport.type
          })
        });
        
        setProcessingProgress(40);
        
        if (passportResponse.ok) {
          results.passport = await passportResponse.json();
        }
      }
      
      // Process CV
      if (uploads.cv) {
        setProcessingProgress(50);
        const cvBase64 = await fileToBase64(uploads.cv);
        
        const cvResponse = await fetch(`${API_URL}/api/auth/candidate/ocr/cv`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: cvBase64,
            mime_type: uploads.cv.type
          })
        });
        
        setProcessingProgress(80);
        
        if (cvResponse.ok) {
          results.cv = await cvResponse.json();
        }
      }
      
      setProcessingProgress(90);
      
      // Merge extracted data
      if (results.passport?.success || results.cv?.success) {
        setExtractedData(results);
        
        // Update form data with extracted values
        const passportData = results.passport?.data || {};
        const cvData = results.cv?.data || {};
        
        setFormData(prev => ({
          ...prev,
          first_name: passportData.first_name || prev.first_name,
          last_name: passportData.last_name || prev.last_name,
          date_of_birth: passportData.date_of_birth || prev.date_of_birth,
          citizenship: passportData.citizenship || prev.citizenship,
          nationality: passportData.nationality || prev.nationality,
          passport_number: passportData.passport_number || prev.passport_number,
          passport_expiry_date: passportData.expiry_date || prev.passport_expiry_date,
          gender: passportData.sex === 'M' ? 'male' : passportData.sex === 'F' ? 'female' : prev.gender,
          phone: cvData.phone || prev.phone,
          current_profession: cvData.current_profession || prev.current_profession,
          experience_years: cvData.experience_years || prev.experience_years,
          employers: cvData.employers || prev.employers,
          countries_worked_in: cvData.countries_worked_in || prev.countries_worked_in,
          languages_known: cvData.languages?.map(l => l.language) || prev.languages_known,
          education_level: cvData.education_level || prev.education_level
        }));
        
        // Build field status
        const newStatus = {};
        if (results.passport?.field_status) {
          Object.assign(newStatus, results.passport.field_status);
        }
        if (results.cv?.field_status) {
          Object.assign(newStatus, results.cv.field_status);
        }
        setFieldStatus(newStatus);
      }
      
      setProcessingProgress(100);
      
      // Move to next step
      setTimeout(() => {
        setProcessing(false);
        setCurrentStep(4);
      }, 500);
      
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Eroare la procesarea documentelor');
      setProcessing(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // Calculate profile score
  useEffect(() => {
    let score = 0;
    const suggestions = [];
    
    // Required fields
    if (formData.first_name) score += 10; else suggestions.push({ points: 10, text: 'Adaugă numele' });
    if (formData.last_name) score += 10; else suggestions.push({ points: 10, text: 'Adaugă prenumele' });
    if (formData.citizenship) score += 10; else suggestions.push({ points: 10, text: 'Adaugă cetățenia' });
    if (formData.phone) score += 10; else suggestions.push({ points: 10, text: 'Adaugă telefonul' });
    if (formData.current_profession) score += 10; else suggestions.push({ points: 10, text: 'Adaugă profesia' });
    if (formData.date_of_birth) score += 10; else suggestions.push({ points: 10, text: 'Adaugă data nașterii' });
    
    // Documents
    if (uploads.passport) score += 10; else suggestions.push({ points: 10, text: 'Încarcă pașaportul' });
    if (uploads.cv) score += 10; else suggestions.push({ points: 10, text: 'Încarcă CV-ul' });
    if (uploads.criminal_record) score += 5; else suggestions.push({ points: 5, text: 'Adaugă cazierul' });
    if (uploads.passport_photo) score += 5; else suggestions.push({ points: 5, text: 'Adaugă foto pașaport' });
    
    // Bonus
    if (uploads.video_presentation) score += 5; else suggestions.push({ points: 5, text: 'Adaugă video prezentare' });
    if (uploads.diploma) score += 5; else suggestions.push({ points: 5, text: 'Adaugă diplome' });
    
    setProfileScore(Math.min(score, 100));
    setScoreSuggestions(suggestions.slice(0, 5));
  }, [formData, uploads]);

  // Handle form change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit registration
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        toast.error('Email și parola sunt obligatorii');
        setLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Parolele nu coincid');
        setLoading(false);
        return;
      }
      
      // Step 1: Register user
      const registerResponse = await fetch(`${API_URL}/api/auth/candidate/register-with-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          profile_data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            date_of_birth: formData.date_of_birth,
            citizenship: formData.citizenship,
            nationality: formData.nationality,
            passport_number: formData.passport_number,
            passport_expiry_date: formData.passport_expiry_date,
            gender: formData.gender,
            phone: formData.phone,
            current_profession: formData.current_profession,
            experience_years: formData.experience_years,
            countries_worked_in: formData.countries_worked_in,
            languages_known: formData.languages_known,
            marital_status: formData.marital_status,
            religion: formData.religion,
            address: formData.address,
            target_position: formData.target_position,
            salary_expectation: `${formData.salary_min}-${formData.salary_max} EUR`,
            availability: formData.availability,
            already_in_romania: formData.already_in_romania,
            work_permit_expiry: formData.work_permit_expiry,
            available_for_change: formData.available_for_change,
            accept_part_time: formData.accept_part_time
          }
        })
      });
      
      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.detail || 'Eroare la înregistrare');
      }
      
      const registerData = await registerResponse.json();
      
      // Step 2: Upload documents
      for (const [type, file] of Object.entries(uploads)) {
        if (file) {
          const uploadForm = new FormData();
          uploadForm.append('file', file);
          uploadForm.append('document_type', type);
          uploadForm.append('replace_existing', 'true');
          
          await fetch(`${API_URL}/api/portal/candidate/documents/upload`, {
            method: 'POST',
            credentials: 'include',
            body: uploadForm
          });
        }
      }
      
      // Clear draft
      localStorage.removeItem('candidate_registration_draft');
      
      toast.success('Profilul a fost creat cu succes!');
      
      // Navigate to portal
      navigate('/portal/candidate');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Eroare la înregistrare');
    } finally {
      setLoading(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'green':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'yellow':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'red':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      // STEP 1 - Welcome
      case 1:
        return (
          <div className="text-center space-y-8 py-8" data-testid="step-welcome">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Creează-ți profilul în 3 minute
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Încarcă documentele și noi extragem datele automat
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-3 p-6 bg-blue-50 rounded-xl">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-7 w-7 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Încarcă documentele</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 bg-green-50 rounded-xl">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-7 w-7 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Verifică datele extrase</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 p-6 bg-purple-50 rounded-xl">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Completează ce lipsește</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
              onClick={() => setCurrentStep(2)}
              data-testid="btn-start"
            >
              Începe acum
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );
      
      // STEP 2 - Document Upload
      case 2:
        return (
          <div className="space-y-6" data-testid="step-upload">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Încarcă documentele</h2>
              <p className="text-gray-600">Trage fișierele sau click pentru a selecta</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Passport - Required */}
              <UploadZone
                title="Pașaport (față)"
                description="Asigură-te că toate datele sunt vizibile"
                accept=".jpg,.jpeg,.png,.pdf"
                maxSize="10MB"
                required
                file={uploads.passport}
                onUpload={(file) => handleFileUpload('passport', file)}
                onRemove={() => setUploads(prev => ({ ...prev, passport: null }))}
              />
              
              {/* CV - Required */}
              <UploadZone
                title="CV-ul tău"
                description="Acceptăm PDF, DOC, DOCX"
                accept=".pdf,.doc,.docx"
                maxSize="5MB"
                required
                file={uploads.cv}
                onUpload={(file) => handleFileUpload('cv', file)}
                onRemove={() => setUploads(prev => ({ ...prev, cv: null }))}
              />
              
              {/* Diploma - Optional */}
              <UploadZone
                title="Diplomă / Certificate"
                description="Crește șansele cu 40%"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize="10MB"
                badge="Opțional"
                badgeColor="blue"
                file={uploads.diploma}
                onUpload={(file) => handleFileUpload('diploma', file)}
                onRemove={() => setUploads(prev => ({ ...prev, diploma: null }))}
              />
              
              {/* Criminal Record - Optional at start */}
              <UploadZone
                title="Cazier judiciar"
                description="Poți adăuga mai târziu"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize="10MB"
                badge="Obligatoriu la final"
                badgeColor="yellow"
                file={uploads.criminal_record}
                onUpload={(file) => handleFileUpload('criminal_record', file)}
                onRemove={() => setUploads(prev => ({ ...prev, criminal_record: null }))}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!uploads.passport || !uploads.cv}
                className="bg-green-600 hover:bg-green-700"
                data-testid="btn-continue-upload"
              >
                Continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      // STEP 3 - AI Processing
      case 3:
        return (
          <div className="text-center space-y-8 py-12" data-testid="step-processing">
            {processing ? (
              <>
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Citim documentele tale...
                  </h2>
                  <p className="text-gray-600 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    Aproximativ 10 secunde
                  </p>
                  <Progress value={processingProgress} className="max-w-xs mx-auto" />
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gata să extragem datele
                  </h2>
                  <p className="text-gray-600">
                    AI-ul nostru va citi pașaportul și CV-ul tău
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button 
                    onClick={processDocuments}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="btn-process"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Procesează documentele
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      
      // STEP 4 - Confirm Extracted Data
      case 4:
        return (
          <div className="space-y-6" data-testid="step-confirm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Am găsit aceste date — verificați:
                </CardTitle>
                <CardDescription>
                  <span className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Complet</span>
                    <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-500" /> De verificat</span>
                    <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> Negăsit</span>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From Passport */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Din Pașaport</h3>
                    
                    <ExtractedField
                      label="Prenume"
                      value={formData.first_name}
                      status={fieldStatus.first_name}
                      onChange={(v) => handleChange('first_name', v)}
                    />
                    <ExtractedField
                      label="Nume"
                      value={formData.last_name}
                      status={fieldStatus.last_name}
                      onChange={(v) => handleChange('last_name', v)}
                    />
                    <ExtractedField
                      label="Data nașterii"
                      value={formData.date_of_birth}
                      status={fieldStatus.date_of_birth}
                      type="date"
                      onChange={(v) => handleChange('date_of_birth', v)}
                    />
                    <ExtractedField
                      label="Cetățenie"
                      value={formData.citizenship}
                      status={fieldStatus.citizenship}
                      onChange={(v) => handleChange('citizenship', v)}
                    />
                    <ExtractedField
                      label="Nr. Pașaport"
                      value={formData.passport_number}
                      status={fieldStatus.passport_number}
                      onChange={(v) => handleChange('passport_number', v)}
                    />
                    <ExtractedField
                      label="Expiră la"
                      value={formData.passport_expiry_date}
                      status={fieldStatus.expiry_date}
                      type="date"
                      onChange={(v) => handleChange('passport_expiry_date', v)}
                    />
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        Sex
                        {getStatusIcon(fieldStatus.sex || 'green')}
                      </Label>
                      <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculin (M)</SelectItem>
                          <SelectItem value="female">Feminin (F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* From CV */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Din CV</h3>
                    
                    <ExtractedField
                      label="Email"
                      value={formData.email}
                      status={fieldStatus.email}
                      type="email"
                      onChange={(v) => handleChange('email', v)}
                      required
                    />
                    <ExtractedField
                      label="Telefon"
                      value={formData.phone}
                      status={fieldStatus.phone}
                      onChange={(v) => handleChange('phone', v)}
                      placeholder="+40 7XX XXX XXX"
                    />
                    <ExtractedField
                      label="Profesia"
                      value={formData.current_profession}
                      status={fieldStatus.current_profession}
                      onChange={(v) => handleChange('current_profession', v)}
                      suggestions={commonProfessions}
                    />
                    <ExtractedField
                      label="Ani experiență"
                      value={formData.experience_years}
                      status={fieldStatus.experience_years}
                      type="number"
                      onChange={(v) => handleChange('experience_years', parseInt(v) || 0)}
                    />
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        Țări în care a lucrat
                        {getStatusIcon(fieldStatus.countries_worked_in)}
                      </Label>
                      <Input
                        value={formData.countries_worked_in?.join(', ') || ''}
                        onChange={(e) => handleChange('countries_worked_in', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Ex: Italia, Spania"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        Limbi străine
                        {getStatusIcon(fieldStatus.languages)}
                      </Label>
                      <Input
                        value={formData.languages_known?.join(', ') || ''}
                        onChange={(e) => handleChange('languages_known', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="Ex: Engleză, Italiană"
                      />
                    </div>
                    <ExtractedField
                      label="Nivel studii"
                      value={formData.education_level}
                      status={fieldStatus.education_level}
                      onChange={(v) => handleChange('education_level', v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Modifică documentele
              </Button>
              <Button 
                onClick={() => setCurrentStep(5)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="btn-confirm-data"
              >
                Confirmă și continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      // STEP 5 - Fill Missing Fields
      case 5:
        return (
          <div className="space-y-6" data-testid="step-missing">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Completează informațiile lipsă</h2>
              <p className="text-gray-600">Doar câmpurile care nu au fost extrase automat</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Setup */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Creare cont</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Parolă *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Minim 6 caractere"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmă parola *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Repetă parola"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Date personale lipsă</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Stare civilă</Label>
                    <Select value={formData.marital_status} onValueChange={(v) => handleChange('marital_status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatuses.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Religie (opțional)</Label>
                    <Select value={formData.religion} onValueChange={(v) => handleChange('religion', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează" />
                      </SelectTrigger>
                      <SelectContent>
                        {religions.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Adresa actuală</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Oraș, țară"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Professional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informații profesionale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Postul vizat</Label>
                    <Input
                      value={formData.target_position}
                      onChange={(e) => handleChange('target_position', e.target.value)}
                      placeholder="Ex: Sudor, Electrician"
                      list="professions"
                    />
                    <datalist id="professions">
                      {commonProfessions.map(p => (
                        <option key={p} value={p} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <Label>Salariul solicitat (EUR/lună)</Label>
                    <div className="pt-6 pb-2">
                      <Slider
                        value={[formData.salary_min, formData.salary_max]}
                        min={500}
                        max={3000}
                        step={50}
                        onValueChange={([min, max]) => {
                          handleChange('salary_min', min);
                          handleChange('salary_max', max);
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formData.salary_min} EUR</span>
                      <span>{formData.salary_max} EUR</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Disponibilitate</Label>
                    <Select value={formData.availability} onValueChange={(v) => handleChange('availability', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Special Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disponibilitate specială</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="already_in_romania"
                      checked={formData.already_in_romania}
                      onCheckedChange={(c) => handleChange('already_in_romania', c)}
                    />
                    <label htmlFor="already_in_romania" className="font-medium cursor-pointer">
                      Sunt deja în România
                    </label>
                  </div>
                  
                  {formData.already_in_romania && (
                    <div className="ml-6 space-y-4 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label>Permis de muncă valid până la:</Label>
                        <Input
                          type="date"
                          value={formData.work_permit_expiry}
                          onChange={(e) => handleChange('work_permit_expiry', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="available_for_change"
                          checked={formData.available_for_change}
                          onCheckedChange={(c) => handleChange('available_for_change', c)}
                        />
                        <label htmlFor="available_for_change" className="cursor-pointer">
                          Disponibil pentru schimbare angajator
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="accept_part_time"
                          checked={formData.accept_part_time}
                          onCheckedChange={(c) => handleChange('accept_part_time', c)}
                        />
                        <label htmlFor="accept_part_time" className="cursor-pointer">
                          Accept și poziții part-time
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
              <Button 
                onClick={() => setCurrentStep(6)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="btn-continue-missing"
              >
                Continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      // STEP 6 - Document Checklist
      case 6:
        return (
          <div className="space-y-6" data-testid="step-checklist">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Checklist documente</h2>
              <p className="text-gray-600">Verifică că ai încărcat toate documentele necesare</p>
            </div>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <ChecklistItem
                  label="Pașaport"
                  checked={!!uploads.passport}
                  required
                />
                <ChecklistItem
                  label="CV"
                  checked={!!uploads.cv}
                  required
                />
                <ChecklistItem
                  label="Cazier judiciar"
                  checked={!!uploads.criminal_record}
                  required
                  onUpload={(file) => handleFileUpload('criminal_record', file)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <ChecklistItem
                  label="Foto tip pașaport"
                  checked={!!uploads.passport_photo}
                  required
                  onUpload={(file) => handleFileUpload('passport_photo', file)}
                  accept=".jpg,.jpeg,.png"
                />
                <ChecklistItem
                  label="Diplome / Certificate"
                  checked={!!uploads.diploma}
                  badge="opțional"
                  onUpload={(file) => handleFileUpload('diploma', file)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <ChecklistItem
                  label="Video prezentare"
                  checked={!!uploads.video_presentation}
                  badge="Crește șansele cu 60%"
                  badgeColor="green"
                  onUpload={(file) => handleFileUpload('video_presentation', file)}
                  accept=".mp4,.mov,.avi"
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
              <Button 
                onClick={() => setCurrentStep(7)}
                disabled={!uploads.passport || !uploads.cv || !uploads.criminal_record || !uploads.passport_photo}
                className="bg-green-600 hover:bg-green-700"
                data-testid="btn-continue-checklist"
              >
                Continuă
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      // STEP 7 - Final Confirmation
      case 7:
        return (
          <div className="space-y-6" data-testid="step-final">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Confirmare finală</h2>
              
              {/* Profile Score */}
              <div className="max-w-md mx-auto space-y-3">
                <div className="text-5xl font-bold text-green-600">{profileScore}%</div>
                <p className="text-gray-600">Profilul tău este {profileScore}% complet</p>
                <Progress value={profileScore} className="h-3" />
              </div>
            </div>
            
            {/* Improvement Suggestions */}
            {scoreSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cum poți îmbunătăți profilul</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {scoreSuggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{suggestion.text}</span>
                      <span className="text-green-600 font-medium">+{suggestion.points}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Submit */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center space-y-4">
                <p className="text-gray-700">
                  Trimite profilul pentru validare. Vei primi răspuns în <strong>24 de ore</strong>.
                </p>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                  disabled={loading || profileScore < 50}
                  data-testid="btn-submit-profile"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  Trimite profilul pentru validare
                </Button>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(6)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Înapoi
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">GJC</span>
              </div>
              <span className="font-semibold text-gray-900">Înregistrare Candidat</span>
            </div>
            
            {/* Auto-save indicator */}
            {autoSaveStatus && (
              <div className={`flex items-center gap-2 text-sm ${
                autoSaveStatus === 'saved' ? 'text-green-600' :
                autoSaveStatus === 'saving' ? 'text-gray-500' : 'text-red-500'
              }`}>
                {autoSaveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
                {autoSaveStatus === 'saved' && <Check className="h-3 w-3" />}
                {autoSaveStatus === 'saved' ? 'Salvat automat ✓' : 'Se salvează...'}
              </div>
            )}
          </div>
          
          {/* Progress Steps */}
          {currentStep > 1 && (
            <div className="mt-4 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
}

// Upload Zone Component
function UploadZone({ title, description, accept, maxSize, required, badge, badgeColor, file, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onUpload(droppedFile);
  };
  
  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
        dragOver ? 'border-green-500 bg-green-50' :
        file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
      />
      
      {badge && (
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
          badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
          badgeColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {badge}
        </span>
      )}
      
      {file ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="font-medium text-gray-900">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <p className="text-xs text-gray-400 mt-2">Max {maxSize}</p>
        </div>
      )}
    </div>
  );
}

// Extracted Field Component
function ExtractedField({ label, value, status, type = 'text', onChange, placeholder, suggestions, required }) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {status === 'green' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {status === 'yellow' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        {status === 'red' && <XCircle className="h-4 w-4 text-red-500" />}
      </Label>
      <Input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={suggestions ? `list-${label}` : undefined}
        className={`${
          status === 'green' ? 'border-green-300 bg-green-50' :
          status === 'yellow' ? 'border-yellow-300 bg-yellow-50' :
          status === 'red' ? 'border-red-300 bg-red-50' : ''
        }`}
      />
      {suggestions && (
        <datalist id={`list-${label}`}>
          {suggestions.map(s => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  );
}

// Checklist Item Component
function ChecklistItem({ label, checked, required, badge, badgeColor, onUpload, accept }) {
  const inputRef = useRef(null);
  
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        {checked ? (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        ) : (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        )}
        <span className={checked ? 'text-gray-900' : 'text-gray-500'}>
          {label}
          {required && !checked && <span className="text-red-500 ml-1">*</span>}
        </span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            badgeColor === 'green' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {badge}
          </span>
        )}
      </div>
      
      {!checked && onUpload && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            Încarcă
          </Button>
        </>
      )}
      
      {checked && (
        <span className="text-green-600 text-sm font-medium">Încărcat</span>
      )}
    </div>
  );
}
