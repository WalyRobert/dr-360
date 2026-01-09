import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import Controls from './Controls';
import { ViewMode, QualitySettings, VideoState, PlayerSettings } from '../types';

interface Video360ViewerProps {
  onBack: () => void;
}

const defaultQuality: QualitySettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  colorProfile: 'natural',
  resolution: 'auto'
};

const defaultSettings: PlayerSettings = {
  viewMode: ViewMode.Mode360,
  headTracking: false,
  isVR: false
};

const Video360Viewer: React.FC<Video360ViewerProps> = ({ onBack }) => {
  // Video and Playback State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  // View and Display State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Mode360);
  const [zoom, setZoom] = useState(75);
  const [isVR, setIsVR] = useState(false);
  const [headTracking, setHeadTracking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Quality and Settings State
  const [quality, setQuality] = useState<QualitySettings>(defaultQuality);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fileName, setFileName] = useState('ElephantsDream.mp4');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(undefined);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isLooping]);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) return;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Mouse move to show controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (!isPlaying) return;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  // Video Controls Handlers
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

  const handleSeek = (percent: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = (percent / 100) * duration;
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      if (value > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
      setPlaybackRate(nextSpeed);
    }
  };

  const handleLoopToggle = () => {
    setIsLooping(!isLooping);
  };

  const handleVRToggle = () => {
    setIsVR(!isVR);
  };

  const handleHeadTrackingToggle = () => {
    setHeadTracking(!headTracking);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleZoom = (dir: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = dir === 'in' ? prev + 5 : prev - 5;
      return Math.max(20, Math.min(150, newZoom));
    });
  };

  const handleQualityChange = (newQuality: QualitySettings) => {
    setQuality(prev => ({ ...prev, ...newQuality }));
  };

  const handleFileChange = (file: File) => {
    setVideoFile(file);
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleDownload = () => {
    if (videoRef.current && videoRef.current.src) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = fileName || 'video-360.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Build video state object
  const videoState: VideoState = {
    currentTime,
    duration,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    isPlaying,
    isMuted,
    volume,
    playbackRate,
    isLooping,
    isBuffering: false
  };

  // Build player settings object
  const playerSettings: PlayerSettings = {
    viewMode,
    headTracking,
    isVR
  };

  // VR Layout: Two viewports (top and bottom)
  if (isVR) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#000',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          crossOrigin="anonymous"
          loop={isLooping}
          muted={isMuted}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Top Viewport */}
        <div
          style={{
            flex: '1 1 50%',
            position: 'relative',
            background: '#000',
            width: '100%',
            height: '50vh',
            display: 'flex',
            alignItems: 'stretch',
            overflow: 'hidden'
          }}
        >
          <Canvas
            camera={{ position: [-0.032, 0, 0.1], fov: zoom }}
            style={{ width: '100%', height: '100%' }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              precision: 'highp'
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

        {/* Bottom Viewport */}
        <div
          style={{
            flex: '1 1 50%',
            position: 'relative',
            background: '#000',
            width: '100%',
            height: '50vh',
            display: 'flex',
            alignItems: 'stretch',
            overflow: 'hidden'
          }}
        >
          <Canvas
            camera={{ position: [0.032, 0, 0.1], fov: zoom }}
            style={{ width: '100%', height: '100%' }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              precision: 'highp'
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
      </div>
    );
  }

  // Normal Layout: Single Canvas
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setControlsVisible(true)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        loop={isLooping}
        muted={isMuted}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Canvas Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
        }}
      >
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
      </div>

      {/* Controls */}
      <Controls
        visible={controlsVisible}
        state={videoState}
        settings={playerSettings}
        quality={quality}
        fileName={fileName}
        isFullscreen={isFullscreen}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onMute={handleMute}
        onVolume={handleVolumeChange}
        onSpeedChange={handleSpeedChange}
        onLoopToggle={handleLoopToggle}
        onVRToggle={handleVRToggle}
        onViewModeChange={handleViewModeChange}
        onHeadTrackingToggle={handleHeadTrackingToggle}
        onZoom={handleZoom}
        onBack={onBack}
        onDownload={handleDownload}
        onFileChange={handleFileChange}
        onQualityChange={handleQualityChange}
        onToggleFullscreen={handleToggleFullscreen}
      />
    </div>
  );
};

export default Video360Viewer;
