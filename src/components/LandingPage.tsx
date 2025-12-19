import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const styles = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.4)); }
      50% { filter: drop-shadow(0 0 25px rgba(212, 175, 55, 0.6)); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    .landing-container {
      width: 100%;
      height: 100vh;
      background: linear-gradient(135deg, #f5f1e8 0%, #ebe5db 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Arial', sans-serif;
      position: relative;
      overflow: hidden;
    }
    .gradient-orbs {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.6;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #D4AF37 0%, transparent 70%);
      top: -100px;
      right: -50px;
      animation: float 6s ease-in-out infinite;
    }
    .orb-2 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #6b5d4f 0%, transparent 70%);
      bottom: -100px;
      left: -50px;
      animation: float 8s ease-in-out infinite;
    }
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      animation: fadeInUp 1s ease-out;
    }
    .title {
      font-size: clamp(2.5rem, 10vw, 5.5rem);
      color: #D4AF37;
      font-weight: 900;
      margin: 0;
      letter-spacing: 8px;
      animation: glow 3s ease-in-out infinite;
      text-transform: uppercase;
      text-shadow: 2px 2px 4px rgba(107, 93, 79, 0.1);
    }
    .subtitle {
      font-size: clamp(1.2rem, 4vw, 2rem);
      color: #6b5d4f;
      margin: 15px 0 30px 0;
      letter-spacing: 6px;
      font-weight: 300;
      text-transform: uppercase;
    }
    .description {
      font-size: clamp(1rem, 2vw, 1.3rem);
      color: #6b5d4f;
      max-width: 500px;
      line-height: 1.8;
      margin-bottom: 50px;
      opacity: 0.9;
    }
    .button {
      padding: 18px 60px;
      font-size: clamp(1rem, 2vw, 1.3rem);
      background: linear-gradient(135deg, #D4AF37 0%, #c49925 100%);
      color: #ffffff;
      border: 2px solid #D4AF37;
      border-radius: 50px;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 2px;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
      text-transform: uppercase;
      position: relative;
      overflow: hidden;
    }
    .button:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 40px rgba(212, 175, 55, 0.5);
      background: linear-gradient(135deg, #c49925 0%, #b8931f 100%);
    }
    .button:active {
      transform: translateY(-2px) scale(0.98);
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-top: 60px;
      max-width: 800px;
    }
    .feature-item {
      padding: 20px;
      background: rgba(212, 175, 55, 0.1);
      border-radius: 15px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(212, 175, 55, 0.2);
      transition: all 0.3s ease;
    }
    .feature-item:hover {
      background: rgba(212, 175, 55, 0.2);
      transform: translateY(-5px);
    }
    .feature-label {
      font-size: 0.9rem;
      color: #6b5d4f;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="landing-container">
        <div className="gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>

        <div className="content" style={{ opacity: isVisible ? 1 : 0 }}>
          <h1 className="title">DR360°</h1>
          <h2 className="subtitle">IMMERSIVE VÍDEO</h2>
          <p className="description">
            Experimente a próxima geração de visualização 360°. Tecnologia de ponta para conteúdo imersivo incomparável.
          </p>

          <button className="button" onClick={onNavigate}>
            INICIAR VISUALIZAÇÃO
          </button>

          <div className="features">
            <div className="feature-item">
              <div className="feature-label">360° Completo</div>
            </div>
            <div className="feature-item">
              <div className="feature-label">Toque e Arrasto</div>
            </div>
            <div className="feature-item">
              <div className="feature-label">Premium Design</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
