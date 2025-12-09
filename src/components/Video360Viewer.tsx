import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, Download, Repeat, Glasses, Smartphone, FileVideo, ScanEye, Gauge, ZoomIn, ZoomOut } from 'lucide-react';

export default function Video360Viewer() {
  const wrapperRef = useRef<HTMLDivElement>(null); // New ref for the main wrapper
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
  
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ lon: 0, lat: 0, phi: 0, theta: 0 });
  const lastInteractionTimeRef = useRef(Date.now());

  // Refs for auto-hide controls logic
  const controlsTimeoutRef = useRef<number | null>(null);
  const isControlsHoveredRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      fov, // Initial FOV
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // Setup Stereo Camera (VR)
    const stereo = new THREE.StereoCamera();
    stereo.eyeSep = 0.064; 
    stereoRef.current = stereo;

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup Video
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = true; 
    video.muted = isMuted;
    videoRef.current = video;

    // Create Sphere Geometry (Initial)
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

    // Mouse Controls
    const onMouseDown = (e: MouseEvent) => {
      if (isHeadTracking) return;
      mouseRef.current.isDown = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      lastInteractionTimeRef.current = Date.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isHeadTracking) return;
      if (!mouseRef.current.isDown) return;

      const deltaX = e.clientX - mouseRef.current.x;
      const deltaY = e.clientY - mouseRef.current.y;

      rotationRef.current.lon += deltaX * 0.1;
      rotationRef.current.lat -= deltaY * 0.1;
      rotationRef.current.lat = Math.max(-85, Math.min(85, rotationRef.current.lat));

      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      lastInteractionTimeRef.current = Date.now();
    };

    const onMouseUp = () => {
      mouseRef.current.isDown = false;
      lastInteractionTimeRef.current = Date.now();
    };

    // Touch Controls
    const onTouchStart = (e: TouchEvent) => {
      if (isHeadTracking) return;
      const touch = e.touches[0];
      mouseRef.current.isDown = true;
      mouseRef.current.x = touch.clientX;
      mouseRef.current.y = touch.clientY;
      lastInteractionTimeRef.current = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isHeadTracking) return;
      if (!mouseRef.current.isDown) return;
      const touch = e.touches[0];
      
      const deltaX = touch.clientX - mouseRef.current.x;
      const deltaY = touch.clientY - mouseRef.current.y;

      rotationRef.current.lon += deltaX * 0.1;
      rotationRef.current.lat -= deltaY * 0.1;
      rotationRef.current.lat = Math.max(-85, Math.min(85, rotationRef.current.lat));

      mouseRef.current.x = touch.clientX;
      mouseRef.current.y = touch.clientY;
      lastInteractionTimeRef.current = Date.now();
    };

    const onTouchEnd = () => {
      mouseRef.current.isDown = false;
      lastInteractionTimeRef.current = Date.now();
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Auto-center logic
      if (!isHeadTracking && !mouseRef.current.isDown) {
        const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
        if (timeSinceInteraction > 5000) { // 5 seconds
           // Simple ease back to 0
           rotationRef.current.lat = THREE.MathUtils.lerp(rotationRef.current.lat, 0, 0.05);
           // Optional: Center longitude as well, or just keep spinning/floating?
           // rotationRef.current.lon = THREE.MathUtils.lerp(rotationRef.current.lon, 0, 0.05);
        }
      }

      // Camera Rotation Logic
      if (isHeadTracking && cameraRef.current) {
         // Head tracking rotation uses quaternion now (handled in orientation event or here if needed)
         // Actually, typically we apply quaternion directly to camera object.
         // However, the previous implementation updated rotationRef.lon/lat from alpha/beta/gamma.
         // Let's stick to the rotationRef mapping logic implemented below in the useEffect.
      }
      
      rotationRef.current.phi = THREE.MathUtils.degToRad(90 - rotationRef.current.lat);
      rotationRef.current.theta = THREE.MathUtils.degToRad(rotationRef.current.lon);

      // Orbit camera at a fixed radius from center (0,0,0) inside the sphere
      const r = 0.1; 
      camera.position.x = r * Math.sin(rotationRef.current.phi) * Math.cos(rotationRef.current.theta);
      camera.position.y = r * Math.cos(rotationRef.current.phi);
      camera.position.z = r * Math.sin(rotationRef.current.phi) * Math.sin(rotationRef.current.theta);

      camera.lookAt(scene.position);
      
      // Apply device orientation roll if needed? 
      // The current simple lat/lon mapping doesn't fully support 3-axis roll perfectly without quaternions.
      // But for this request, we are just maintaining existing logic + adding speed control.
      
      // VR Rendering Logic
      if (isVRRef.current && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        renderer.setScissorTest(true);

        stereo.update(camera);

        // Render Left Eye
        renderer.setScissor(0, 0, width / 2, height);
        renderer.setViewport(0, 0, width / 2, height);
        renderer.render(scene, stereo.cameraL);

        // Render Right Eye
        renderer.setScissor(width / 2, 0, width / 2, height);
        renderer.setViewport(width / 2, 0, width / 2, height);
        renderer.render(scene, stereo.cameraR);

        renderer.setScissorTest(false);
      } else {
        // Normal Rendering
        if (containerRef.current) {
          renderer.setViewport(0, 0, containerRef.current.clientWidth, containerRef.current.clientHeight);
          renderer.setScissorTest(false);
        }
        renderer.render(scene, camera);
      }
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('touchend', onTouchEnd);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Camera FOV when state changes
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [fov]);

  // Effect to update geometry based on viewMode
  useEffect(() => {
    if (!sphereRef.current) return;

    const mesh = sphereRef.current;
    // Dispose old geometry
    mesh.geometry.dispose();

    let newGeometry;
    
    // Create new geometry based on mode
    // Note: The scale(-1, 1, 1) is applied to invert normals
    switch (viewMode) {
      case '180':
        // Half sphere
        newGeometry = new THREE.SphereGeometry(250, 64, 64, 0, Math.PI);
        break;
      case '120':
        // 1/3 sphere approx (120 degrees)
        newGeometry = new THREE.SphereGeometry(250, 64, 64, 0, (Math.PI * 2) / 3);
        break;
      case '360':
      default:
        // Full sphere
        newGeometry = new THREE.SphereGeometry(250, 64, 64);
        break;
    }

    newGeometry.scale(-1, 1, 1);
    
    // Rotate mesh to center the view for 180/120 modes if needed
    // For a standard equirectangular video, 0 is the center back, we want it centered
    if (viewMode !== '360') {
      mesh.rotation.y = -Math.PI / 2;
    } else {
      mesh.rotation.y = 0;
    }

    mesh.geometry = newGeometry;

  }, [viewMode]);

  // Controls Visibility Logic
  const handleUserActivity = () => {
    setShowControls(true);
    lastInteractionTimeRef.current = Date.now();
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    // Only set timeout if we are not hovering controls
    if (!isControlsHoveredRef.current) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleControlsMouseEnter = () => {
    isControlsHoveredRef.current = true;
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleControlsMouseLeave = () => {
    isControlsHoveredRef.current = false;
    handleUserActivity();
  };

  // Init activity timer
  useEffect(() => {
    handleUserActivity();
    return () => {
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Head Tracking Logic using Quaternions for 3-axis
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (!isHeadTracking) return;
      
      // Basic fallback to lon/lat if quaternions aren't fully implemented in the loop
      // But let's try to map gamma/beta/alpha to lon/lat as before for stability
      const alpha = event.alpha ? event.alpha : 0; 
      const beta = event.beta ? event.beta : 0;   
      const gamma = event.gamma ? event.gamma : 0; 

      const isLandscape = window.innerWidth > window.innerHeight;

      if (isLandscape) {
        rotationRef.current.lon = alpha + 90; 
        rotationRef.current.lat = -gamma; 
      } else {
        rotationRef.current.lon = alpha;
        rotationRef.current.lat = Math.max(-85, Math.min(85, beta - 90));
      }
    };

    if (isHeadTracking) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isHeadTracking]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
        setIsPlaying(false);
        handleUserActivity();
      }
    }
  };

  const handleFileSelectTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    handleUserActivity();
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video-360-${Date.now()}.mp4`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar:", error);
    }
  };

  const togglePlay = () => {
    handleUserActivity();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    handleUserActivity();
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    handleUserActivity();
    setIsLooping(!isLooping);
  };
  
  const togglePlaybackRate = () => {
    handleUserActivity();
    // Cycle through rates: 0.5 -> 1 -> 1.5 -> 2 -> 0.5
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };
  
  const handleZoomIn = () => {
    handleUserActivity();
    setFov(prev => Math.max(30, prev - 10)); // Min FOV 30
  };

  const handleZoomOut = () => {
    handleUserActivity();
    setFov(prev => Math.min(110, prev + 10)); // Max FOV 110
  };

  const toggleViewMode = () => {
    handleUserActivity();
    if (viewMode === '360') setViewMode('180');
    else if (viewMode === '180') setViewMode('120');
    else setViewMode('360');
  };

  const toggleVR = () => {
    handleUserActivity();
    const newState = !isVR;
    setIsVR(newState);
    isVRRef.current = newState;
    
    // Updated to use wrapperRef so overlay/lines are included if needed
    if (newState && wrapperRef.current && !document.fullscreenElement) {
       wrapperRef.current.requestFullscreen().catch(console.error);
    }
    
    setTimeout(() => {
       window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  const toggleHeadTracking = async () => {
    handleUserActivity();
    if (!isHeadTracking) {
      // iOS 13+ permission check
      if (
        typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        try {
          const permissionState = await (DeviceOrientationEvent as any).requestPermission();
          if (permissionState === 'granted') {
            setIsHeadTracking(true);
          } else {
            alert("Permissão para giroscópio negada.");
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // Non-iOS 13+ devices
        setIsHeadTracking(true);
      }
    } else {
      setIsHeadTracking(false);
    }
  };

  const toggleFullscreen = () => {
    handleUserActivity();
    if (wrapperRef.current) { // Updated to use wrapperRef
      if (!document.fullscreenElement) {
        wrapperRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleUserActivity();
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
    <div 
      ref={wrapperRef} // Attached wrapperRef here
      className="w-full h-screen bg-black relative overflow-hidden font-sans"
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      onTouchStart={handleUserActivity}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Input Section - Premium Design */}
      {!videoUrl && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
          {/* Ambient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]" />
          
          {/* Decorative Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-[#D4AF37] opacity-[0.03] blur-[120px] rounded-full pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-12 p-4 w-full max-w-4xl animate-in fade-in zoom-in duration-1000">
            {/* Header Group */}
            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-[#D4AF37] drop-shadow-[0_0_35px_rgba(212,175,55,0.25)] select-none">
                DR 360°
              </h1>
              
              <div className="flex flex-col items-center gap-2">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />
                <p className="text-xl md:text-2xl font-light tracking-[0.2em] text-[#D4AF37] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Dodge Recian
                </p>
                <p className="text-sm md:text-base text-[#D4AF37]/60 tracking-widest font-light">
                  Experiência Imersiva Premium
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="group relative mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#F2C94C] rounded-2xl blur opacity-20 group-hover:opacity-70 transition duration-500"></div>
              
              <button 
                onClick={handleFileSelectTrigger}
                className="relative bg-[#D4AF37] hover:bg-[#E5C158] text-black text-lg md:text-xl font-bold px-12 py-5 rounded-2xl flex items-center gap-4 shadow-[0_10px_30px_rgba(212,175,55,0.2)] transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 active:translate-y-0"
              >
                <Upload className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
                <span>Carregar Vídeo Local</span>
              </button>
            </div>
          </div>

          {/* Footer Hint */}
          <div className="absolute bottom-12 px-8 py-4 rounded-full bg-[#D4AF37]/[0.03] backdrop-blur-md border border-[#D4AF37]/10 flex items-center gap-3 text-[#D4AF37]/50 text-sm font-medium hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/5 transition-all duration-500 select-none">
             <span className="text-base filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">💡</span>
             <span>Suporta vídeos equiretangulares (formato 360° padrão)</span>
          </div>
        </div>
      )}

      {/* 360 Viewer Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* VR Split Line */}
      {isVR && (
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-black z-10 opacity-50 pointer-events-none" />
      )}

      {/* Controls */}
      {videoUrl && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-8 transition-opacity duration-500 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-neutral-800 rounded-full mb-6 cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-[#D4AF37] rounded-full transition-all duration-100 relative shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-0 group-hover:scale-100" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={togglePlay}
                className="bg-[#D4AF37] hover:bg-[#F2C94C] text-black p-4 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg shadow-[#D4AF37]/20"
              >
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
              </button>

              <div className="flex items-center gap-4 bg-neutral-900/50 backdrop-blur-md p-2 rounded-xl border border-white/5">
                <button
                  onClick={toggleMute}
                  className="text-[#D4AF37] hover:text-white p-2 rounded-lg transition-colors"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>

                <span className="text-[#D4AF37] font-mono text-sm px-2 border-l border-white/10">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleZoomIn}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group"
                title="Zoom In"
              >
                <ZoomIn size={24} className="group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={handleZoomOut}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group"
                title="Zoom Out"
              >
                <ZoomOut size={24} className="group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={togglePlaybackRate}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group flex flex-col items-center justify-center min-w-[50px]"
                title={`Velocidade: ${playbackRate}x`}
              >
                <Gauge size={20} className="group-hover:scale-110 transition-transform mb-0.5" />
                <span className="text-[10px] font-bold leading-none">{playbackRate}x</span>
              </button>

              <button
                onClick={toggleViewMode}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group flex flex-col items-center justify-center min-w-[50px]"
                title={`Alterar Visualização (Atual: ${viewMode}°)`}
              >
                <ScanEye size={20} className="group-hover:scale-110 transition-transform mb-0.5" />
                <span className="text-[10px] font-bold leading-none">{viewMode}°</span>
              </button>

              <button
                onClick={handleFileSelectTrigger}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group"
                title="Trocar Vídeo"
              >
                <FileVideo size={24} className="group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={toggleHeadTracking}
                className={`p-3 rounded-xl border border-[#D4AF37]/30 transition-all duration-300 backdrop-blur-sm group ${
                  isHeadTracking
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                  : 'bg-neutral-900/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                }`}
                title={isHeadTracking ? "Desativar Rastreamento" : "Ativar Head Tracking"}
              >
                <Smartphone size={24} className={isHeadTracking ? "" : "group-hover:scale-110 transition-transform"} />
              </button>

              <button
                onClick={toggleVR}
                className={`p-3 rounded-xl border border-[#D4AF37]/30 transition-all duration-300 backdrop-blur-sm group ${
                  isVR 
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                  : 'bg-neutral-900/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                }`}
                title={isVR ? "Sair do modo VR" : "Modo VR (Cardboard)"}
              >
                <Glasses size={24} className={isVR ? "" : "group-hover:scale-110 transition-transform"} />
              </button>

              <button
                onClick={toggleLoop}
                className={`p-3 rounded-xl border border-[#D4AF37]/30 transition-all duration-300 backdrop-blur-sm group ${
                  isLooping 
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                  : 'bg-neutral-900/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                }`}
                title={isLooping ? "Desativar Loop" : "Ativar Loop"}
              >
                <Repeat size={24} className={isLooping ? "" : "group-hover:scale-110 transition-transform"} />
              </button>

              <button
                onClick={handleDownload}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group"
                title="Salvar Vídeo"
              >
                <Download size={24} className="group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="bg-neutral-900/80 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black p-3 rounded-xl border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 backdrop-blur-sm group"
              >
                <Maximize size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions/Status Overlay */}
      {videoUrl && (
        <div className="absolute top-8 left-8 flex flex-col gap-2 pointer-events-none select-none">
          <div className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/20 text-[#D4AF37] px-6 py-3 rounded-xl text-sm font-medium animate-fade-in">
            ✨ DR 360° - {isHeadTracking ? "Mova o dispositivo para olhar" : "Arraste para explorar"} 
          </div>
          {isHeadTracking && (
             <div className="bg-[#D4AF37] text-black px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 w-fit">
               Head Tracking ON
             </div>
          )}
        </div>
      )}
    </div>
  );
}
