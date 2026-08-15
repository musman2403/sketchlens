import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogIn } from 'lucide-react';
import AuthModal from './AuthModal';
import { useState } from 'react';

export default function Navbar({ onShowPricing }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <nav className="glass-header navbar-container" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span className="text-gradient">SketchLens</span>
        <select 
          onChange={(e) => changeLanguage(e.target.value)} 
          value={i18n.language}
          style={{ background: 'var(--bg-surface)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', padding: '0.25rem 0.5rem' }}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user && !user.isPro && (
          <button 
            onClick={onShowPricing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Sparkles size={16} /> Upgrade to Pro
          </button>
        )}
        {user && user.isPro && (
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={16} /> PRO
          </span>
        )}
        {user ? (
          <button 
            onClick={logout}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
          >
            {t('buttons.signOut')}
          </button>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="hover-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              fontWeight: '500',
              backdropFilter: 'blur(10px)'
            }}
          >
            <LogIn size={16} /> {t('buttons.signIn')}
          </button>
        )}
      </div>
      {isAuthModalOpen && <AuthModal isOpen={true} onClose={() => setIsAuthModalOpen(false)} />}
    </nav>
  );
}
