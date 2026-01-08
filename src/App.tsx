import React from 'react';

export default function App() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      margin: 0,
      padding: 0,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <iframe
        src="https://stitch.withgoogle.com/projects/5929593525739188444?pli=1"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '0px'
        }}
        allow="autoplay; fullscreen; camera; accelerometer; gyroscope; xr-spatial-tracking"
        allowFullScreen
        title="DR 360° Mobile Video Player"
      />
    </div>
  );
}