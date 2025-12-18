import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Video360Viewer from './components/Video360Viewer';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'player'>('landing');

  if (currentPage === 'player') {
    return <Video360Viewer onBack={() => setCurrentPage('landing')} />;
  }

  return <LandingPage onNavigate={() => setCurrentPage('player')} />;
};

export default App;
