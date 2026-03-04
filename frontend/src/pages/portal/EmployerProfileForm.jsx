import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Send, Building2, FileCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const industries = [
  'Construction', 'Manufacturing', 'HoReCa (Hotels, Restaurants, Catering)', 
  'Agriculture', 'Transportation', 'Healthcare', 'IT & Technology', 
  'Retail', 'Cleaning Services', 'Security', 'Logistics', 'Other'
];

const countries = [
  { value: 'RO', label: 'Romania' },
  { value: 'AT', label: 'Austria' },
  { value: 'RS', label: 'Serbia' }
];

export default function EmployerProfileForm() {
  const { user } = useOutletContext();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_cui: '',
    company_j_number: '',
    country: 'RO',
    city: '',
    address: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    industry: '',
    employees_count: 0,
    year_founded: '',
    website: '',
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
            country: data.profile.country || 'RO',
            city: data.profile.city || '',
            address: data.profile.address || '',
            contact_person: data.profile.contact_person || user?.name || '',
            contact_email: data.profile.contact_email || user?.email || '',
            contact_phone: data.profile.contact_phone || '',
            industry: data.profile.industry || '',
            employees_count: data.profile.employees_count || 0,
            year_founded: data.profile.year_founded || '',
            website: data.profile.website || '',
            has_no_debts: data.profile.has_no_debts || false,
            has_no_sanctions: data.profile.has_no_sanctions || false,
            has_min_employees: data.profile.has_min_employees || false,
            company_age_over_1_year: data.profile.company_age_over_1_year || false
          });
        } else {
          setFormData(prev => ({
            ...prev,
            contact_person: user?.name || '',
            contact_email: user?.email || ''
          }));
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
        toast.success('Company profile saved!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save profile');
      }
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const required = ['company_name', 'company_cui', 'country', 'city', 'address', 
                      'contact_person', 'contact_email', 'contact_phone', 'industry'];
    const missing = required.filter(f => !formData[f]);
    
    if (missing.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check IGI eligibility for Romania
    if (formData.country === 'RO') {
      const igiChecks = ['has_no_debts', 'has_no_sanctions', 'has_min_employees', 'company_age_over_1_year'];
      const unchecked = igiChecks.filter(c => !formData[c]);
      if (unchecked.length > 0) {
        toast.error('Please confirm all IGI eligibility requirements');
        return;
      }
    }

    setSubmitting(true);
    try {
      await handleSave();
      
      const response = await fetch(`${API_URL}/api/portal/employer/profile/submit`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Company profile submitted for validation!');
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit profile');
      }
    } catch (error) {
      toast.error('Failed to submit profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  const isSubmitted = profile?.status === 'pending_validation' || profile?.status === 'validated';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-500">Complete your company profile to start recruiting</p>
        </div>
        {profile?.status && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            profile.status === 'validated' ? 'bg-green-100 text-green-700' :
            profile.status === 'pending_validation' ? 'bg-yellow-100 text-yellow-700' :
            profile.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {profile.status === 'validated' ? '✓ Validated' :
             profile.status === 'pending_validation' ? '⏳ Pending Validation' :
             profile.status === 'rejected' ? '✗ Rejected' : 'Draft'}
          </div>
        )}
      </div>

      {profile?.status === 'rejected' && profile.validation_notes && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Rejection reason:</strong> {profile.validation_notes}
          </AlertDescription>
        </Alert>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-navy-600" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              disabled={isSubmitted}
              placeholder="Company S.R.L."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_cui">CUI/Tax ID *</Label>
            <Input
              id="company_cui"
              value={formData.company_cui}
              onChange={(e) => handleChange('company_cui', e.target.value)}
              disabled={isSubmitted}
              placeholder="RO12345678"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_j_number">J Number (Registry)</Label>
            <Input
              id="company_j_number"
              value={formData.company_j_number}
              onChange={(e) => handleChange('company_j_number', e.target.value)}
              disabled={isSubmitted}
              placeholder="J40/1234/2020"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select 
              value={formData.country} 
              onValueChange={(v) => handleChange('country', v)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={isSubmitted}
              placeholder="Bucharest"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={isSubmitted}
              placeholder="Street, Number, Building"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select 
              value={formData.industry} 
              onValueChange={(v) => handleChange('industry', v)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(ind => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employees_count">Number of Employees</Label>
            <Input
              id="employees_count"
              type="number"
              min="0"
              value={formData.employees_count}
              onChange={(e) => handleChange('employees_count', parseInt(e.target.value) || 0)}
              disabled={isSubmitted}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year_founded">Year Founded</Label>
            <Input
              id="year_founded"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.year_founded}
              onChange={(e) => handleChange('year_founded', e.target.value)}
              disabled={isSubmitted}
              placeholder="2020"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              disabled={isSubmitted}
              placeholder="https://www.company.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Person */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Person</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Name *</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email *</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Phone *</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              disabled={isSubmitted}
              placeholder="+40 712 345 678"
            />
          </div>
        </CardContent>
      </Card>

      {/* IGI Eligibility - Romania Only */}
      {formData.country === 'RO' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              IGI Eligibility Requirements (Romania)
            </CardTitle>
            <CardDescription>
              To recruit non-EU workers in Romania, your company must meet these requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="has_no_debts"
                checked={formData.has_no_debts}
                onCheckedChange={(c) => handleChange('has_no_debts', c)}
                disabled={isSubmitted}
              />
              <div>
                <label htmlFor="has_no_debts" className="font-medium">No Outstanding Debts</label>
                <p className="text-sm text-gray-500">Company has no outstanding debts to ANAF (tax authority)</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="has_no_sanctions"
                checked={formData.has_no_sanctions}
                onCheckedChange={(c) => handleChange('has_no_sanctions', c)}
                disabled={isSubmitted}
              />
              <div>
                <label htmlFor="has_no_sanctions" className="font-medium">No Legal Sanctions</label>
                <p className="text-sm text-gray-500">Company has no sanctions for illegal employment in the past 3 years</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="has_min_employees"
                checked={formData.has_min_employees}
                onCheckedChange={(c) => handleChange('has_min_employees', c)}
                disabled={isSubmitted}
              />
              <div>
                <label htmlFor="has_min_employees" className="font-medium">Minimum 2 Employees</label>
                <p className="text-sm text-gray-500">Company has at least 2 employees with work contracts</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="company_age_over_1_year"
                checked={formData.company_age_over_1_year}
                onCheckedChange={(c) => handleChange('company_age_over_1_year', c)}
                disabled={isSubmitted}
              />
              <div>
                <label htmlFor="company_age_over_1_year" className="font-medium">Company Age Over 1 Year</label>
                <p className="text-sm text-gray-500">Company has been active for more than 1 year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!isSubmitted && (
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || submitting}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit for Validation
          </Button>
        </div>
      )}

      {profile?.status === 'validated' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Your company has been validated! You can now create job requests and start recruiting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
