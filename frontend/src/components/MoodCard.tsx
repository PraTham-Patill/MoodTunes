import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MoodCardProps {
  icon: React.ReactNode;
  mood: string;
  description: string;
  color: string;
  isSelected?: boolean;
  onClick: () => void;
}

const MoodCard = ({ icon, mood, description, color, isSelected = false, onClick }: MoodCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const moodColors = {
    'Happy': 'from-yellow-400 to-amber-500',
    'Sad': 'from-blue-500 to-cyan-600',
    'Energetic': 'from-purple-500 to-violet-600',
    'Romantic': 'from-pink-500 to-rose-600',
    'Calm': 'from-sky-400 to-blue-500',
    'Melancholy': 'from-gray-500 to-slate-600',
    'Night': 'from-indigo-700 to-blue-900',
    'Discover': 'from-purple-500 to-indigo-600'
  };

  const getMoodGradient = () => moodColors[mood] || `from-${color}-500 to-${color}-600`;

  const cardClasses = cn(
    'relative rounded-2xl p-5 flex flex-col items-center justify-center',
    'transition-all duration-300 cursor-pointer shadow-lg aspect-square',
    isSelected
      ? `bg-gradient-to-br ${getMoodGradient()} text-white`
      : 'bg-gray-900/30 hover:bg-gray-800/50 backdrop-blur-md'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        cardClasses,
        'border-2 border-transparent hover:border-gray-200/50',
        isSelected ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'
      )}
    >
      <div className="absolute inset-0 rounded-2xl border border-transparent hover:border-white/30 transition-all duration-300"></div>

      <div className={`relative z-10 text-5xl ${isSelected ? 'text-white' : `text-${color}-400`} mb-4`}>
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold">{mood}</h3>
      
      <p className={`text-sm text-center mt-2 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
        {description}
      </p>
    </motion.div>
  );
};

export default MoodCard;
