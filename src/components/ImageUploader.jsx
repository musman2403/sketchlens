import { Upload, ImageIcon, ArrowLeft } from 'lucide-react';

const SAMPLES = [
  { id: 1, url: '/samples/anime.jpg', label: 'Anime Boy' },
  { id: 2, url: '/samples/landscape.jpg', label: 'Landscape' },
  { id: 3, url: '/samples/cat.jpg', label: 'Cute Cat' },
  { id: 4, url: '/samples/flower.jpg', label: 'Rose' }
];

export default function ImageUploader({ onSelect, onBack }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onSelect(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="uploader-page p-responsive" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h2 style={{ fontSize: 'clamp(1.35rem, 5vw, 2rem)', marginBottom: '1.25rem' }}>Choose an image to sketch</h2>

      <div className="glass-panel hover-lift" style={{ padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '2rem', borderStyle: 'dashed' }}>
        <input 
          type="file" 
          id="file-upload" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-glass)', padding: '1.25rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <Upload size={32} />
          </div>
          <h3 style={{ fontSize: '1.05rem' }}>Upload from device</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>JPG, PNG up to 10MB</p>
        </label>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Or pick a starter image</h3>
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
        {SAMPLES.map(sample => (
          <div 
            key={sample.id} 
            className="sample-card hover-lift"
            onClick={() => onSelect(sample.url)}
            style={{ 
              background: 'var(--bg-glass)', 
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid var(--border-glass)'
            }}
          >
            <div style={{ width: '100%', height: '120px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${sample.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
               {/* Fallback icon if image not generated yet */}
               <ImageIcon size={28} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            </div>
            <div style={{ padding: '0.5rem', fontSize: '0.8rem', textAlign: 'center' }}>
              {sample.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
