
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string,id:string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('moodtunes_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('moodtunes_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string,id:string) => {
    // Simulate API call
    setIsLoading(true);
    
    // In a real app, you would call your authentication API here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, we'll accept any non-empty email/password
    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Email and password are required');
    }
    
    console.log("login "+id)
    const mockUser = { id, email };
    setUser(mockUser);
    console.log(mockUser)
    localStorage.setItem('moodtunes_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signup = async (email: string, password: string) => {
    // Simulate API call
    setIsLoading(true);
    
    // In a real app, you would call your registration API here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, we'll accept any non-empty email/password
    if (!email || !password) {
      setIsLoading(false);
      throw new Error('Email and password are required');
    }
    
    const mockUser = { id: '123', email };
    setUser(mockUser);
    localStorage.setItem('moodtunes_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moodtunes_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
