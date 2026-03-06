import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Chrome, Building2, UserCircle, GraduationCap, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const accountTypeConfig = {
  employer: {
    title: 'Create Employer Account',
    description: 'Recruit workers for your company in Romania',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  candidate: {
    title: 'Create Candidate Profile',
    description: 'Apply for jobs in Romania',
    icon: UserCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  student: {
    title: 'Student Application',
    description: 'Apply to study in Romania with our assistance',
    icon: GraduationCap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  immigration_client: {
    title: 'Immigration Services',
    description: 'Assistance for visas, residence permits, family reunification and citizenship',
    icon: FileText,
    color: 'text-coral',
    bgColor: 'bg-red-50'
  }
};

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const accountType = searchParams.get('type') || 'candidate';
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, loginWithGoogle } = useAuth();

  const config = accountTypeConfig[accountType] || accountTypeConfig.candidate;
  const Icon = config.icon;

  // Redirect candidates to new registration flow
  useEffect(() => {
    if (accountType === 'candidate') {
      navigate('/register/candidate', { replace: true });
    }
  }, [accountType, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          account_type: accountType 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      toast.success('Account created successfully!');
      
      // Redirect based on account type
      const redirectPath = getRedirectPath(data.user.account_type);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRedirectPath = (type) => {
    switch (type) {
      case 'admin':
        return '/admin';
      case 'employer':
        return '/portal/employer';
      case 'student':
        return '/portal/student';
      case 'immigration_client':
        return '/portal/immigration';
      case 'candidate':
      default:
        return '/portal/candidate';
    }
  };

  const handleGoogleLogin = () => {
    // Store intended account type in sessionStorage for after OAuth
    sessionStorage.setItem('intended_account_type', accountType);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-12">
      <Card className="w-full max-w-md" data-testid="register-card">
        <CardHeader className="text-center">
          <Link to="/my-account" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to service selection
          </Link>
          
          <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          
          <CardTitle className="text-2xl font-heading text-navy-900">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Login Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleGoogleLogin}
            data-testid="google-register-btn"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="register-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  data-testid="register-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="register-confirm-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-navy-600 hover:bg-navy-700"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center text-sm">
          <div className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">Sunteți angajator?</p>
            <Link to="/register/employer" className="text-blue-600 hover:underline font-medium">
              Înregistrați-vă compania cu CUI →
            </Link>
          </div>
          <p className="text-gray-500 w-full">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
