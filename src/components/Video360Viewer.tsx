import React from 'react';

interface Video360ViewerProps {
  onBack: () => void;
}

const Video360Viewer: React.FC<Video360ViewerProps> = ({ onBack }) => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Canvas placeholder - will be 360 player */}
      <div style={{
        width: '100%',
        height: 'calc(100% - 80px)',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#D4AF37',
        fontSize: '1.5rem',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 20px 0' }}>360° Video Player</h2>
          <p style={{ color: '#aaa', fontSize: '1rem' }}>Touch or drag to rotate the view</p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '40px' }}>Three.js 360° video rendering initializing...</p>
        </div>
      </div>

      {/* Control bar */}
      <div style={{
        width: '100%',
        height: '80px',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 25px',
            background: 'rgba(212, 175, 55, 0.2)',
            color: '#D4AF37',
            border: '1px solid #D4AF37',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.background = 'rgba(212, 175, 55, 0.4)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.background = 'rgba(212, 175, 55, 0.2)';
          }}
        >
          ← Voltar
        </button>

        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <span style={{
            color: '#aaa',
            fontSize: '0.9rem'
          }}>Ready for your video</span>
        </div>
      </div>
    </div>
  );
};

export default Video360Viewer;
