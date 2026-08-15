import { Eye, EyeOff } from 'lucide-react';

export default function OpacitySlider({ value, onChange }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <EyeOff size={16} />
        <span>Overlay Opacity</span>
        <Eye size={16} />
      </div>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.05" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
      />
    </div>
  );
}
