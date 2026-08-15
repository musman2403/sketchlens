import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function StepNavigation({ current, total, onNext, onPrev, isComplete }) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div>
      <div style={{ height: '4px', background: 'var(--bg-glass)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gradient)', transition: 'width 0.3s ease' }}></div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={onPrev} 
          disabled={current === 0}
          style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: current === 0 ? 'var(--text-secondary)' : '#fff', cursor: current === 0 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={20} /> Prev
        </button>
        <button 
          onClick={onNext} 
          style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isComplete ? 'Done' : current === total - 1 ? 'Finish' : 'Next'} {isComplete ? <Check size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}
