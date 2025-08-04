import { useState } from 'react';
import { Play, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerContext } from '@/context/PlayerContext';

interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  previewAvailable?: boolean;
  mood: string;
  onClick?: () => void;
}

const SongCard = ({
  id,
  title,
  artist,
  thumbnailUrl,
  previewAvailable = true,
  onClick,
  mood
}: SongCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const { playSong, currentSongId } = usePlayerContext();
  const isPlaying = currentSongId === id;
  
  const handleClick =  async () => {
    if (onClick) {
      onClick();
    } else {
      playSong(id, title, artist, thumbnailUrl);
    }
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div 
      className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white rounded-full p-3">
            <Play className="text-black" size={24} />
          </div>
        </div>
        
        <button 
          onClick={handleLikeClick}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart 
            className={cn("transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-gray-700")} 
            size={18} 
          />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{artist}</p>
        {previewAvailable && (
          <span className="text-xs text-emerald-600 mt-1 inline-block">
            Preview Available
          </span>
        )}
      </div>
    </div>
  );
};

export default SongCard;