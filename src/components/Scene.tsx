import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, DeviceOrientationControls, shaderMaterial } from '@react-three/drei';
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

  const handleMouseDown = (e: any) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, y: e.clientY || e.touches?.[0]?.clientY || 0 };
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging.current) return;
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
    const deltaX = (currentX - dragStart.current.x) * 0.01;
    const deltaY = (currentY - dragStart.current.y) * 0.01;
    
    rotation.current.y += deltaX;
    rotation.current.x += deltaY;
    
    dragStart.current = { x: currentX, y: currentY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    canvas.addEventListener('touchstart', handleMouseDown, false);
    canvas.addEventListener('touchmove', handleMouseMove, false);
    canvas.addEventListener('touchend', handleMouseUp, false);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
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
      {headTracking ? (
        <DeviceOrientationControls enableZoom={false} enablePan={false} />
      ) : (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={-0.5}
          reverseOrbit={true}
          autoRotate={false}
        />
      )}
    </>
  );
};

export default Scene;
