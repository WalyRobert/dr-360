
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ViewMode, VideoState, PlayerSettings, QualitySettings } from '../types';
import Scene from './Scene';
import Controls from './Controls';
import { Play, AlertCircle, ChevronLeft, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  fileName: string;
  onBack: () => void;
  onFileChange: (file: File) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, fileName, onBack, onFileChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const xrSessionRef = useRef<XRSession | null>(null);
  const xrSessionStarterRef = useRef<(() => Promise<void>) | null>(null);
  const userSelectedViewModeRef = useRef(false);

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
    poleCapsEnabled: true,
    poleCapDiameter: 1.6,
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

  const handleXrSessionChange = useCallback((session: XRSession | null) => {
    xrSessionRef.current = session;
  }, []);

  const handleXrSessionStarterReady = useCallback((starter: (() => Promise<void>) | null) => {
    xrSessionStarterRef.current = starter;
  }, []);

  const exitImmersive = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    const session = xrSessionRef.current;
    if (session) {
      void session.end().catch((error: unknown) => {
        console.warn('Não foi possível encerrar a sessão VR:', error);
      });
    }

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch((error: unknown) => {
        console.warn('Não foi possível sair da tela cheia:', error);
      });
    }

    setControlsVisible(true);
  }, []);

  const handleBack = useCallback(() => {
    exitImmersive();
    onBack();
  }, [exitImmersive, onBack]);

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
      const fullscreen = !!document.fullscreenElement;
      setIsFullscreen(fullscreen);
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
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
      void document.exitFullscreen().catch((error: unknown) => {
        console.error('Error attempting to exit full-screen mode:', error);
      });
    }
  }, []);

  const requestImmersiveView = useCallback(() => {
    const startSession = xrSessionStarterRef.current;
    if (!startSession) {
      if (!document.fullscreenElement) toggleFullscreen();
      return;
    }

    void startSession().catch((error: unknown) => {
      console.warn('Não foi possível iniciar o modo imersivo:', error);
      if (!document.fullscreenElement) toggleFullscreen();
    });
  }, [toggleFullscreen]);

  // Função para esconder os controles
  const startHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isFullscreen || settings.isVR) {
      setControlsVisible(true);
      return;
    }
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, [isFullscreen, settings.isVR]);

  const handleMouseMove = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    
    // Só inicia o timer de esconder se estiver tocando
    if (videoRef.current && !videoRef.current.paused) {
      startHideTimer();
    }
  }, [startHideTimer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Backspace') return;
      if (!document.fullscreenElement && !xrSessionRef.current) return;
      event.preventDefault();
      exitImmersive();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [exitImmersive]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().then(() => {
        setNeedsInteraction(false);
      }).catch((error: unknown) => {
        console.warn('Não foi possível iniciar a reprodução:', error);
        setNeedsInteraction(true);
      });
    } else {
      video.pause();
    }
    handleMouseMove();
  }, [handleMouseMove]);

  const stopPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      video.currentTime = 0;
    }

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    setVideoState(previous => ({ ...previous, isPlaying: false, currentTime: 0, progress: 0 }));
  }, []);

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
    userSelectedViewModeRef.current = false;

    const onLoadedMetadata = () => {
      setVideoState(prev => ({ ...prev, duration: video.duration }));
      const aspectRatio = video.videoWidth / video.videoHeight;
      // 2:1 is the usual equirectangular layout for 360° video. Other
      // aspect ratios default to a flat screen and can be changed manually.
      const detectedMode = aspectRatio >= 1.9 && aspectRatio <= 2.1
        ? ViewMode.Mode360
        : ViewMode.ModeFlat;
      if (!userSelectedViewModeRef.current) {
        setSettings(prev => ({ ...prev, viewMode: detectedMode }));
      }
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
    if (settings.isVR) {
      exitImmersive();
      return;
    }

    const video = videoRef.current;
    if (video?.paused) {
      void video.play().then(() => {
        setNeedsInteraction(false);
      }).catch((error: unknown) => {
        console.warn('Não foi possível iniciar o vídeo antes do modo VR:', error);
        setNeedsInteraction(true);
      });
    }

    requestImmersiveView();
    handleMouseMove();
  }, [exitImmersive, handleMouseMove, requestImmersiveView, settings.isVR]);

  const changeViewMode = useCallback((mode: ViewMode) => {
    userSelectedViewModeRef.current = true;
    setSettings(previous => ({ ...previous, viewMode: mode }));
    handleMouseMove();

    if (settings.isVR) return;

    requestImmersiveView();
  }, [handleMouseMove, requestImmersiveView, settings.isVR]);

  const handleXrActiveChange = useCallback((active: boolean) => {
    if (active && hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setSettings((previous) => ({ ...previous, isVR: active }));
    setControlsVisible(true);
  }, []);

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
      onPointerMove={handleMouseMove}
      onPointerDown={handleMouseMove}
      onTouchStart={handleMouseMove}
      onMouseEnter={() => setControlsVisible(true)}
      className="relative w-full h-full dark-player-bg overflow-hidden select-none flex flex-col items-center justify-center"
    >
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
              poleCapsEnabled={settings.poleCapsEnabled}
              poleCapDiameter={settings.poleCapDiameter}
              quality={qualitySettings} 
              onXrActiveChange={handleXrActiveChange}
              onXrSessionChange={handleXrSessionChange}
              onXrSessionStarterReady={handleXrSessionStarterReady}
            />
          </Canvas>
        ) : (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-dr-black/90 p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-serif gold-text-effect mb-4 uppercase tracking-widest text-dr-gold">Acesso Negado ou Erro</h2>
            <p className="text-dr-gray max-w-md mb-8 leading-relaxed">{loadError}</p>
            <div className="flex gap-4">
              <button onClick={handleBack} className="px-6 py-2 border border-dr-gold/30 text-dr-gold hover:bg-dr-gold/10 transition-colors uppercase text-xs font-bold tracking-widest">Voltar</button>
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
        onStop={stopPlayback}
        onSeek={handleSeek}
        onMute={toggleMute}
        onVolume={handleVolume}
        onSpeedChange={changeSpeed}
        onLoopToggle={toggleLoop}
        onVRToggle={toggleVR}
        onViewModeChange={changeViewMode}
        onHeadTrackingToggle={requestHeadTracking}
        onZoom={handleZoom}
        onBack={handleBack}
        onDownload={handleDownload}
        onFileChange={onFileChange}
        onQualityChange={(q) => { setQualitySettings(q); handleMouseMove(); }}
        onPoleCapsToggle={() => { setSettings(s => ({ ...s, poleCapsEnabled: !s.poleCapsEnabled })); handleMouseMove(); }}
        onPoleCapDiameterChange={(diameter) => { setSettings(s => ({ ...s, poleCapDiameter: diameter })); handleMouseMove(); }}
        onToggleFullscreen={toggleFullscreen}
      />

      {isFullscreen && (
        <div className="absolute inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 p-4 pointer-events-none">
          <button
            type="button"
            onClick={handleBack}
            className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-full border border-dr-gold/60 bg-black/85 px-5 py-3 text-sm font-bold uppercase tracking-wider text-dr-gold shadow-gold-glow"
            aria-label="Sair do vídeo e voltar"
          >
            <ChevronLeft size={20} /> Voltar
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-full border border-dr-gold/60 bg-black/85 px-5 py-3 text-sm font-bold uppercase tracking-wider text-dr-gold shadow-gold-glow"
            aria-label="Sair da tela cheia"
          >
            <Minimize size={18} /> Sair da tela cheia
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
