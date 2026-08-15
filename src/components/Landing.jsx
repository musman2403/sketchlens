import { useState } from 'react';
import { Sparkles, Layers, PenTool, LogIn } from 'lucide-react';
import AuthModal from './AuthModal';
import { useTranslation } from 'react-i18next';

export default function Landing({ onStart }) {
  const { t } = useTranslation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="landing-page" style={{ padding: '4rem 2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      
      <button 
        onClick={() => setIsAuthModalOpen(true)}
        className="hover-lift"
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '1rem',
          backdropFilter: 'blur(10px)'
        }}
      >
        <LogIn size={18} /> {t('buttons.signIn')}
      </button>

      <header style={{ marginBottom: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '1rem' }}>{t('appTitle')}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          {t('tagline')}
        </p>
      </header>
      
      <div className="features glass-panel" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', padding: '3rem', maxWidth: '900px', margin: '0 auto 4rem', flexWrap: 'wrap' }}>
        <div className="feature" style={{ flex: '1 1 250px', textAlign: 'left' }}>
          <Sparkles size={32} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>{t('features.aiPowered')}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{t('features.aiDesc')}</p>
        </div>
        <div className="feature" style={{ flex: '1 1 250px', textAlign: 'left' }}>
          <Layers size={32} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>{t('features.overlay')}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{t('features.overlayDesc')}</p>
        </div>
        <div className="feature" style={{ flex: '1 1 250px', textAlign: 'left' }}>
          <PenTool size={32} color="var(--accent-tertiary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>{t('features.difficulty')}</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{t('features.difficultyDesc')}</p>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="hover-lift"
        style={{
          background: 'var(--accent-gradient)',
          color: '#fff',
          border: 'none',
          padding: '1rem 3rem',
          fontSize: '1.25rem',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {t('buttons.startFree')}
      </button>

      {isAuthModalOpen && <AuthModal isOpen={true} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}
