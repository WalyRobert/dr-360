import React, { useState, Suspense, lazy } from 'react';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';

const Video360Viewer = lazy(() => import('./components/Video360Viewer'));

const LoadingScreen: React.FC = () => (
  <div style={{
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000',
    color: '#D4AF37',
    fontSize: '1.2rem',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h2>Carregando Player 360°...</h2>
      <p>Aguarde um momento</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'player'>('landing');

  return (
    <ErrorBoundary>
      {currentPage === 'player' ? (
        <Suspense fallback={<LoadingScreen />}>
          <Video360Viewer onBack={() => setCurrentPage('landing')} />
        </Suspense>
      ) : (
        <LandingPage onNavigate={() => setCurrentPage('player')} />
      )}
    </ErrorBoundary>
  );
};

export default App;
