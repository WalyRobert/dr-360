import React, { useLayoutEffect, useRef, useState } from 'react'; // Mudado para useLayoutEffect
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

  // Setup Three.js scene com useLayoutEffect para evitar erros de DOM
  useLayoutEffect(() => {
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

    // Evitar adicionar canvas duplicado
    if (containerRef.current && renderer.domElement && !containerRef.current.contains(renderer.domElement)) {
      containerRef.current.appendChild(renderer.domElement);
    }

    rendererRef.current = renderer;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    videoRef.current = video;

    // Cria geometria inicial
    let geometry = new THREE.SphereGeometry(250, 64, 64);
    geometry.scale(-1, 1, 1);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Mouse/Touch event handlers (igual)
    const onMouseDown = (e: MouseEvent) => { /* igual ao seu */ };
    // ... (manhã todos os handlers como no seu código, incluindo onMouseMove, onMouseUp, onTouchStart, etc.)

    // Add event listeners (igual)

    const handleResize = () => { /* igual */ };
    window.addEventListener('resize', handleResize);

    // Animation loop (igual)

    animate();

    // Video event listeners (igual)

    return () => {
      // Cleanup (igual, com removeChild)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      // Remove listeners (igual)
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, []); // Dependência vazia

  // Sync video properties (igual)

  // Update FOV (igual)

  // Update VR ref (igual)

  // Update geometry based on viewMode (corrigido: recriar geometria)
  useEffect(() => {
    if (!sphereRef.current) return;

    const oldGeometry = sphereRef.current.geometry as THREE.SphereGeometry;
    oldGeometry.dispose();

    let thetaLength = 2 * Math.PI; // 360°
    if (viewMode === '180') thetaLength = Math.PI;
    if (viewMode === '120') thetaLength = (2 * Math.PI) / 3;

    const newGeometry = new THREE.SphereGeometry(250, 64, 64, 0, 2 * Math.PI, 0, thetaLength);
    newGeometry.scale(-1, 1, 1);
    sphereRef.current.geometry = newGeometry;
  }, [viewMode]);

  // Head tracking (igual)

  // Toggle functions (igual, incluindo zoomIn/Out com limites)

  // Handle file select e URL submit (igual)

  // Handle progress click e formatTime (igual)

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {error && <div className="absolute top-0 left-0 p-4 bg-red-500 text-white">{error}</div>}
      <div ref={containerRef} className="w-full h-full" />
      {/* Resto da JSX igual ao seu, com input hidden, controls, etc. */}
    </div>
  );
}
