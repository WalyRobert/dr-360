import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import { Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  fileName: string;
  onBack: () => void;
  onFileChange: (file: File) => void;
}

function VideoPlayerComponent({ src, fileName, onBack, onFileChange }: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fov, setFov] = useState<360 | 180 | 120>(360);
  const [isVR, setIsVR] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const buttonStyle = {
    background: '#D4AF37',
    border: 'none',
    color: '#000',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: '12px',
    transition: 'all 0.2s ease',
  };

  const inactiveButtonStyle = {
    ...buttonStyle,
    background: 'rgba(212, 175, 55, 0.3)',
    color: '#D4AF37',
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      }}
    >
      {/* Top Bar */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#D4AF37',
            fontSize: '18px',
            cursor: 'pointer',
          }}
        >
          ← VOLTAR
        </button>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {fileName}
        </div>
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) onFileChange(file);
            };
            input.click();
          }}
          style={{
            background: '#D4AF37',
            border: 'none',
            color: '#000',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          OUTRO VÍDEO
        </button>
      </div>

      {/* Video Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        position: 'relative',
      }}>
        {src ? (
          <video
            ref={videoRef}
            src={src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div style={{ color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle /> Carregando vídeo...
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '15px 20px',
        color: '#fff',
        borderTop: '2px solid #D4AF37',
      }}>
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          style={{
            width: '100%',
            height: '6px',
            marginBottom: '12px',
            cursor: 'pointer',
            background: '#D4AF37',
            borderRadius: '3px',
            WebkitAppearance: 'none',
          }}
        />

        {/* Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px',
          flexWrap: 'wrap',
        }}>
          {/* Left Section: Play, Volume, Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Play Button */}
            <button
              onClick={togglePlay}
              style={{
                background: '#D4AF37',
                border: 'none',
                color: '#000',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', color: '#D4AF37' }}>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  width: '80px',
                  cursor: 'pointer',
                  accentColor: '#D4AF37',
                }}
              />
            </div>

            {/* Time */}
            <span style={{ fontSize: '12px', minWidth: '80px', fontFamily: 'monospace' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Middle Section: FOV and VR Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* 360° Mode */}
            <button
              onClick={() => setFov(360)}
              style={fov === 360 ? buttonStyle : inactiveButtonStyle}
              title="Modo 360°"
            >
              360°
            </button>

            {/* 180° Mode */}
            <button
              onClick={() => setFov(180)}
              style={fov === 180 ? buttonStyle : inactiveButtonStyle}
              title="Modo 180°"
            >
              180°
            </button>

            {/* 120° Mode */}
            <button
              onClick={() => setFov(120)}
              style={fov === 120 ? buttonStyle : inactiveButtonStyle}
              title="Modo 120°"
            >
              120°
            </button>

            {/* VR Mode */}
            <button
              onClick={() => setIsVR(!isVR)}
              style={isVR ? buttonStyle : inactiveButtonStyle}
              title="Modo VR"
            >
              🥽 VR
            </button>
          </div>

          {/* Right Section: Settings and Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={buttonStyle}
              title="Configurações"
            >
              ⚙️
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              style={buttonStyle}
              title={isFullscreen ? 'Sair do modo tela cheia' : 'Modo tela cheia'}
            >
              {isFullscreen ? '⛶ SAIR' : '⛶'}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '4px',
            border: '1px solid #D4AF37',
            color: '#D4AF37',
            fontSize: '12px',
          }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Configurações</div>
            <div style={{ marginBottom: '8px' }}>Campo de Visão (FOV): {fov}°</div>
            <div style={{ marginBottom: '8px' }}>Modo VR: {isVR ? 'Ativado' : 'Desativado'}</div>
            <div style={{ marginBottom: '8px' }}>Volume: {Math.round(volume * 100)}%</div>
            <div style={{ marginBottom: '8px' }}>Resolução: Automática</div>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                ...buttonStyle,
                marginTop: '8px',
                width: '100%',
              }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');

  const handleVideoUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoName(file.name);
  }, []);

  const handleUrlSubmit = useCallback((url: string) => {
    setVideoSrc(url);
    const name = url.split('/').pop() || 'Vídeo Externo';
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
    <div style={{ width: '100%', height: '100vh' }}>
      {!videoSrc ? (
        <LandingPage
          onUpload={handleVideoUpload}
          onUrlSubmit={handleUrlSubmit}
        />
      ) : (
        <VideoPlayerComponent
          src={videoSrc}
          fileName={videoName}
          onBack={handleBackToHome}
          onFileChange={handleVideoUpload}
        />
      )}
    </div>
  );
}
