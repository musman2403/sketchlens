import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
        credentials: 'include'
      });
      
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        onClose();
      } else {
        console.error('Login failed', data.error);
      }
    } catch (error) {
      console.error('Failed to communicate with server', error);
    }
  };

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

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            theme="filled_black"
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
}
