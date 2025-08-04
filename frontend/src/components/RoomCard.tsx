import { Users, Lock, Music } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomCardProps {
  room: {
    _id: string;
    title: string;
    mood: string;
    owner: {
      _id: string;
      name: string;
    };
    isPrivate: boolean;
    participants: Array<{
      _id: string;
      name: string;
    }>;
    maxUsers: number;
    currentSong: {
      id: string | null;
      title: string | null;
    };
  };
  onClick: () => void;
}

const RoomCard = ({ room, onClick }: RoomCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-white/5"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg line-clamp-1">{room.title}</h3>
          {room.isPrivate && (
            <Lock size={16} className="text-muted-foreground" />
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
          <span className="capitalize bg-secondary/50 px-2 py-0.5 rounded-full">
            {room.mood}
          </span>
          <span>•</span>
          <span>By {room.owner.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-sm">
            <Users size={14} />
            <span>{room.participants.length}/{room.maxUsers}</span>
          </div>
          
          {room.currentSong?.id ? (
            <div className="flex items-center space-x-1 text-sm text-emerald-500">
              <Music size={14} />
              <span className="line-clamp-1 max-w-[150px]">
                {room.currentSong.title}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No music playing</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;