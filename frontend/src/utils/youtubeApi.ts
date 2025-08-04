
import { toast } from 'sonner';

const API_KEY = 'AIzaSyDO3pQv4rywn2PHaLzTWLo47dRgCtcGXv4';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Define types for the YouTube API responses
interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      channelTitle: string;
      description: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
  }>;
}

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      description: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
  }>;
}

// Define types for our internal song representation
export interface Song {
  id: string;
  title: string;
  artist: string;
  description: string;
  thumbnailUrl: string;
}

// Map from moods to search terms
const moodSearchMap: Record<string, string> = {
  happy: 'happy upbeat music',
  sad: 'sad emotional music',
  energetic: 'energetic upbeat music',
  romantic: 'romantic love songs',
  calm: 'calm relaxing music',
  melancholy: 'melancholy reflective music',
  night: 'atmospheric night music',
  discover: 'popular music mix',
};

// Search for songs based on mood
export const searchSongsByMood = async (mood: string): Promise<Song[]> => {
  try {
    const searchTerm = moodSearchMap[mood.toLowerCase()] || mood;
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchTerm)}&type=video&videoCategoryId=10&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data: YouTubeSearchResponse = await response.json();
    
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    }));
  } catch (error) {
    console.error('Error searching songs by mood:', error);
    toast.error('Failed to load music recommendations. Please try again later.');
    return [];
  }
};

// Search for songs based on query
export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data: YouTubeSearchResponse = await response.json();
    
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    }));
  } catch (error) {
    console.error('Error searching songs:', error);
    toast.error('Failed to search. Please try again later.');
    return [];
  }
};

// Helper function to get song details by ID
export const getSongById = async (videoId: string): Promise<Song | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet&id=${videoId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data: YouTubeVideoResponse = await response.json();
    
    if (data.items.length === 0) {
      return null;
    }
    
    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
    };
  } catch (error) {
    console.error('Error getting song by ID:', error);
    toast.error('Failed to load song details. Please try again later.');
    return null;
  }
};
