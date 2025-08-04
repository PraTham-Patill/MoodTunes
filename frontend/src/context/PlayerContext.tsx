import { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
}

interface PlayerContextType {
  currentSongId: string | null;
  currentSongTitle: string;
  currentSongArtist: string;
  currentSongThumbnail: string;
  isPlaying: boolean;
  playQueue: Song[];
  currentSongIndex: number;
  playSong: (id: string, title: string, artist: string, thumbnail: string, queue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  stopSong: () => void;
  playNext: () => void;
  playPrevious: () => void;
  stopPlayback: () => void;
  setIsPlaying: (playing: boolean) => void;
  setExternalControl: (isControlled: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [currentSongTitle, setCurrentSongTitle] = useState('');
  const [currentSongArtist, setCurrentSongArtist] = useState('');
  const [currentSongThumbnail, setCurrentSongThumbnail] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isExternallyControlled, setIsExternallyControlled] = useState(false);

  const playSong = (id: string, title: string, artist: string, thumbnail: string, queue?: Song[]) => {
    setCurrentSongId(id);
    setCurrentSongTitle(title);
    setCurrentSongArtist(artist);
    setCurrentSongThumbnail(thumbnail);
    setIsPlaying(true);
    
    // If a queue is provided, use it and set the current index
    if (queue && queue.length > 0) {
      setPlayQueue(queue);
      const index = queue.findIndex(song => song.id === id);
      setCurrentSongIndex(index !== -1 ? index : 0);
    } else if (playQueue.length === 0) {
      // If no queue exists, create one with just this song
      setPlayQueue([{ id, title, artist, thumbnailUrl: thumbnail }]);
      setCurrentSongIndex(0);
    }
    
    toast.success(`Now playing: ${title}`, {
      description: artist,
      duration: 3000,
    });
  };

  // Add these functions to maintain compatibility with existing components
  const pauseSong = () => {
    if (!isExternallyControlled) {
      setIsPlaying(false);
    }
  };

  const resumeSong = () => {
    if (!isExternallyControlled) {
      setIsPlaying(true);
    }
  };

  const stopSong = () => {
    if (!isExternallyControlled) {
      setIsPlaying(false);
      setCurrentSongId(null);
      setCurrentSongTitle('');
      setCurrentSongArtist('');
      setCurrentSongThumbnail('');
    }
  };

  const setExternalControl = (isControlled: boolean) => {
    setIsExternallyControlled(isControlled);
  };

  const playNext = () => {
    if (playQueue.length === 0 || currentSongIndex === -1) return;
    
    // Calculate next index (loop back to beginning if at the end)
    const nextIndex = (currentSongIndex + 1) % playQueue.length;
    const nextSong = playQueue[nextIndex];
    
    // Play the next song
    setCurrentSongId(nextSong.id);
    setCurrentSongTitle(nextSong.title);
    setCurrentSongArtist(nextSong.artist);
    setCurrentSongThumbnail(nextSong.thumbnailUrl);
    setCurrentSongIndex(nextIndex);
    
    toast.success(`Now playing: ${nextSong.title}`, {
      description: nextSong.artist,
      duration: 3000,
    });
  };

  const playPrevious = () => {
    if (playQueue.length === 0 || currentSongIndex === -1) return;
    
    // Calculate previous index (loop to the end if at the beginning)
    const prevIndex = (currentSongIndex - 1 + playQueue.length) % playQueue.length;
    const prevSong = playQueue[prevIndex];
    
    // Play the previous song
    setCurrentSongId(prevSong.id);
    setCurrentSongTitle(prevSong.title);
    setCurrentSongArtist(prevSong.artist);
    setCurrentSongThumbnail(prevSong.thumbnailUrl);
    setCurrentSongIndex(prevIndex);
    
    toast.success(`Now playing: ${prevSong.title}`, {
      description: prevSong.artist,
      duration: 3000,
    });
  };

  const stopPlayback = () => {
    console.log("Stopping playback")
    setIsPlaying(false);
    setCurrentSongId(null);
    setCurrentSongTitle('');
    setCurrentSongArtist('');
    setCurrentSongThumbnail('');
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSongId,
        currentSongTitle,
        currentSongArtist,
        currentSongThumbnail,
        isPlaying,
        playQueue,
        currentSongIndex,
        playSong,
        pauseSong,
        resumeSong,
        stopSong,
        playNext,
        playPrevious,
        stopPlayback,
        setIsPlaying,
        setExternalControl
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};