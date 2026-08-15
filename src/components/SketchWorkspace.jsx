import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, Check, Download, Share2 } from 'lucide-react';
import { processImageWithOpenCV } from '../utils/imageProcessor';
import { getInstructionsForSteps } from '../utils/geminiService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingScreen from './LoadingScreen';

// Subcomponents (mocked for now, will create next)
// Subcomponents
import SketchOverlay from './SketchOverlay';
import StepNavigation from './StepNavigation';
import InstructionCard from './InstructionCard';
import OpacitySlider from './OpacitySlider';
import Celebration from './Celebration';
import CameraFeed from './CameraFeed';

export default function SketchWorkspace({ image, stepCount, difficulty, artStyle, onBack }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [stepImages, setStepImages] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [opacity, setOpacity] = useState(0.5);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const generateLesson = async () => {
      try {
        setLoading(true);
        // Load image to pass to OpenCV
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = image;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        if (!isMounted) return;

        // 1. Process with OpenCV
        const cvImages = await processImageWithOpenCV(img, stepCount);
        if (!isMounted) return;
        setStepImages(cvImages);

        // 2. Fetch Gemini instructions
        try {
          const aiInstructions = await getInstructionsForSteps(cvImages, artStyle);
          if (isMounted) setInstructions(aiInstructions);
        } catch (aiErr) {
          console.error("AI failed, falling back to visual only", aiErr);
          if (isMounted) {
            setInstructions(cvImages.map((_, i) => `Draw the lines shown in step ${i + 1}.`));
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError(err.message || 'Failed to generate lesson.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    generateLesson();

    return () => { isMounted = false; };
  }, [image, stepCount]);

  const handleNext = () => {
    if (currentStep < stepImages.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
      setIsComplete(false);
    }
  };

  const handleSaveSketch = async () => {
    if (!user || isSaved) return;
    setIsSaving(true);
    
    try {
      // Convert base64 to Blob
      const res = await fetch(image);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'sketch.png');
      formData.append('title', `Sketch - ${difficulty} - ${stepCount} steps`);
      formData.append('steps', JSON.stringify(instructions.map((inst, i) => ({ instruction: inst, imageIndex: i }))));

      const apiRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (apiRes.ok) {
        setIsSaved(true);
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Error saving sketch:', err);
      alert('Failed to save sketch. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = stepImages[currentStep];
    link.download = `sketch-step-${currentStep + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(stepImages[currentStep]);
        const blob = await res.blob();
        const file = new File([blob], 'sketch.png', { type: 'image/png' });
        await navigator.share({
          title: 'My SketchLens Drawing',
          text: 'Check out what I am drawing with SketchLens!',
          files: [file]
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  if (loading) {
    return (
      <LoadingScreen 
        message={t('workspace.loading')} 
        subtitle={t('workspace.analyzing')} 
      />
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Oops! Something went wrong.</h2>
        <p style={{ color: 'var(--accent-secondary)' }}>{error}</p>
        <button onClick={onBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      {/* Top Header */}
      <div className="workspace-header">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1rem' }}>
          <ArrowLeft size={20} /> {t('workspace.exit')}
        </button>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleDownload} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', cursor: 'pointer', border: 'none', color: '#fff' }} title={t('buttons.download')}>
            <Download size={18} />
          </button>
          <button onClick={handleShare} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', cursor: 'pointer', border: 'none', color: '#fff' }} title={t('buttons.share')}>
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="workspace-content">
        {/* Sidebar / Controls */}
        <div className="glass-panel workspace-sidebar">

        {user && (
          <button 
            onClick={handleSaveSketch}
            disabled={isSaving || isSaved}
            className="hover-lift"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '2rem',
              borderRadius: '9999px',
              fontWeight: '500',
              fontSize: '0.875rem',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              background: isSaved ? 'rgba(16, 185, 129, 0.2)' : isSaving ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
              color: isSaved ? '#34d399' : isSaving ? 'rgba(255,255,255,0.5)' : '#fff'
            }}
          >
            {isSaved ? <><Check size={16} /> {t('buttons.saved')}</> : 
             isSaving ? <><Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : 
             <><Save size={16} /> {t('buttons.save')}</>}
          </button>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <InstructionCard 
            step={currentStep + 1} 
            total={stepImages.length} 
            text={instructions[currentStep] || 'Follow the lines on screen.'} 
          />
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <OpacitySlider value={opacity} onChange={setOpacity} />
          <StepNavigation 
            current={currentStep} 
            total={stepImages.length} 
            onNext={handleNext} 
            onPrev={handlePrev}
            isComplete={isComplete}
          />
        </div>

        </div>
        
        {/* Main Canvas Area */}
        <div className="workspace-canvas" style={{ position: 'relative' }}>
          <CameraFeed active={/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)} />
          <SketchOverlay image={stepImages[currentStep]} opacity={opacity} />
          {isComplete && <Celebration />}
        </div>
      </div>
    </div>
  );
}
