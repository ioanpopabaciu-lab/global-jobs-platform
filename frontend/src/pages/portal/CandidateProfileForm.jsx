import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Send, User, Briefcase, Globe, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const nationalities = [
  'Afghanistan', 'Bangladesh', 'India', 'Indonesia', 'Nepal', 'Pakistan', 'Philippines', 
  'Sri Lanka', 'Vietnam', 'Ethiopia', 'Kenya', 'Nigeria', 'South Africa', 'Other'
];

const industries = [
  'Construction', 'Manufacturing', 'HoReCa (Hotels, Restaurants, Catering)', 
  'Agriculture', 'Transportation', 'Healthcare', 'IT & Technology', 
  'Retail', 'Cleaning Services', 'Security', 'Other'
];

const englishLevels = [
  { value: 'none', label: 'None' },
  { value: 'basic', label: 'Basic (A1-A2)' },
  { value: 'intermediate', label: 'Intermediate (B1-B2)' },
  { value: 'advanced', label: 'Advanced (C1)' },
  { value: 'fluent', label: 'Fluent (C2)' }
];

const countries = [
  { value: 'RO', label: 'Romania' },
  { value: 'AT', label: 'Austria' },
  { value: 'RS', label: 'Serbia' }
];

export default function CandidateProfileForm() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    nationality: '',
    current_country: '',
    phone: '',
    whatsapp: '',
    profession: '',
    experience_years: 0,
    english_level: 'basic',
    other_languages: [],
    skills: [],
    preferred_countries: [],
    preferred_industries: [],
    salary_expectation: '',
    available_from: ''
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
          setFormData({
            full_name: data.profile.full_name || user?.name || '',
            date_of_birth: data.profile.date_of_birth?.split('T')[0] || '',
            nationality: data.profile.nationality || '',
            current_country: data.profile.current_country || '',
            phone: data.profile.phone || '',
            whatsapp: data.profile.whatsapp || '',
            profession: data.profile.profession || '',
            experience_years: data.profile.experience_years || 0,
            english_level: data.profile.english_level || 'basic',
            other_languages: data.profile.other_languages || [],
            skills: data.profile.skills || [],
            preferred_countries: data.profile.preferred_countries || [],
            preferred_industries: data.profile.preferred_industries || [],
            salary_expectation: data.profile.salary_expectation || '',
            available_from: data.profile.available_from?.split('T')[0] || ''
          });
        } else {
          setFormData(prev => ({ ...prev, full_name: user?.name || '' }));
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
        toast.success('Profile saved successfully!');
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
    // Validate required fields
    const required = ['full_name', 'nationality', 'current_country', 'phone', 'profession'];
    const missing = required.filter(f => !formData[f]);
    
    if (missing.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // First save
      await handleSave();
      
      // Then submit for validation
      const response = await fetch(`${API_URL}/api/portal/candidate/profile/submit`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Profile submitted for validation!');
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Complete your profile to apply for jobs</p>
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

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-navy-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              disabled={isSubmitted}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality *</Label>
            <Select 
              value={formData.nationality} 
              onValueChange={(v) => handleChange('nationality', v)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent>
                {nationalities.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current_country">Current Country *</Label>
            <Input
              id="current_country"
              value={formData.current_country}
              onChange={(e) => handleChange('current_country', e.target.value)}
              disabled={isSubmitted}
              placeholder="Country where you currently live"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={isSubmitted}
              placeholder="+1234567890"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              disabled={isSubmitted}
              placeholder="+1234567890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-navy-600" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profession">Profession/Trade *</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              disabled={isSubmitted}
              placeholder="e.g., Welder, Cook, Driver"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              value={formData.experience_years}
              onChange={(e) => handleChange('experience_years', parseInt(e.target.value) || 0)}
              disabled={isSubmitted}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="english_level">English Level</Label>
            <Select 
              value={formData.english_level} 
              onValueChange={(v) => handleChange('english_level', v)}
              disabled={isSubmitted}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {englishLevels.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary_expectation">Salary Expectation (EUR/month)</Label>
            <Input
              id="salary_expectation"
              value={formData.salary_expectation}
              onChange={(e) => handleChange('salary_expectation', e.target.value)}
              disabled={isSubmitted}
              placeholder="e.g., 1500-2000"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="available_from">Available From</Label>
            <Input
              id="available_from"
              type="date"
              value={formData.available_from}
              onChange={(e) => handleChange('available_from', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-navy-600" />
            Work Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Countries</Label>
            <div className="flex flex-wrap gap-3">
              {countries.map(c => (
                <div key={c.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${c.value}`}
                    checked={formData.preferred_countries.includes(c.value)}
                    onCheckedChange={() => handleArrayToggle('preferred_countries', c.value)}
                    disabled={isSubmitted}
                  />
                  <label htmlFor={`country-${c.value}`} className="text-sm">{c.label}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferred Industries</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {industries.map(ind => (
                <div key={ind} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${ind}`}
                    checked={formData.preferred_industries.includes(ind)}
                    onCheckedChange={() => handleArrayToggle('preferred_industries', ind)}
                    disabled={isSubmitted}
                  />
                  <label htmlFor={`industry-${ind}`} className="text-sm">{ind}</label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
            Your profile has been validated! You can now be matched with job opportunities.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
