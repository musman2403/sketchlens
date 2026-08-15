export default function Celebration() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.8)', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div style={{ textAlign: 'center', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Masterpiece Complete!</h2>
        <p style={{ fontSize: '1.25rem', color: '#64748b' }}>Great job following the steps.</p>
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
