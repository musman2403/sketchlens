import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Pricing({ onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      alert('Please sign in to upgrade.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/billing/create-checkout-session`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSafepayUpgrade = async () => {
    if (!user) {
      alert('Please sign in to upgrade.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/billing/create-safepay-session`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to start Safepay checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '2rem'
    }}>
      <div className="glass-panel relative" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', padding: '0' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div style={{ padding: '3rem 2rem', textAlign: 'center', borderBottom: '1px solid var(--border-glass)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Upgrade to SketchLens Pro</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Unlock unlimited AI drawing lessons and master your art.</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', padding: '2rem', flexWrap: 'wrap' }}>
          
          {/* Free Tier */}
          <div style={{ flex: '1 1 300px', padding: '2rem', border: '1px solid var(--border-glass)', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Basic</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>Free</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={18} color="var(--accent-secondary)" /> 3 sketches per day</li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={18} color="var(--accent-secondary)" /> Standard support</li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={18} color="var(--accent-secondary)" /> Community access</li>
            </ul>
            <button 
              onClick={onClose}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--border-glass)', color: '#fff', cursor: 'pointer' }}
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div style={{ flex: '1 1 300px', padding: '2rem', border: '2px solid var(--accent-primary)', borderRadius: '1rem', background: 'var(--accent-glow)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-gradient)', padding: '0.25rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 'bold' }}>RECOMMENDED</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>$9.99<span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>/mo</span></div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Billed monthly (or 3000 PKR). Cancel anytime.</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={18} color="var(--accent-primary)" /> Unlimited sketches</li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={18} color="var(--accent-primary)" /> Priority AI generation</li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Check size={18} color="var(--accent-primary)" /> Advanced art styles</li>
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={handleUpgrade}
                disabled={loading || user?.isPro}
                className="hover-lift"
                style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: 'var(--accent-gradient)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: user?.isPro ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : user?.isPro ? 'You are PRO' : 'Pay with Stripe ($9.99)'}
              </button>
              
              {!user?.isPro && (
                <button 
                  onClick={handleSafepayUpgrade}
                  disabled={loading}
                  className="hover-lift"
                  style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Pay with Safepay (3000 PKR)'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
