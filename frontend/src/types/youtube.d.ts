
interface YTConfig {
  host: string;
  Player: {
    new (elementId: string, options: YTPlayerOptions): YT.Player;
  };
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare namespace YT {
  export interface PlayerOptions {
    width?: number | string;
    height?: number | string;
    videoId?: string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1;
      disablekb?: 0 | 1;
      enablejsapi?: 0 | 1;
      fs?: 0 | 1;
      iv_load_policy?: 1 | 3;
      modestbranding?: 0 | 1;
      playsinline?: 0 | 1;
      rel?: 0 | 1;
      showinfo?: 0 | 1;
      start?: number;
      end?: number;
      origin?: string;
    };
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { target: Player; data: number }) => void;
      onPlaybackQualityChange?: (event: { target: Player; data: string }) => void;
      onPlaybackRateChange?: (event: { target: Player; data: number }) => void;
      onError?: (event: { target: Player; data: number }) => void;
      onApiChange?: (event: { target: Player }) => void;
    };
  }

  export interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    loadVideoById(videoId: string, startSeconds?: number): void;
    cueVideoById(videoId: string, startSeconds?: number): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    getDuration(): number;
    getCurrentTime(): number;
    getPlaybackRate(): number;
    setPlaybackRate(rate: number): void;
    getAvailablePlaybackRates(): number[];
    getPlayerState(): number;
    getPlaybackQuality(): string;
    setPlaybackQuality(quality: string): void;
    getAvailableQualityLevels(): string[];
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getVideoData(): any;
    getVideoLoadedFraction(): number;
    getVideoStartBytes(): number;
    getOptions(): string[];
    getOption(option: string): any;
    destroy(): void;
  }
}

interface Window {
  YT: YTConfig;
  onYouTubeIframeAPIReady: () => void;
}
