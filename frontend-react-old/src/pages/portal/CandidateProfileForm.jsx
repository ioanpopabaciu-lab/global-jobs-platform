import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, Save, Send, User, Users, Briefcase, FileText, 
  Info, CheckCircle, AlertCircle, Upload, Camera, Video, X, Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Countries of origin (Non-EU)
const countriesOfOrigin = [
  'Afghanistan', 'Bangladesh', 'Cambodia', 'Ethiopia', 'India', 'Indonesia',
  'Kenya', 'Nepal', 'Nigeria', 'Pakistan', 'Philippines', 'Sri Lanka',
  'Thailand', 'Vietnam', 'Other'
];

// Languages
const languages = [
  'English', 'French', 'Spanish', 'Arabic', 'Hindi', 'Urdu', 'Bengali',
  'Nepali', 'Tagalog', 'Vietnamese', 'Indonesian', 'Romanian', 'German', 'Other'
];

// English levels
const englishLevels = [
  { value: 'none', label: 'Niciunul / None' },
  { value: 'basic', label: 'Bază / Basic (A1-A2)' },
  { value: 'intermediate', label: 'Intermediar / Intermediate (B1-B2)' },
  { value: 'advanced', label: 'Avansat / Advanced (C1)' },
  { value: 'fluent', label: 'Fluent (C2)' }
];

// Marital status
const maritalStatuses = [
  { value: 'single', label: 'Necăsătorit(ă) / Single' },
  { value: 'married', label: 'Căsătorit(ă) / Married' },
  { value: 'divorced', label: 'Divorțat(ă) / Divorced' },
  { value: 'widowed', label: 'Văduv(ă) / Widowed' }
];

// Gender options
const genderOptions = [
  { value: 'male', label: 'Masculin / Male' },
  { value: 'female', label: 'Feminin / Female' }
];

// Document types for candidates
const documentTypes = [
  { type: 'cv', label: 'CV (fără date de contact)', required: true, accept: '.pdf,.doc,.docx', description: 'CV without contact information' },
  { type: 'diploma', label: 'Diplome / Certificate', required: false, accept: '.pdf,.jpg,.jpeg,.png', description: 'Education certificates', multiple: true },
  { type: 'video_presentation', label: 'Video prezentare candidat', required: false, accept: '.mp4,.mov,.avi', description: 'Video introduction (max 2 min)' },
  { type: 'passport', label: 'Copie pașaport', required: true, accept: '.pdf,.jpg,.jpeg,.png', description: 'Clear passport copy' },
  { type: 'criminal_record', label: 'Certificat cazier judiciar', required: true, accept: '.pdf,.jpg,.jpeg,.png', description: 'Criminal record certificate from your country' },
  { type: 'passport_photo', label: 'Fotografie tip pașaport', required: true, accept: '.jpg,.jpeg,.png', description: 'Passport-style photo' }
];

export default function CandidateProfileForm() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const fileInputRefs = useRef({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form data matching the new model
  const [formData, setFormData] = useState({
    // Section 1 - Personal Information
    first_name: '',
    last_name: '',
    country_of_origin: '',
    date_of_birth: '',
    gender: 'male',
    marital_status: 'single',
    religion: '',
    citizenship: '',
    
    // Section 2 - Family
    father_name: '',
    mother_name: '',
    spouse_name: '',
    children_count: 0,
    children_ages: [],
    
    // Section 3 - Professional Experience
    current_profession: '',
    target_position_cor: '',
    experience_years: 0,
    worked_abroad: false,
    countries_worked_in: [],
    languages_known: [],
    english_level: 'none',
    
    // Section 5 - Additional Information
    salary_expectation: '',
    existing_residence_permit: '',
    existing_residence_permit_country: '',
    
    // Contact
    phone: '',
    whatsapp: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/candidate/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          // Map profile data to form
          setFormData(prev => ({
            ...prev,
            first_name: data.profile.first_name || '',
            last_name: data.profile.last_name || '',
            country_of_origin: data.profile.country_of_origin || '',
            date_of_birth: data.profile.date_of_birth || '',
            gender: data.profile.gender || 'male',
            marital_status: data.profile.marital_status || 'single',
            religion: data.profile.religion || '',
            citizenship: data.profile.citizenship || '',
            father_name: data.profile.father_name || '',
            mother_name: data.profile.mother_name || '',
            spouse_name: data.profile.spouse_name || '',
            children_count: data.profile.children_count || 0,
            children_ages: data.profile.children_ages || [],
            current_profession: data.profile.current_profession || '',
            target_position_cor: data.profile.target_position_cor || '',
            experience_years: data.profile.experience_years || 0,
            worked_abroad: data.profile.worked_abroad || false,
            countries_worked_in: data.profile.countries_worked_in || [],
            languages_known: data.profile.languages_known || [],
            english_level: data.profile.english_level || 'none',
            salary_expectation: data.profile.salary_expectation || '',
            existing_residence_permit: data.profile.existing_residence_permit || '',
            existing_residence_permit_country: data.profile.existing_residence_permit_country || '',
            phone: data.profile.phone || '',
            whatsapp: data.profile.whatsapp || ''
          }));
        }
        if (data.documents) {
          setDocuments(data.documents);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleChildrenAgesChange = (value) => {
    const ages = value.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a));
    setFormData(prev => ({ ...prev, children_ages: ages }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/candidate/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast.success('Profilul a fost salvat cu succes!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la salvarea profilului');
      }
    } catch (error) {
      toast.error('Eroare la salvarea profilului');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (documentType, files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Fișierul este prea mare (max 50MB)');
      return;
    }
    
    setUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      
      const response = await fetch(`${API_URL}/api/portal/candidate/documents/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success('Document încărcat cu succes!');
        // Refresh profile and documents
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la încărcarea documentului');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Eroare la încărcarea documentului');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Sigur doriți să ștergeți acest document?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/portal/candidate/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Document șters');
        fetchProfile();
      } else {
        toast.error('Eroare la ștergerea documentului');
      }
    } catch (error) {
      toast.error('Eroare la ștergerea documentului');
    }
  };

  const handleSubmit = async () => {
    // First save the profile
    await handleSave();
    
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/candidate/profile/submit`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Profilul a fost trimis pentru validare!');
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la trimiterea profilului');
      }
    } catch (error) {
      toast.error('Eroare la trimiterea profilului');
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentsByType = (type) => {
    return documents.filter(d => d.document_type === type);
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;
    
    // Required personal fields
    const requiredPersonal = ['first_name', 'last_name', 'country_of_origin', 'citizenship', 'phone'];
    requiredPersonal.forEach(f => {
      total++;
      if (formData[f]) completed++;
    });
    
    // Required documents
    const requiredDocs = ['cv', 'passport', 'criminal_record', 'passport_photo'];
    requiredDocs.forEach(type => {
      total++;
      if (getDocumentsByType(type).length > 0) completed++;
    });
    
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  const isSubmitted = profile?.status === 'pending_validation';
  const isValidated = profile?.status === 'validated';
  const isRejected = profile?.status === 'rejected';
  const isEditable = !isSubmitted && !isValidated;

  return (
    <div className="space-y-6 max-w-5xl" data-testid="candidate-profile-form">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Profilul Meu</h1>
          <p className="text-gray-500">Completați toate secțiunile pentru a aplica la joburi</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.status && (
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              isValidated ? 'bg-green-100 text-green-700' :
              isSubmitted ? 'bg-yellow-100 text-yellow-700' :
              isRejected ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`} data-testid="profile-status">
              {isValidated && <CheckCircle className="h-4 w-4" />}
              {isSubmitted && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRejected && <AlertCircle className="h-4 w-4" />}
              {isValidated ? 'PROFIL VALIDAT' :
               isSubmitted ? 'ÎN AȘTEPTARE VALIDARE' :
               isRejected ? 'RESPINS' : 'DRAFT'}
            </div>
          )}
        </div>
      </div>

      {/* Completion Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progres completare profil</span>
            <span className="text-sm font-bold text-navy-600">{calculateCompletion()}%</span>
          </div>
          <Progress value={calculateCompletion()} className="h-2" />
        </CardContent>
      </Card>

      {/* Rejection Alert */}
      {isRejected && profile?.validation_notes && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Motiv respingere:</strong> {profile.validation_notes}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-gray-100 p-2 rounded-xl">
          <TabsTrigger value="personal" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Familie</span>
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Briefcase className="h-4 w-4" />
            <span className="hidden md:inline">Experiență</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Documente</span>
          </TabsTrigger>
          <TabsTrigger value="additional" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Adițional</span>
          </TabsTrigger>
        </TabsList>

        {/* SECTION 1 - Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          {/* Profile Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-navy-600" />
                Poză Profil *
              </CardTitle>
              <CardDescription>Încărcați o fotografie recentă de tip pașaport</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-200">
                  {profile?.profile_photo_url ? (
                    <img 
                      src={`${API_URL}${profile.profile_photo_url}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    id="profile-photo-upload"
                    onChange={(e) => handleFileUpload('profile_photo', e.target.files)}
                    disabled={!isEditable || uploading.profile_photo}
                  />
                  <label htmlFor="profile-photo-upload">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={!isEditable || uploading.profile_photo}
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        {uploading.profile_photo ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {profile?.profile_photo_url ? 'Schimbă poza' : 'Încarcă poza'}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, max 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-navy-600" />
                Informații Personale
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prenume *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Prenumele dvs."
                  data-testid="input-first-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Nume *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Numele de familie"
                  data-testid="input-last-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country_of_origin">Țara de Origine *</Label>
                <Select 
                  value={formData.country_of_origin} 
                  onValueChange={(v) => handleChange('country_of_origin', v)}
                  disabled={!isEditable}
                >
                  <SelectTrigger data-testid="select-country-origin">
                    <SelectValue placeholder="Selectați țara" />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesOfOrigin.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Data Nașterii *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  disabled={!isEditable}
                  data-testid="input-dob"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Sex *</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(v) => handleChange('gender', v)}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectați" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(g => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marital_status">Stare Civilă *</Label>
                <Select 
                  value={formData.marital_status} 
                  onValueChange={(v) => handleChange('marital_status', v)}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectați" />
                  </SelectTrigger>
                  <SelectContent>
                    {maritalStatuses.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="religion">Religie</Label>
                <Input
                  id="religion"
                  value={formData.religion}
                  onChange={(e) => handleChange('religion', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Opțional"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="citizenship">Cetățenie *</Label>
                <Select 
                  value={formData.citizenship} 
                  onValueChange={(v) => handleChange('citizenship', v)}
                  disabled={!isEditable}
                >
                  <SelectTrigger data-testid="select-citizenship">
                    <SelectValue placeholder="Selectați cetățenia" />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesOfOrigin.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditable}
                  placeholder="+977 123 456 789"
                  data-testid="input-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  disabled={!isEditable}
                  placeholder="+977 123 456 789"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 2 - Family */}
        <TabsContent value="family" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-navy-600" />
                Informații Familie
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="father_name">Nume Tată</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => handleChange('father_name', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Numele complet al tatălui"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mother_name">Nume Mamă</Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => handleChange('mother_name', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Numele complet al mamei"
                />
              </div>
              
              {formData.marital_status === 'married' && (
                <div className="space-y-2">
                  <Label htmlFor="spouse_name">Nume Soț / Soție</Label>
                  <Input
                    id="spouse_name"
                    value={formData.spouse_name}
                    onChange={(e) => handleChange('spouse_name', e.target.value)}
                    disabled={!isEditable}
                    placeholder="Numele complet"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="children_count">Număr Copii</Label>
                <Input
                  id="children_count"
                  type="number"
                  min="0"
                  max="20"
                  value={formData.children_count}
                  onChange={(e) => handleChange('children_count', parseInt(e.target.value) || 0)}
                  disabled={!isEditable}
                />
              </div>
              
              {formData.children_count > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="children_ages">Vârsta Copiilor</Label>
                  <Input
                    id="children_ages"
                    value={formData.children_ages.join(', ')}
                    onChange={(e) => handleChildrenAgesChange(e.target.value)}
                    disabled={!isEditable}
                    placeholder="Ex: 5, 8, 12 (separate cu virgulă)"
                  />
                  <p className="text-xs text-gray-500">Introduceți vârstele separate cu virgulă</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 3 - Professional Experience */}
        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-navy-600" />
                Experiență Profesională
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_profession">Profesie Actuală *</Label>
                <Input
                  id="current_profession"
                  value={formData.current_profession}
                  onChange={(e) => handleChange('current_profession', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ex: Sudor, Electrician, Bucătar"
                  data-testid="input-profession"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_position_cor">Postul Vizat (Cod COR România)</Label>
                <Input
                  id="target_position_cor"
                  value={formData.target_position_cor}
                  onChange={(e) => handleChange('target_position_cor', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ex: 721401 - Sudor"
                />
                <p className="text-xs text-gray-500">Codul de Clasificare a Ocupațiilor din România</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience_years">Ani Experiență</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => handleChange('experience_years', parseInt(e.target.value) || 0)}
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="english_level">Nivel Limba Engleză *</Label>
                <Select 
                  value={formData.english_level} 
                  onValueChange={(v) => handleChange('english_level', v)}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectați nivelul" />
                  </SelectTrigger>
                  <SelectContent>
                    {englishLevels.map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="worked_abroad"
                    checked={formData.worked_abroad}
                    onCheckedChange={(c) => handleChange('worked_abroad', c)}
                    disabled={!isEditable}
                  />
                  <label htmlFor="worked_abroad" className="font-medium">
                    Am lucrat în străinătate
                  </label>
                </div>
              </div>
              
              {formData.worked_abroad && (
                <div className="space-y-2 md:col-span-2">
                  <Label>În ce țări ați lucrat?</Label>
                  <div className="flex flex-wrap gap-2">
                    {['UAE', 'Qatar', 'Saudi Arabia', 'Malaysia', 'Singapore', 'South Korea', 'Japan', 'Italy', 'Spain', 'Germany', 'Other'].map(country => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={`country-${country}`}
                          checked={formData.countries_worked_in.includes(country)}
                          onCheckedChange={() => handleArrayToggle('countries_worked_in', country)}
                          disabled={!isEditable}
                        />
                        <label htmlFor={`country-${country}`} className="text-sm">{country}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 md:col-span-2">
                <Label>Limbi Străine Cunoscute</Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={formData.languages_known.includes(lang)}
                        onCheckedChange={() => handleArrayToggle('languages_known', lang)}
                        disabled={!isEditable}
                      />
                      <label htmlFor={`lang-${lang}`} className="text-sm">{lang}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 4 - Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Formate acceptate:</strong> PDF, JPG, PNG (max 50MB per fișier). 
              Video: MP4, MOV, AVI (max 50MB, recomandat sub 2 minute).
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {documentTypes.map((docType) => {
              const existingDocs = getDocumentsByType(docType.type);
              const isDocUploading = uploading[docType.type];
              
              return (
                <Card key={docType.type}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {docType.type === 'video_presentation' ? (
                            <Video className="h-4 w-4 text-navy-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-navy-600" />
                          )}
                          {docType.label}
                          {docType.required && <span className="text-red-500">*</span>}
                        </CardTitle>
                        <CardDescription>{docType.description}</CardDescription>
                      </div>
                      {existingDocs.length > 0 && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Existing documents */}
                    {existingDocs.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {existingDocs.map((doc) => (
                          <div 
                            key={doc.doc_id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {doc.original_filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(doc.file_size / 1024).toFixed(1)} KB • {doc.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {doc.status === 'verified' ? 'Verificat' :
                                 doc.status === 'rejected' ? 'Respins' : 'Încărcat'}
                              </span>
                              {isEditable && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteDocument(doc.doc_id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload area */}
                    {isEditable && (existingDocs.length === 0 || docType.multiple) && (
                      <div className="relative">
                        <input
                          type="file"
                          id={`file-${docType.type}`}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept={docType.accept}
                          onChange={(e) => handleFileUpload(docType.type, e.target.files)}
                          disabled={isDocUploading}
                        />
                        <div className={`
                          border-2 border-dashed rounded-lg p-4 text-center transition-colors
                          border-gray-200 hover:border-navy-300 hover:bg-navy-50
                          ${isDocUploading ? 'opacity-50' : ''}
                        `}>
                          {isDocUploading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin text-navy-600" />
                              <span className="text-sm text-gray-600">Se încarcă...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                <span className="font-medium text-navy-600">Click pentru upload</span> sau drag & drop
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* SECTION 5 - Additional Information */}
        <TabsContent value="additional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-navy-600" />
                Informații Suplimentare
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_expectation">Salariul Solicitat (EUR/lună)</Label>
                <Input
                  id="salary_expectation"
                  value={formData.salary_expectation}
                  onChange={(e) => handleChange('salary_expectation', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ex: 1500-2000 EUR"
                />
                <p className="text-xs text-gray-500">Opțional - salariul net dorit</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="existing_residence_permit">Permis de Ședere Existent</Label>
                <Input
                  id="existing_residence_permit"
                  value={formData.existing_residence_permit}
                  onChange={(e) => handleChange('existing_residence_permit', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ex: Permis de ședere în Italia"
                />
              </div>
              
              {formData.existing_residence_permit && (
                <div className="space-y-2">
                  <Label htmlFor="existing_residence_permit_country">Țara Permisului</Label>
                  <Input
                    id="existing_residence_permit_country"
                    value={formData.existing_residence_permit_country}
                    onChange={(e) => handleChange('existing_residence_permit_country', e.target.value)}
                    disabled={!isEditable}
                    placeholder="Ex: Italia, Spania"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-lg">
        {isEditable && (
          <>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || submitting}
              data-testid="btn-save-draft"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvează Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || submitting || calculateCompletion() < 80}
              className="bg-green-600 hover:bg-green-700"
              data-testid="btn-submit-validation"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Trimite pentru Validare
            </Button>
          </>
        )}
      </div>

      {/* Validated Success Message */}
      {isValidated && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Felicitări!</strong> Profilul dvs. a fost validat. Acum puteți fi potrivit cu oportunități de muncă în România.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
