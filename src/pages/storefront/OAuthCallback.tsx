import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

/**
 * OAuthCallback
 *
 * Landing page after Google/Facebook OAuth redirect.
 * Reads `?token=` query param, logs the user in via AuthContext,
 * then routes: admin → /admin, customer → /account.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('OAuth login failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      loginWithToken(token);
      window.history.replaceState({}, document.title, '/oauth/callback');
      toast.success('Welcome to LootThread!');

      // Route based on role decoded from JWT
      try {
        const { role } = jwtDecode<{ role: string }>(token);
        navigate(role === 'admin' ? '/admin' : '/account', { replace: true });
      } catch {
        navigate('/account', { replace: true });
      }
    } else {
      toast.error('No token received. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        <p className="text-white/60 text-sm font-bold uppercase tracking-widest">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
