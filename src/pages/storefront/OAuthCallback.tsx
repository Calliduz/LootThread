import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * OAuthCallback
 * 
 * This page is the landing page after a Google or GitHub OAuth redirect.
 * It reads the `?token=` query param, logs the user in via AuthContext,
 * strips the token from the URL (for security), and redirects to /account.
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
      // Replace the current history entry to remove the token from the URL
      window.history.replaceState({}, document.title, '/oauth/callback');
      toast.success('Welcome to LootThread!');
      navigate('/account', { replace: true });
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
