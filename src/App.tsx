import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');

  const handleVideoUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoName(file.name);
  }, []);

  const handleUrlSubmit = useCallback((url: string) => {
    setVideoSrc(url);
    const name = url.split('/').pop() || 'Video Externo';
    setVideoName(name.split('?')[0]);
  }, []);

  const handleBackToHome = () => {
    if (videoSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(videoSrc);
    }

    setVideoSrc(null);
    setVideoName('');
  };

  return (
    <div className="w-full h-screen bg-dr-offwhite overflow-hidden">
      {!videoSrc ? (
        <LandingPage
          onUpload={handleVideoUpload}
          onUrlSubmit={handleUrlSubmit}
          />
      ) : (
        <VideoPlayer
          src={videoSrc}
          fileName={videoName}
          onBack={handleBackToHome}
          onFileChange={handleVideoUpload}
          />
      )}
    </div>
  );
};

export default App;
