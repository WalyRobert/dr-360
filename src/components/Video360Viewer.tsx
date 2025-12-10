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
  const [error, setError] = useState<string | null>(null); // Novo: Error handling
  
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ lon: 0, lat: 0, phi: 0, theta: 0 });
  const lastInteractionTimeRef = useRef(Date.now());

  const controlsTimeoutRef = useRef<number | null>(null);
  const isControlsHoveredRef = useRef(false);

  // Quaternion para head tracking preciso
  const orientationQuaternion = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(fov, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    const stereo = new THREE.StereoCamera();
    stereo.eyeSep = 0.064;
    stereoRef.current = stereo;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
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

    // Event listeners para mouse/touch (igual ao original)
    const onMouseDown = (e: MouseEvent) => { /* ... igual */ };
    // ... (adicionar todos os handlers de mouse/touch como no seu código)

    // Adicione listeners...
    // (Omitindo por brevidade, mas mantenha como no seu)

    const handleResize = () => { /* ... igual */ };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      // Auto-center logic (igual)
      // Camera rotation (use quaternion para head tracking)
      if (isHeadTracking) {
        camera.setRotationFromQuaternion(orientationQuaternion.current);
      } else {
        // Lon/lat fallback (igual)
      }
      // VR rendering (igual)
      // Normal rendering (igual)
    };
    animate();

    // Progress e duration update
    video.addEventListener('loadedmetadata', () => setDuration(video.duration));
    video.addEventListener('timeupdate', () => setProgress((video.currentTime / video.duration) * 100));
    video.addEventListener('error', () => setError('Erro ao carregar vídeo. Tente outro arquivo/URL.'));

    return () => {
      // Cleanup completo (adicionado orientation)
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('deviceorientation', handleOrientation); // Novo
      // Remova mouse/touch listeners (igual)
      // Dispose resources (igual)
    };
  }, []);

  // Sincronize loop, muted, playbackRate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [isLooping, isMuted, playbackRate]);

  // Update FOV
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.fov = fov;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [fov]);

  // Update geometry por viewMode (igual ao seu)

  // Head Tracking com Quaternions
  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (!event.alpha || !event.beta || !event.gamma) return;

    const alpha = THREE.MathUtils.degToRad(event.alpha);
    const beta = THREE.MathUtils.degToRad(event.beta);
    const gamma = THREE.MathUtils.degToRad(event.gamma);

    orientationQuaternion.current.setFromEuler(new THREE.Euler(beta, alpha, -gamma, 'YXZ'));
  };

  useEffect(() => {
    if (isHeadTracking) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(permission => {
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isHeadTracking]);

  // Toggle functions (ex: togglePlay, toggleMute, etc. - adicione como no seu código original)

  // Zoom in/out com limites
  const zoomIn = () => setFov(Math.max(30, fov - 10));
  const zoomOut = () => setFov(Math.min(120, fov + 10));

  // Handle file select (ex: URL.createObjectURL para local, fetch para remote)

  // JSX return (igual ao seu, com error display se necessário)
  return (
    <div ref={wrapperRef} className="relative w-full h-full" onMouseMove={handleUserActivity} onTouchMove={handleUserActivity}>
      {error && <div className="absolute top-0 left-0 p-4 bg-red-500 text-white">{error}</div>}
      {/* ... resto da UI igual ao seu código */}
    </div>
  );
}
