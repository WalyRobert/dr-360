
import React, { useRef, useState, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Repeat, 
  Smartphone, FileVideo, Glasses,
  ZoomIn, ZoomOut, Download, ChevronLeft, Settings,
  Monitor, Sliders, Zap, Check, Folder, Maximize, Minimize
} from 'lucide-react';
import { ViewMode, VideoState, PlayerSettings, QualitySettings } from '../types';

interface ControlsProps {
  visible: boolean;
  state: VideoState;
  settings: PlayerSettings;
  quality: QualitySettings;
  fileName: string;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (val: number) => void;
  onMute: () => void;
  onVolume: (val: number) => void;
  onSpeedChange: () => void;
  onLoopToggle: () => void;
  onVRToggle: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onHeadTrackingToggle: () => void;
  onZoom: (dir: 'in' | 'out') => void;
  onBack: () => void;
  onDownload: () => void;
  onFileChange: (file: File) => void;
  onQualityChange: (q: QualitySettings) => void;
  onToggleFullscreen: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  visible,
  state,
  settings,
  quality,
  fileName,
  isFullscreen,
  onPlayPause,
  onSeek,
  onMute,
  onVolume,
  onSpeedChange,
  onLoopToggle,
  onVRToggle,
  onViewModeChange,
  onHeadTrackingToggle,
  onZoom,
  onBack,
  onDownload,
  onFileChange,
  onQualityChange,
  onToggleFullscreen
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'quality'>('quality');

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  const handleSeekInternal = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    onSeek(percent);
  };

  return (
    <>
    <div 
      className={`absolute inset-0 flex flex-col justify-between z-10 transition-opacity duration-300 pointer-events-none ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Top Header Navigation */}
      <div className={`p-4 md:p-6 flex justify-between items-start transition-all ${visible ? 'pointer-events-auto translate-y-0' : 'translate-y-[-20px]'}`}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack} 
            className="text-dr-gold hover:scale-110 transition-transform p-2 rounded-none bg-transparent border border-dr-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)] hover:border-dr-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        
        <div className="flex space-x-2">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-none border border-dr-gold/30 bg-transparent text-dr-gold hover:border-dr-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"><Settings size={16} /></button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-none border border-dr-gold/30 bg-transparent text-dr-gold hover:border-dr-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"><Folder size={16} /></button>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])} accept="video/*" className="hidden" />
            <button onClick={onDownload} className="p-2 rounded-none border border-dr-gold/30 bg-transparent text-dr-gold hover:border-dr-gold hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"><Download size={16} /></button>
        </div>
      </div>

      {/* Control Dock Bottom */}
      <div className={`p-4 md:p-6 space-y-3 flex flex-col items-center transition-all ${visible ? 'pointer-events-auto translate-y-0' : 'translate-y-[20px]'}`}>
        <div className="w-full max-w-2xl bg-black/50 backdrop-blur-xl p-4 rounded-none border border-dr-gold/20 shadow-2xl">
          <div className="flex items-center space-x-3 mb-3 cursor-pointer" onClick={handleSeekInternal}>
            <span className="text-dr-gold text-[10px] font-mono">{formatTime(state.currentTime)}</span>
            <div className="flex-1 h-[1.5px] bg-dr-gold/20 relative rounded-none">
              <div className="absolute h-full bg-dr-gold" style={{ width: `${state.progress}%` }}></div>
              <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-dr-goldLight rounded-full shadow-gold-glow" style={{ left: `${state.progress}%` }}></div>
            </div>
            <span className="text-dr-gold/60 text-[10px] font-mono">-{formatTime(state.duration - state.currentTime)}</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Reordered: Volume first, then Action Button (File Picker) */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <button onClick={onMute} className="text-dr-gold/60 hover:text-dr-gold transition-colors bg-transparent">
                  {state.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={state.volume} 
                  onChange={(e) => onVolume(parseFloat(e.target.value))} 
                  className="w-16 h-0.5 bg-dr-gray/10 accent-dr-gold appearance-none cursor-pointer" 
                />
              </div>

              <button 
                onClick={onPlayPause} 
                className="text-dr-gold hover:scale-110 transition-transform bg-transparent flex items-center justify-center p-1"
                title="Select Media Source"
              >
                <Play size={20} fill="currentColor" />
              </button>
            </div>

            <div className="flex items-center space-x-1.5">
              {[ViewMode.Mode360, ViewMode.Mode180, ViewMode.Mode120].map((m) => (
                <button 
                  key={m} 
                  onClick={() => onViewModeChange(m)} 
                  className={`px-2 py-1 text-[7px] font-bold border rounded-none transition-all uppercase bg-transparent ${settings.viewMode === m ? 'border-dr-gold text-dr-gold shadow-gold-glow' : 'border-dr-gold/20 text-dr-gray hover:border-dr-gold/50'}`}
                >
                  {m}°
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button onClick={onSpeedChange} className="text-dr-gold font-bold text-[8px] tracking-widest mr-1 hover:text-dr-goldLight bg-transparent">{state.playbackRate}X</button>
              
              <button 
                onClick={onLoopToggle} 
                className={`p-1.5 rounded-none border transition-all bg-transparent ${state.isLooping ? 'border-dr-gold text-dr-gold shadow-gold-glow' : 'text-dr-gold border-dr-gold/20 hover:border-dr-gold/50'}`} 
                title="Toggle Loop"
              >
                <Repeat size={12} />
              </button>

              <button 
                onClick={onHeadTrackingToggle} 
                className={`p-1.5 rounded-none border transition-all bg-transparent ${settings.headTracking ? 'border-dr-gold text-dr-gold shadow-gold-glow' : 'text-dr-gold border-dr-gold/20 hover:border-dr-gold/50'}`} 
                title="Orientation Tracking"
              >
                <Smartphone size={12} />
              </button>
              
              <button 
                onClick={onVRToggle} 
                className={`p-1.5 rounded-none border transition-all bg-transparent ${settings.isVR ? 'border-dr-gold text-dr-gold shadow-gold-glow' : 'text-dr-gold border-dr-gold/20 hover:border-dr-gold/50'}`} 
                title="VR Stereoscopic Mode"
              >
                <Glasses size={12} />
              </button>

              <button 
                onClick={onToggleFullscreen} 
                className="p-1.5 rounded-none border border-dr-gold/20 text-dr-gold hover:border-dr-gold/50 transition-all bg-transparent" 
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Calibration Panel */}
    {showSettings && visible && (
      <div className="absolute top-20 right-6 w-64 bg-black/90 border border-dr-gold rounded-none shadow-gold-glow-lg z-50 overflow-hidden text-dr-offwhite backdrop-blur-2xl pointer-events-auto">
        <div className="flex border-b border-dr-gold/10">
          <button onClick={() => setActiveTab('quality')} className={`flex-1 py-3 text-[8px] font-bold uppercase tracking-widest bg-transparent transition-colors ${activeTab === 'quality' ? 'text-dr-gold border-b border-dr-gold' : 'text-dr-gray hover:text-dr-gold'}`}>Output</button>
          <button onClick={() => setActiveTab('adjust')} className={`flex-1 py-3 text-[8px] font-bold uppercase tracking-widest bg-transparent transition-colors ${activeTab === 'adjust' ? 'text-dr-gold border-b border-dr-gold' : 'text-dr-gray hover:text-dr-gold'}`}>Color</button>
        </div>
        <div className="p-6 space-y-4">
          {activeTab === 'quality' ? (
            <div className="grid grid-cols-2 gap-2">
              {(['auto', '720p', '1080p', '4k'] as const).map((res) => (
                <button 
                  key={res} 
                  onClick={() => onQualityChange({ ...quality, resolution: res })} 
                  className={`px-2 py-1.5 rounded-none text-[8px] border font-bold uppercase bg-transparent transition-all ${quality.resolution === res ? 'border-dr-gold text-dr-gold shadow-gold-glow' : 'border-dr-gold/20 text-dr-gray hover:border-dr-gold/50'}`}
                >
                  {res}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
               {['brightness', 'contrast', 'saturation'].map((key) => (
                 <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[7px] text-dr-gray uppercase"><span>{key}</span><span>{quality[key as keyof QualitySettings]}</span></div>
                    <input type="range" min="-0.3" max="0.3" step="0.01" value={quality[key as keyof QualitySettings] as number} onChange={(e) => onQualityChange({...quality, [key]: parseFloat(e.target.value)})} className="w-full h-0.5 accent-dr-gold bg-dr-gray/10 appearance-none cursor-pointer" />
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Controls;
