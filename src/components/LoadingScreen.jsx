import { motion } from 'framer-motion';

const pencilPath = "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z";

export default function LoadingScreen({ message = 'Preparing your canvas...', subtitle = '' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '20%', left: '15%',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Animated pencil icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        style={{ marginBottom: '2rem', position: 'relative' }}
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pencilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
            </defs>
            <path d={pencilPath} fill="url(#pencilGrad)" />
          </svg>
        </motion.div>

        {/* Glow ring behind icon */}
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: '-16px', borderRadius: '50%',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Drawing progress line */}
      <div style={{
        width: '200px', height: '3px', borderRadius: '4px',
        background: 'rgba(255,255,255,0.08)', marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '40%', height: '100%', borderRadius: '4px',
            background: 'var(--accent-gradient)',
          }}
        />
      </div>

      {/* Main message */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {message}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '1.5rem' }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent-primary)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
