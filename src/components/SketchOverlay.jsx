export default function SketchOverlay({ image, opacity }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'absolute',
      inset: 0,
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1,
      pointerEvents: 'none',
    }}>
      {image && (
        <img 
          src={image} 
          alt="Sketch Step" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%', 
            objectFit: 'contain',
            opacity: opacity,
            transition: 'opacity 0.2s ease',
            // mix-blend-mode makes the white background disappear,
            // leaving only the black sketch lines visible over the camera feed
            mixBlendMode: 'multiply',
          }} 
        />
      )}
    </div>
  );
}
