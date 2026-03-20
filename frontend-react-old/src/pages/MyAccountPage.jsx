import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, UserCircle, GraduationCap, FileText, ArrowRight, User } from 'lucide-react';
import { useEffect } from 'react';

const serviceCards = [
  {
    id: 'employer',
    icon: Building2,
    title: 'Employer Account',
    description: 'Recruit workers for your company in Romania',
    button: 'Create Employer Account',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    lightBg: 'bg-blue-50',
    accountType: 'employer'
  },
  {
    id: 'candidate',
    icon: UserCircle,
    title: 'Candidate Account',
    description: 'Apply for jobs in Romania',
    button: 'Create Candidate Profile',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    lightBg: 'bg-green-50',
    accountType: 'candidate'
  },
  {
    id: 'student',
    icon: GraduationCap,
    title: 'Student Application',
    description: 'Apply to study in Romania with our assistance',
    button: 'Apply as Student',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    lightBg: 'bg-purple-50',
    accountType: 'student'
  },
  {
    id: 'immigration',
    icon: FileText,
    title: 'Immigration Services',
    description: 'Assistance for visas, residence permits, family reunification and citizenship',
    button: 'Request Immigration Assistance',
    color: 'bg-coral',
    hoverColor: 'hover:bg-red-600',
    lightBg: 'bg-red-50',
    accountType: 'immigration_client'
  }
];

export default function MyAccountPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const dashboardPath = getDashboardPath(user.account_type || user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  const getDashboardPath = (accountType) => {
    switch (accountType) {
      case 'employer':
        return '/portal/employer';
      case 'candidate':
        return '/portal/candidate';
      case 'student':
        return '/portal/student';
      case 'immigration_client':
        return '/portal/immigration';
      case 'admin':
        return '/admin';
      default:
        return '/portal/candidate';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Homepage
        </Link>
        
        <div className="text-center mb-12">
          <Link to="/">
            <img 
              src="https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/en2yk94c_Design%20f%C4%83r%C4%83%20titlu%20%281%29.png" 
              alt="Global Jobs Consulting" 
              className="h-20 mx-auto mb-6"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Choose Your Service
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Select the type of account that best fits your needs. Each service provides a dedicated portal with specific features.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {serviceCards.map((service) => (
            <Card 
              key={service.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
              data-testid={`service-card-${service.id}`}
            >
              <CardHeader className={`${service.lightBg} pb-4`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${service.color} rounded-xl text-white`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      {service.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Link to={`/register?type=${service.accountType}`}>
                  <Button 
                    className={`w-full ${service.color} ${service.hoverColor} text-white group-hover:scale-[1.02] transition-transform`}
                    data-testid={`btn-${service.id}`}
                  >
                    {service.button}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Already have account section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto bg-white/10 backdrop-blur border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <User className="h-6 w-6 text-white" />
                <p className="text-white font-medium">Already have an account?</p>
              </div>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="w-full border-white text-white hover:bg-white hover:text-navy-900"
                  data-testid="btn-login"
                >
                  Sign In to Your Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 text-white/50 text-sm">
          <p>Need help choosing? Contact us at <a href="mailto:office@gjc.ro" className="text-coral hover:underline">office@gjc.ro</a></p>
          <p className="mt-2">or call <a href="tel:+40732403464" className="text-coral hover:underline">+40 732 403 464</a></p>
        </div>
      </div>
    </div>
  );
}
