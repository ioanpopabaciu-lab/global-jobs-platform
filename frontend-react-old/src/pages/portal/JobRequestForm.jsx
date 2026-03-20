import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, Save, ArrowLeft, Briefcase, Users, MapPin, 
  DollarSign, Languages, Calendar, AlertCircle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Countries for nationality preference
const countries = [
  'Nepal', 'India', 'Bangladesh', 'Pakistan', 'Sri Lanka',
  'Philippines', 'Indonesia', 'Vietnam', 'Thailand', 'Cambodia',
  'Ethiopia', 'Kenya', 'Nigeria', 'Other'
];

// Languages
const languages = [
  'Engleză', 'Română', 'Germană', 'Franceză', 'Spaniolă', 
  'Italiană', 'Arabă', 'Hindi', 'Nepaleză', 'Altele'
];

// English levels
const englishLevels = [
  { value: 'none', label: 'Nu este necesar' },
  { value: 'basic', label: 'Bază (A1-A2)' },
  { value: 'intermediate', label: 'Intermediar (B1-B2)' },
  { value: 'advanced', label: 'Avansat (C1-C2)' }
];

// Contract types
const contractTypes = [
  { value: 'permanent', label: 'Permanent / Nedeterminat' },
  { value: 'seasonal', label: 'Sezonier' },
  { value: 'detached', label: 'Detașare' }
];

// Industries
const industries = [
  'Construcții',
  'Producție / Manufacturing',
  'HoReCa',
  'Agricultură',
  'Transport',
  'Logistică',
  'Curățenie',
  'Securitate',
  'IT & Tech',
  'Retail',
  'Sănătate',
  'Altele'
];

export default function JobRequestForm() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditing = !!jobId;
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [profileValidated, setProfileValidated] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    cor_code: '',
    description: '',
    positions_count: 1,
    industry: '',
    work_location: '',
    
    // Requirements
    required_experience_years: 0,
    preferred_gender: 'any',
    age_range_min: '',
    age_range_max: '',
    preferred_nationalities: [],
    required_languages: [],
    required_language_level: '',
    required_english_level: 'none',
    required_skills: [],
    
    // Conditions
    salary_gross: '',
    contract_type: 'permanent',
    contract_duration_months: '',
    accommodation_provided: false,
    meals_provided: false,
    transport_provided: false
  });

  useEffect(() => {
    checkProfileStatus();
    if (isEditing) {
      fetchJob();
    }
  }, [jobId]);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfileValidated(data.profile?.status === 'validated');
      }
    } catch (error) {
      console.error('Failed to check profile status:', error);
    }
  };

  const fetchJob = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/jobs/${jobId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.job) {
          setFormData({
            title: data.job.title || '',
            cor_code: data.job.cor_code || '',
            description: data.job.description || '',
            positions_count: data.job.positions_count || 1,
            industry: data.job.industry || '',
            work_location: data.job.work_location || '',
            required_experience_years: data.job.required_experience_years || 0,
            preferred_gender: data.job.preferred_gender || 'any',
            age_range_min: data.job.age_range_min || '',
            age_range_max: data.job.age_range_max || '',
            preferred_nationalities: data.job.preferred_nationalities || [],
            required_languages: data.job.required_languages || [],
            required_language_level: data.job.required_language_level || '',
            required_english_level: data.job.required_english_level || 'none',
            required_skills: data.job.required_skills || [],
            salary_gross: data.job.salary_gross || '',
            contract_type: data.job.contract_type || 'permanent',
            contract_duration_months: data.job.contract_duration_months || '',
            accommodation_provided: data.job.accommodation_provided || false,
            meals_provided: data.job.meals_provided || false,
            transport_provided: data.job.transport_provided || false
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Eroare la încărcarea jobului');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Titlul poziției este obligatoriu');
      return;
    }
    
    setSaving(true);
    
    try {
      const url = isEditing 
        ? `${API_URL}/api/portal/employer/jobs/${jobId}`
        : `${API_URL}/api/portal/employer/jobs`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          age_range_min: formData.age_range_min ? parseInt(formData.age_range_min) : null,
          age_range_max: formData.age_range_max ? parseInt(formData.age_range_max) : null,
          contract_duration_months: formData.contract_duration_months ? parseInt(formData.contract_duration_months) : null
        })
      });

      if (response.ok) {
        toast.success(isEditing ? 'Poziție actualizată!' : 'Poziție creată cu succes!');
        navigate('/portal/employer/jobs');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la salvare');
      }
    } catch (error) {
      toast.error('Eroare la salvarea poziției');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  if (!profileValidated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profilul companiei trebuie să fie validat înainte de a putea crea cereri de personal.
            <Button 
              variant="link" 
              className="pl-1" 
              onClick={() => navigate('/portal/employer/profile')}
            >
              Completează profilul
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="job-request-form">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/portal/employer/jobs')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {isEditing ? 'Editează Poziția' : 'Creează Poziție Nouă'}
          </h1>
          <p className="text-gray-500">
            {isEditing ? 'Actualizați detaliile poziției' : 'Completați cerințele pentru poziția nouă'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-navy-600" />
              Informații Poziție
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Titlu Poziție *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Sudor, Fierar Betonist, Bucătar"
                data-testid="input-job-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cor_code">Cod COR</Label>
              <Input
                id="cor_code"
                value={formData.cor_code}
                onChange={(e) => handleChange('cor_code', e.target.value)}
                placeholder="Ex: 721401"
              />
              <p className="text-xs text-gray-500">Codul de Clasificare a Ocupațiilor din România</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="positions_count">Număr Poziții *</Label>
              <Input
                id="positions_count"
                type="number"
                min="1"
                value={formData.positions_count}
                onChange={(e) => handleChange('positions_count', parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Domeniu Activitate *</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(v) => handleChange('industry', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectați domeniul" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work_location">Locație Muncă *</Label>
              <Input
                id="work_location"
                value={formData.work_location}
                onChange={(e) => handleChange('work_location', e.target.value)}
                placeholder="Ex: București, Sector 3"
                data-testid="input-work-location"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descriere Poziție</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrieți responsabilitățile și cerințele poziției..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-navy-600" />
              Cerințe Candidat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="required_experience_years">Experiență (ani)</Label>
                <Input
                  id="required_experience_years"
                  type="number"
                  min="0"
                  value={formData.required_experience_years}
                  onChange={(e) => handleChange('required_experience_years', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred_gender">Gen Preferat</Label>
                <Select 
                  value={formData.preferred_gender} 
                  onValueChange={(v) => handleChange('preferred_gender', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Indiferent</SelectItem>
                    <SelectItem value="male">Masculin</SelectItem>
                    <SelectItem value="female">Feminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="required_english_level">Nivel Engleză</Label>
                <Select 
                  value={formData.required_english_level} 
                  onValueChange={(v) => handleChange('required_english_level', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {englishLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interval Vârstă</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="18"
                    max="65"
                    placeholder="Min"
                    value={formData.age_range_min}
                    onChange={(e) => handleChange('age_range_min', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="number"
                    min="18"
                    max="65"
                    placeholder="Max"
                    value={formData.age_range_max}
                    onChange={(e) => handleChange('age_range_max', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">ani</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Naționalități Preferate</Label>
              <div className="flex flex-wrap gap-2">
                {countries.map(country => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nat-${country}`}
                      checked={formData.preferred_nationalities.includes(country)}
                      onCheckedChange={() => handleArrayToggle('preferred_nationalities', country)}
                    />
                    <label htmlFor={`nat-${country}`} className="text-sm cursor-pointer">{country}</label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Lăsați necompletat pentru a accepta orice naționalitate</p>
            </div>
            
            <div className="space-y-3">
              <Label>Limbi Străine Necesare</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map(lang => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang}`}
                      checked={formData.required_languages.includes(lang)}
                      onCheckedChange={() => handleArrayToggle('required_languages', lang)}
                    />
                    <label htmlFor={`lang-${lang}`} className="text-sm cursor-pointer">{lang}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-navy-600" />
              Condiții de Muncă
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_gross">Salariu Brut (EUR/lună)</Label>
                <Input
                  id="salary_gross"
                  value={formData.salary_gross}
                  onChange={(e) => handleChange('salary_gross', e.target.value)}
                  placeholder="Ex: 800-1200 EUR"
                  data-testid="input-salary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contract_type">Tip Contract</Label>
                <Select 
                  value={formData.contract_type} 
                  onValueChange={(v) => handleChange('contract_type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.contract_type !== 'permanent' && (
                <div className="space-y-2">
                  <Label htmlFor="contract_duration_months">Durată Contract (luni)</Label>
                  <Input
                    id="contract_duration_months"
                    type="number"
                    min="1"
                    value={formData.contract_duration_months}
                    onChange={(e) => handleChange('contract_duration_months', e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <Label>Beneficii Oferite</Label>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Cazare Asigurată</p>
                  <p className="text-sm text-gray-500">Angajatorul oferă cazare pentru muncitori</p>
                </div>
                <Switch
                  checked={formData.accommodation_provided}
                  onCheckedChange={(c) => handleChange('accommodation_provided', c)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Masă Asigurată</p>
                  <p className="text-sm text-gray-500">Angajatorul oferă masă sau tichete de masă</p>
                </div>
                <Switch
                  checked={formData.meals_provided}
                  onCheckedChange={(c) => handleChange('meals_provided', c)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Transport Asigurat</p>
                  <p className="text-sm text-gray-500">Angajatorul oferă transport sau decontare</p>
                </div>
                <Switch
                  checked={formData.transport_provided}
                  onCheckedChange={(c) => handleChange('transport_provided', c)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/portal/employer/jobs')}
          >
            Anulează
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-navy-600 hover:bg-navy-700"
            data-testid="btn-save-job"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditing ? 'Salvează Modificările' : 'Creează Poziția'}
          </Button>
        </div>
      </form>
    </div>
  );
}
