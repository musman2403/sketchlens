import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import ImageUploader from './components/ImageUploader';
import StepConfigurator from './components/StepConfigurator';
import SketchWorkspace from './components/SketchWorkspace';
import Dashboard from './components/Dashboard';
import Pricing from './components/Pricing';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { user, loading } = useAuth();
  // if user is logged in, default to dashboard, else landing
  const [screen, setScreen] = useState('landing');
  const [originalImage, setOriginalImage] = useState(null);
  const [stepCount, setStepCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Beginner');
  const [artStyle, setArtStyle] = useState('Standard');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Sync screen with auth state initially
  if (!loading && user && screen === 'landing') {
    setScreen('dashboard');
  } else if (!loading && !user && screen === 'dashboard') {
    setScreen('landing');
  }

  const handleStart = () => {
    setScreen('upload');
  };

  const handleImageSelect = (imgDataUrl) => {
    setOriginalImage(imgDataUrl);
    setScreen('configure');
  };

  const handleSketchSelect = (sketch) => {
    setOriginalImage(sketch.imageUrl);
    setScreen('configure');
  };

  const handleConfigureComplete = (steps, diff, style) => {
    if (!user) {
      const count = parseInt(localStorage.getItem('anonymous_sketch_count') || '0');
      if (count >= 1) {
        setShowLimitModal(true);
        return;
      }
      localStorage.setItem('anonymous_sketch_count', (count + 1).toString());
    }
    setStepCount(steps);
    setDifficulty(diff);
    setArtStyle(style || 'Standard');
    setScreen('workspace');
  };

  const handleBack = () => {
    if (screen === 'upload') setScreen(user ? 'dashboard' : 'landing');
    if (screen === 'configure') setScreen('upload');
    if (screen === 'workspace') setScreen('configure');
  };

  if (loading) {
    return <LoadingScreen message="SketchLens" subtitle="Loading your creative space..." />;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {screen !== 'workspace' && <Navbar onShowPricing={() => setShowPricing(true)} isTransparent={screen === 'landing'} />}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: '100%', height: '100%' }}
          >
            {screen === 'landing' && <Landing onStart={handleStart} />}
            {screen === 'dashboard' && <Dashboard onNewSketch={handleStart} onSketchSelect={handleSketchSelect} />}
            {screen === 'upload' && <ImageUploader onSelect={handleImageSelect} onBack={handleBack} />}
            {screen === 'configure' && (
              <StepConfigurator 
                image={originalImage} 
                onComplete={handleConfigureComplete} 
                onBack={handleBack} 
              />
            )}
            {screen === 'workspace' && (
              <SketchWorkspace 
                image={originalImage} 
                stepCount={stepCount} 
                difficulty={difficulty}
                artStyle={artStyle}
                onBack={handleBack} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showLimitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}
            >
              <h2 style={{ marginBottom: '1rem' }}>Free Limit Reached</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                You've used your free anonymous sketch. Sign in to get 3 more free sketches every day!
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-glass)', color: '#fff', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPricing && (
          <Pricing onClose={() => setShowPricing(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
