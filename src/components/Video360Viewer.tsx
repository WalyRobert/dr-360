import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Upload, Repeat, Glasses, Smartphone, FileVideo, ZoomIn, ZoomOut } from 'lucide-react';

export default function Video360Viewer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [viewMode, setViewMode] = useState<'360' | '180' | '120'>('360');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fov, setFov] = useState(75);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, startX: 0, startY: 0 });
  const rotationRef = useRef({ yaw: 0, pitch: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Setup Canvas
  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Canvas não suportado neste navegador');
      return;
    }

    canvasRef.current = canvas;
    ctxRef.current = ctx;
    
    if (!containerRef.current.contains(canvas)) {
      containerRef.current.appendChild(canvas);
    }

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    videoRef.current = video;

    // Mouse/Touch handlers
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      mouseRef.current.isDown = true;
      mouseRef.current.startX = e.clientX;
      mouseRef.current.startY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return;
      
      const deltaX = e.clientX - mouseRef.current.startX;
      const deltaY = e.clientY - mouseRef.current.startY;
      
      mouseRef.current.startX = e.clientX;
      mouseRef.current.startY = e.clientY;
      
      rotationRef.current.yaw += deltaX * 0.5;
      rotationRef.current.pitch = Math.max(-90, Math.min(90, rotationRef.current.pitch + deltaY * 0.5));
    };

    const onMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        mouseRef.current.isDown = true;
        mouseRef.current.startX = e.touches[0].clientX;
        mouseRef.current.startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && mouseRef.current.isDown) {
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - mouseRef.current.startX;
        const deltaY = e.touches[0].clientY - mouseRef.current.startY;
        
        mouseRef.current.startX = e.touches[0].clientX;
        mouseRef.current.startY = e.touches[0].clientY;
        
        rotationRef.current.yaw += deltaX * 0.5;
        rotationRef.current.pitch = Math.max(-90, Math.min(90, rotationRef.current.pitch + deltaY * 0.5));
      }
    };

    const onTouchEnd = () => {
      mouseRef.current.isDown = false;
    };

    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (!ctxRef.current || !canvasRef.current || !videoRef.current) return;
      if (videoRef.current.readyState < 2) return;

      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simple 360 projection (equirectangular)
      const zoom = fov / 75;
      const offsetX = (rotationRef.current.yaw * canvas.width) / 360;
      const offsetY = (rotationRef.current.pitch * canvas.height) / 180;
      
      try {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-canvas.width / 2 + offsetX, -canvas.height / 2 + offsetY);
        
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        ctx.restore();
      } catch (e) {
        // Ignore drawing errors
      }
    };
    
    animate();

    // Video event listeners
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
        setIsLoading(false);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current && videoRef.current.duration) {
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      }
    };

    const handleVideoError = () => {
      setError('Erro ao carregar vídeo. Tente outro arquivo.');
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleVideoError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleVideoError);
      video.removeEventListener('canplay', handleCanPlay);
      
      if (containerRef.current && canvas && containerRef.current.contains(canvas)) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, [fov]);

  // Sync video properties
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [isLooping, isMuted, playbackRate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setError('Erro ao reproduzir: ' + err.message);
          setIsPlaying(false);
        });
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleLoop = () => setIsLooping(!isLooping);

  const zoomIn = () => setFov(prev => Math.max(30, prev - 10));
  const zoomOut = () => setFov(prev => Math.min(120, prev + 10));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setIsLoading(true);
    setError(null);
    
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadSampleVideo = () => {
    const sampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    setVideoUrl(sampleUrl);
    setIsLoading(true);
    setError(null);
    
    if (videoRef.current) {
      videoRef.current.src = sampleUrl;
      videoRef.current.load();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full h-screen bg-black overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-4 underline"
          >
            Fechar
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}
      
      <div ref={containerRef} className="w-full h-full" />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {showControls && videoUrl && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-30">
          <div className="max-w-6xl mx-auto space-y-4">
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-white text-sm">
              <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button 
                  onClick={togglePlay} 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </button>
                
                <button 
                  onClick={toggleMute} 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  title={isMuted ? 'Ativar som' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                </button>
                
                <button 
                  onClick={toggleLoop} 
                  className={`p-3 rounded-lg transition ${isLooping ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'}`}
                  title="Loop"
                >
                  <Repeat size={20} className="text-white" />
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  title="Carregar vídeo"
                >
                  <Upload size={20} className="text-white" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={zoomIn} 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  title="Zoom in"
                >
                  <ZoomIn size={20} className="text-white" />
                </button>
                
                <button 
                  onClick={zoomOut} 
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                  title="Zoom out"
                >
                  <ZoomOut size={20} className="text-white" />
                </button>
                
                <select 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="p-2 bg-white/10 text-white rounded-lg border-none outline-none"
                  title="Modo de visualização"
                >
                  <option value="360">360°</option>
                  <option value="180">180°</option>
                  <option value="120">120°</option>
                </select>
                
                <select 
                  value={playbackRate} 
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="p-2 bg-white/10 text-white rounded-lg border-none outline-none"
                  title="Velocidade"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white space-y-6 p-8">
            <FileVideo size={64} className="mx-auto opacity-50" />
            <h2 className="text-3xl font-bold">Visualizador de Vídeo 360°</h2>
            <p className="text-gray-400 max-w-md">
              Carregue um vídeo 360° do seu dispositivo ou teste com um vídeo de exemplo
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition font-medium"
              >
                Selecionar Arquivo
              </button>
              <button 
                onClick={loadSampleVideo}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg transition font-medium"
              >
                Testar com Exemplo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Arraste para navegar • Scroll para zoom
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
