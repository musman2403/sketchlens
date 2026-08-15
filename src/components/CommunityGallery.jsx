import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function CommunityGallery() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSketches();
  }, []);

  const fetchSketches = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches/community`);
      const data = await res.json();
      setSketches(data.sketches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) return alert(t('buttons.signIn'));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches/${id}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSketches(sketches.map(s => 
          s._id === id ? { ...s, likes: data.isLiked ? [...s.likes, user.id] : s.likes.filter(l => l !== user.id) } : s
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>{t('community.title')}</h2>
      
      {sketches.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.noSketches')}</p>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}
        >
          {sketches.map(sketch => {
            const isLiked = user && sketch.likes.includes(user.id);
            return (
              <motion.div variants={itemVariants} key={sketch._id} className="glass-panel hover-lift" style={{ overflow: 'hidden' }}>
                <img src={sketch.imageUrl} alt={sketch.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{sketch.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      By {sketch.userId?.name || 'Anonymous'}
                    </span>
                    <button 
                      onClick={() => handleLike(sketch._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: isLiked ? 'var(--accent-secondary)' : 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                      {sketch.likes?.length || 0}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
