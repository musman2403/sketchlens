import { useState } from 'react';
import { Sparkles, Layers, PenTool, ArrowRight, Image as ImageIcon, Sliders, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CommunityGallery from './CommunityGallery';

export default function Landing({ onStart }) {
  const { t } = useTranslation();

  return (
    <div className="landing-page" style={{ width: '100%' }}>
      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        {/* Abstract glowing backgrounds */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: 'var(--accent-secondary)', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-pill)', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--accent-tertiary)', fontWeight: '600' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-top' }} />
              Master the art of sketching
            </span>
            <h1 className="text-gradient" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '1.5rem', lineHeight: '1.1' }}>
              {t('appTitle') || 'SketchLens'}
            </h1>
            <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
              {t('tagline') || 'Learn to draw anything with AI-powered guided overlays. Perfect for beginners and experts alike.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={onStart}
                className="hover-lift"
                style={{
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem 3rem',
                  fontSize: '1.2rem',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 8px 25px var(--accent-glow)'
                }}
              >
                {t('buttons.startFree') || 'Start Sketching Free'} <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works" style={{ padding: '8rem 2rem', background: 'var(--bg-glass)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Three simple steps to create your masterpiece.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: ImageIcon, title: '1. Upload Image', desc: 'Choose any photo or select from our community gallery to start your drawing journey.' },
              { icon: Sliders, title: '2. Configure Style', desc: 'Adjust difficulty, edge detection, and tracing style to match your current skill level.' },
              { icon: PenTool, title: '3. Start Tracing', desc: 'Use our smart overlay to trace over your physical canvas and learn as you go.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2 }}
                className="glass-panel hover-lift" 
                style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: 'var(--accent-primary)' }}>
                  <step.icon size={36} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="features-section" style={{ padding: '8rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Feature 1 */}
          <div className="feature-row" style={{ display: 'flex', alignItems: 'center', gap: '5rem', marginBottom: '8rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
                  <Layers size={28} />
                </div>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1.5rem', lineHeight: '1.2' }}>Smart AI Overlays</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                  Our advanced AI processes any image and extracts perfect outlines tailored to your selected difficulty level. It's like having a master artist guide your hand step by step.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {['Adaptive edge detection', 'Multiple artistic styles', 'Real-time opacity control'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                      <CheckCircle2 size={22} color="var(--accent-primary)" /> {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} className="glass-panel hover-lift" style={{ height: '450px', background: 'linear-gradient(135deg, var(--bg-surface), rgba(99, 102, 241, 0.15))', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(var(--accent-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 <div style={{ textAlign: 'center', color: 'var(--text-primary)', position: 'relative', zIndex: 1, background: 'var(--bg-glass)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
                    <ImageIcon size={48} style={{ opacity: 0.8, marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Processing</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Extracting perfect lines...</p>
                 </div>
              </motion.div>
            </div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="feature-row reverse" style={{ display: 'flex', alignItems: 'center', gap: '5rem', flexWrap: 'wrap-reverse' }}>
            <div style={{ flex: '1 1 400px' }}>
               <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} className="glass-panel hover-lift" style={{ height: '450px', background: 'linear-gradient(135deg, var(--bg-surface), rgba(236, 72, 153, 0.15))', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(var(--accent-secondary) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 <div style={{ textAlign: 'center', color: 'var(--text-primary)', position: 'relative', zIndex: 1, background: 'var(--bg-glass)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
                    <Sliders size={48} style={{ opacity: 0.8, marginBottom: '1rem', color: 'var(--accent-secondary)' }} />
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Dynamic Difficulty</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Beginner to Master</p>
                 </div>
              </motion.div>
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}>
                  <Star size={28} />
                </div>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1.5rem', lineHeight: '1.2' }}>Learn at Your Pace</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                  Whether you're drawing your first stick figure or mastering complex portraits, SketchLens adapts to you. Choose from Beginner, Intermediate, or Advanced line complexities.
                </p>
                <button onClick={onStart} style={{ background: 'transparent', border: '2px solid var(--accent-secondary)', color: 'var(--text-primary)', padding: '0.85rem 2.5rem', fontSize: '1.1rem', borderRadius: 'var(--radius-pill)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }} className="hover-lift">
                  Try it now <ChevronRight size={18} />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-glass)', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', padding: '0 2rem' }}>
            <span style={{ color: 'var(--accent-tertiary)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Inspiration</span>
          </div>
          <CommunityGallery />
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '10rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100vw', height: '100%', background: 'var(--accent-glow)', filter: 'blur(200px)', opacity: 0.15, zIndex: 0 }} />
         <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1.5rem', lineHeight: '1.1' }}>Ready to create your first masterpiece?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', lineHeight: '1.6' }}>
              Join thousands of users improving their drawing skills every day with SketchLens. No credit card required to start.
            </p>
            <button 
                onClick={onStart}
                className="hover-lift"
                style={{
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '1.25rem 4rem',
                  fontSize: '1.25rem',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 10px 40px rgba(255,255,255,0.2)'
                }}
              >
                Start Sketching Now
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '4rem 2rem 2rem', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem' }}>
          <div style={{ flex: '1 1 300px' }}>
             <h3 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>SketchLens</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px' }}>
               The AI-powered drawing companion that helps you learn and create beautiful art.
             </p>
          </div>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Product</h4>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Features</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Pricing</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Gallery</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Legal</h4>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Terms of Service</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Privacy Policy</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Contact</a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} SketchLens. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
