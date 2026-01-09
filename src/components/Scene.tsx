import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame, extend } from '@react-three/fiber';
import { DeviceOrientationControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ViewMode, QualitySettings } from '../types';

interface SceneProps {
  videoElement: HTMLVideoElement | null;
  viewMode: ViewMode;
  zoom: number;
  headTracking: boolean;
  isVR: boolean;
  autoCenter?: boolean;
  quality: QualitySettings;
}

const VideoMaterial = shaderMaterial(
  {
    map: null,
    brightness: 0.0,
    contrast: 0.0,
    saturation: 0.0,
    sharpness: 0.0,
    resolution: new THREE.Vector2(1920, 1080),
    tint: new THREE.Vector3(1.0, 1.0, 1.0),
  },
  `varying vec2 vUv;
  void main() {
    vUv = uv;
    glPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,
  `uniform sampler2D map;
  uniform float brightness;
  uniform float contrast;
  uniform float saturation;
  uniform float sharpness;
  uniform vec2 resolution;
  uniform vec3 tint;
  varying vec2 vUv;
  
  void main() {
    vec4 texColor = texture2D(map, vUv);
    vec3 color = texColor.rgb;
    
    if (sharpness > 0.0) {
      vec2 step = 1.0 / resolution;
      vec3 up = texture2D(map, vUv + vec2(0.0, step.y)).rgb;
      vec3 down = texture2D(map, vUv - vec2(0.0, step.y)).rgb;
      vec3 left = texture2D(map, vUv - vec2(step.x, 0.0)).rgb;
      vec3 right = texture2D(map, vUv + vec2(step.x, 0.0)).rgb;
      vec3 sharpened = color * 5.0 - up - down - left - right;
      color = mix(color, sharpened, sharpness);
    }
    
    color += brightness;
    color = (color - 0.5) * (1.0 + contrast) + 0.5;
    vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
    color = mix(gray, color, 1.0 + saturation);
    color *= tint;
    
    glFragColor = vec4(color, texColor.a);
  }`
);

extend({ VideoMaterial });

const Scene: React.FC<SceneProps> = ({
  videoElement,
  viewMode,
  zoom,
  headTracking,
  isVR,
  quality,
}) => {
  const { camera, gl } = useThree();
  const materialRef = useRef<any>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = zoom;
      camera.updateProjectionMatrix();
    }
  }, [zoom, camera]);

  useEffect(() => {
    if (!videoElement) return;
    const texture = new THREE.VideoTexture(videoElement);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    textureRef.current = texture;
    
    if (materialRef.current) {
      materialRef.current.map = texture;
    }
    const updateRes = () => {
      if (videoElement.videoWidth && materialRef.current) {
        materialRef.current.resolution.set(
          videoElement.videoWidth,
          videoElement.videoHeight
        );
      }
    };
    videoElement.addEventListener('loadedmetadata', updateRes);
    videoElement.addEventListener('playing', updateRes);
    return () => {
      videoElement.removeEventListener('loadedmetadata', updateRes);
      videoElement.removeEventListener('playing', updateRes);
      texture.dispose();
    };
  }, [videoElement]);

  useFrame(() => {
    if (textureRef.current && videoElement && !videoElement.paused) {
      textureRef.current.needsUpdate = true;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation.current.y;
      meshRef.current.rotation.x = rotation.current.x;
    }
    
    // Apply inertia/momentum to rotation
    if (!isDragging.current) {
      rotationVelocity.current.x *= 0.95;
      rotationVelocity.current.y *= 0.95;
      rotation.current.x += rotationVelocity.current.x;
      rotation.current.y += rotationVelocity.current.y;
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.brightness = quality.brightness;
      materialRef.current.contrast = quality.contrast;
      materialRef.current.saturation = quality.saturation;
      materialRef.current.sharpness = quality.sharpness;
      let tint = new THREE.Vector3(1.0, 1.0, 1.0);
      if (quality.colorProfile === 'cinema') {
        tint.set(0.95, 0.95, 0.85);
      } else if (quality.colorProfile === 'vivid') {
        tint.set(1.1, 1.1, 1.1);
      } else if (quality.colorProfile === 'natural') {
        tint.set(1.0, 1.0, 0.95);
      }
      materialRef.current.tint = tint;
    }
  }, [quality]);

  const handleMouseDown = (e: MouseEvent | TouchEvent) => {
    isDragging.current = true;
    const x = 'touches' in e ? e.touches[0]?.clientX || 0 : (e as MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0]?.clientY || 0 : (e as MouseEvent).clientY;
    dragStart.current = { x, y };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const x = 'touches' in e ? e.touches[0]?.clientX || 0 : (e as MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0]?.clientY || 0 : (e as MouseEvent).clientY;
    
    const deltaX = (x - dragStart.current.x) * 0.005;
    const deltaY = (y - dragStart.current.y) * 0.005;
    
    rotation.current.y += deltaX;
    rotation.current.x += deltaY;
    
    // Store velocity for inertia
    rotationVelocity.current.x = deltaY * 0.5;
    rotationVelocity.current.y = deltaX * 0.5;
    
    dragStart.current = { x, y };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleDown = (e: MouseEvent | TouchEvent) => handleMouseDown(e);
    const handleMove = (e: MouseEvent | TouchEvent) => handleMouseMove(e);
    const handleUp = () => handleMouseUp();
    
    canvas.addEventListener('mousedown', handleDown as EventListener, false);
    canvas.addEventListener('mousemove', handleMove as EventListener, false);
    canvas.addEventListener('mouseup', handleUp, false);
    canvas.addEventListener('touchstart', handleDown as EventListener, false);
    canvas.addEventListener('touchmove', handleMove as EventListener, false);
    canvas.addEventListener('touchend', handleUp, false);
    
    return () => {
      canvas.removeEventListener('mousedown', handleDown as EventListener);
      canvas.removeEventListener('mousemove', handleMove as EventListener);
      canvas.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('touchstart', handleDown as EventListener);
      canvas.removeEventListener('touchmove', handleMove as EventListener);
      canvas.removeEventListener('touchend', handleUp);
    };
  }, [gl]);

  const getGeometryArgs = (): [number, number, number, number, number, number, number, number] => {
    const radius = 500;
    const widthSegments = 80;
    const heightSegments = 60;
    if (viewMode === ViewMode.Mode180) {
      return [radius, widthSegments, heightSegments, 0, Math.PI, 0, Math.PI];
    }
    if (viewMode === ViewMode.Mode120) {
      return [
        radius,
        widthSegments,
        heightSegments,
        Math.PI / 3,
        Math.PI * 1.5,
        Math.PI / 4,
        Math.PI / 2,
      ];
    }
    return [radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI];
  };

  return (
    <>
      <mesh ref={meshRef} scale={[-1, 1, 1]} rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={getGeometryArgs()} />
        {/* @ts-ignore */}
        <videoMaterial
          ref={materialRef}
          side={THREE.BackSide}
          transparent={false}
        />
      </mesh>
      {headTracking && (
        <DeviceOrientationControls enableZoom={false} enablePan={false} />
      )}
    </>
  );
};

export default Scene;
