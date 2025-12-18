export enum ViewMode {
  Mode360 = '360',
  Mode180 = '180',
  Mode120 = '120',
}

export interface VideoState {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isLooping: boolean;
  isBuffering: boolean;
}

export interface PlayerSettings {
  viewMode: ViewMode;
  isVR: boolean;
  zoom: number;
  headTracking: boolean;
}

export interface QualitySettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  resolution: 'auto' | '720p' | '1080p' | '4k';
  colorProfile: 'standard' | 'cinema' | 'vivid' | 'natural';
}
