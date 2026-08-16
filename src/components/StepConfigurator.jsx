import { useState } from 'react';
import { ArrowLeft, Sliders, Play, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StepConfigurator({ image, onComplete, onBack }) {
  const { user } = useAuth();
  const [steps, setSteps] = useState(5);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [artStyle, setArtStyle] = useState('Standard');

  const advancedStyles = [
    { id: 'Standard', name: 'Standard Sketch' },
    { id: 'Anime', name: 'Anime / Manga', pro: true },
    { id: 'Comic', name: 'Comic Book', pro: true },
    { id: 'Technical', name: 'Technical Drawing', pro: true },
  ];

  return (
    <div className="p-responsive" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex-responsive" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div className="glass-panel" style={{ width: '100%', maxHeight: '300px', aspectRatio: '4/3', backgroundImage: `url(${image})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', overflow: 'hidden' }}>
          </div>
        </div>

        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.35rem, 5vw, 2rem)', marginBottom: '0.35rem' }}>Configure Sketch</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>How detailed do you want this lesson to be?</p>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                <Sliders size={16} /> Steps
              </label>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{steps}</span>
            </div>
            <input 
              type="range" 
              min="2" 
              max="10" 
              value={steps} 
              onChange={(e) => setSteps(parseInt(e.target.value))} 
              style={{ width: '100%', marginBottom: '1.25rem', accentColor: 'var(--accent-primary)' }}
            />

            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Target Difficulty</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid',
                    borderColor: difficulty === diff ? 'var(--accent-primary)' : 'var(--border-glass)',
                    background: difficulty === diff ? 'var(--accent-glow)' : 'transparent',
                    color: difficulty === diff ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.8rem'
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>

            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <Palette size={16} /> Art Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {advancedStyles.map(style => {
                const disabled = style.pro && !user?.isPro;
                return (
                  <button
                    key={style.id}
                    onClick={() => !disabled && setArtStyle(style.id)}
                    disabled={disabled}
                    style={{
                      padding: '0.4rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: artStyle === style.id ? 'var(--accent-secondary)' : 'var(--border-glass)',
                      background: artStyle === style.id ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: disabled ? 'var(--text-secondary)' : '#fff',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.5 : 1,
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <span>{style.name}</span>
                    {style.pro && <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>PRO</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            className="hover-lift"
            onClick={() => onComplete(steps, difficulty, artStyle)}
            style={{
              background: 'var(--accent-gradient)',
              color: '#fff',
              border: 'none',
              padding: '0.85rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: 'auto'
            }}
          >
            Generate Lesson <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
