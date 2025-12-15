import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, Download, Repeat, Glasses, Smartphone, FileVideo, Gauge, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'360' | '180' | '120'>('360');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fov, setFov] = useState(75);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const rotationRef = useRef({ lon: 0, lat: 0, phi: 0, theta: 0 });
  const lastInteractionTimeRef = useRef(Date.now());

  const controlsTimeoutRef = useRef<number | null>(null);
  const isControlsHoveredRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Câmera
    const camera = new THREE.PerspectiveCamera(fov, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // Stereo para VR
    const stereo = new THREE.StereoCamera();
    stereo.eyeSep = 0.064;
    stereoRef.current = stereo;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Vídeo
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.loop = isLooping;
    video.muted = isMuted;
    videoRef.current = video;

    // Geometria da esfera (para 360°)
    let geometry = new THREE.SphereGeometry(250, 64, 64);
    geometry.scale(-1, 1, 1); // Inverte para vista interna

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Controles de mouse
    const onMouseDown = (e: MouseEvent) => {
      if (isHeadTracking) return;
      mouseRef.current.isDown = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      lastInteractionTimeRef.current = Date.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isHeadTracking || !mouseRef.current.isDown) return;
      const deltaX = e.clientX - mouseRef.current.x;
      const deltaY = e.clientY - mouseRef.current.y;
      rotationRef.current.lon += deltaX * 0.1;
      rotationRef.current.lat -= deltaY * 0.1;
      rotationRef.current.lat = Math.max(-85, Math.min(85, rotationRef.current.lat));
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const onMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Loop de animação
    const animate = () => {
      requestAnimationFrame(animate);
      if (cameraRef.current && sceneRef.current && rendererRef.current) {
        rotationRef.current.phi = THREE.MathUtils.degToRad(90 - rotationRef.current.lat);
        rotationRef.current.theta = THREE.MathUtils.degToRad(rotationRef.current.lon);
        const x = Math.sin(rotationRef.current.phi) * Math.cos(rotationRef.current.theta);
        const y = Math.cos(rotationRef.current.phi);
        const z = Math.sin(rotationRef.current.phi) * Math.sin(rotationRef.current.theta);
        cameraRef.current.lookAt(x, y, z);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [fov, isHeadTracking, isLooping, isMuted]);

  // Funções de controle (togglePlay, etc.) - adicione do seu código original aqui

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Controles UI - adicione o JSX dos botões aqui */}
    </div>
  );
}
