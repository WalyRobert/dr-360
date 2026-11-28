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
  poleCapsEnabled: boolean;
  poleCapDiameter: number;
  quality: QualitySettings;
  onXrActiveChange: (active: boolean) => void;
  onXrSessionChange: (session: XRSession | null) => void;
  onXrSessionStarterReady: (starter: (() => Promise<void>) | null) => void;
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
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D map;
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
        vec3 down = texture2D(map, vUv + vec2(0.0, -step.y)).rgb;
        vec3 left = texture2D(map, vUv + vec2(-step.x, 0.0)).rgb;
        vec3 right = texture2D(map, vUv + vec2(step.x, 0.0)).rgb;
        vec3 sharpened = color * 5.0 - (up + down + left + right);
        color = mix(color, sharpened, sharpness);
      }

      color += brightness;
      color = (color - 0.5) * (1.0 + contrast) + 0.5;
      vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
      color = mix(gray, color, 1.0 + saturation);
      color *= tint;

      gl_FragColor = vec4(color, texColor.a);
    }
  `
);

extend({ VideoMaterial });

const Scene: React.FC<SceneProps> = ({ 
  videoElement, 
  viewMode, 
  zoom, 
  headTracking, 
  poleCapsEnabled,
  poleCapDiameter,
  quality,
  onXrActiveChange,
  onXrSessionChange,
  onXrSessionStarterReady
}) => {
  const { camera, gl, scene, size } = useThree();
  const [xrActive, setXrActive] = useState(false);
  const materialRef = useRef<any>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const xrExitPanelRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    gl.xr.enabled = true;

    const handleSessionStart = () => {
      setXrActive(true);
      onXrActiveChange(true);
      onXrSessionChange(gl.xr.getSession());
      createXrExitControl();
    };
    const handleSessionEnd = () => {
      setXrActive(false);
      onXrActiveChange(false);
      onXrSessionChange(null);
      removeXrExitControl();
    };
    gl.xr.addEventListener('sessionstart', handleSessionStart);
    gl.xr.addEventListener('sessionend', handleSessionEnd);

    let xrExitTexture: THREE.CanvasTexture | null = null;
    const xrControllerCleanups: Array<() => void> = [];
    const xr = (navigator as Navigator & { xr?: XRSystem }).xr;

    if (xr) {
      onXrSessionStarterReady(async () => {
        // Keep the session request compatible with Quest Browser and other
        // WebXR runtimes. The extra bounded-floor/layers features are not used
        // by this scene and can make some runtimes reject the whole request.
        const session = await xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor'],
        });
        try {
          await gl.xr.setSession(session);
        } catch (error) {
          await session.end().catch(() => undefined);
          throw error;
        }
      });
    } else {
      onXrSessionStarterReady(null);
    }

    const removeXrExitControl = () => {
      for (const cleanup of xrControllerCleanups.splice(0)) cleanup();
      const panel = xrExitPanelRef.current;
      if (!panel) return;
      scene.remove(panel);
      panel.geometry.dispose();
      (panel.material as THREE.Material).dispose();
      xrExitPanelRef.current = null;
      xrExitTexture?.dispose();
      xrExitTexture = null;
    };

    const createXrExitControl = () => {
      if (xrExitPanelRef.current) return;

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = 'rgba(8, 8, 8, 0.94)';
      context.strokeStyle = '#d4af37';
      context.lineWidth = 5;
      context.beginPath();
      context.roundRect(4, 4, 504, 120, 24);
      context.fill();
      context.stroke();
      context.fillStyle = '#f0d780';
      context.font = 'bold 38px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('SAIR DA IMERSÃO', 256, 66);

      xrExitTexture = new THREE.CanvasTexture(canvas);
      xrExitTexture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({
        map: xrExitTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false,
      });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.21), material);
      panel.name = 'dr360-xr-exit-control';
      panel.renderOrder = 999;
      xrExitPanelRef.current = panel;
      scene.add(panel);

      for (let index = 0; index < 2; index += 1) {
        const controller = gl.xr.getController(index);
        const ray = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -2),
          ]),
          new THREE.LineBasicMaterial({ color: 0xd4af37, depthTest: false }),
        );
        ray.name = 'dr360-xr-pointer-ray';
        controller.add(ray);
        scene.add(controller);

        const onSelect = () => {
          const origin = controller.getWorldPosition(new THREE.Vector3());
          const rotation = controller.getWorldQuaternion(new THREE.Quaternion());
          const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(rotation).normalize();
          const raycaster = new THREE.Raycaster(origin, direction, 0, 5);
          if (xrExitPanelRef.current && raycaster.intersectObject(xrExitPanelRef.current).length > 0) {
            void gl.xr.getSession()?.end().catch((error: unknown) => {
              console.warn('Não foi possível encerrar a sessão VR pelo controle:', error);
            });
          }
        };

        controller.addEventListener('select', onSelect);
        xrControllerCleanups.push(() => {
          controller.removeEventListener('select', onSelect);
          scene.remove(controller);
          controller.remove(ray);
          ray.geometry.dispose();
          (ray.material as THREE.Material).dispose();
        });
      }
    };

    return () => {
      onXrSessionStarterReady(null);
      gl.xr.removeEventListener('sessionstart', handleSessionStart);
      gl.xr.removeEventListener('sessionend', handleSessionEnd);
      removeXrExitControl();
    };
  }, [gl, scene, onXrActiveChange, onXrSessionChange, onXrSessionStarterReady]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = zoom;
      camera.updateProjectionMatrix();
    }
  }, [zoom, camera]);

  useEffect(() => {
    if (!videoElement) return;

    videoElement.crossOrigin = "anonymous";

    const texture = new THREE.VideoTexture(videoElement);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.format = THREE.RGBAFormat;
    
    textureRef.current = texture;
    if (materialRef.current) {
      materialRef.current.map = texture;
    }

    const updateRes = () => {
      if (videoElement.videoWidth && materialRef.current) {
        materialRef.current.resolution.set(videoElement.videoWidth, videoElement.videoHeight);
      }
    };

    if (videoElement.readyState >= 1) {
      updateRes();
    } else {
      videoElement.addEventListener('loadedmetadata', updateRes);
    }
    
    videoElement.addEventListener('playing', updateRes);

    return () => {
      videoElement.removeEventListener('loadedmetadata', updateRes);
      videoElement.removeEventListener('playing', updateRes);
      texture.dispose();
      textureRef.current = null;
    };
  }, [videoElement, viewMode]);

  useFrame(() => {
    if (textureRef.current && videoElement && videoElement.readyState >= 2) {
      textureRef.current.needsUpdate = true;
    }

    if (xrActive && xrExitPanelRef.current) {
      const viewerCamera = gl.xr.getCamera();
      const viewerPosition = viewerCamera.getWorldPosition(new THREE.Vector3());
      const viewerRotation = viewerCamera.getWorldQuaternion(new THREE.Quaternion());
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(viewerRotation);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(viewerRotation);
      xrExitPanelRef.current.position
        .copy(viewerPosition)
        .addScaledVector(forward, 1.35)
        .addScaledVector(up, 0.34);
      xrExitPanelRef.current.quaternion.copy(viewerRotation);
    }

    if (!xrActive && camera instanceof THREE.PerspectiveCamera) {
      const standardAspect = size.width / size.height;
      if (Math.abs(camera.aspect - standardAspect) > 0.01) {
        camera.aspect = standardAspect;
        camera.updateProjectionMatrix();
      }
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.brightness = quality.brightness;
      materialRef.current.contrast = quality.contrast;
      materialRef.current.saturation = quality.saturation;
      materialRef.current.sharpness = quality.sharpness;

      let tint = new THREE.Vector3(1.0, 1.0, 1.0);
      if (quality.colorProfile === 'cinema') tint.set(0.95, 0.95, 0.85);
      else if (quality.colorProfile === 'vivid') tint.set(1.1, 1.1, 1.1);
      else if (quality.colorProfile === 'natural') tint.set(1.0, 1.0, 0.95);
      materialRef.current.tint = tint;
    }
  }, [quality]);

  const getGeometryArgs = (): [number, number, number, number, number, number, number] => {
    const radius = 500;
    const widthSegments = 128;
    const heightSegments = 64;
    if (viewMode === ViewMode.Mode180) return [radius, widthSegments, heightSegments, 0, Math.PI, 0, Math.PI];
    if (viewMode === ViewMode.Mode120) return [radius, widthSegments, heightSegments, Math.PI / 6, Math.PI / 1.5, Math.PI / 4, Math.PI / 2];
    return [radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI];
  };

  const videoAspectRatio = videoElement?.videoWidth && videoElement.videoHeight
    ? videoElement.videoWidth / videoElement.videoHeight
    : 16 / 9;
  const screenWidth = Math.min(3, 1.8 * videoAspectRatio);
  const screenHeight = screenWidth / videoAspectRatio;

  return (
    <>
      {viewMode === ViewMode.ModeFlat ? (
        <mesh position={[0, 0, -3]}>
          <planeGeometry args={[screenWidth, screenHeight]} />
          {/* @ts-ignore */}
          <videoMaterial ref={materialRef} side={THREE.DoubleSide} transparent={false} />
        </mesh>
      ) : (
        <mesh scale={[-1, 1, 1]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={getGeometryArgs()} />
          {/* @ts-ignore */}
          <videoMaterial ref={materialRef} side={THREE.BackSide} transparent={false} />
        </mesh>
      )}

      {poleCapsEnabled && (viewMode === ViewMode.Mode360 || viewMode === ViewMode.Mode180) && (
        <>
          <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
            <circleGeometry args={[poleCapDiameter / 2, 64]} />
            <meshBasicMaterial color="#050505" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={1}>
            <circleGeometry args={[poleCapDiameter / 2, 64]} />
            <meshBasicMaterial color="#050505" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {headTracking && !xrActive ? (
        <DeviceOrientationControls />
      ) : (
        <OrbitControls 
          makeDefault
          enabled={!xrActive && !headTracking}
          enableZoom={false} 
          enablePan={false} 
          rotateSpeed={-0.6} 
          reverseOrbit={true}
          enableDamping={true}
          dampingFactor={0.1}
        />
      )}
    </>
  );
};

export default Scene;
