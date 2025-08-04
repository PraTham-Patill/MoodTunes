import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { formatTime } from '@/utils/formatTime';
import {useAuth} from "../context/AuthContext"

const MusicPlayer = () => {
  const [volumeVisible, setVolumeVisible] = useState(false);
  const {user} = useAuth();
  
  const { 
    currentSongId, 
    currentSongTitle, 
    currentSongArtist, 
    currentSongThumbnail,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrevious,
    stopPlayback
  } = usePlayerContext();

  const {
    currentTime,
    duration,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    seekTo
  } = useYouTubePlayer({
    videoId: currentSongId,
    isPlaying,
  });


  const handlestop = () => {
    console.log("Stopping playback")
    setIsPlaying(false);
    stopPlayback();
  };
  

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = () => {
    playNext();
  };

  const handleSkipPrevious = () => {
    playPrevious();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    seekTo(newTime);
  };

  

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(100, Math.round(percent * 100)));
    
    setVolume(newVolume);
  };

  if (!currentSongId) return null;
  if (user?.email == null) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-3 z-50"
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          {/* Song info */}
          <div className="flex items-center space-x-3">
            <img 
              src={currentSongThumbnail} 
              alt={currentSongTitle}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="hidden sm:block">
              <h4 className="text-sm font-medium truncate max-w-[150px]">{currentSongTitle}</h4>
              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{currentSongArtist}</p>
            </div>
          </div>
          
          {/* Player controls */}
          <div className="flex flex-col items-center flex-1 max-w-md px-4">
            <div className="flex items-center space-x-4 mb-1">
              <button 
                onClick={handleSkipPrevious}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={handlePlayPause}
                className="bg-white text-black p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              </button>
              <button 
                onClick={handleSkipNext}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center w-full space-x-2">
              <span className="text-xs">{formatTime(currentTime)}</span>
              <div 
                className="h-1.5 bg-white/20 rounded-full flex-1 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs">{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Volume control */}
          <div className="hidden sm:flex items-center space-x-3">
            <button 
              onClick={toggleMute} 
              className="text-muted-foreground hover:text-white transition-colors"
              onMouseEnter={() => setVolumeVisible(true)}
              onMouseLeave={() => setVolumeVisible(false)}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div 
              className="h-1.5 bg-white/20 rounded-full w-24 cursor-pointer"
              onClick={handleVolumeClick}
              onMouseEnter={() => setVolumeVisible(true)}
              onMouseLeave={() => setVolumeVisible(false)}
            >
              <div 
                className={cn("h-full rounded-full", isMuted ? "bg-muted" : "bg-blue-500")}
                style={{ width: `${volume}%` }}
              />
            </div>
            <button onClick={handlestop} className="text-muted-foreground hover:text-white ml-2">
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;