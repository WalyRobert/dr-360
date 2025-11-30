'use client';

import React, { useState, useRef, useEffect } from 'react';

const Video360Viewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isHeadTrackingEnabled, setIsHeadTrackingEnabled] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [cameraRotation, setCameraRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request device orientation permission (iOS 13+)
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      } catch (error) {
        console.error('Permission denied', error);
      }
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (isHeadTrackingEnabled) {
      setCameraRotation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      });
    }
  };

  const handleHeadTrackingToggle = async () => {
    if (!isHeadTrackingEnabled && !permissionGranted) {
      await requestPermission();
    }
    setIsHeadTrackingEnabled(!isHeadTrackingEnabled);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'video360.mp4';
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Upload Section */}
      <div className="bg-gray-900 p-6 rounded-xl border-2 border-gray-700">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>Upload de Vídeo 360°</h2>
        <label className="block mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-black file:text-white
              hover:file:bg-gray-800"
            style={{
              '--file-color': '#D4AF37'
            } as React.CSSProperties}
          />
        </label>
      </div>

      {/* Video Player */}
      {videoUrl && (
        <div className="bg-black rounded-xl overflow-hidden border-2 border-gray-700">
          <video
            src={videoUrl}
            controls
            loop={isLooping}
            style={{
              transform: isHeadTrackingEnabled
                ? `rotateX(${cameraRotation.beta}deg) rotateY(${cameraRotation.alpha}deg)`
                : 'none',
            }}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={handleHeadTrackingToggle}
          className="py-3 px-4 rounded-xl font-semibold transition-all"
          style={{
            backgroundColor: isHeadTrackingEnabled ? '#D4AF37' : '#000',
            color: isHeadTrackingEnabled ? '#000' : '#D4AF37',
            border: '2px solid #D4AF37',
          }}
        >
          {isHeadTrackingEnabled ? '🎧 Head On' : '🎧 Head Off'}
        </button>

        <button
          onClick={() => setIsVRMode(!isVRMode)}
          className="py-3 px-4 rounded-xl font-semibold transition-all"
          style={{
            backgroundColor: isVRMode ? '#D4AF37' : '#000',
            color: isVRMode ? '#000' : '#D4AF37',
            border: '2px solid #D4AF37',
          }}
        >
          {isVRMode ? '🔍 VR On' : '🔍 VR Off'}
        </button>

        <button
          onClick={() => setIsLooping(!isLooping)}
          className="py-3 px-4 rounded-xl font-semibold transition-all"
          style={{
            backgroundColor: isLooping ? '#D4AF37' : '#000',
            color: isLooping ? '#000' : '#D4AF37',
            border: '2px solid #D4AF37',
          }}
        >
          {isLooping ? '🔁 Loop On' : '🔁 Loop Off'}
        </button>

        <button
          onClick={handleDownload}
          disabled={!videoUrl}
          className="py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50"
          style={{
            backgroundColor: videoUrl ? '#000' : '#333',
            color: '#D4AF37',
            border: '2px solid #D4AF37',
          }}
        >
          💾 Download
        </button>
      </div>

      {/* Status Information */}
      <div className="bg-gray-900 p-4 rounded-xl border-2 border-gray-700 text-sm text-gray-300">
        <p>Head Tracking: {isHeadTrackingEnabled ? '✓ Ativo' : '✗ Inativo'}</p>
        <p>VR Mode: {isVRMode ? '✓ Ativo' : '✗ Inativo'}</p>
        <p>Loop: {isLooping ? '✓ Ativo' : '✗ Inativo'}</p>
        {isHeadTrackingEnabled && (
          <p className="mt-2" style={{ color: '#D4AF37' }}>
            Rotação: X={cameraRotation.alpha.toFixed(0)}° Y={cameraRotation.beta.toFixed(0)}° Z={cameraRotation.gamma.toFixed(0)}°
          </p>
        )}
      </div>
    </div>
  );
};

export default Video360Viewer;
