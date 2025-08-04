import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlayerContext } from '@/context/PlayerContext';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import SongCard from '@/components/SongCard';
import MoodCard from '@/components/MoodCard';
import { searchSongsByMood, searchSongs, Song } from '@/utils/youtubeApi';
import { toast } from 'sonner';
import { LogOut, Smile, Frown, Zap, Heart, Sun, Cloud, Moon, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { playSong,stopPlayback,setIsPlaying} = usePlayerContext();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [noResults, setNoResults] = useState(false);
  
  // Parse query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const moodParam = searchParams.get('mood');
    const queryParam = searchParams.get('q');
    
    if (moodParam) {
      setSelectedMood(moodParam);
      fetchSongsByMood(moodParam);
    } else if (queryParam) {
      setQuery(queryParam);
      fetchSongsByQuery(queryParam);
    }
  }, [location.search]);
  
  const fetchSongsByMood = async (mood: string) => {
    setIsLoading(true);
    setNoResults(false);
    
    try {
      const results = await searchSongsByMood(mood);
      setSongs(results);
      setNoResults(results.length === 0);
    } catch (error) {
      console.error('Error fetching songs by mood:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchSongsByQuery = async (query: string) => {
    setIsLoading(true);
    setNoResults(false);
    setSelectedMood(null);
    
    try {
      const results = await searchSongs(query);
      setSongs(results);
      setNoResults(results.length === 0);
    } catch (error) {
      console.error('Error searching songs:', error);
      toast.error('Search failed. Please try again');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMoodSelection = (mood: string) => {
    if (mood === selectedMood) return;
    
    setSelectedMood(mood);
    navigate(`/explore?mood=${mood.toLowerCase()}`);
    fetchSongsByMood(mood);
  };
  
  const handleLogout = () => {
    setIsPlaying(false);
    logout();
    navigate('/login');
  };

  const handleSongPlay = async (song: Song) => {
    // Pass the entire song queue along with the selected song
    console.log("mood")

    // History details to save
    const historyData = {
        artist: song.artist,             // Song artist
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        time: new Date().toLocaleTimeString(),       // Current time in HH:MM:SS AM/PM formattime:,
        songTitle: song.title,
        mood: selectedMood || 'discover'  // Use 'discover' as default mood if selectedMood is null
    };

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Send token for authentication
            },
            body: JSON.stringify(historyData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to add history:', errorData.message);
            toast.error('Failed to save to history');
            // Continue with playing the song even if history saving fails
        } else {
            const result = await response.json();
            console.log('History added successfully:', result);
        }
    } catch (error) {
        console.error('Error adding history:', error);
        // Continue with playing the song even if history saving fails
    }
    
    // Play the song regardless of whether history was saved successfully
    playSong(song.id, song.title, song.artist, song.thumbnailUrl, songs);
  };
  
  const moods = [
    { name: 'Happy', icon: <Smile size={24} />, color: 'happy', description: 'Joyful vibes' },
    { name: 'Sad', icon: <Frown size={24} />, color: 'sad', description: 'Emotional tunes' },
    { name: 'Energetic', icon: <Zap size={24} />, color: 'energetic', description: 'High energy' },
    { name: 'Romantic', icon: <Heart size={24} />, color: 'romantic', description: 'Love songs' },
    { name: 'Calm', icon: <Sun size={24} />, color: 'calm', description: 'Peaceful melodies' },
    { name: 'Melancholy', icon: <Cloud size={24} />, color: 'melancholy', description: 'Reflective sounds' },
    { name: 'Night', icon: <Moon size={24} />, color: 'night', description: 'Nocturnal beats' },
    { name: 'Discover', icon: <Music size={24} />, color: 'discover', description: 'New discoveries' },
  ];
  
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
                className="text-sm font-medium text-foreground transition-colors"
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
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
        {/* Mood filter */}
        <div className="overflow-x-auto mb-8 pb-2">
          <div className="flex space-x-3 justify-center align-center">
            {moods.map((mood) => (
              <div key={mood.name} className="w-28 flex-shrink-0">
                <MoodCard
                  icon={mood.icon}
                  mood={mood.name}
                  description={mood.description}
                  color={mood.color}
                  isSelected={selectedMood === mood.name.toLowerCase()}
                  onClick={() => handleMoodSelection(mood.name.toLowerCase())}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Results header */}
        {query ? (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold mb-2"
          >
            Search Results
          </motion.h2>
        ) : selectedMood ? (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold mb-2"
          >
            {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Music
          </motion.h2>
        ) : null}
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1 } }}
          className="text-muted-foreground mb-6"
        >
          {query ? (
            `Search for your favorite songs, artists or albums.`
          ) : selectedMood ? (
            `Music that matches your ${selectedMood} mood.`
          ) : (
            `Select a mood to get recommendations or search for specific music.`
          )}
        </motion.p>
        
        {/* Song results */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-secondary/50 rounded-lg mb-2"></div>
                <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : noResults ? (
          <div className="text-center py-16">
            <Music className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-xl font-medium mb-2">No search results found</h3>
            <p className="text-muted-foreground mb-4">Try searching for different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                id={song.id}
                title={song.title}
                artist={song.artist}
                thumbnailUrl={song.thumbnailUrl}
                mood = {selectedMood}
                onClick={() => handleSongPlay(song)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;