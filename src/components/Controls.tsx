import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings, ArrowLeft } from 'lucide-react';
import { ViewMode, QualitySettings } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  headTracking: boolean;
  onHeadTrackingChange: (enabled: boolean) => void;
  isVR: boolean;
  onVRChange: (enabled: boolean) => void;
  quality: QualitySettings;
  onQualityChange: (quality: Partial<QualitySettings>) => void;
  onBack: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onPlayPause,
  viewMode,
  onViewModeChange,
  zoom,
  onZoomChange,
  headTracking,
  onHeadTrackingChange,
  isVR,
  onVRChange,
  quality,
  onQualityChange,
  onBack
}) => {
  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#D4AF37',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'Arial, sans-serif'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    background: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
    boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 0.95) 100%)',
      padding: '30px 20px 20px 20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(4px)',
      zIndex: 100
    }}>
      {/* Left Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={buttonStyle}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(212, 175, 55, 0.2)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
            (e.target as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        
        <button
          onClick={onPlayPause}
          style={isPlaying ? activeButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pausa' : 'Play'}
        </button>
      </div>

      {/* Center Controls */}
      <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => onViewModeChange(ViewMode.Mode360)}
          style={viewMode === ViewMode.Mode360 ? activeButtonStyle : buttonStyle}
        >
          360°
        </button>
        
        <button
          onClick={() => onViewModeChange(ViewMode.Mode180)}
          style={viewMode === ViewMode.Mode180 ? activeButtonStyle : buttonStyle}
        >
          180°
        </button>
        
        <button
          onClick={() => onViewModeChange(ViewMode.Mode120)}
          style={viewMode === ViewMode.Mode120 ? activeButtonStyle : buttonStyle}
        >
          120°
        </button>

        <input
          type="range"
          min="30"
          max="120"
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value))}
          style={{
            width: '120px',
            cursor: 'pointer',
            accentColor: '#D4AF37'
          }}
          title="Zoom"
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => onHeadTrackingChange(!headTracking)}
          style={headTracking ? activeButtonStyle : buttonStyle}
          title="Head Tracking"
        >
          🗣 Head
        </button>
        
        <button
          onClick={() => onVRChange(!isVR)}
          style={isVR ? activeButtonStyle : buttonStyle}
          title="VR Mode"
        >
          VR
        </button>

        <button
          onClick={() => onQualityChange({ brightness: quality.brightness })}
          style={buttonStyle}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

export default Controls;import React, { useRef, useState } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Repeat, 
  Glasses, Smartphone, FileVideo, 
  ZoomIn, ZoomOut, Download, ChevronLeft, Settings,
  Monitor, Sliders, Zap, Check
} from 'lucide-react';
import { ViewMode, VideoState, PlayerSettings, QualitySettings, ColorProfile } from '../types';

interface ControlsProps {
  visible: boolean;
  state: VideoState;
  settings: PlayerSettings;
  quality: QualitySettings;
  fileName: string;
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
}

const Controls: React.FC<ControlsProps> = ({
  visible,
  state,
  settings,
  quality,
  fileName,
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
  onQualityChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'quality'>('quality');

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleAutoEnhance = () => {
    onQualityChange({
      ...quality,
      brightness: 0.1,
      contrast: 0.15,
      saturation: 0.2,
      sharpness: 0.3,
      colorProfile: 'vivid'
    });
  };

  return (
    <>
    <div 
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between transition-opacity duration-500 z-10 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Top Bar */}
      <div className="bg-gradient-to-b from-black/70 to-transparent p-4 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-white hover:text-dr-gold transition-colors">
            <ChevronLeft size={32} />
          </button>
          <div className="overflow-hidden">
            <h3 className="text-white font-serif font-bold text-lg drop-shadow-md truncate max-w-[200px] sm:max-w-md">
              {fileName}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-dr-gold text-xs uppercase tracking-widest">DR 360° Player</span>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] text-white font-mono">
                {quality.resolution === 'auto' ? 'AUTO' : quality.resolution.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full backdrop-blur-md transition-all ${showSettings ? 'bg-dr-gold text-white' : 'bg-white/10 text-white hover:bg-dr-gold/80'}`}
                title="Configurações de Qualidade"
            >
                <Settings size={20} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 hover:bg-dr-gold/80 p-2 rounded-full backdrop-blur-md text-white transition-all"
                title="Trocar Vídeo"
            >
                <FileVideo size={20} />
            </button>
             <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
                accept="video/*"
                className="hidden"
            />
            <button 
                onClick={onDownload}
                className="bg-white/10 hover:bg-dr-gold/80 p-2 rounded-full backdrop-blur-md text-white transition-all"
                title="Download"
            >
                <Download size={20} />
            </button>
        </div>
      </div>

      {/* Center Feedback */}
      {state.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-dr-gold"></div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6 pointer-events-auto space-y-4">
        
        {/* Progress Bar */}
        <div className="group relative w-full h-2 bg-gray-600 rounded-full cursor-pointer" onClick={(e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           const percent = ((e.clientX - rect.left) / rect.width) * 100;
           onSeek(percent);
        }}>
          <div 
            className="absolute top-0 left-0 h-full bg-dr-gold rounded-full transition-all duration-100" 
            style={{ width: `${state.progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" 
            style={{ left: `${state.progress}%` }} 
          />
        </div>

        {/* Main Control Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Play & Volume */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-center md:justify-start">
            <button onClick={onPlayPause} className="text-white hover:text-dr-gold transition-transform hover:scale-110">
              {state.isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>

            <div className="flex items-center space-x-2 group">
              <button onClick={onMute} className="text-white hover:text-dr-gold">
                {state.isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={state.volume} 
                onChange={(e) => onVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-dr-gold"
              />
            </div>

            <div className="text-white font-mono text-sm">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </div>
          </div>

          {/* Center: Modes & Zoom */}
          <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="flex bg-black/50 rounded-lg p-1">
              {[ViewMode.Mode360, ViewMode.Mode180, ViewMode.Mode120].map((m) => (
                <button
                  key={m}
                  onClick={() => onViewModeChange(m)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${settings.viewMode === m ? 'bg-dr-gold text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  {m}°
                </button>
              ))}
            </div>
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <button onClick={() => onZoom('out')} className="text-white hover:text-dr-gold p-1"><ZoomOut size={18} /></button>
            <button onClick={() => onZoom('in')} className="text-white hover:text-dr-gold p-1"><ZoomIn size={18} /></button>
          </div>

          {/* Right: Advanced Controls */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-end">
            <button onClick={onSpeedChange} className="text-white font-bold text-sm w-10 hover:text-dr-gold">{state.playbackRate}x</button>
            <button onClick={onLoopToggle} className={`transition-colors ${state.isLooping ? 'text-dr-gold' : 'text-white hover:text-gray-300'}`}><Repeat size={20} /></button>
            <button onClick={onHeadTrackingToggle} className={`transition-colors p-2 rounded-lg ${settings.headTracking ? 'bg-dr-gold text-white' : 'text-white hover:bg-white/10'}`}><Smartphone size={20} /></button>
            <button onClick={onVRToggle} className={`transition-colors p-2 rounded-lg ${settings.isVR ? 'bg-dr-gold text-white' : 'text-white hover:bg-white/10'}`}><Glasses size={22} /></button>
          </div>
        </div>
      </div>
    </div>

    {/* Settings Panel */}
    {showSettings && (
      <div className="absolute top-20 right-4 w-80 bg-black/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-20 overflow-hidden text-white animate-fade-in-up">
        
        {/* Header Tabs */}
        <div className="flex border-b border-white/10">
          <button 
            onClick={() => setActiveTab('quality')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'quality' ? 'bg-dr-gold/20 text-dr-gold border-b-2 border-dr-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <Monitor size={16} /> Qualidade
          </button>
          <button 
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'adjust' ? 'bg-dr-gold/20 text-dr-gold border-b-2 border-dr-gold' : 'text-gray-400 hover:text-white'}`}
          >
            <Sliders size={16} /> Ajustes
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {activeTab === 'quality' && (
            <>
              {/* Resolution */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Resolução de Renderização</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['auto', '720p', '1080p', '4k'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => onQualityChange({ ...quality, resolution: res })}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all flex items-center justify-between ${quality.resolution === res ? 'border-dr-gold bg-dr-gold/20 text-dr-gold' : 'border-white/10 hover:border-white/30 text-gray-300'}`}
                    >
                      {res === 'auto' ? 'Auto' : res.toUpperCase()}
                      {quality.resolution === res && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Profiles */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-bold">Perfil de Cor</label>
                <div className="space-y-1">
                  {(['standard', 'cinema', 'vivid', 'natural'] as const).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => onQualityChange({ ...quality, colorProfile: profile })}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center justify-between ${quality.colorProfile === profile ? 'bg-white/10 text-dr-gold font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                    >
                      {profile.charAt(0).toUpperCase() + profile.slice(1)}
                      {quality.colorProfile === profile && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

               {/* Auto Enhance Button */}
               <button 
                onClick={handleAutoEnhance}
                className="w-full mt-2 py-3 bg-gradient-to-r from-dr-gold to-[#b08d26] rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <Zap size={18} /> Auto-Melhoria AI
              </button>
            </>
          )}

          {activeTab === 'adjust' && (
            <div className="space-y-5">
              {[
                { label: 'Brilho', key: 'brightness', min: -0.5, max: 0.5 },
                { label: 'Contraste', key: 'contrast', min: -0.5, max: 0.5 },
                { label: 'Saturação', key: 'saturation', min: -1, max: 1 },
                { label: 'Nitidez', key: 'sharpness', min: 0, max: 1 },
              ].map((control) => (
                <div key={control.key} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="uppercase font-bold">{control.label}</span>
                    <span>{(quality[control.key as keyof QualitySettings] as number).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={0.01}
                    value={quality[control.key as keyof QualitySettings] as number}
                    onChange={(e) => onQualityChange({ ...quality, [control.key]: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-dr-gold"
                  />
                </div>
              ))}

              <button 
                onClick={() => onQualityChange({ ...quality, brightness: 0, contrast: 0, saturation: 0, sharpness: 0 })}
                className="w-full py-2 border border-white/20 rounded-lg text-xs hover:bg-white/10 transition-colors"
              >
                Resetar Ajustes
              </button>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default Controls;
