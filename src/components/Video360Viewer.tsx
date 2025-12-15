import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Volume2, VolumeX, Maximize, Upload, Download, Repeat, Gauge, ZoomIn, ZoomOut } from 'lucide-react';

export default function Video360Viewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const mouseRef = useRef({ isDown: false, prevX: 0, prevY: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cena, câmera e renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Eventos de mouse para rotação 360°
    const onMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.prevX = e.clientX;
      mouseRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseRef.current.isDown) return;
      const deltaX = (e.clientX - mouseRef.current.prevX) / 100;
      const deltaY = (e.clientY - mouseRef.current.prevY) / 100;
      if (cameraRef.current) {
        cameraRef.current.rotateY(-deltaX);
        cameraRef.current.rotateX(-deltaY);
      }
      mouseRef.current.prevX = e.clientX;
      mouseRef.current.prevY = e.clientY;
    };

    const onMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Zoom com roda do mouse
    const onWheel = (e: WheelEvent) => {
      if (cameraRef.current) {
        cameraRef.current.fov = Math.max(10, Math.min(120, cameraRef.current.fov + e.deltaY / 10));
        cameraRef.current.updateProjectionMatrix();
      }
    };
    renderer.domElement.addEventListener('wheel', onWheel);

    // Animação
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
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
  }, []);

  // Atualiza vídeo quando URL mudar
  useEffect(() => {
    if (videoUrl && sceneRef.current) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.loop = isLooping;
      video.muted = isMuted;
      video.playbackRate = playbackRate;
      video.crossOrigin = 'anonymous';
      videoRef.current = video;

      const texture = new THREE.VideoTexture(video);
      const geometry = new THREE.SphereGeometry(15, 32, 16);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
      const mesh = new THREE.Mesh(geometry, material);
      sceneRef.current.add(mesh);

      video.addEventListener('loadedmetadata', () => {
        setDuration(video.duration);
      });

      video.addEventListener('timeupdate', () => {
        setProgress((video.currentTime / video.duration) * 100);
      });

      if (isPlaying) video.play();
    }
  }, [videoUrl, isLooping, isMuted, playbackRate, isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    if (videoRef.current) videoRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    if (videoRef.current) videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoUrl(URL.createObjectURL(file));
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) videoRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  // Auto-esconder controles
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  return (
    <div className="relative w-full h-full" onMouseMove={() => setShowControls(true)}>
      <div ref={containerRef} className="w-full h-full" />
      {!videoUrl && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/80">
          <button onClick={() => fileInputRef.current?.click()} className="bg-[#D4AF37] text-black p-4 rounded-xl">
            <Upload size={24} /> Carregar Vídeo 360°
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
        </div>
      )}
      {videoUrl && showControls && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
          <button onClick={togglePlay}>{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
          <button onClick={toggleMute}>{isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
          <button onClick={toggleLoop}><Repeat size={24} /></button>
          <button onClick={changePlaybackRate}><Gauge size={24} /> {playbackRate}x</button>
          <input type="range" value={progress} onChange={handleProgressChange} className="flex-1 mx-4" />
          <button onClick={() => document.documentElement.requestFullscreen()}><Maximize size={24} /></button>
        </div>
      )}
    </div>
  );
}
