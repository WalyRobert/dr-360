import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import Controls from './Controls';
import { ViewMode, QualitySettings } from '../types';

interface Video360ViewerProps {
  onBack: () => void;
}

const defaultQuality: QualitySettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  colorProfile: 'natural'
};

const Video360Viewer: React.FC<Video360ViewerProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Mode360);
  const [zoom, setZoom] = useState(75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [headTracking, setHeadTracking] = useState(false);
  const [isVR, setIsVR] = useState(false);
  const [quality, setQuality] = useState<QualitySettings>(defaultQuality);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canvasKey, setCanvasKey] = useState(0);

  // Garante que o vídeo está pronto antes de renderizar o canvas
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanvasKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleZoomChange = (value: number) => {
    setZoom(Math.max(10, Math.min(120, value)));
  };

  const handleQualityChange = (newQuality: Partial<QualitySettings>) => {
    setQuality(prev => ({ ...prev, ...newQuality }));
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#000',
      position: 'relative'
    }}>
      {/* Video element - SEMPRE CARREGADO PRIMEIRO */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        loop
        muted
        autoPlay
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" type="video/mp4" />
        Seu navegador não suporta vídeo HTML5.
      </video>

      {/* Canvas Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <Canvas
          key={canvasKey}
          camera={{ position: [0, 0, 0.1], fov: zoom }}
          style={{ width: '100%', height: '100%' }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
          }}
        >
          <Scene
            videoElement={videoRef.current}
            viewMode={viewMode}
            zoom={zoom}
            headTracking={headTracking}
            isVR={isVR}
            quality={quality}
          />
        </Canvas>
      </div>

      {/* Controls Bar */}
      <Controls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        headTracking={headTracking}
        onHeadTrackingChange={setHeadTracking}
        isVR={isVR}
        onVRChange={setIsVR}
        quality={quality}
        onQualityChange={handleQualityChange}
        onBack={onBack}
      />
    </div>
  );
};

export default Video360Viewer;
