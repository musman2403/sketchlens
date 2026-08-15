import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, Check, Download, Share2 } from 'lucide-react';
import { processImageWithOpenCV } from '../utils/imageProcessor';
import { getInstructionsForSteps } from '../utils/geminiService';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Subcomponents (mocked for now, will create next)
// Subcomponents
import SketchOverlay from './SketchOverlay';
import StepNavigation from './StepNavigation';
import InstructionCard from './InstructionCard';
import OpacitySlider from './OpacitySlider';
import Celebration from './Celebration';

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

      const apiRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sketches`, {
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <Loader2 size={48} className="spin" color="var(--accent-primary)" style={{ animation: 'spin 2s linear infinite' }} />
        <h2>{t('workspace.loading')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{t('workspace.analyzing')}</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
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
    <div className="workspace-page flex h-screen overflow-hidden text-white bg-black">
      {/* Sidebar / Controls */}
      <div className="glass-panel w-[350px] border-l-0 border-y-0 rounded-none p-8 flex flex-col z-10">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="flex items-center gap-2 bg-transparent border-none text-white/60 hover:text-white cursor-pointer text-base">
            <ArrowLeft size={20} /> {t('workspace.exit')}
          </button>
          
          <div className="flex gap-2">
            <button onClick={handleDownload} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors" title={t('buttons.download')}>
              <Download size={18} />
            </button>
            <button onClick={handleShare} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors" title={t('buttons.share')}>
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {user && (
          <button 
            onClick={handleSaveSketch}
            disabled={isSaving || isSaved}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 mb-8 rounded-full font-medium text-sm transition-colors ${
              isSaved ? 'bg-green-500/20 text-green-400' : 
              isSaving ? 'bg-white/5 text-white/50 cursor-not-allowed' : 
              'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isSaved ? <><Check className="w-4 h-4" /> {t('buttons.saved')}</> : 
             isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 
             <><Save className="w-4 h-4" /> {t('buttons.save')}</>}
          </button>
        )}

        <div className="flex-1 overflow-y-auto">
          <InstructionCard 
            step={currentStep + 1} 
            total={stepImages.length} 
            text={instructions[currentStep] || 'Follow the lines on screen.'} 
          />
        </div>

        <div className="mt-auto pt-8">
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
      <div className="flex-1 relative bg-white">
        <SketchOverlay image={stepImages[currentStep]} opacity={opacity} />
        {isComplete && <Celebration />}
      </div>
    </div>
  );
}
