import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlayerContext } from "../context/PlayerContext"
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import HistoryItem from '@/components/HistoryItem';
import { toast } from 'sonner';
import { LogOut, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const {stopPlayback} = usePlayerContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch history from backend
  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Failed to fetch history: ${errorData.message}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setHistory(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Error fetching history.');
      setLoading(false);
    }
  };

  // ✅ Clear history
  const handleClearHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Failed to clear history: ${errorData.message}`);
        return;
      }

      toast.success('History cleared successfully');
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Error clearing history.');
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    logout();
    stopPlayback();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // ✅ Fetch history on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchHistory();
    }
  }, [user, navigate]);

  if (!user) return null;

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
                className="text-sm font-medium text-foreground transition-colors"
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">
              Track your mood and music recommendation history.
            </p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClearHistory}
            className="mt-4 md:mt-0 px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <Trash size={16} />
            <span>Clear history</span>
          </motion.button>
        </div>

        {/* History list */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          ) : history.length > 0 ? (
            history.map((item: any) => (
              <HistoryItem
                key={item._id}
                mood={item.mood}
                date={item.date}
                time={item.time}
                songs={[{
                  id: item._id,
                  title: item.songTitle,
                  artist: item.artist
                }]}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No history available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
