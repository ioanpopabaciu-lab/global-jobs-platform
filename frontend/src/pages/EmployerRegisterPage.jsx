import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Building2, Search, CheckCircle2, XCircle, AlertTriangle,
  ArrowLeft, ArrowRight, User, Phone, Mail, Briefcase, Users,
  MapPin, Calendar, FileText, Factory, Check, X, Info
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Recruitment industries
const RECRUITMENT_INDUSTRIES = [
  { id: "construction", label: "Construcții", icon: Building2 },
  { id: "horeca", label: "HoReCa (Hoteluri, Restaurante)", icon: Building2 },
  { id: "manufacturing", label: "Producție / Fabricație", icon: Factory },
  { id: "agriculture", label: "Agricultură", icon: Building2 },
  { id: "logistics", label: "Transport și Logistică", icon: Building2 },
  { id: "cleaning", label: "Curățenie și Întreținere", icon: Building2 },
  { id: "healthcare", label: "Asistență Medicală / Socială", icon: Building2 },
  { id: "retail", label: "Retail / Comerț", icon: Building2 },
  { id: "other", label: "Altele", icon: Building2 },
];

export default function EmployerRegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: CUI input
  const [cui, setCui] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  
  // Step 2-3: Company data from registry
  const [companyData, setCompanyData] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  
  // Step 5: Contact info
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [employeesCount, setEmployeesCount] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Final submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 1: Lookup company by CUI
  const handleCUILookup = async () => {
    if (!cui.trim()) {
      setLookupError('Vă rugăm să introduceți CUI-ul companiei');
      return;
    }
    
    setLookupLoading(true);
    setLookupError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/lookup-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui: cui.trim() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCompanyData(data.company);
        setEligibility(data.eligibility);
        setCurrentStep(2);
      } else {
        setLookupError(data.error || 'Nu am putut găsi compania. Verificați CUI-ul introdus.');
      }
    } catch (error) {
      setLookupError('Eroare la căutarea companiei. Vă rugăm să încercați din nou.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Toggle industry selection
  const toggleIndustry = (industryId) => {
    setSelectedIndustries(prev => 
      prev.includes(industryId)
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    );
  };

  // Final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    // Validation
    if (!contactName || !contactPhone || !contactEmail || !password) {
      setSubmitError('Vă rugăm să completați toate câmpurile obligatorii');
      return;
    }
    
    if (password !== confirmPassword) {
      setSubmitError('Parolele nu coincid');
      return;
    }
    
    if (password.length < 6) {
      setSubmitError('Parola trebuie să aibă minim 6 caractere');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register/employer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: contactEmail,
          password: password,
          cui: companyData.cui,
          company_name: companyData.denumire,
          company_address: companyData.adresa,
          numar_reg_com: companyData.numar_reg_com,
          cod_caen: companyData.cod_caen,
          denumire_caen: companyData.denumire_caen,
          is_vat_payer: companyData.is_vat_payer,
          data_infiintare: companyData.data_infiintare,
          contact_name: contactName,
          contact_position: contactPosition,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          employees_count: parseInt(employeesCount) || 0,
          recruitment_industries: selectedIndustries
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Cont creat cu succes!');
        // Login the user
        if (data.user) {
          login(data.user, data.access_token);
        }
        navigate('/portal/employer');
      } else {
        setSubmitError(data.detail || 'Eroare la crearea contului');
      }
    } catch (error) {
      setSubmitError('Eroare la procesarea cererii');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Step 1: CUI Input
  const renderStep1 = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Înregistrare Angajator</CardTitle>
        <CardDescription>
          Introduceți CUI-ul companiei pentru a prelua automat datele
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cui" className="text-base font-medium">
            CUI-ul Companiei
          </Label>
          <div className="relative">
            <Input
              id="cui"
              value={cui}
              onChange={(e) => setCui(e.target.value)}
              placeholder="Ex: RO12345678 sau 12345678"
              className="text-lg h-14 pr-12"
              onKeyPress={(e) => e.key === 'Enter' && handleCUILookup()}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Introduceți codul unic de identificare fiscală cu sau fără prefixul "RO"
          </p>
        </div>
        
        {lookupError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{lookupError}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleCUILookup} 
          className="w-full h-12 text-lg"
          disabled={lookupLoading}
        >
          {lookupLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Se caută compania...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Caută Compania
            </>
          )}
        </Button>
        
        <div className="text-center pt-4 border-t">
          <Link 
            to="/login" 
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la autentificare
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  // Render Step 2-3: Company Data Display
  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className={`${eligibility?.is_eligible ? 'bg-green-50' : 'bg-red-50'} rounded-t-lg`}>
        <div className="flex items-center gap-3">
          {eligibility?.is_eligible ? (
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          ) : (
            <XCircle className="h-8 w-8 text-red-600" />
          )}
          <div>
            <CardTitle className={eligibility?.is_eligible ? 'text-green-800' : 'text-red-800'}>
              {eligibility?.is_eligible ? 'Companie găsită — verificați datele' : 'Companie ineligibilă'}
            </CardTitle>
            <CardDescription className={eligibility?.is_eligible ? 'text-green-600' : 'text-red-600'}>
              {eligibility?.is_eligible 
                ? 'Datele au fost identificate automat în registre publice oficiale securizate.'
                : 'Această companie nu îndeplinește criteriile de eligibilitate'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Company Details */}
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Denumire Companie</Label>
              <p className="font-medium text-lg">{companyData?.denumire}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <Label className="text-xs text-gray-500">CUI</Label>
                <p className="font-medium font-mono">{companyData?.cui}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <Label className="text-xs text-gray-500">Nr. Registru Comerțului</Label>
                <p className="font-medium">{companyData?.numar_reg_com || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Adresa Sediu Social</Label>
              <p className="font-medium">{companyData?.adresa}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <Label className="text-xs text-gray-500">Cod CAEN</Label>
                <p className="font-medium">{companyData?.cod_caen}</p>
                <p className="text-sm text-gray-500">{companyData?.denumire_caen}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <Label className="text-xs text-gray-500">Data Înființării</Label>
                <p className="font-medium">{companyData?.data_infiintare || 'N/A'}</p>
                <p className="text-sm text-gray-500">Vechime: {companyData?.company_age_years} ani</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              {companyData?.is_active ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <Label className="text-xs text-gray-500">Stare Firmă</Label>
                <Badge className={companyData?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {companyData?.stare}
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <Label className="text-xs text-gray-500">Plătitor TVA</Label>
                <Badge variant="outline">
                  {companyData?.is_vat_payer ? 'Da' : 'Nu'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Eligibility Check */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Verificare Eligibilitate IGI
          </h3>
          <div className="space-y-3">
            {eligibility?.reasons?.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                {reason.passed === true ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : reason.passed === false ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Info className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="font-medium">{reason.check}</p>
                  <p className="text-sm text-gray-500">{reason.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Ineligible Company Message */}
        {!eligibility?.is_eligible && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Companie ineligibilă</AlertTitle>
            <AlertDescription>
              Această companie nu este activă sau nu îndeplinește criteriile de eligibilitate 
              și nu poate utiliza platforma GJC pentru recrutare internațională.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Eligible Company Message */}
        {eligibility?.is_eligible && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Companie eligibilă</AlertTitle>
            <AlertDescription className="text-green-700">
              Compania dvs. este eligibilă pentru recrutare internațională. 
              Puteți continua cu înregistrarea.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(1)}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Caută altă companie
          </Button>
          
          {eligibility?.is_eligible ? (
            <Button 
              onClick={() => setCurrentStep(3)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Datele sunt corecte — Continuă
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="flex-1"
            >
              Contactează-ne
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render Step 3: Contact Information
  const renderStep3 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Informații Contact</CardTitle>
            <CardDescription>
              Completați datele persoanei de contact și configurați contul
            </CardDescription>
          </div>
        </div>
        
        {/* Company Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
          <Building2 className="h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium">{companyData?.denumire}</p>
            <p className="text-sm text-gray-500">CUI: {companyData?.cui}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Person */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Persoană de Contact
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nume și Prenume *</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Ion Popescu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPosition">Funcția în Companie</Label>
                <Input
                  id="contactPosition"
                  value={contactPosition}
                  onChange={(e) => setContactPosition(e.target.value)}
                  placeholder="Ex: Director HR"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon Direct *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ex: 0721 123 456"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Contact *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Ex: contact@companie.ro"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Company Additional Info */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informații Recrutare
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="employeesCount">Număr Angajați Actuali</Label>
              <Input
                id="employeesCount"
                type="number"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                placeholder="Ex: 50"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Domeniile în care recrutați</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {RECRUITMENT_INDUSTRIES.map((industry) => (
                  <div
                    key={industry.id}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                      ${selectedIndustries.includes(industry.id) 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50'}
                    `}
                    onClick={() => toggleIndustry(industry.id)}
                  >
                    <Checkbox 
                      checked={selectedIndustries.includes(industry.id)}
                      onCheckedChange={() => toggleIndustry(industry.id)}
                    />
                    <span className="text-sm">{industry.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Account Credentials */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Credențiale Cont
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Parolă *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minim 6 caractere"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmă Parola *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetă parola"
                  required
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Adresa de email folosită pentru cont: <strong>{contactEmail || '(completați email-ul de contact)'}</strong>
            </p>
          </div>
          
          {submitError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setCurrentStep(2)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se creează contul...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizează Înregistrarea
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-medium
                ${currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'}
              `}>
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500 px-4">
          <span>Căutare CUI</span>
          <span>Verificare Date</span>
          <span>Finalizare</span>
        </div>
      </div>
      
      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </div>
  );
}
