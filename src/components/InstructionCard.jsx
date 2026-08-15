export default function InstructionCard({ step, total, text }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Step {step} of {total}
        </span>
      </div>
      <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  );
}
