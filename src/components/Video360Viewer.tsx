
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ViewMode, VideoState, PlayerSettings, QualitySettings } from '../types';
import Scene from './Scene';
import Controls from './Controls';
import { Play, AlertCircle, RefreshCcw } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  fileName: string;
  onBack: () => void;
  onFileChange: (file: File) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, fileName, onBack, onFileChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isLooping: false,
    isBuffering: true,
  });

  const [settings, setSettings] = useState<PlayerSettings>({
    viewMode: ViewMode.Mode360,
    zoom: 75,
    headTracking: false,
    isVR: false,
  });

  const [qualitySettings, setQualitySettings] = useState<QualitySettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    resolution: 'auto',
    colorProfile: 'standard',
  });

  const [controlsVisible, setControlsVisible] = useState(true);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [textureKey, setTextureKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    switch (qualitySettings.resolution) {
      case '720p': return 1;
      case '1080p': return 1.5;
      case '4k': return Math.min(window.devicePixelRatio, 2.5);
      case 'auto': default: return window.devicePixelRatio;
    }
  }, [qualitySettings.resolution]);

  // Handle fullscreen state change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Função para esconder os controles
  const startHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    
    // Só inicia o timer de esconder se estiver tocando
    if (videoRef.current && !videoRef.current.paused) {
      startHideTimer();
    }
  }, [startHideTimer]);

  // Modified togglePlay to open file picker and remove play/pause logic
  const togglePlay = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setNeedsInteraction(false);
      setLoadError(null);
      setVideoState(prev => ({ ...prev, isPlaying: true }));
      setTextureKey(prev => prev + 1);
    } catch (err) {
      console.warn("Autoplay blocked:", err);
      setNeedsInteraction(true);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoadError(null);
    setNeedsInteraction(false);

    video.crossOrigin = "anonymous";
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    video.src = src;
    video.load();

    const onLoadedMetadata = () => {
      setVideoState(prev => ({ ...prev, duration: video.duration }));
      attemptPlay();
    };
    
    const onTimeUpdate = () => {
      setVideoState(prev => ({ 
        ...prev, 
        currentTime: video.currentTime, 
        progress: video.duration ? (video.currentTime / video.duration) * 100 : 0 
      }));
    };
    
    const onPlay = () => {
      setVideoState(prev => ({ ...prev, isPlaying: true }));
      startHideTimer();
    };
    
    const onPause = () => {
      setVideoState(prev => ({ ...prev, isPlaying: false }));
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };

    const onError = () => {
      let message = "Erro ao carregar vídeo ou problema de CORS.";
      if (video.error?.code === 3) message = "Erro de decodificação.";
      if (video.error?.code === 4) message = "Vídeo não suportado ou erro de acesso (CORS).";
      setLoadError(message);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [src, attemptPlay, startHideTimer]);

  const handleSeek = (value: number) => { 
    if (videoRef.current) { 
      videoRef.current.currentTime = (value / 100) * videoState.duration; 
      handleMouseMove();
    }
  };

  const toggleMute = () => { 
    if (videoRef.current) { 
      const newMute = !videoState.isMuted;
      videoRef.current.muted = newMute; 
      setVideoState(prev => ({ ...prev, isMuted: newMute })); 
      handleMouseMove();
    }
  };

  const handleVolume = (value: number) => { 
    if (videoRef.current) { 
      videoRef.current.volume = value; 
      const isMuted = value === 0;
      videoRef.current.muted = isMuted; 
      setVideoState(prev => ({ ...prev, volume: value, isMuted })); 
      handleMouseMove();
    }
  };

  const changeSpeed = () => { 
    if (videoRef.current) { 
      const speeds = [0.5, 1, 1.5, 2]; 
      const next = speeds[(speeds.indexOf(videoState.playbackRate) + 1) % speeds.length]; 
      videoRef.current.playbackRate = next; 
      setVideoState(prev => ({ ...prev, playbackRate: next })); 
      handleMouseMove();
    }
  };

  const toggleLoop = () => { 
    if (videoRef.current) { 
      const newState = !videoState.isLooping;
      videoRef.current.loop = newState; 
      setVideoState(prev => ({ ...prev, isLooping: newState })); 
      handleMouseMove();
    }
  };

  const toggleVR = useCallback(() => {
    setSettings(p => ({ ...p, isVR: !p.isVR }));
    handleMouseMove();
  }, [handleMouseMove]);

  const requestHeadTracking = async () => { 
    handleMouseMove();
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') { 
      try { 
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setSettings(p => ({ ...p, headTracking: !p.headTracking }));
        }
      } catch (e) { console.error(e); } 
    } else { 
      setSettings(p => ({ ...p, headTracking: !p.headTracking })); 
    }
  };

  const handleZoom = (dir: 'in' | 'out') => {
    setSettings(p => ({ ...p, zoom: dir === 'in' ? Math.max(30, p.zoom - 10) : Math.min(110, p.zoom + 10) }));
    handleMouseMove();
  };
  
  const handleDownload = () => { 
    handleMouseMove();
    if (src.startsWith('blob:')) {
      const a = document.createElement('a'); 
      a.href = src; 
      a.download = fileName || 'dodge-recian-premium.mp4'; 
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a); 
    } else {
      window.open(src, '_blank');
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setControlsVisible(true)}
      className="relative w-full h-full dark-player-bg overflow-hidden select-none flex flex-col items-center justify-center"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLocalFileChange} 
        accept="video/*" 
        className="hidden" 
      />
      <video 
        ref={videoRef} 
        className="hidden"
        playsInline 
        autoPlay={false}
        preload="auto"
        muted={videoState.isMuted}
        loop={videoState.isLooping}
        crossOrigin="anonymous"
      />
      
      <div className={`relative transition-all duration-700 ease-in-out bg-[#000] overflow-hidden ${settings.isVR || isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-[98%] h-[90%] rounded-none gold-border-gradient shadow-[0_0_60px_rgba(212,175,55,0.2)]'}`}>
        {!loadError ? (
          <Canvas 
            className="w-full h-full cursor-move" 
            camera={{ position: [0, 0, 0.1], fov: 75 }} 
            dpr={dpr} 
            gl={{
              antialias: true, 
              powerPreference: 'high-performance', 
              alpha: false,
              stencil: false,
              depth: true
            }}
          >
            <Scene 
              key={`scene-${textureKey}-${src}`} 
              videoElement={videoRef.current} 
              viewMode={settings.viewMode} 
              zoom={settings.zoom} 
              headTracking={settings.headTracking} 
              quality={qualitySettings} 
              isVR={settings.isVR}
            />
          </Canvas>
        ) : (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-dr-black/90 p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-serif gold-text-effect mb-4 uppercase tracking-widest text-dr-gold">Acesso Negado ou Erro</h2>
            <p className="text-dr-gray max-w-md mb-8 leading-relaxed">{loadError}</p>
            <div className="flex gap-4">
              <button onClick={onBack} className="px-6 py-2 border border-dr-gold/30 text-dr-gold hover:bg-dr-gold/10 transition-colors uppercase text-xs font-bold tracking-widest">Voltar</button>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-dr-gold text-dr-black hover:bg-dr-goldLight transition-colors uppercase text-xs font-bold tracking-widest">Recarregar</button>
            </div>
          </div>
        )}

        {needsInteraction && !loadError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-dr-black/90 backdrop-blur-md">
            <div className="flex flex-col items-center space-y-8 animate-fade-in-up">
              <button 
                onClick={togglePlay}
                className="gold-play-btn"
              >
                <Play size={48} fill="currentColor" />
              </button>
              <div className="text-center space-y-2">
                <p className="text-dr-gold text-2xl font-serif tracking-[0.2em] italic uppercase">Elite Immersive Video</p>
                <p className="text-dr-gray text-sm tracking-widest uppercase">Tap to unveil the masterpiece</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Controls 
        visible={controlsVisible}
        state={videoState}
        settings={settings}
        quality={qualitySettings}
        fileName={fileName}
        isFullscreen={isFullscreen}
        onPlayPause={togglePlay}
        onSeek={handleSeek}
        onMute={toggleMute}
        onVolume={handleVolume}
        onSpeedChange={changeSpeed}
        onLoopToggle={toggleLoop}
        onVRToggle={toggleVR}
        onViewModeChange={(mode) => { setSettings(s => ({ ...s, viewMode: mode })); handleMouseMove(); }}
        onHeadTrackingToggle={requestHeadTracking}
        onZoom={handleZoom}
        onBack={onBack}
        onDownload={handleDownload}
        onFileChange={onFileChange}
        onQualityChange={(q) => { setQualitySettings(q); handleMouseMove(); }}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};

export default VideoPlayer;
