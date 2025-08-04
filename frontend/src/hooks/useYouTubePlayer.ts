
import { useState, useEffect, useRef } from 'react';

interface UseYouTubePlayerProps {
  videoId: string | null;
  isPlaying: boolean;
}

interface UseYouTubePlayerReturn {
  player: YT.Player | null;
  isReady: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (seconds: number) => void;
}

export const useYouTubePlayer = ({ videoId, isPlaying }: UseYouTubePlayerProps): UseYouTubePlayerReturn => {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Load YouTube API
  useEffect(() => {
    // Create container for YouTube player if it doesn't exist
    if (!containerRef.current) {
      containerRef.current = document.createElement('div');
      containerRef.current.id = 'youtube-player-container';
      containerRef.current.style.position = 'absolute';
      containerRef.current.style.top = '-9999px';
      containerRef.current.style.left = '-9999px';
      document.body.appendChild(containerRef.current);
    }

    // Only load API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initializePlayer();
      };
    } else if (window.YT.Player) {
      console.log('YouTube API already loaded');
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (containerRef.current) {
        document.body.removeChild(containerRef.current);
        containerRef.current = null;
      }
    };
  }, []);

  // Initialize YouTube player
  const initializePlayer = () => {
    if (!containerRef.current || !window.YT || !window.YT.Player) return;
    
    console.log('Initializing YouTube player');
    
    playerRef.current = new window.YT.Player(containerRef.current.id, {
      height: '360',
      width: '640',
      playerVars: {
        autoplay: 0,
        controls: 0,
        enablejsapi: 1,
        origin: window.location.origin,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          console.log('YouTube player ready');
          setPlayer(event.target);
          setIsReady(true);
          event.target.setVolume(volume);
          
          // Start tracking player time
          startTimeTracking();
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startTimeTracking();
          } else if (event.data === window.YT.PlayerState.PAUSED ||
                    event.data === window.YT.PlayerState.ENDED ||
                    event.data === window.YT.PlayerState.UNSTARTED) {
            stopTimeTracking();
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
        },
      },
    });
  };

  // Load video when videoId changes
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    
    if (videoId) {
      console.log('Loading video:', videoId);
      playerRef.current.loadVideoById(videoId);
      
      // Get video duration after a short delay to ensure it's available
      setTimeout(() => {
        if (playerRef.current) {
          const newDuration = playerRef.current.getDuration();
          setDuration(newDuration > 0 ? newDuration : 0);
        }
      }, 1000);
    } else {
      // Stop the player when videoId becomes null (player is closed)
      console.log('Stopping YouTube player');
      playerRef.current.stopVideo();
      setCurrentTime(0);
      setDuration(0);
    }
    
  }, [videoId, isReady]);

  // Handle play/pause
  useEffect(() => {
    if (!isReady || !playerRef.current || !videoId) return;
    
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, isReady, videoId]);

  // Track player time
  const startTimeTracking = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
        
        // Update duration if it wasn't available earlier
        if (duration === 0) {
          const newDuration = playerRef.current.getDuration();
          if (newDuration > 0) {
            setDuration(newDuration);
          }
        }
      }
    }, 500);
  };

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Set volume
  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (playerRef.current) {
      if (newMuteState) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  };

  // Seek to time
  const seekTo = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  return {
    player: player,
    isReady,
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    seekTo,
  };
};
