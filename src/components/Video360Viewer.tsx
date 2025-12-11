import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, Download, Repeat, Glasses, Smartphone, FileVideo, ScanEye, Gauge, ZoomIn, ZoomOut } from 'lucide-react';

export default function Video360Viewer() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const stereoRef = useRef<THREE.StereoCamera | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isHeadTracking, setIsHeadTracking] = useState(false);
  const [isVR, setIsVR] = useState(false);
  const isVRRef = useRef(false);
  const [viewMode, setViewMode] = useState<'360' | '180' | '120'>('360');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fov, setFov] = useState(75);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ lon: 0, lat: 0, phi: 0, theta: 0 });
  const lastInteractionTimeRef = useRef(Date.now());
  const controlsTimeoutRef = useRef<number | null>(null);
  const isControlsHoveredRef = useRef(false);
  const orientationQuaternion = useRef(new THREE.Quaternion());
  const animationFrameRef = useRef<number | null>(null);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      fov, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    const stereo = new THREE.StereoCamera();
    stereo.eyeSep = 0.064;
    stereoRef.current = stereo;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // CORREÇÃO: Evitar adicionar canvas duplicado
    if (containerRef.current && renderer.domElement && !containerRef.current.contains(renderer.domElement)) {
      containerRef.current.appendChild(renderer.domElement);
    }
    
    rendererRef.current = renderer;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    videoRef.current = video;

    const geometry = new THREE.SphereGeometry(250, 64, 64);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Mouse/Touch event handlers
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      mouseRef.current.isDown = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      lastInteractionTimeRef.current = Date.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return;
      
      const deltaX = e.clientX - mouseRef.current.x;
      const deltaY = e.clientY - mouseRef.current.y;
      
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      
      rotationRef.current.lon -= deltaX * 0.1;
      rotationRef.current.lat += deltaY * 0.1;
      rotationRef.current.lat = Math.max(-85, Math.min(85, rotationRef.current.lat));
      
      lastInteractionTimeRef.current = Date.now();
    };

    const onMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.isDown = true;
        lastInteractionTimeRef.current = Date.now();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && mouseRef.current.isDown) {
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - mouseRef.current.x;
        const deltaY = e.touches[0].clientY - mouseRef.current.y;
        
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        
        rotationRef.current.lon -= deltaX * 0.1;
        rotationRef.current.lat += deltaY * 0.1;
        rotationRef.current.lat = Math.max(-85, Math.min(85, rotationRef.current.lat));
        
        lastInteractionTimeRef.current = Date.now();
      }
    };

    const onTouchEnd = () => {
      mouseRef.current.isDown = false;
    };

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

      // Auto-center after inactivity
      const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
      if (timeSinceInteraction > 3000 && !mouseRef.current.isDown) {
        rotationRef.current.lon *= 0.95;
        rotationRef.current.lat *= 0.95;
      }

      // Update camera rotation
      if (isHeadTracking) {
        cameraRef.current.setRotationFromQuaternion(orientationQuaternion.current);
      } else {
        rotationRef.current.phi = THREE.MathUtils.degToRad(90 - rotationRef.current.lat);
        rotationRef.current.theta = THREE.MathUtils.degToRad(rotationRef.current.lon);
        
        cameraRef.current.target = new THREE.Vector3(
          500 * Math.sin(rotationRef.current.phi) * Math.cos(rotationRef.current.theta),
          500 * Math.cos(rotationRef.current.phi),
          500 * Math.sin(rotationRef.current.phi) * Math.sin(rotationRef.current.theta)
        );
        
        cameraRef.current.lookAt(cameraRef.current.target);
      }

      // Render
      if (isVRRef.current && stereoRef.current) {
        const width = containerRef.current?.clientWidth || 0;
        const height = containerRef.current?.clientHeight || 0;
        
        stereoRef.current.update(cameraRef.current);
        
        rendererRef.current.setScissorTest(true);
        
        // Left eye
        rendererRef.current.setViewport(0, 0, width / 2, height);
        rendererRef.current.setScissor(0, 0, width / 2, height);
        rendererRef.current.render(sceneRef.current, stereoRef.current.cameraL);
        
        // Right eye
        rendererRef.current.setViewport(width / 2, 0, width / 2, height);
        rendererRef.current.setScissor(width / 2, 0, width / 2, height);
        rendererRef.current.render(sceneRef.current, stereoRef.current.cameraR);
        
        rendererRef.current.setScissorTest(false);
      } else {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Video event listeners
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current && videoRef.current.duration) {
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
      }
    };

    const handleVideoError = () => {
      setError('Erro ao carregar vídeo. Tente outro arquivo ou URL.');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleVideoError);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleVideoError);
      
      // CORREÇÃO: Remover canvas antes de dispose
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, []);

  // Sync video properties
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Update FOV
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [fov]);

  // Update VR ref
  useEffect(() => {
    isVRRef.current = isVR;
  }, [isVR]);

  // Update geometry based on view mode
  useEffect(() => {
    if (!sphereRef.current) return;
    
    const geometry = sphereRef.current.geometry as THREE.SphereGeometry;
    
    switch(viewMode) {
      case '180':
        geometry.theta = Math.PI;
        break;
      case '120':
        geometry.theta = (2 * Math.PI) / 3;
        break;
      default:
        geometry.theta = 2 * Math.PI;
    }
    
    geometry.attributes.position.needsUpdate = true;
  }, [viewMode]);

  // Head tracking
  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha === null || event.beta === null || event.gamma === null) return;

    const alpha = THREE.MathUtils.degToRad(event.alpha);
    const beta = THREE.MathUtils.degToRad(event.beta);
    const gamma = THREE.MathUtils.degToRad(event.gamma);

    orientationQuaternion.current.setFromEuler(new THREE.Euler(beta, alpha, -gamma, 'YXZ'));
  };

  useEffect(() => {
    if (isHeadTracking) {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permission: string) => {
            if (permission === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(() => {
            setError('Permissão de orientação negada');
          });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isHeadTracking]);

  // Toggle functions
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        setError('Erro ao reproduzir vídeo');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleLoop = () => setIsLooping(!isLooping);
  const toggleHeadTracking = () => setIsHeadTracking(!isHeadTracking);
  const toggleVR = () => setIsVR(!isVR);

  const zoomIn = () => setFov(prev => Math.max(30, prev - 10));
  const zoomOut = () => setFov(prev => Math.min(120, prev + 10));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
    
    setError(null);
  };

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
    
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
    
    setError(null);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={wrapperRef} className="relative w-full h-screen bg-black">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
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
      
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Progress bar */}
            <div 
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Time */}
            <div className="flex justify-between text-white text-sm">
              <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button onClick={togglePlay} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </button>
                
                <button onClick={toggleMute} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                </button>
                
                <button onClick={toggleLoop} className={`p-2 rounded-lg transition ${isLooping ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'}`}>
                  <Repeat size={20} className="text-white" />
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  <Upload size={20} className="text-white" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={zoomIn} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  <ZoomIn size={20} className="text-white" />
                </button>
                
                <button onClick={zoomOut} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  <ZoomOut size={20} className="text-white" />
                </button>
                
                <button onClick={toggleHeadTracking} className={`p-2 rounded-lg transition ${isHeadTracking ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}>
                  <Smartphone size={20} className="text-white" />
                </button>
                
                <button onClick={toggleVR} className={`p-2 rounded-lg transition ${isVR ? 'bg-purple-500' : 'bg-white/10 hover:bg-white/20'}`}>
                  <Glasses size={20} className="text-white" />
                </button>
                
                <select 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="p-2 bg-white/10 text-white rounded-lg"
                >
                  <option value="360">360°</option>
                  <option value="180">180°</option>
                  <option value="120">120°</option>
                </select>
                
                <select 
                  value={playbackRate} 
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="p-2 bg-white/10 text-white rounded-lg"
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <FileVideo size={64} className="mx-auto opacity-50" />
            <h2 className="text-2xl font-bold">Carregue um vídeo 360°</h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              Selecionar Arquivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
