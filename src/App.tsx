import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Video360Viewer from './components/Video360Viewer';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/player" element={<Video360Viewer />} />
      </Routes>
    </Router>
  );
};

export default App;
