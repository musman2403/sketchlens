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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to SketchLens</h2>
          <p className="text-white/60">Sign in to save your sketches and track your progress.</p>
        </div>

        <div className="flex justify-center">
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
