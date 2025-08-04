import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomData: any) => void;
}

const CreateRoomModal = ({ isOpen, onClose, onSubmit }: CreateRoomModalProps) => {
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState('happy');
  const [maxUsers, setMaxUsers] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    onSubmit({
      title,
      mood,
      maxUsers,
      isPrivate
    });
    
    // Reset form
    setTitle('');
    setMood('happy');
    setMaxUsers(10);
    setIsPrivate(false);
  };
  
  // Available moods
  const moods = ['happy', 'sad', 'energetic', 'romantic', 'calm', 'melancholy', 'night', 'discover'];
  
  // Available max users options
  const maxUsersOptions = [5, 10, 15, 20, 30, 50];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold">Create a Room</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Room Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a room title..."
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="mood" className="block text-sm font-medium mb-1">
                  Room Mood
                </label>
                <select
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {moods.map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="maxUsers" className="block text-sm font-medium mb-1">
                  Maximum Users
                </label>
                <select
                  id="maxUsers"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {maxUsersOptions.map((option) => (
                    <option key={option} value={option}>
                      {option} users
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isPrivate"
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm">
                  Make this room private (joinable only with room code)
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateRoomModal;