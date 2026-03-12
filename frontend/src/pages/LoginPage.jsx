import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      toast.success('Authentication successful!');
      
      // Redirect based on account_type
      const redirectPath = getRedirectPath(data.user.account_type || data.user.role);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRedirectPath = (accountType) => {
    switch (accountType) {
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
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-12">
      <Card className="w-full max-w-md" data-testid="login-card">
        <CardHeader className="text-center">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_b9aed6e8-8f6d-4a68-a3af-3170845dc48c/artifacts/99mub5h3_logo%20fundal%20transparent.png" 
              alt="GJC Logo" 
              className="h-16 mx-auto"
            />
          </Link>
          <CardTitle className="text-2xl font-heading text-navy-900">Autentificare</CardTitle>
          <CardDescription>Accesează portalul Global Jobs Consulting</CardDescription>
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
            data-testid="google-login-btn"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continuă cu Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">sau</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="login-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
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
                  data-testid="login-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-navy-600 hover:bg-navy-700"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se autentifică...
                </>
              ) : (
                'Autentificare'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <Link to="/forgot-password" className="text-navy-600 hover:underline">
            Ai uitat parola?
          </Link>
          <p className="text-gray-500">
            Nu ai cont?{' '}
            <Link to="/register" className="text-navy-600 hover:underline font-medium">
              Înregistrează-te
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
