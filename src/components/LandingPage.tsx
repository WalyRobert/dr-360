import React from 'react';

interface LandingPageProps {
  onNavigate: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#f5f1e8',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background circles */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        backgroundColor: '#D4AF37',
        opacity: 0.1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        backgroundColor: '#6b5d4f',
        opacity: 0.05,
      }} />
      
      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        color: '#333',
      }}>
        <h1 style={{
          fontSize: '4rem',
          color: '#D4AF37',
          marginBottom: '10px',
          marginTop: '0',
          fontWeight: 'bold',
          textShadow: '2px 2px 8px rgba(0,0,0,0.1)',
          letterSpacing: '3px',
        }}>
          DR360
        </h1>
        <h2 style={{
          fontSize: '1.8rem',
          color: '#6b5d4f',
          marginTop: '0',
          marginBottom: '30px',
          fontWeight: 'normal',
          letterSpacing: '2px',
        }}>
          VISUALIZAÇÃO EM 360
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: '#6b5d4f',
          maxWidth: '500px',
          lineHeight: '1.6',
          marginBottom: '40px',
        }}>
          Experimente uma tecnologia revolucionária de vídeo imersivo em 360 graus
        </p>
        <button
          onClick={onNavigate}
          style={{
            padding: '15px 50px',
            fontSize: '1.2rem',
            backgroundColor: '#D4AF37',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c49925';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#D4AF37';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
          }}
        >
          INICIAR VISUALIZAÇÃO
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
