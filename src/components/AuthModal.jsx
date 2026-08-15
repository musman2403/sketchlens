import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Detect mobile: popup auth gets blocked/stuck on most mobile browsers
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: isMobile ? 'redirect' : 'popup',
    redirect_uri: isMobile ? window.location.origin : undefined,
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code }),
          credentials: 'include'
        });
        
        const data = await res.json();
        if (res.ok) {
          login(data.user);
          onClose();
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Failed to communicate with server');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google Login Error:', err);
      setError('Google sign-in was cancelled or failed');
    }
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '28rem',
        margin: '0 1rem',
        padding: '2rem',
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem',
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'transparent',
            border: 'none',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'color 0.2s, background-color 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <X size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Welcome to SketchLens</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Sign in to save your sketches and track your progress.</p>
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="hover-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 2rem',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-pill)',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {/* Google "G" icon */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}
