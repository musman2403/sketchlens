import { useEffect, useRef, useState } from 'react';

export default function CameraFeed({ active }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Rear camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
      } catch (err) {
        console.warn('Camera not available:', err.message);
        setError(err.message);
        setHasCamera(false);
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop all tracks when unmounting
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  if (!active) return null;

  if (error) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.875rem',
        textAlign: 'center',
        padding: '1rem',
        zIndex: 0
      }}>
        Camera unavailable — place your device over paper to trace
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
        opacity: hasCamera ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
}
