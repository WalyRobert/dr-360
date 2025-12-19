import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f1e8',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#D4AF37', fontSize: '3rem', marginBottom: '20px' }}>DR 360°</h1>
      <p style={{ color: '#6b5d4f', fontSize: '1.2rem' }}>Testing React Rendering</p>
      <button onClick={() => alert('App is working!')} style={{
        padding: '10px 20px',
        fontSize: '1rem',
        backgroundColor: '#D4AF37',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px'
      }}>Click Me</button>
    </div>
  );
};

export default App;
