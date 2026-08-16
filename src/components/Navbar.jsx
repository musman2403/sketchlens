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
    <nav className="glass-header navbar-container" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: 0, flexShrink: 1 }}>
        <span className="text-gradient" style={{ whiteSpace: 'nowrap' }}>SketchLens</span>
        <select 
          onChange={(e) => changeLanguage(e.target.value)} 
          value={i18n.language}
          style={{ background: 'var(--bg-surface)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', padding: '0.2rem 0.35rem', fontSize: '0.75rem', flexShrink: 0 }}
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="ar">AR</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
        {user && !user.isPro && (
          <button 
            onClick={onShowPricing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={14} /> Pro
          </button>
        )}
        {user && user.isPro && (
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
            <Sparkles size={14} /> PRO
          </span>
        )}
        {user ? (
          <button 
            onClick={logout}
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
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
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}
          >
            <LogIn size={14} /> {t('buttons.signIn')}
          </button>
        )}
      </div>
      {isAuthModalOpen && <AuthModal isOpen={true} onClose={() => setIsAuthModalOpen(false)} />}
    </nav>
  );
}

