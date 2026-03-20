import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, Save, Send, Building2, FileCheck, CheckCircle, 
  AlertCircle, Upload, User, FileText, Plus, X, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

const industries = [
  'Construcții / Construction',
  'Producție / Manufacturing',
  'HoReCa (Hoteluri, Restaurante, Catering)',
  'Agricultură / Agriculture',
  'Transport / Transportation',
  'Logistică / Logistics',
  'Curățenie / Cleaning Services',
  'Securitate / Security',
  'IT & Tehnologie',
  'Retail / Comerț',
  'Sănătate / Healthcare',
  'Altele / Other'
];

const countries = [
  { value: 'RO', label: 'România' },
  { value: 'AT', label: 'Austria' },
  { value: 'RS', label: 'Serbia' }
];

// Document types for employers
const employerDocumentTypes = [
  { type: 'cui_certificate', label: 'Certificat CUI', required: true, description: 'Certificat de înregistrare fiscală' },
  { type: 'administrator_id', label: 'Carte Identitate Administrator', required: true, description: 'CI/Pașaport administrator/asociat unic' },
  { type: 'company_criminal_record', label: 'Cazier Judiciar Persoană Juridică', required: true, description: 'Cazier fiscal al companiei' }
];

export default function EmployerProfileForm() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState({});
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('company');
  
  const [formData, setFormData] = useState({
    // Company Information
    company_name: '',
    company_cui: '',
    company_j_number: '',
    address: '',
    phone: '',
    email: '',
    administrator_name: '',
    country: 'RO',
    city: '',
    industry: '',
    employees_count: 0,
    year_founded: '',
    website: '',
    
    // Contact person
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    
    // IGI Eligibility (Romania only)
    has_no_debts: false,
    has_no_sanctions: false,
    has_min_employees: false,
    company_age_over_1_year: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          setFormData({
            company_name: data.profile.company_name || '',
            company_cui: data.profile.company_cui || '',
            company_j_number: data.profile.company_j_number || '',
            address: data.profile.address || '',
            phone: data.profile.phone || '',
            email: data.profile.email || user?.email || '',
            administrator_name: data.profile.administrator_name || '',
            country: data.profile.country || 'RO',
            city: data.profile.city || '',
            industry: data.profile.industry || '',
            employees_count: data.profile.employees_count || 0,
            year_founded: data.profile.year_founded || '',
            website: data.profile.website || '',
            contact_person: data.profile.contact_person || user?.name || '',
            contact_email: data.profile.contact_email || user?.email || '',
            contact_phone: data.profile.contact_phone || '',
            has_no_debts: data.profile.has_no_debts || false,
            has_no_sanctions: data.profile.has_no_sanctions || false,
            has_min_employees: data.profile.has_min_employees || false,
            company_age_over_1_year: data.profile.company_age_over_1_year || false
          });
        } else {
          setFormData(prev => ({
            ...prev,
            contact_person: user?.name || '',
            contact_email: user?.email || '',
            email: user?.email || ''
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast.success('Profilul companiei a fost salvat!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la salvare');
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
    
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Fișierul este prea mare (max 50MB)');
      return;
    }
    
    setUploading(prev => ({ ...prev, [documentType]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      
      const response = await fetch(`${API_URL}/api/portal/employer/documents/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        toast.success('Document încărcat cu succes!');
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la încărcare');
      }
    } catch (error) {
      toast.error('Eroare la încărcarea documentului');
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Sigur doriți să ștergeți acest document?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/documents/${docId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        toast.success('Document șters');
        fetchProfile();
      } else {
        toast.error('Eroare la ștergere');
      }
    } catch (error) {
      toast.error('Eroare la ștergerea documentului');
    }
  };

  const handleSubmit = async () => {
    await handleSave();
    
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/portal/employer/profile/submit`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Profilul a fost trimis pentru validare!');
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la trimitere');
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
    
    // Required fields
    const requiredFields = ['company_name', 'company_cui', 'address', 'administrator_name', 'phone', 'email'];
    requiredFields.forEach(f => {
      total++;
      if (formData[f]) completed++;
    });
    
    // IGI checks for Romania
    if (formData.country === 'RO') {
      const igiChecks = ['has_no_debts', 'has_no_sanctions', 'has_min_employees', 'company_age_over_1_year'];
      igiChecks.forEach(c => {
        total++;
        if (formData[c]) completed++;
      });
    }
    
    // Required documents
    employerDocumentTypes.filter(d => d.required).forEach(docType => {
      total++;
      if (getDocumentsByType(docType.type).length > 0) completed++;
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
    <div className="space-y-6 max-w-5xl" data-testid="employer-profile-form">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Profil Companie</h1>
          <p className="text-gray-500">Completați profilul pentru a începe recrutarea</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.status && (
            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
              isValidated ? 'bg-green-100 text-green-700' :
              isSubmitted ? 'bg-yellow-100 text-yellow-700' :
              isRejected ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`} data-testid="employer-profile-status">
              {isValidated && <CheckCircle className="h-4 w-4" />}
              {isSubmitted && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRejected && <AlertCircle className="h-4 w-4" />}
              {isValidated ? 'COMPANIE VALIDATĂ' :
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-gray-100 p-2 rounded-xl">
          <TabsTrigger value="company" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <Building2 className="h-4 w-4" />
            <span className="hidden md:inline">Companie</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Documente</span>
          </TabsTrigger>
          {formData.country === 'RO' && (
            <TabsTrigger value="eligibility" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
              <FileCheck className="h-4 w-4" />
              <span className="hidden md:inline">Eligibilitate IGI</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-navy-600" />
                Date Companie
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Denumire Companie *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  disabled={!isEditable}
                  placeholder="S.C. Exemplu S.R.L."
                  data-testid="input-company-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_cui">CUI *</Label>
                <Input
                  id="company_cui"
                  value={formData.company_cui}
                  onChange={(e) => handleChange('company_cui', e.target.value)}
                  disabled={!isEditable}
                  placeholder="RO12345678"
                  data-testid="input-cui"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_j_number">Nr. Registrul Comerțului</Label>
                <Input
                  id="company_j_number"
                  value={formData.company_j_number}
                  onChange={(e) => handleChange('company_j_number', e.target.value)}
                  disabled={!isEditable}
                  placeholder="J40/1234/2020"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="administrator_name">Nume Administrator *</Label>
                <Input
                  id="administrator_name"
                  value={formData.administrator_name}
                  onChange={(e) => handleChange('administrator_name', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Ion Popescu"
                  data-testid="input-administrator"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adresă Sediu *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditable}
                  placeholder="Str. Exemplu nr. 1, Sector 1, București"
                  data-testid="input-address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Țara *</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(v) => handleChange('country', v)}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectați țara" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Oraș *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditable}
                  placeholder="București"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditable}
                  placeholder="+40 21 123 4567"
                  data-testid="input-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditable}
                  placeholder="office@companie.ro"
                  data-testid="input-email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Domeniu Activitate *</Label>
                <Select 
                  value={formData.industry} 
                  onValueChange={(v) => handleChange('industry', v)}
                  disabled={!isEditable}
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
                <Label htmlFor="employees_count">Număr Angajați</Label>
                <Input
                  id="employees_count"
                  type="number"
                  min="0"
                  value={formData.employees_count}
                  onChange={(e) => handleChange('employees_count', parseInt(e.target.value) || 0)}
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year_founded">Anul Înființării</Label>
                <Input
                  id="year_founded"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.year_founded}
                  onChange={(e) => handleChange('year_founded', e.target.value)}
                  disabled={!isEditable}
                  placeholder="2020"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  disabled={!isEditable}
                  placeholder="https://www.companie.ro"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Person Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-navy-600" />
                Persoană de Contact
              </CardTitle>
              <CardDescription>
                Persoana responsabilă de comunicarea cu agenția GJC
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Nume Complet</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefon</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  disabled={!isEditable}
                  placeholder="+40 712 345 678"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Documente obligatorii:</strong> Certificat CUI, Carte identitate administrator, 
              Cazier judiciar persoană juridică. Formate: PDF, JPG, PNG (max 50MB).
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {employerDocumentTypes.map((docType) => {
              const existingDocs = getDocumentsByType(docType.type);
              const isDocUploading = uploading[docType.type];
              
              return (
                <Card key={docType.type}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-navy-600" />
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
                                  {(doc.file_size / 1024).toFixed(1)} KB
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
                    {isEditable && existingDocs.length === 0 && (
                      <div className="relative">
                        <input
                          type="file"
                          id={`file-${docType.type}`}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pdf,.jpg,.jpeg,.png"
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

        {/* IGI Eligibility Tab (Romania only) */}
        {formData.country === 'RO' && (
          <TabsContent value="eligibility" className="space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                  Cerințe Eligibilitate IGI (România)
                </CardTitle>
                <CardDescription>
                  Pentru a recruta muncitori non-UE în România, compania dvs. trebuie să îndeplinească 
                  următoarele condiții legale conform legislației IGI (Inspectoratul General pentru Imigrări).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
                  <Checkbox
                    id="has_no_debts"
                    checked={formData.has_no_debts}
                    onCheckedChange={(c) => handleChange('has_no_debts', c)}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="has_no_debts" className="font-medium text-gray-900 cursor-pointer">
                      Fără Datorii la Buget
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Compania nu are obligații fiscale restante la ANAF (certificate fiscale la zi)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
                  <Checkbox
                    id="has_no_sanctions"
                    checked={formData.has_no_sanctions}
                    onCheckedChange={(c) => handleChange('has_no_sanctions', c)}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="has_no_sanctions" className="font-medium text-gray-900 cursor-pointer">
                      Fără Sancțiuni Legale
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Compania nu a primit sancțiuni pentru angajare ilegală în ultimii 3 ani 
                      (ANAF / ITM / AJOFM / IGI)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
                  <Checkbox
                    id="has_min_employees"
                    checked={formData.has_min_employees}
                    onCheckedChange={(c) => handleChange('has_min_employees', c)}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="has_min_employees" className="font-medium text-gray-900 cursor-pointer">
                      Minimum 2 Angajați Activi
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Compania are cel puțin 2 angajați cu contracte de muncă active
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg">
                  <Checkbox
                    id="company_age_over_1_year"
                    checked={formData.company_age_over_1_year}
                    onCheckedChange={(c) => handleChange('company_age_over_1_year', c)}
                    disabled={!isEditable}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="company_age_over_1_year" className="font-medium text-gray-900 cursor-pointer">
                      Vechime Companie Peste 1 An
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Compania este activă de mai mult de 1 an de la înregistrare
                    </p>
                  </div>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    <strong>Important:</strong> Toate condițiile de mai sus trebuie îndeplinite 
                    pentru a putea obține aviz de muncă de la IGI pentru angajarea muncitorilor non-UE.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-lg">
        {isEditable && (
          <>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || submitting}
              data-testid="btn-save-employer"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvează Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || submitting || calculateCompletion() < 80}
              className="bg-green-600 hover:bg-green-700"
              data-testid="btn-submit-employer"
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
            <strong>Compania dvs. a fost validată!</strong> Acum puteți crea cereri de personal 
            și începe procesul de recrutare.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
