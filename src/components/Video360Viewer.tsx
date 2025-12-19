import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ViewMode, VideoState, PlayerSettings, QualitySettings } from '../types';
import Scene from './Scene';
import Controls from './Controls';
import { Play } from 'lucide-react';



const DEFAULT_VIDEO_URL = 'https://sample-videos.com/zip/360-sweet-potato-chips.zip';

interface VideoPlayerProps {
  src: string;
  fileName: string;
  onBack: () => void;
  onFileChange: (file: File) => void;
}


const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, fileName, onBack, onFileChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: true,
    playbackRate: 1,
    isLooping: false,
    isBuffering: true,
  });


  const [settings, setSettings] = useState<PlayerSettings>({
    viewMode: ViewMode.Mode360,
    isVR: false,
    zoom: 75,
    headTracking: false,
  });


  const [qualitySettings, setQualitySettings] = useState<QualitySettings>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    resolution: 'auto',
    colorProfile: 'standard',
  });


  const [uiVisible, setUiVisible] = useState(true);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [textureKey, setTextureKey] = useState(0);


  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    switch (qualitySettings.resolution) {
      case '720p': return 1;
      case '1080p': return 1.5;
      case '4k': return Math.min(window.devicePixelRatio, 2.5);
      case 'auto': default: return window.devicePixelRatio;
    }
  }, [qualitySettings.resolution]);


  const showUI = useCallback(() => {
    setUiVisible(true);
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    activityTimerRef.current = setTimeout(() => {
      if (videoState.isPlaying) setUiVisible(false);
    }, 3000);
  }, [videoState.isPlaying]);


  const attemptPlay = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setNeedsInteraction(false);
      setTextureKey(prev => prev + 1);
    } catch (err) {
      console.warn("Autoplay bloqueado. Aguardando interação.", err);
      setNeedsInteraction(true);
    }
  }, []);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;


    video.src = src;
    video.load();


    const onLoadedMetadata = () => {
      setVideoState(prev => ({ ...prev, duration: video.duration }));
      attemptPlay();
    };
    
    const onTimeUpdate = () => setVideoState(prev => ({ 
      ...prev, 
      currentTime: video.currentTime, 
      progress: (video.currentTime / video.duration) * 100 
    }));
    const onPlay = () => {
      setVideoState(prev => ({ ...prev, isPlaying: true }));
      setNeedsInteraction(false);
    };
    const onPause = () => setVideoState(prev => ({ ...prev, isPlaying: false }));
    const onWaiting = () => setVideoState(prev => ({ ...prev, isBuffering: true }));
    const onCanPlay = () => setVideoState(prev => ({ ...prev, isBuffering: false }));


    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);


    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [src, attemptPlay]);


  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleInteraction = () => showUI();
    container.addEventListener('mousemove', handleInteraction);
    container.addEventListener('touchstart', handleInteraction);
    container.addEventListener('click', handleInteraction);
    showUI();
    return () => {
      container.removeEventListener('mousemove', handleInteraction);
      container.removeEventListener('touchstart', handleInteraction);
      container.removeEventListener('click', handleInteraction);
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, [showUI]);


  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoState.isPlaying) {
      videoRef.current.pause();
    } else {
      attemptPlay();
    }
  };


  const handleSeek = (value: number) => { 
    if (videoRef.current) { 
      videoRef.current.currentTime = (value / 100) * videoState.duration; 
      setVideoState(prev => ({ ...prev, progress: value })); 
    }
  };


  const toggleMute = () => { 
    if (videoRef.current) { 
      videoRef.current.muted = !videoState.isMuted; 
      setVideoState(prev => ({ ...prev, isMuted: !prev.isMuted })); 
    }
  };


  const handleVolume = (value: number) => { 
    if (videoRef.current) { 
      videoRef.current.volume = value; 
      videoRef.current.muted = value === 0; 
      setVideoState(prev => ({ ...prev, volume: value, isMuted: value === 0 })); 
    }
  };


  const changeSpeed = () => { 
    if (videoRef.current) { 
      const speeds = [0.5, 1, 1.5, 2]; 
      const next = speeds[(speeds.indexOf(videoState.playbackRate) + 1) % speeds.length]; 
      videoRef.current.playbackRate = next; 
      setVideoState(prev => ({ ...prev, playbackRate: next })); 
    }
  };


  const toggleLoop = () => { 
    if (videoRef.current) { 
      videoRef.current.loop = !videoState.isLooping; 
      setVideoState(prev => ({ ...prev, isLooping: !prev.isLooping })); 
    }
  };


  const toggleVR = () => setSettings(prev => ({ ...prev, isVR: !prev.isVR, headTracking: !prev.isVR }));
  
  const requestHeadTracking = async () => { 
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') { 
      try { 
        if (await (DeviceOrientationEvent as any).requestPermission() === 'granted') 
          setSettings(p => ({ ...p, headTracking: !p.headTracking })); 
      } catch (e) { console.error(e); } 
    } else { 
      setSettings(p => ({ ...p, headTracking: !p.headTracking })); 
    }
  };


  const handleZoom = (dir: 'in' | 'out') => setSettings(p => ({ ...p, zoom: dir === 'in' ? Math.max(30, p.zoom - 10) : Math.min(110, p.zoom + 10) }));
  
  const handleDownload = () => { 
    const a = document.createElement('a'); 
    a.href = src; 
    a.download = fileName || 'video-360.mp4'; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
  };


  return (
    <div ref={containerRef} className="relative w-full h-full bg-black">
      <video 
        ref={videoRef} 
        className="hidden" 
        crossOrigin="anonymous" 
        playsInline 
        muted={videoState.isMuted}
        loop={videoState.isLooping} 
      />
      
      <Canvas 
        className="w-full h-full cursor-move"
        dpr={dpr}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          alpha: false 
        }}
      >
        <Scene 
          key={`scene-${textureKey}`}
          videoElement={videoRef.current} 
          viewMode={settings.viewMode}
          zoom={settings.zoom}
          headTracking={settings.headTracking}
          isVR={settings.isVR}
          autoCenter={true}
          quality={qualitySettings}
        />
      </Canvas>


      {needsInteraction && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all">
          <button 
            onClick={togglePlay}
            className="p-10 bg-[#D4AF37] text-white rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          >
            <Play size={56} fill="white" />
          </button>
        </div>
      )}


      <Controls 
        visible={uiVisible}
        state={videoState}
        settings={settings}
        quality={qualitySettings}
        fileName={fileName}
        onPlayPause={togglePlay}
        onSeek={handleSeek}
        onMute={toggleMute}
        onVolume={handleVolume}
        onSpeedChange={changeSpeed}
        onLoopToggle={toggleLoop}
        onVRToggle={toggleVR}
        onViewModeChange={(mode) => setSettings(s => ({ ...s, viewMode: mode }))}
        onHeadTrackingToggle={requestHeadTracking}
        onZoom={handleZoom}
        onBack={onBack}
        onDownload={handleDownload}
        onFileChange={onFileChange}
        onQualityChange={setQualitySettings}
      />
    </div>
  );
};


export default VideoPlayer;
