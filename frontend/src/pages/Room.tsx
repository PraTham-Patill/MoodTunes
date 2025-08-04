import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlayerContext } from '@/context/PlayerContext';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import { LogOut, Send, Users, Music, ArrowLeft, Lock, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import SongCard from '@/components/SongCard';
import { searchSongs, Song } from '@/utils/youtubeApi';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define types
interface Message {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface RoomData {
  _id: string;
  title: string;
  mood: string;
  owner: {
    _id: string;
    name: string;
  };
  isPrivate: boolean;
  code: string;
  maxUsers: number;
  currentSong: {
    id: string | null;
    title: string | null;
    artist: string | null;
    thumbnailUrl: string | null;
    timestamp: number;
  };
  participants: Array<{
    _id: string;
    name: string;
  }>;
}

// Inside the Room component
const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, logout } = useAuth();
  const { playSong, currentSongId, setExternalControl } = usePlayerContext();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<RoomData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch room data
  const fetchRoomData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room data');
      }

      const data = await response.json();
      setRoom(data);
      setIsOwner(data.owner._id === user?.id);
      console.log("owner hai kya "+isOwner+" "+data.owner._id+" "+user?.id)
      
      // If there's a current song and we're not the owner, play it
      if (data.currentSong?.id && !isOwner) {
        playSong(
          data.currentSong.id,
          data.currentSong.title || '',
          data.currentSong.artist || '',
          data.currentSong.thumbnailUrl || ''
        );
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching room data:', error);
      toast.error('Failed to load room data');
      navigate('/social-rooms');
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    
    if (!token || !roomId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!messageText.trim() || !roomId) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${roomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: messageText })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const newMessage = await response.json();
      
      // Fix: Make sure the room property is correctly set for socket.io
      newMessage.room = roomId;
      
      // Emit the message to other users in the room
      if (socketRef.current && socketRef.current.connected) {
        console.log('Emitting message:', newMessage);
        socketRef.current.emit('send_message', newMessage);
      } else {
        console.error('Socket not connected, cannot emit message');
      }
      
      // Add the message to our local state immediately
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      
      // Clear the input
      setMessageText('');
      
      // Scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  // Add this function to handle copying the room code
const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle song search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = await searchSongs(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching songs:', error);
      toast.error('Failed to search songs');
    } finally {
      setIsSearching(false);
    }
  };

  // Play a song (for room owner)
  const handlePlaySong = async (song: Song) => {
    if (!isOwner || !roomId) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }

    try {
      // Play the song locally
      playSong(song.id, song.title, song.artist, song.thumbnailUrl);
      
      // Update the current song in the room
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/song`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          songId: song.id,
          title: song.title,
          artist: song.artist,
          thumbnailUrl: song.thumbnailUrl,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update current song');
      }
      
      // Emit song update to socket
      socketRef.current.emit('update_song', {
        roomId,
        song: {
          id: song.id,
          title: song.title,
          artist: song.artist,
          thumbnailUrl: song.thumbnailUrl
        }
      });
      
      // Update the local room state with the new song information
      if (room) {
        setRoom({
          ...room,
          currentSong: {
            id: song.id,
            title: song.title,
            artist: song.artist,
            thumbnailUrl: song.thumbnailUrl,
            timestamp: Date.now()
          }
        });
      }
      
      // Clear search results
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error updating current song:', error);
      toast.error('Failed to update current song');
    }
  };

  const handleBackToSocialRooms = () => {
    // Call the leave room function before navigating
    handleLeaveRoom();
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No token found. Please log in again.');
      navigate('/social-rooms');
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Disconnect from socket
      if (socketRef.current) {
        socketRef.current.emit('leave_room', roomId);
        socketRef.current.disconnect();
      }
      
      toast.success(isOwner ? 'Room deleted successfully' : 'Left room successfully');
      navigate('/social-rooms');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Disconnect from socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize socket connection
  useEffect(() => {
    if (!user || !roomId) return;
    
    // Fix: Use the correct socket.io connection with proper options
    socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
      transports: ['websocket'],
      withCredentials: true
    });
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected with ID:', socketRef.current.id);
      socketRef.current.emit('join_room', roomId);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Improved message handling
    socketRef.current.on('receive_message', (newMessage) => {
      console.log('Received new message:', newMessage);
      
      // Ensure the message has all required properties before adding to state
      if (newMessage && newMessage._id) {
        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(msg => msg._id === newMessage._id);
          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
        
        // Scroll to bottom when new message arrives
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
    
    // Improved song update handling
    socketRef.current.on('song_updated', (data) => {
      console.log('Song updated:', data);
      if (!isOwner && data.song) {
        playSong(
          data.song.id,
          data.song.title || '',
          data.song.artist || '',
          data.song.thumbnailUrl || ''
        );
        
        // Update the room data with the new song information
        if (room) {
          setRoom({
            ...room,
            currentSong: {
              id: data.song.id,
              title: data.song.title || '',
              artist: data.song.artist || '',
              thumbnailUrl: data.song.thumbnailUrl || '',
              timestamp: Date.now()
            }
          });
        }
      }
    });
    
    // Add this event listener for room updates
    socketRef.current.on('room_updated', () => {
      console.log('Room data updated, refreshing...');
      fetchRoomData();
    });
    
    // Add this event listener for participant updates
    // Update the participant_updated event handler in the useEffect hook
    socketRef.current.on('participant_updated', (data) => {
    console.log('Participant list updated:', data);
    if (room && data.participants) {
    setRoom(prevRoom => {
    if (!prevRoom) return null;
    return {
    ...prevRoom,
    participants: data.participants
    };
    });
    }
    });
    
    // Also update the room_updated event handler to ensure it properly refreshes the data
    socketRef.current.on('room_updated', () => {
    console.log('Room data updated, refreshing...');
    fetchRoomData();
    });
    
    // Add this event listener for room deletion
    socketRef.current.on('room_deleted', () => {
      console.log('Room has been deleted by the owner');
      toast.info('This room has been deleted by the owner');
      navigate('/social-rooms');
    });
    
    // Load initial data
    fetchRoomData();
    fetchMessages();
    
    // Set external control for the player
    setExternalControl(!isOwner);
    
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket...');
        socketRef.current.emit('leave_room', roomId);
        socketRef.current.disconnect();
      }
      
      // Reset external control
      setExternalControl(false);
    };
  }, [roomId, user, isOwner, playSong]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Room not found</h1>
        <p className="text-muted-foreground mb-6">The room you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/social-rooms')}
          className="px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Social Rooms</span>
        </button>
      </div>
    );
  }

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
      
      {/* Room header */}
      <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <button
  onClick={handleBackToSocialRooms}
  className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
>
  <ArrowLeft size={18} />
</button>
            <div>
              <h1 className="text-xl font-bold">{room.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="capitalize">{room.mood} mood</span>
                <span>•</span>
                <span>Hosted by {room.owner.name}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Users size={14} className="mr-1" />
                  <span>{room.participants.length}/{room.maxUsers}</span>
                </div>
                <span>•</span>
                <div 
                  className="flex items-center space-x-1 cursor-pointer hover:text-foreground transition-colors"
                  onClick={copyRoomCode}
                  title="Click to copy room code"
                >
                  <span>Room Code: {room.code}</span>
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </div>
              </div>
            </div>
          </div>
          
          {/* Fix: Remove duplicate import and state declarations */}
          <div className="flex items-center space-x-2">
            {room.isPrivate && (
              <div className="flex items-center space-x-1 text-sm bg-secondary/50 px-3 py-1.5 rounded-full">
                <Lock size={14} />
                <span>Code: {room.code}</span>
                <button
                  onClick={copyRoomCode}
                  className="ml-1 p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Copy room code"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
            <button
              onClick={handleLeaveRoom}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              {isOwner ? 'Delete Room' : 'Leave Room'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-screen-xl mx-auto w-full">
        {/* Left side - Chat */}
        <div className="w-full md:w-1/3 border-r border-white/10 flex flex-col h-[calc(100vh-14rem)] relative">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-medium">Chat</h2>
          </div>
          
          <ScrollArea className="flex-1 mb-14">
            <div className="p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message._id} className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{message.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm bg-secondary/30 p-2 rounded-md">{message.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-background">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 rounded-md bg-secondary/50 border border-border px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="h-10 w-10 rounded-md bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
        
        {/* Right side - Music */}
        <div className="w-full md:w-2/3 flex flex-col h-[calc(100vh-12rem)]">
          {/* Current song */}
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-medium mb-4">
              {isOwner ? 'Now Playing' : 'Listening to'}
            </h2>
            
            {room.currentSong?.id ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={room.currentSong.thumbnailUrl || ''} 
                  alt={room.currentSong.title || 'Current song'} 
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium">{room.currentSong.title}</h3>
                  <p className="text-sm text-muted-foreground">{room.currentSong.artist}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-secondary/20 rounded-md">
                <Music className="mx-auto mb-2 text-muted-foreground" size={24} />
                <p className="text-muted-foreground">
                  {isOwner ? 'No song playing. Search for a song below.' : 'Host hasn\'t played any songs yet.'}
                </p>
              </div>
            )}
          </div>
          
          {/* Song search (only for owner) */}
          {isOwner && (
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-medium mb-4">Search Songs</h2>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex items-center space-x-2 mb-4"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs..."
                  className="flex-1 h-10 rounded-md bg-secondary/50 border border-border px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>
              
              {/* Search results */}
              <div className="overflow-y-auto max-h-[calc(100vh-24rem)]">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.map((song) => (
                      <SongCard
                        key={song.id}
                        id={song.id}
                        title={song.title}
                        artist={song.artist}
                        thumbnailUrl={song.thumbnailUrl}
                        mood={room.mood}
                        onClick={() => handlePlaySong(song)}
                      />
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found. Try a different search.</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
          
          {/* Participants */}
          <div className="p-4 flex-1">
            <h2 className="text-lg font-medium mb-4">Participants ({room.participants.length}/{room.maxUsers})</h2>
            
            <div className="space-y-2">
              {room.participants.map((participant) => (
                <div 
                  key={participant._id}
                  className={`flex items-center space-x-3 p-2 rounded-md ${
                    participant._id === room.owner._id ? 'bg-blue-500/10' : 'bg-secondary/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.name}</p>
                  </div>
                  {participant._id === room.owner._id && (
                    <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;

