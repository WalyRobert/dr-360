import React from 'react';

interface LandingPageProps {
  onNavigate: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f1e8 0%, #ebe5db 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Arial', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Orbs */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.3,
        top: '-100px',
        right: '-50px',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, #6b5d4f 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.3,
        bottom: '-100px',
        left: '-50px',
        zIndex: 0
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '600px',
        padding: '20px'
      }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 10vw, 5rem)',
          color: '#D4AF37',
          fontWeight: 900,
          margin: '0 0 20px 0',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          textShadow: '2px 2px 4px rgba(107, 93, 79, 0.1)'
        }}>
          DR 360°
        </h1>

        <h2 style={{
          fontSize: 'clamp(1.2rem, 4vw, 2rem)',
          color: '#6b5d4f',
          margin: '15px 0 30px 0',
          letterSpacing: '6px',
          fontWeight: 300,
          textTransform: 'uppercase'
        }}>
          IMMERSIVE VÍDEO
        </h2>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.3rem)',
          color: '#6b5d4f',
          lineHeight: 1.8,
          marginBottom: '50px',
          opacity: 0.9
        }}>
          Experimente a próxima geração de visualização 360°. Tecnologia de ponta para conteúdo imersivo incomparável.
        </p>

        <button
          onClick={onNavigate}
          style={{
            padding: '18px 60px',
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            background: 'linear-gradient(135deg, #D4AF37 0%, #c49925 100%)',
            color: '#ffffff',
            border: '2px solid #D4AF37',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'translateY(-4px) scale(1.05)';
            target.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.5)';
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.transform = 'translateY(0) scale(1)';
            target.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.3)';
          }}
        >
          INICIAR VISUALIZAÇÃO
        </button>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '20px',
          marginTop: '60px',
          maxWidth: '400px',
          margin: '60px auto 0'
        }}>
          <div style={{
            padding: '20px',
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b5d4f',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0
            }}>
              360° Completo
            </p>
          </div>
          <div style={{
            padding: '20px',
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b5d4f',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0
            }}>
              Toque e Arrasto
            </p>
          </div>
          <div style={{
            padding: '20px',
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b5d4f',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0
            }}>
              Premium Design
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
