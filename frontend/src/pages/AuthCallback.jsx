import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const hasProcessed = useRef(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Extract session_id from URL fragment
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        console.error('No session_id in callback');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Exchange session_id for our session token
        const response = await fetch(`${API_URL}/api/auth/google/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId })
        });

        if (!response.ok) {
          throw new Error('Failed to exchange session');
        }

        const data = await response.json();
        
        // Redirect based on user account_type
        const redirectPath = getRedirectPath(data.user.account_type || data.user.role);
        
        // Clear the hash and navigate
        window.history.replaceState(null, '', window.location.pathname);
        navigate(redirectPath, { replace: true, state: { user: data.user } });

      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [navigate, API_URL, checkAuth]);

  const getRedirectPath = (role) => {
    switch (role) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-navy-600 mx-auto mb-4" />
        <p className="text-gray-600">Se procesează autentificarea...</p>
      </div>
    </div>
  );
}
