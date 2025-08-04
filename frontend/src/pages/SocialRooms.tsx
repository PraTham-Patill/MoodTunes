import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import { toast } from 'sonner';
import { LogOut, Plus, Music, Users, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';
import RoomCard from '@/components/RoomCard';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';

const SocialRooms = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Fetch rooms
  const fetchRooms = async (mood = '') => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const url = mood 
        ? `${import.meta.env.VITE_API_URL}/api/rooms?mood=${mood}`
        : `${import.meta.env.VITE_API_URL}/api/rooms`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Handle mood filter
  const handleMoodFilter = (mood: string) => {
    if (selectedMood === mood) {
      setSelectedMood(null);
      fetchRooms();
    } else {
      setSelectedMood(mood);
      fetchRooms(mood);
    }
  };

  // Handle room creation
  const handleCreateRoom = async (roomData) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const newRoom = await response.json();
      toast.success('Room created successfully');
      setIsCreateModalOpen(false);
      navigate(`/room/${newRoom._id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    }
  };

  // Update the handleRoomClick function to join via room code
const handleRoomClick = async (room) => {
  // If the room is private, don't allow direct joining
  if (room.isPrivate) {
    toast.error('This is a private room. Please use the room code to join.');
    setIsJoinModalOpen(true);
    return;
  }
  
  // Join the room using its code
  await handleJoinRoom(room.code);
};

  // Handle room join
  const handleJoinRoom = async (code: string) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join room');
      }

      const room = await response.json();
      toast.success('Joined room successfully');
      setIsJoinModalOpen(false);
      navigate(`/room/${room._id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error(error.message || 'Failed to join room');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Fetch rooms on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchRooms();
    }
  }, [user, navigate]);

  // Available moods
  const moods = ['happy', 'sad', 'energetic', 'romantic', 'calm', 'melancholy', 'night', 'discover'];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-white/10 p-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Logo />
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Explore
              </Link>
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                History
              </Link>
              <Link 
                to="/social-rooms" 
                className="text-sm font-medium text-foreground transition-colors"
              >
                Social Rooms
              </Link>
            </nav>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>
      
      {/* Search bar */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b border-white/10 p-4">
        <SearchBar />
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 max-w-screen-xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Social Rooms</h1>
            <p className="text-muted-foreground">
              Join music rooms or create your own to share your favorite tunes with others.
            </p>
          </motion.div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsJoinModalOpen(true)}
              className="px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <Users size={16} />
              <span>Join Room</span>
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Plus size={16} />
              <span>Create Room</span>
            </motion.button>
          </div>
        </div>

        {/* Mood filters */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">Filter by Mood</h2>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodFilter(mood)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedMood === mood
                    ? 'bg-blue-600 text-white'
                    : 'bg-secondary/50 hover:bg-secondary text-foreground'
                }`}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-secondary/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary/50 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-secondary/50 rounded w-1/3"></div>
                  <div className="h-8 bg-secondary/50 rounded-full w-8"></div>
                </div>
              </div>
            ))
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onClick={() => handleRoomClick(room)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Music className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-xl font-medium mb-2">No rooms available</h3>
              <p className="text-muted-foreground mb-4">
                {selectedMood
                  ? `No ${selectedMood} rooms found. Try a different mood or create your own room.`
                  : 'No rooms available. Be the first to create a room!'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-full inline-flex items-center space-x-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Plus size={16} />
                <span>Create Room</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
      />

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinRoom}
      />
    </div>
  );
};

export default SocialRooms;