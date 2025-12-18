import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, PerspectiveCamera } from '@react-three/drei';

const LandingPage: React.FC = () => {
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
    }}>
      <Canvas style={{ position: 'absolute', top: 0, left: 0 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Sphere args={[2, 32, 32]} position={[-3, 0, 0]}>
          <meshStandardMaterial color="#D4AF37" />
        </Sphere>
      </Canvas>

      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        color: '#333',
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: '#D4AF37',
          marginBottom: '10px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
        }}>
          DR360
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#6b5d4f',
          marginTop: '0',
          fontWeight: 'normal',
          letterSpacing: '2px',
        }}>
          VISUALIZACAO EM 360
        </h2>
        <button
          onClick={() => window.location.href = '/player'}
          style={{
            marginTop: '30px',
            padding: '12px 40px',
            fontSize: '1.1rem',
            backgroundColor: '#D4AF37',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c49925'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4AF37'}
        >
          INICIAR VISUALIZACAO
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
