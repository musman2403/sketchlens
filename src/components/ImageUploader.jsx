import { Upload, ImageIcon, ArrowLeft } from 'lucide-react';

const SAMPLES = [
  { id: 1, url: '/samples/anime-samurai.jpg', label: 'Anime Samurai' },
  { id: 2, url: '/samples/anime-spirit.jpg', label: 'Forest Spirit' },
  { id: 3, url: '/samples/rose.jpg', label: 'Rose' },
  { id: 4, url: '/samples/mountain-lake.jpg', label: 'Mountain Lake' },
  { id: 5, url: '/samples/female-portrait.jpg', label: 'Portrait' },
  { id: 6, url: '/samples/cat-sitting.jpg', label: 'Cat' },
  { id: 7, url: '/samples/lion-head.jpg', label: 'Lion' },
  { id: 8, url: '/samples/eiffel-tower.jpg', label: 'Eiffel Tower' },
  { id: 9, url: '/samples/acoustic-guitar.jpg', label: 'Guitar' },
  { id: 10, url: '/samples/mandala.jpg', label: 'Mandala' },
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
    <div className="uploader-page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}>
        <ArrowLeft size={20} /> Back
      </button>

      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Choose an image to sketch</h2>

      <div className="glass-panel hover-lift" style={{ padding: '3rem', textAlign: 'center', marginBottom: '3rem', borderStyle: 'dashed' }}>
        <input 
          type="file" 
          id="file-upload" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <Upload size={40} />
          </div>
          <h3>Upload from device</h3>
          <p style={{ color: 'var(--text-secondary)' }}>JPG, PNG up to 10MB</p>
        </label>
      </div>

      <h3 style={{ marginBottom: '1.5rem' }}>Or pick a starter image</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
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
            <div style={{ width: '100%', height: '150px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${sample.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
               {/* Fallback icon if image not generated yet */}
               <ImageIcon size={32} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
            </div>
            <div style={{ padding: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {sample.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
