import React, { useRef, useState } from 'react';
import { Folder, Play, Volume2, Link } from 'lucide-react';

interface LandingPageProps {
  onUpload: (file: File) => void;
  onUrlSubmit?: (url: string) => void;
}

const DR360Logo = () => (
  <div className="relative w-64 h-28 md:w-80 md:h-32 flex items-center justify-center animate-fade-in-up">
    <svg viewBox="0 0 300 120" className="w-full h-full filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.2)]">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4af37' }} />
          <stop offset="100%" style={{ stopColor: '#8b6b1d' }} />
        </linearGradient>
      </defs>
      
      {/* DR Main Text */}
      <text 
        x="130" 
        y="85" 
        textAnchor="middle" 
        fontFamily="Georgia, serif" 
        fontSize="110" 
        fontWeight="900" 
        fill="url(#goldGrad)" 
        style={{ letterSpacing: '-6px' }}
      >
        DR
      </text>
      {/* 360 Text with Degree Symbol */}
      <text 
        x="215" 
        y="85" 
        textAnchor="start" 
        fontFamily="Georgia, serif" 
        fontSize="34" 
        fontWeight="400" 
        fill="url(#goldGrad)" 
        style={{ letterSpacing: '4px' }}
      >
        360°
      </text>
      {/* Elegant Separator Line */}
      <rect x="215" y="95" width="45" height="1.5" fill="url(#goldGrad)" opacity="0.6" />
      
      {/* Decorative Halo Arc */}
      <path 
        d="M60,100 Q150,130 240,100" 
        fill="none" 
        stroke="url(#goldGrad)" 
        strokeWidth="1" 
        strokeDasharray="4 2"
        opacity="0.3"
      />
    </svg>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onUpload, onUrlSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoUrl.trim() && onUrlSubmit) onUrlSubmit(videoUrl.trim());
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="relative w-full max-w-[900px] aspect-square gold-border-gradient rounded-none flex flex-col items-center justify-center py-10 px-12 shadow-[0_20px_60px_rgba(74,63,53,0.15)] overflow-hidden">
        
        {/* Branding Section */}
        <div className="flex flex-col items-center justify-center w-full mb-12">
          <DR360Logo />
          <h1 className="mt-2 text-4xl md:text-6xl font-serif gold-text-effect tracking-tight">
            Dodge Recian
          </h1>
          <p className="mt-2 text-dr-brown/40 text-[10px] font-bold tracking-[0.6em] uppercase">
            Luxury Immersive Vision
          </p>
        </div>
        
        {/* Central Premium Control Hub */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
          
          {/* URL Input overlay */}
          {showUrlInput && (
            <div className="absolute -top-32 inset-x-0 animate-fade-in-up bg-white/95 backdrop-blur-md p-6 rounded-none border border-dr-gold/30 z-30 shadow-2xl">
              <form onSubmit={handleUrlSubmit} className="flex gap-4">
                <input 
                  autoFocus
                  type="url"
                  placeholder="https://exclusive-video.mp4"
                  className="flex-1 bg-transparent border-b border-dr-gold/40 text-dr-brown outline-none p-2 text-sm"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <button type="submit" className="text-dr-gold hover:text-dr-goldLight font-serif font-bold">GO</button>
                <button type="button" onClick={() => setShowUrlInput(false)} className="text-dr-gray hover:text-dr-brown text-xs">CLOSE</button>
              </form>
            </div>
          )}
          
          {/* START Button - Direct Link to Google AI Studio */}
          <a
            href="https://ai.studio/apps/drive/1YJu-PnuwAaHhj7NSugpM2wL8IBnql5tc"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 inline-block px-8 py-3 bg-gradient-to-r from-dr-gold to-dr-goldLight text-dr-black font-serif font-bold text-lg rounded-none shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.5)] transition-all duration-300 hover:scale-105"
            aria-label="Start DR360 App"
          >
            START
          </a>
          
          {/* All buttons clustered together */}
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="gold-icon-btn shadow-gold-glow"
                title="Upload File"
              >
                <Folder size={20} />
              </button>
              <button 
                className="gold-icon-btn shadow-gold-glow" 
                onClick={() => setShowUrlInput(!showUrlInput)}
                title="Enter URL"
              >
                <Link size={20} />
              </button>
            </div>
            
            {/* Central Large Play Button */}
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="gold-play-btn z-10"
              aria-label="Select Video from PC"
            >
              <Play size={40} fill="currentColor" />
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="gold-icon-btn shadow-gold-glow" title="Volume">
                <Volume2 size={20} />
              </button>
              <button className="gold-icon-btn shadow-gold-glow" title="View Mode">
                <div className="w-4 h-4 rounded-none border border-dr-gold/60 bg-white/80 shadow-inner"></div>
              </button>
            </div>
          </div>
          
          {/* Mini Seek Bar */}
          <div className="w-64 mt-12 flex items-center space-x-3 opacity-50">
            <span className="text-[10px] text-dr-brown/40 font-serif">0:00</span>
            <div className="flex-1 h-[1px] bg-dr-gold/20 relative">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-dr-gold"></div>
            </div>
            <span className="text-[10px] text-dr-brown/40 font-serif">-360</span>
          </div>
        </div>
        
        {/* Decorative footer text */}
        <div className="absolute bottom-10 text-center">
          <p className="text-[8px] text-dr-brown/20 tracking-[0.8em] uppercase">
            Excellence in Motion
          </p>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/mp4,video/webm"
        className="hidden"
      />
    </div>
  );
};

export default LandingPage;
