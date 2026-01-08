import React, { useState, useRef } from 'react';
import { RotateCw, Eye, Settings, Menu, ChevronLeft } from 'lucide-react';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isVRMode, setIsVRMode] = useState(false);
  const [mode360, setMode360] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

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
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background 0.2s',
    fontSize: '14px',
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#001a2e',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        overflow: 'hidden',
      }}
      onMouseMove={() => setShowControls(true)}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            color: '#fff',
            transition: 'opacity 0.3s',
            opacity: showControls ? 1 : 0,
          }}
        >
          {/* Left: Back Button */}
          <button
            onClick={() => window.history.back()}
            style={{
              ...buttonStyle,
              fontSize: '20px',
            } as React.CSSProperties}
            title="Voltar"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Center: Title */}
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px' }}>
            SUMMIT OF EVEREST
            <div style={{ fontSize: '10px', marginTop: '2px' }}>360°</div>
          </div>

          {/* Right: Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={buttonStyle as React.CSSProperties}
            title="Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src="https://media-files.vidstack.io/360_hd_demo.mp4"
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000',
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Left Side Button - Rotate */}
        <button
          onClick={() => setMode360(!mode360)}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            ...buttonStyle,
            fontSize: '32px',
            background: mode360 ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 5,
            transition: 'all 0.2s',
          } as React.CSSProperties}
          title="Modo 360"
        >
          <RotateCw size={32} />
        </button>

        {/* Center Play Button */}
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 188, 212, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(0, 188, 212, 0.5)',
            color: '#fff',
            fontSize: '48px',
            cursor: 'pointer',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            transition: 'all 0.2s',
          } as React.CSSProperties}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Right Side Button - Rotate */}
        <button
          onClick={() => setMode360(!mode360)}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            ...buttonStyle,
            fontSize: '32px',
            background: mode360 ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 5,
            transition: 'all 0.2s',
          } as React.CSSProperties}
          title="Modo 360"
        >
          <RotateCw size={32} />
        </button>

        {/* Bottom Controls Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            padding: '30px 15px 15px',
            color: '#fff',
            fontSize: '14px',
            zIndex: 10,
            transition: 'opacity 0.3s',
            opacity: showControls ? 1 : 0,
          }}
        >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            style={{
              width: '100%',
              height: '4px',
              cursor: 'pointer',
              marginBottom: '15px',
              background: 'rgba(0, 188, 212, 0.3)',
              borderRadius: '2px',
              WebkitAppearance: 'none',
              outline: 'none',
            }}
          />

          {/* Controls Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            {/* Left Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                style={{
                  ...buttonStyle,
                  fontSize: '20px',
                } as React.CSSProperties}
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {/* Volume Control */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ fontSize: '16px' }}>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '50px',
                    height: '3px',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Time Display */}
              <div style={{ fontSize: '11px', minWidth: '70px', fontFamily: 'monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {/* VR Mode */}
              <button
                onClick={() => setIsVRMode(!isVRMode)}
                style={{
                  ...buttonStyle,
                  background: isVRMode ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                } as React.CSSProperties}
                title="Modo VR"
              >
                <Eye size={18} />
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  ...buttonStyle,
                  background: showMenu ? 'rgba(0, 188, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                } as React.CSSProperties}
                title="Configurações"
              >
                <Settings size={18} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                style={{
                  ...buttonStyle,
                  fontSize: '18px',
                } as React.CSSProperties}
                title="Tela cheia"
              >
                {isFullscreen ? '⛶' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
