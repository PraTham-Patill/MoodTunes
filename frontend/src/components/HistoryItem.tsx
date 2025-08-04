
import { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryItemProps {
  mood: string;
  date: string;
  time: string;
  songs?: Array<{
    id: string;
    title: string;
    artist: string;
  }>;
}

const HistoryItem = ({ mood, date, time, songs = [] }: HistoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getMoodColor = () => {
    switch(mood.toLowerCase()) {
      case 'happy': return 'bg-happy text-black';
      case 'sad': return 'bg-sad text-white';
      case 'energetic': return 'bg-energetic text-white';
      case 'romantic': return 'bg-romantic text-white';
      case 'calm': return 'bg-calm text-black';
      case 'melancholy': return 'bg-melancholy text-white';
      case 'night': return 'bg-night text-white';
      default: return 'bg-discover text-white';
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <div 
        className="flex items-center justify-between p-4 border border-white/10 rounded-lg glassmorphism cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`${getMoodColor()} px-3 py-1 rounded-full text-sm font-medium`}>
            {mood}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>{time}</span>
          </div>
        </div>
        <button>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && songs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 pl-4 border-l-2 border-white/10 ml-4"
        >
          {songs.map(song => (
            <div key={song.id} className="py-2 px-4 hover:bg-white/5 rounded transition-colors">
              <p className="text-sm font-medium">{song.title}</p>
              <p className="text-xs text-muted-foreground">{song.artist}</p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistoryItem;
