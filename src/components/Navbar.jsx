import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Navbar({ onShowPricing }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <nav className="glass-header" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        ) : null}
      </div>
    </nav>
  );
}
