
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

const History = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };
  
  // Redirect to Dashboard page since History functionality is now in Dashboard
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);
  
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
        <div className="text-center py-16">
          <p className="text-muted-foreground">Redirecting to Dashboard...</p>
        </div>
      </main>
    </div>
  );
};

export default History;
