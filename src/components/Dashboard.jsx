import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Image as ImageIcon, Globe, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CommunityGallery from './CommunityGallery';

export default function Dashboard({ onNewSketch, onSketchSelect }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my_sketches');

  useEffect(() => {
    const fetchSketches = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setSketches(data.sketches);
        }
      } catch (error) {
        console.error('Failed to fetch sketches', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && activeTab === 'my_sketches') {
      fetchSketches();
    }
  }, [user, activeTab]);

  const handleTogglePublish = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches/${id}/publish`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        setSketches(sketches.map(s => s._id === id ? { ...s, isPublic: !s.isPublic } : s));
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

  return (
    <div className="landing-page p-responsive" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Header */}
        <header className="flex-responsive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', border: '2px solid var(--border-glass)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold', flexShrink: 0 }}>
                {user?.name?.charAt(0)}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('dashboard.welcome', { name: user?.name })}</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </div>
          </div>
          
          <div style={{ flexShrink: 0 }}>
            <button 
              onClick={onNewSketch}
              className="hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.6rem 1.25rem',
                background: 'var(--accent-gradient)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} /> {t('buttons.newSketch')}
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-glass)' }}>
          <button 
            onClick={() => setActiveTab('my_sketches')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
              border: 'none',
              background: activeTab === 'my_sketches' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'my_sketches' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              fontSize: '0.85rem'
            }}
          >
            <UserIcon size={16} /> My Sketches
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
              border: 'none',
              background: activeTab === 'community' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'community' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              fontSize: '0.85rem'
            }}
          >
            <Globe size={16} /> {t('community.title')}
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'community' ? (
          <CommunityGallery onSketchSelect={onSketchSelect} />
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin"></div>
          </div>
        ) : sketches.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '1rem auto', maxWidth: '600px' }}>
            <ImageIcon size={48} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 0.75rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.35rem' }}>{t('dashboard.noSketches')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{t('dashboard.startFirst')}</p>
            <button 
              onClick={onNewSketch}
              className="hover-lift"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.6rem 1.5rem',
                borderRadius: 'var(--radius-pill)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {t('buttons.newSketch')}
            </button>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid-responsive"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}
          >
            {sketches.map(sketch => (
              <motion.div variants={itemVariants} key={sketch._id} className="glass-panel hover-lift" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => onSketchSelect(sketch)}>
                <div style={{ aspectRatio: '4/3', backgroundColor: 'rgba(0,0,0,0.5)', position: 'relative' }}>
                  <img src={sketch.imageUrl} alt={sketch.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '1rem', margin: '0 0 0.35rem 0' }}>{sketch.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                      {new Date(sketch.createdAt).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleTogglePublish(sketch._id); }}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        border: sketch.isPublic ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                        backgroundColor: sketch.isPublic ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: sketch.isPublic ? '#34d399' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {sketch.isPublic ? 'Published' : 'Make Public'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
