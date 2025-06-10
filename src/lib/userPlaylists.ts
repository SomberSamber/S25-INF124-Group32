import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// User playlist interfaces
export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  source: 'spotify' | 'youtube' | 'manual';
  sourceId: string; // Original playlist ID from Spotify/YouTube
  sourceUrl: string; // Original playlist URL
  coverImageUrl?: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  trackCount: number;
}

export interface UserSong {
  id: string;
  title: string;
  artist: string;
  audioUrl: string; // YouTube URL for playback
  duration?: number;
  albumArt?: string;
  spotifyId?: string; // Original Spotify track ID
  youtubeId?: string; // YouTube video ID
  addedAt: Date;
}



// YouTube API interfaces
export interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
    };
  };
}

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
    };
  };
  contentDetails: {
    duration: string; // ISO 8601 format (PT4M13S)
  };
}

// Create user playlist
export const createUserPlaylist = async (
  userId: string,
  playlistData: Omit<UserPlaylist, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const playlistRef = collection(db, 'users', userId, 'imported-playlists');
    const docRef = await addDoc(playlistRef, {
      ...playlistData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('User playlist created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user playlist:', error);
    throw error;
  }
};

// Add song to user playlist
export const addSongToUserPlaylist = async (
  userId: string,
  playlistId: string,
  songData: Omit<UserSong, 'id' | 'addedAt'>
): Promise<string> => {
  try {
    const songsRef = collection(db, 'users', userId, 'imported-playlists', playlistId, 'songs');
    
    const docRef = await addDoc(songsRef, {
      ...songData,
      addedAt: serverTimestamp()
    });
    
    console.log('Song added to user playlist with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding song to user playlist:', error);
    throw error;
  }
};

// Get user playlists
export const getUserPlaylists = async (userId: string): Promise<UserPlaylist[]> => {
  try {
    const playlistsRef = collection(db, 'users', userId, 'imported-playlists');
    const snapshot = await getDocs(playlistsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as UserPlaylist[];
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    throw error;
  }
};

// Get songs from user playlist
export const getUserPlaylistSongs = async (
  userId: string,
  playlistId: string
): Promise<UserSong[]> => {
  try {
    const songsRef = collection(db, 'users', userId, 'imported-playlists', playlistId, 'songs');
    const snapshot = await getDocs(songsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      addedAt: (doc.data().addedAt as Timestamp)?.toDate() || new Date()
    })) as UserSong[];
  } catch (error) {
    console.error('Error fetching user playlist songs:', error);
    throw error;
  }
};

// Convert ISO 8601 duration to seconds
export const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = (match[1] ? parseInt(match[1]) : 0);
  const minutes = (match[2] ? parseInt(match[2]) : 0);
  const seconds = (match[3] ? parseInt(match[3]) : 0);
  return hours * 3600 + minutes * 60 + seconds;
};

// Search YouTube for a song (to find playback URL for Spotify tracks)
export const searchYouTubeForSong = async (
  songTitle: string,
  artistName: string,
  apiKey: string
): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`${songTitle} ${artistName} official audio`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${apiKey}&maxResults=1`
    );
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return null;
  }
};

// Import YouTube playlist
export const importYouTubePlaylist = async (
  userId: string,
  playlistUrl: string,
  apiKey: string
): Promise<string> => {
  try {
    // Extract playlist ID from URL
    const playlistId = playlistUrl.split('list=')[1]?.split('&')[0];
    if (!playlistId) throw new Error('Invalid YouTube playlist URL');

    console.log('Importing YouTube playlist:', playlistId);

    // Fetch playlist metadata
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );
    
    const playlistData = await playlistResponse.json();
    
    // Check for API errors
    if (playlistData.error) {
      const error = playlistData.error;
      console.error('YouTube API Error:', error);
      
      if (error.code === 403) {
        if (error.message.includes('quotaExceeded')) {
          throw new Error('YouTube API quota exceeded. Please try again later or check your API key quota limits.');
        } else if (error.message.includes('forbidden')) {
          throw new Error('YouTube API access forbidden. Please check your API key permissions and make sure YouTube Data API v3 is enabled.');
        } else {
          throw new Error(`YouTube API access denied: ${error.message}`);
        }
      } else if (error.code === 400) {
        throw new Error(`Invalid request: ${error.message}. Please check the playlist URL.`);
      } else if (error.code === 404) {
        throw new Error('Playlist not found. Please check that the playlist exists and is public or unlisted.');
      } else {
        throw new Error(`YouTube API error (${error.code}): ${error.message}`);
      }
    }
    
    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error('Playlist not found or is private. Please make sure the playlist is public or unlisted.');
    }
    
    const playlist: YouTubePlaylist = playlistData.items[0];

    // Fetch playlist items
    const itemsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=50`
    );
    const itemsData = await itemsResponse.json();
    
    // Check for API errors on playlist items
    if (itemsData.error) {
      const error = itemsData.error;
      console.error('YouTube API Error (playlist items):', error);
      
      if (error.code === 403) {
        throw new Error('Cannot access playlist items. The playlist might be private or you may have reached the API quota limit.');
      } else if (error.code === 404) {
        throw new Error('Playlist items not found. The playlist might be empty or private.');
      } else {
        throw new Error(`YouTube API error when fetching playlist items (${error.code}): ${error.message}`);
      }
    }

    if (!itemsData.items || itemsData.items.length === 0) {
      throw new Error('Playlist is empty or all videos are private/unavailable.');
    }

    // Create user playlist
    const userPlaylistId = await createUserPlaylist(userId, {
      name: playlist.snippet.title,
      description: playlist.snippet.description,
      source: 'youtube',
      sourceId: playlist.id,
      sourceUrl: playlistUrl,
      coverImageUrl: playlist.snippet.thumbnails.maxres?.url || 
                     playlist.snippet.thumbnails.high?.url,
      isPublic: false,
      trackCount: itemsData.items.length
    });

    console.log(`Processing ${itemsData.items.length} videos from playlist...`);

    // Process each video
    for (const item of itemsData.items) {
      try {
        const videoId = item.snippet.resourceId.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Get video details for duration
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
        );
        const videoData = await videoResponse.json();
        
        if (videoData.error) {
          console.warn(`Error fetching video ${videoId}:`, videoData.error);
          continue; // Skip this video and continue with others
        }
        
        if (!videoData.items || videoData.items.length === 0) {
          console.warn(`Video ${videoId} not found or unavailable, skipping...`);
          continue;
        }
        
        const video: YouTubeVideo = videoData.items[0];

        await addSongToUserPlaylist(userId, userPlaylistId, {
          title: video.snippet.title,
          artist: video.snippet.channelTitle,
          audioUrl: videoUrl,
          duration: parseDuration(video.contentDetails.duration),
          albumArt: video.snippet.thumbnails.maxres?.url || 
                    video.snippet.thumbnails.high?.url,
          youtubeId: videoId
        });
      } catch (videoError) {
        console.warn('Error processing individual video:', videoError);
        // Continue with other videos even if one fails
      }
    }

    console.log('YouTube playlist imported successfully!');
    return userPlaylistId;
  } catch (error) {
    console.error('Error importing YouTube playlist:', error);
    throw error;
  }
}; 