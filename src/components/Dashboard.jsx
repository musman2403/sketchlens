import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Image as ImageIcon, Globe, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CommunityGallery from './CommunityGallery';

export default function Dashboard({ onNewSketch }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my_sketches');

  useEffect(() => {
    const fetchSketches = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sketches`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sketches/${id}/publish`, {
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-6">
          <div className="flex items-center gap-4">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full border border-white/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{t('dashboard.welcome', { name: user?.name })}</h1>
              <p className="text-white/50">{user?.email}</p>
            </div>
          </div>
          
          <div>
            <button 
              onClick={onNewSketch}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('buttons.newSketch')}
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('my_sketches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'my_sketches' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            <UserIcon size={18} /> My Sketches
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'community' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            <Globe size={18} /> {t('community.title')}
          </button>
        </div>

        {activeTab === 'community' ? (
          <CommunityGallery />
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : sketches.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10">
            <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('dashboard.noSketches')}</h2>
            <p className="text-white/50 mb-6">{t('dashboard.startFirst')}</p>
            <button 
              onClick={onNewSketch}
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              {t('buttons.newSketch')}
            </button>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sketches.map(sketch => (
              <motion.div variants={itemVariants} key={sketch._id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 transition-colors">
                <div className="aspect-[4/3] bg-black relative">
                  <img src={sketch.imageUrl} alt={sketch.title} className="w-full h-full object-contain" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{sketch.title}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-white/50 text-sm">{new Date(sketch.createdAt).toLocaleDateString()}</p>
                    <button 
                      onClick={() => handleTogglePublish(sketch._id)}
                      className={`text-xs px-3 py-1 rounded-full border ${sketch.isPublic ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
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
