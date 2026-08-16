import { useState } from 'react';
import { Sparkles, Layers, PenTool, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Landing({ onStart }) {
  const { t } = useTranslation();

  return (
    <div className="landing-page p-responsive" style={{ padding: '3rem 2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="text-gradient" style={{ fontSize: 'clamp(2rem, 7vw, 4rem)', marginBottom: '0.75rem' }}>{t('appTitle')}</h1>
        <p style={{ fontSize: 'clamp(0.95rem, 3vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          {t('tagline')}
        </p>
      </header>
      
      <div className="features glass-panel flex-responsive p-responsive" style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', padding: '2rem', maxWidth: '900px', margin: '0 auto 2.5rem', flexWrap: 'wrap' }}>
        <div className="feature" style={{ flex: '1 1 220px', textAlign: 'left' }}>
          <Sparkles size={28} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.35rem', fontSize: '1.05rem' }}>{t('features.aiPowered')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{t('features.aiDesc')}</p>
        </div>
        <div className="feature" style={{ flex: '1 1 220px', textAlign: 'left' }}>
          <Layers size={28} color="var(--accent-secondary)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.35rem', fontSize: '1.05rem' }}>{t('features.overlay')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{t('features.overlayDesc')}</p>
        </div>
        <div className="feature" style={{ flex: '1 1 220px', textAlign: 'left' }}>
          <PenTool size={28} color="var(--accent-tertiary)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.35rem', fontSize: '1.05rem' }}>{t('features.difficulty')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{t('features.difficultyDesc')}</p>
        </div>
      </div>

      <button 
        onClick={onStart}
        className="hover-lift"
        style={{
          background: 'var(--accent-gradient)',
          color: '#fff',
          border: 'none',
          padding: '0.85rem 2.5rem',
          fontSize: 'clamp(1rem, 3vw, 1.25rem)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {t('buttons.startFree')}
      </button>
    </div>
  );
}
