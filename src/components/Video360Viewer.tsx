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
  const [isPlaying, setIsPlaying] = useState(true);
  const [headTracking, setHeadTracking] = useState(false);
  const [isVR, setIsVR] = useState(false);
  const [quality, setQuality] = useState<QualitySettings>(defaultQuality);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsReady(true);
      setIsPlaying(true);
      video.play().catch(err => console.log('Autoplay bloqueado:', err));
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
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

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#000',
      position: 'relative'
    }}>
      {/* Video element - sempre carregado PRIMEIRO */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        loop
        muted
      >
        <source src="https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4" type="video/mp4" />
      </video>

      {/* Canvas Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        {isReady && (
          <Canvas
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
        )}
        {!isReady && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4AF37',
            fontSize: '1.5rem',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h2>Carregando vídeo 360°...</h2>
              <p>Aguarde enquanto o vídeo está sendo preparado</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      {isReady && (
        <Controls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          zoom={zoom}
          onZoomChange={setZoom}
          headTracking={headTracking}
          onHeadTrackingChange={setHeadTracking}
          isVR={isVR}
          onVRChange={setIsVR}
          quality={quality}
          onQualityChange={(newQuality) => setQuality(prev => ({ ...prev, ...newQuality }))}
          onBack={onBack}
        />
      )}
    </div>
  );
};

export default Video360Viewer;
