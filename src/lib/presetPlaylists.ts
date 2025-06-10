import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  updateDoc,
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface PresetPlaylist {
  id: string;
  name: string;
  description?: string;
  genre: string;
  coverImageUrl?: string;
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresetSong {
  id: string;
  title: string;
  artist: string;
  audioUrl: string; // YouTube URL or other streaming URL
  duration?: number; // in seconds
  albumArt?: string;
  youtubeId?: string; // extracted from YouTube URL
  createdAt: Date;
}

// Extract YouTube video ID from URL
export const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Create a preset playlist
export const createPresetPlaylist = async (
  playlistData: Omit<PresetPlaylist, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const playlistRef = collection(db, 'preset-playlists');
    const docRef = await addDoc(playlistRef, {
      ...playlistData,
      isPreset: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Preset playlist created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating preset playlist:', error);
    throw error;
  }
};

// Add a song to a preset playlist
export const addSongToPresetPlaylist = async (
  playlistId: string,
  songData: Omit<PresetSong, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const songsRef = collection(db, 'preset-playlists', playlistId, 'songs');
    const youtubeId = extractYouTubeId(songData.audioUrl);
    
    const docRef = await addDoc(songsRef, {
      ...songData,
      youtubeId,
      createdAt: serverTimestamp()
    });
    
    console.log('Song added to playlist with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    throw error;
  }
};

// Get all preset playlists
export const getPresetPlaylists = async (): Promise<PresetPlaylist[]> => {
  try {
    const playlistsRef = collection(db, 'preset-playlists');
    const snapshot = await getDocs(playlistsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as PresetPlaylist[];
  } catch (error) {
    console.error('Error fetching preset playlists:', error);
    throw error;
  }
};

// Get songs from a preset playlist
export const getPresetPlaylistSongs = async (playlistId: string): Promise<PresetSong[]> => {
  try {
    const songsRef = collection(db, 'preset-playlists', playlistId, 'songs');
    const snapshot = await getDocs(songsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
    })) as PresetSong[];
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    throw error;
  }
};

// Delete a song from a preset playlist
export const deleteSongFromPresetPlaylist = async (
  playlistId: string,
  songId: string
): Promise<void> => {
  try {
    const songRef = doc(db, 'preset-playlists', playlistId, 'songs', songId);
    await deleteDoc(songRef);
    console.log('Song deleted successfully');
  } catch (error) {
    console.error('Error deleting song:', error);
    throw error;
  }
};

// Update a song in a preset playlist
export const updateSongInPresetPlaylist = async (
  playlistId: string,
  songId: string,
  songData: Partial<Omit<PresetSong, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const songRef = doc(db, 'preset-playlists', playlistId, 'songs', songId);
    const youtubeId = songData.audioUrl ? extractYouTubeId(songData.audioUrl) : undefined;
    
    const updateData = {
      ...songData,
      ...(youtubeId && { youtubeId })
    };
    
    await updateDoc(songRef, updateData);
    console.log('Song updated successfully');
  } catch (error) {
    console.error('Error updating song:', error);
    throw error;
  }
};

// Upload Pop Hits playlist data
export const uploadPopHitsPlaylist = async (): Promise<string> => {
  try {
    // Create the Pop Hits playlist
    const playlistData = {
      name: "Pop Hits",
      description: "The biggest pop hits of all time",
      genre: "Pop",
      coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      isPreset: true
    };

    const playlistId = await createPresetPlaylist(playlistData);

    // Pop Hits songs with YouTube URLs
    const popHitsSongs = [
      {
        title: "Blinding Lights",
        artist: "The Weeknd",
        audioUrl: "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
        duration: 200,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Shape of You",
        artist: "Ed Sheeran",
        audioUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
        duration: 233,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Uptown Funk",
        artist: "Mark Ronson ft. Bruno Mars",
        audioUrl: "https://www.youtube.com/watch?v=OPf0YbXqDm0",
        duration: 270,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Levitating",
        artist: "Dua Lipa (feat. DaBaby)",
        audioUrl: "https://www.youtube.com/watch?v=TUVcZfQe-Kw",
        duration: 203,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "As It Was",
        artist: "Harry Styles",
        audioUrl: "https://www.youtube.com/watch?v=H5v3kku4y6Q",
        duration: 167,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Bad Guy",
        artist: "Billie Eilish",
        audioUrl: "https://www.youtube.com/watch?v=DyDfgMOUjCI",
        duration: 194,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Don't Start Now",
        artist: "Dua Lipa",
        audioUrl: "https://www.youtube.com/watch?v=oygrmJFKYZY",
        duration: 183,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Señorita",
        artist: "Shawn Mendes & Camila Cabello",
        audioUrl: "https://www.youtube.com/watch?v=Pkh8UtuejGw",
        duration: 191,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Stay",
        artist: "The Kid LAROI & Justin Bieber",
        audioUrl: "https://www.youtube.com/watch?v=fHI8X4OXluQ",
        duration: 141,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Watermelon Sugar",
        artist: "Harry Styles",
        audioUrl: "https://www.youtube.com/watch?v=E07s5ZYygMg",
        duration: 174,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Sorry",
        artist: "Justin Bieber",
        audioUrl: "https://www.youtube.com/watch?v=fRh_vgS2dFE",
        duration: 200,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Someone You Loved",
        artist: "Lewis Capaldi",
        audioUrl: "https://www.youtube.com/watch?v=zABLecsR5UE",
        duration: 182,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Havana",
        artist: "Camila Cabello ft. Young Thug",
        audioUrl: "https://www.youtube.com/watch?v=HCjNJDNzw8Y",
        duration: 217,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Shallow",
        artist: "Lady Gaga & Bradley Cooper",
        audioUrl: "https://www.youtube.com/watch?v=bo_efYhYU2A",
        duration: 215,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      },
      {
        title: "Old Town Road",
        artist: "Lil Nas X ft. Billy Ray Cyrus",
        audioUrl: "https://www.youtube.com/watch?v=r7qovpFAGrQ",
        duration: 157,
        albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop"
      }
    ];

    // Add all songs to the playlist
    console.log('Adding songs to Pop Hits playlist...');
    for (const song of popHitsSongs) {
      await addSongToPresetPlaylist(playlistId, song);
      console.log(`Added: ${song.title} by ${song.artist}`);
    }

    console.log('Pop Hits playlist uploaded successfully!');
    return playlistId;
  } catch (error) {
    console.error('Error uploading Pop Hits playlist:', error);
    throw error;
  }
};

// Upload Rap Essentials playlist data
export const uploadRapEssentialsPlaylist = async (): Promise<string> => {
  try {
    // Create the Rap Essentials playlist
    const playlistData = {
      name: "Rap Essentials",
      description: "Essential hip hop tracks that define the genre",
      genre: "Hip Hop",
      coverImageUrl: "https://images.unsplash.com/photo-1577648735394-9c41449a1f6f?w=300&h=300&fit=crop&auto=format&q=80",
      isPreset: true
    };

    const playlistId = await createPresetPlaylist(playlistData);

    // Rap Essentials songs with YouTube URLs - using consistent hip-hop image
    const hipHopImageUrl = "https://images.unsplash.com/photo-1577648735394-9c41449a1f6f?w=200&h=200&fit=crop&auto=format&q=80";
    
    const rapEssentialsSongs = [
      {
        title: "Lose Yourself",
        artist: "Eminem",
        audioUrl: "https://www.youtube.com/watch?v=_Yhyp-_hX2s",
        duration: 326,
        albumArt: hipHopImageUrl
      },
      {
        title: "SICKO MODE",
        artist: "Travis Scott ft. Drake",
        audioUrl: "https://www.youtube.com/watch?v=6ONRf7h3Mdk",
        duration: 312,
        albumArt: hipHopImageUrl
      },
      {
        title: "God's Plan",
        artist: "Drake",
        audioUrl: "https://www.youtube.com/watch?v=FrsOnNxIrg8",
        duration: 198,
        albumArt: hipHopImageUrl
      },
      {
        title: "HUMBLE.",
        artist: "Kendrick Lamar",
        audioUrl: "https://www.youtube.com/watch?v=tvTRZJ-4EyI",
        duration: 177,
        albumArt: hipHopImageUrl
      },
      {
        title: "In Da Club",
        artist: "50 Cent",
        audioUrl: "https://www.youtube.com/watch?v=5qm8PH4xAss",
        duration: 213,
        albumArt: hipHopImageUrl
      },
      {
        title: "Mask Off",
        artist: "Future",
        audioUrl: "https://www.youtube.com/watch?v=xvZqHgFz51I",
        duration: 204,
        albumArt: hipHopImageUrl
      },
      {
        title: "Mo Bamba",
        artist: "Sheck Wes",
        audioUrl: "https://www.youtube.com/watch?v=VWoIpDVkOH0",
        duration: 183,
        albumArt: hipHopImageUrl
      },
      {
        title: "No Role Modelz",
        artist: "J. Cole",
        audioUrl: "https://www.youtube.com/watch?v=8HBcV0MtAQg",
        duration: 293,
        albumArt: hipHopImageUrl
      },
      {
        title: "Stronger",
        artist: "Kanye West",
        audioUrl: "https://www.youtube.com/watch?v=PsO6ZnUZI0g",
        duration: 311,
        albumArt: hipHopImageUrl
      },
      {
        title: "Goosebumps",
        artist: "Travis Scott ft. Kendrick Lamar",
        audioUrl: "https://www.youtube.com/watch?v=9mahKFNuHqM",
        duration: 244,
        albumArt: hipHopImageUrl
      },
      {
        title: "Money Trees",
        artist: "Kendrick Lamar ft. Jay Rock",
        audioUrl: "https://www.youtube.com/watch?v=hwR_1EP18eo",
        duration: 386,
        albumArt: hipHopImageUrl
      },
      {
        title: "Hotline Bling",
        artist: "Drake",
        audioUrl: "https://www.youtube.com/watch?v=uxpDa-c-4Mc",
        duration: 267,
        albumArt: hipHopImageUrl
      },
      {
        title: "Alright",
        artist: "Kendrick Lamar",
        audioUrl: "https://www.youtube.com/watch?v=Z-48u_uWMHY",
        duration: 219,
        albumArt: hipHopImageUrl
      },
      {
        title: "Congratulations",
        artist: "Post Malone ft. Quavo",
        audioUrl: "https://www.youtube.com/watch?v=FFhGqNa-Waw",
        duration: 220,
        albumArt: hipHopImageUrl
      },
      {
        title: "20 Min",
        artist: "Lil Uzi Vert",
        audioUrl: "https://www.youtube.com/watch?v=GosY_33lAkA",
        duration: 220,
        albumArt: hipHopImageUrl
      }
    ];

    // Add all songs to the playlist
    console.log('Adding songs to Rap Essentials playlist...');
    for (const song of rapEssentialsSongs) {
      await addSongToPresetPlaylist(playlistId, song);
      console.log(`Added: ${song.title} by ${song.artist}`);
    }

    console.log('Rap Essentials playlist uploaded successfully!');
    return playlistId;
  } catch (error) {
    console.error('Error uploading Rap Essentials playlist:', error);
    throw error;
  }
};

// Upload 90s Essentials playlist data
export const upload90sEssentialsPlaylist = async (): Promise<string> => {
  try {
    // Create the 90s Essentials playlist
    const playlistData = {
      name: "90s Essentials",
      description: "The most essential hits from the 1990s",
      genre: "90s",
      coverImageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop&auto=format&q=80",
      isPreset: true
    };

    const playlistId = await createPresetPlaylist(playlistData);

    // 90s Essentials songs with YouTube URLs - using consistent cassette tape image
    const cassetteImageUrl = "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop&auto=format&q=80";
    
    const nineties90sSongs = [
      {
        title: "Wannabe",
        artist: "Spice Girls",
        audioUrl: "https://www.youtube.com/watch?v=tTZDHlnTgR0",
        duration: 173,
        albumArt: cassetteImageUrl
      },
      {
        title: "No Scrubs",
        artist: "TLC",
        audioUrl: "https://www.youtube.com/watch?v=B4k0MhnP30s",
        duration: 214,
        albumArt: cassetteImageUrl
      },
      {
        title: "Baby One More Time",
        artist: "Britney Spears",
        audioUrl: "https://www.youtube.com/watch?v=fEfvTTJNeAY",
        duration: 211,
        albumArt: cassetteImageUrl
      },
      {
        title: "I Want It That Way",
        artist: "Backstreet Boys",
        audioUrl: "https://www.youtube.com/watch?v=qjlVAsvQLM8",
        duration: 211,
        albumArt: cassetteImageUrl
      },
      {
        title: "My Heart Will Go On",
        artist: "Celine Dion",
        audioUrl: "https://www.youtube.com/watch?v=mNsm2P0l_7Y",
        duration: 279,
        albumArt: cassetteImageUrl
      },
      {
        title: "Genie in a Bottle",
        artist: "Christina Aguilera",
        audioUrl: "https://www.youtube.com/watch?v=k6H5v9iMQhQ",
        duration: 217,
        albumArt: cassetteImageUrl
      },
      {
        title: "I Will Always Love You",
        artist: "Whitney Houston",
        audioUrl: "https://www.youtube.com/watch?v=T9Ybsvw_0p4",
        duration: 264,
        albumArt: cassetteImageUrl
      },
      {
        title: "Macarena",
        artist: "Los del Río",
        audioUrl: "https://www.youtube.com/watch?v=zWaymcVmJ-A",
        duration: 224,
        albumArt: cassetteImageUrl
      },
      {
        title: "Everybody (Backstreet's Back)",
        artist: "Backstreet Boys",
        audioUrl: "https://www.youtube.com/watch?v=4iWm-mUToDg",
        duration: 228,
        albumArt: cassetteImageUrl
      },
      {
        title: "Say My Name",
        artist: "Destiny's Child",
        audioUrl: "https://www.youtube.com/watch?v=JguQIUGoE3E",
        duration: 267,
        albumArt: cassetteImageUrl
      },
      {
        title: "Vogue",
        artist: "Madonna",
        audioUrl: "https://www.youtube.com/watch?v=ydFYm-oomec",
        duration: 318,
        albumArt: cassetteImageUrl
      },
      {
        title: "Baby I Love Your Way",
        artist: "Big Mountain",
        audioUrl: "https://www.youtube.com/watch?v=Kbsi0tsLJUg",
        duration: 263,
        albumArt: cassetteImageUrl
      },
      {
        title: "Believe",
        artist: "Cher",
        audioUrl: "https://www.youtube.com/watch?v=n7wvAEDOxAs",
        duration: 240,
        albumArt: cassetteImageUrl
      },
      {
        title: "Tearin' Up My Heart",
        artist: "*NSYNC",
        audioUrl: "https://www.youtube.com/watch?v=N_Lbhv0xUY4",
        duration: 207,
        albumArt: cassetteImageUrl
      },
      {
        title: "If You Had My Love",
        artist: "Jennifer Lopez",
        audioUrl: "https://www.youtube.com/watch?v=tT5g7I-Itc8",
        duration: 266,
        albumArt: cassetteImageUrl
      }
    ];

    // Add all songs to the playlist
    console.log('Adding songs to 90s Essentials playlist...');
    for (const song of nineties90sSongs) {
      await addSongToPresetPlaylist(playlistId, song);
      console.log(`Added: ${song.title} by ${song.artist}`);
    }

    console.log('90s Essentials playlist uploaded successfully!');
    return playlistId;
  } catch (error) {
    console.error('Error uploading 90s Essentials playlist:', error);
    throw error;
  }
};

// Upload 2000s Essentials playlist data
export const upload2000sEssentialsPlaylist = async (): Promise<string> => {
  try {
    // Create the 2000s Essentials playlist
    const playlistData = {
      name: "2000s Essentials",
      description: "The defining hits of the new millennium",
      genre: "2000s",
      coverImageUrl: "/images/playlists/2000s.PNG", // Your custom image
      isPreset: true
    };

    const playlistId = await createPresetPlaylist(playlistData);

    // 2000s Essentials songs with YouTube URLs - using your custom image
    const cdImageUrl = "/images/playlists/2000s.PNG"; // Your custom image
    
    const early2000sSongs = [
      {
        title: "Hey Ya!",
        artist: "OutKast",
        audioUrl: "https://www.youtube.com/watch?v=PWgvGjAhvIw",
        duration: 235,
        albumArt: cdImageUrl
      },
      {
        title: "Crazy in Love",
        artist: "Beyoncé ft. Jay-Z",
        audioUrl: "https://www.youtube.com/watch?v=ViwtNLUqkMY",
        duration: 236,
        albumArt: cdImageUrl
      },
      {
        title: "Hot in Herre",
        artist: "Nelly",
        audioUrl: "https://www.youtube.com/watch?v=GeZZr_p6vB8",
        duration: 228,
        albumArt: cdImageUrl
      },
      {
        title: "Since U Been Gone",
        artist: "Kelly Clarkson",
        audioUrl: "https://www.youtube.com/watch?v=RCcHO3lQ6xc",
        duration: 207,
        albumArt: cdImageUrl
      },
      {
        title: "Yeah!",
        artist: "Usher ft. Lil Jon, Ludacris",
        audioUrl: "https://www.youtube.com/watch?v=GxBSyx85Kp8",
        duration: 250,
        albumArt: cdImageUrl
      },
      {
        title: "Poker Face",
        artist: "Lady Gaga",
        audioUrl: "https://www.youtube.com/watch?v=bESGLojNYSo",
        duration: 237,
        albumArt: cdImageUrl
      },
      {
        title: "Drop It Like It's Hot",
        artist: "Snoop Dogg ft. Pharrell",
        audioUrl: "https://www.youtube.com/watch?v=K5F-aGDIYaM",
        duration: 267,
        albumArt: cdImageUrl
      },
      {
        title: "Beautiful Day",
        artist: "U2",
        audioUrl: "https://www.youtube.com/watch?v=co6WMzDOh1o",
        duration: 248,
        albumArt: cdImageUrl
      },
      {
        title: "Viva La Vida",
        artist: "Coldplay",
        audioUrl: "https://www.youtube.com/watch?v=dvgZkm1xWPE",
        duration: 242,
        albumArt: cdImageUrl
      },
      {
        title: "Beautiful Girls",
        artist: "Sean Kingston",
        audioUrl: "https://www.youtube.com/watch?v=fNVE8-4TIz0",
        duration: 189,
        albumArt: cdImageUrl
      },
      {
        title: "Cruise",
        artist: "Florida Georgia Line",
        audioUrl: "https://www.youtube.com/watch?v=7aG4fNURQ1Q",
        duration: 200,
        albumArt: cdImageUrl
      },
      {
        title: "Toxic",
        artist: "Britney Spears",
        audioUrl: "https://www.youtube.com/watch?v=LOZuxwVk7TU",
        duration: 198,
        albumArt: cdImageUrl
      },
      {
        title: "Hot N Cold",
        artist: "Katy Perry",
        audioUrl: "https://www.youtube.com/watch?v=kTHNpusq654",
        duration: 220,
        albumArt: cdImageUrl
      },
      {
        title: "I Gotta Feeling",
        artist: "The Black Eyed Peas",
        audioUrl: "https://www.youtube.com/watch?v=uSD4vsh1zDA",
        duration: 289,
        albumArt: cdImageUrl
      },
      {
        title: "Hollaback Girl",
        artist: "Gwen Stefani",
        audioUrl: "https://www.youtube.com/watch?v=Kgjkth6BRRY",
        duration: 199,
        albumArt: cdImageUrl
      }
    ];

    // Add all songs to the playlist
    console.log('Adding songs to 2000s Essentials playlist...');
    for (const song of early2000sSongs) {
      await addSongToPresetPlaylist(playlistId, song);
      console.log(`Added: ${song.title} by ${song.artist}`);
    }

    console.log('2000s Essentials playlist uploaded successfully!');
    return playlistId;
  } catch (error) {
    console.error('Error uploading 2000s Essentials playlist:', error);
    throw error;
  }
};

// Upload Disney Essentials playlist data
export const uploadDisneyEssentialsPlaylist = async (): Promise<string> => {
  try {
    // Create the Disney Essentials playlist
    const playlistData = {
      name: "Disney Essentials",
      description: "The most beloved Disney songs of all time",
      genre: "Disney",
      coverImageUrl: "/images/playlists/disney.PNG", // Your custom Disney image
      isPreset: true
    };

    const playlistId = await createPresetPlaylist(playlistData);

    // Disney Essentials songs - audioUrl to be filled in later
    const disneyImageUrl = "/images/playlists/disney.PNG"; // Your custom Disney image
    
    const disneySongs = [
      {
        title: "Let It Go",
        artist: "Idina Menzel (Frozen)",
        audioUrl: "https://www.youtube.com/watch?v=FnpJBkAMk44",
        duration: 231,
        albumArt: disneyImageUrl
      },
      {
        title: "Under the Sea",
        artist: "Samuel E. Wright (The Little Mermaid)",
        audioUrl: "https://www.youtube.com/watch?v=ChNJ_FMtSnk", 
        duration: 195,
        albumArt: disneyImageUrl
      },
      {
        title: "Circle of Life",
        artist: "Carmen Twillie & Lebo M. (The Lion King)",
        audioUrl: "https://www.youtube.com/watch?v=CF-c1K3WWg4", 
        duration: 238,
        albumArt: disneyImageUrl
      },
      {
        title: "Hakuna Matata",
        artist: "Nathan Lane & Ernie Sabella (The Lion King)",
        audioUrl: "https://www.youtube.com/watch?v=yUioIn8rPPM", // To be filled in
        duration: 255,
        albumArt: disneyImageUrl
      },
      {
        title: "Part of Your World",
        artist: "Jodi Benson (The Little Mermaid)",
        audioUrl: "https://www.youtube.com/watch?v=ZYcV5oXlccc", 
        duration: 211,
        albumArt: disneyImageUrl
      },
      {
        title: "You've Got a Friend in Me",
        artist: "Randy Newman (Toy Story)",
        audioUrl: "https://www.youtube.com/watch?v=0hG-2tQtdlE", 
        duration: 125,
        albumArt: disneyImageUrl
      },
      {
        title: "A Whole New World",
        artist: "Lea Salonga & Brad Kane (Aladdin)",
        audioUrl: "https://www.youtube.com/watch?v=xYjFxFFdyyk",
        duration: 160,
        albumArt: disneyImageUrl
      },
      {
        title: "Beauty and the Beast",
        artist: "Angela Lansbury (Beauty and the Beast)",
        audioUrl: "https://www.youtube.com/watch?v=90b2R6yzIzE", 
        duration: 162,
        albumArt: disneyImageUrl
      },
      {
        title: "If I Didn't Have You",
        artist: "Billy Crystal & John Goodman (Monsters, Inc.)",
        audioUrl: "https://www.youtube.com/watch?v=41ill-Bq5UI", 
        duration: 218,
        albumArt: disneyImageUrl
      },
      {
        title: "I'll Make a Man Out of You",
        artist: "Donny Osmond (Mulan)",
        audioUrl: "https://www.youtube.com/watch?v=elBKil5zE2g", 
        duration: 201,
        albumArt: disneyImageUrl
      },
      {
        title: "I've Got a Dream",
        artist: "Mandy Moore & Zachary Levi (Tangled)",
        audioUrl: "https://www.youtube.com/watch?v=oU8mgUn204A", 
        duration: 189,
        albumArt: disneyImageUrl
      },
      {
        title: "When You Wish Upon a Star",
        artist: "Cliff Edwards (Pinocchio)",
        audioUrl: "https://www.youtube.com/watch?v=wEWowjC2dSk", 
        duration: 193,
        albumArt: disneyImageUrl
      },
      {
        title: "Bare Necessities",
        artist: "Phil Harris & Bruce Reitherman (The Jungle Book)",
        audioUrl: "https://www.youtube.com/watch?v=6BH-Rxd-NBo", 
        duration: 174,
        albumArt: disneyImageUrl
      },
      {
        title: "How Far I'll Go",
        artist: "Auli'i Cravalho (Moana)",
        audioUrl: "https://www.youtube.com/watch?v=cPAbx5kgCJo", 
        duration: 155,
        albumArt: disneyImageUrl
      },
      {
        title: "I See the Light",
        artist: "Mandy Moore & Zachary Levi (Tangled)",
        audioUrl: "https://www.youtube.com/watch?v=chDDxukoT1M", 
        duration: 220,
        albumArt: disneyImageUrl
      }
    ];

    // Add all songs to the playlist
    console.log('Adding songs to Disney Essentials playlist...');
    for (const song of disneySongs) {
      await addSongToPresetPlaylist(playlistId, song);
      console.log(`Added: ${song.title} by ${song.artist}`);
    }

    console.log('Disney Essentials playlist uploaded successfully!');
    return playlistId;
  } catch (error) {
    console.error('Error uploading Disney Essentials playlist:', error);
    throw error;
  }
};

// Upload Country Essentials playlist data
export const uploadCountryEssentialsPlaylist = async (): Promise<string> => {
  try {
    // Create the Country Essentials playlist
    const playlistData = {
      name: "Country Essentials",
      description: "The biggest country hits that define the genre",
      genre: "Country",
      coverImageUrl: "/images/playlists/country.png", // Your custom Country image
      isPreset: true
    };

    const playlistId = await createPresetPlaylist(playlistData);

    // Country Essentials songs - audioUrl to be filled in later
    const countryImageUrl = "/images/playlists/country.png"; // Your custom Country image
    
    const countrySongs = [
      {
        title: "Last Night",
        artist: "Morgan Wallen",
        audioUrl: "https://www.youtube.com/watch?v=TBkpoTbJAsI", 
        duration: 163,
        albumArt: countryImageUrl
      },
      {
        title: "Old Town Road",
        artist: "Lil Nas X ft. Billy Ray Cyrus",
        audioUrl: "https://www.youtube.com/watch?v=r7qovpFAGrQ",
        duration: 157,
        albumArt: countryImageUrl
      },
      {
        title: "Body Like a Back Road",
        artist: "Sam Hunt",
        audioUrl: "https://www.youtube.com/watch?v=Mdh2p03cRfw", 
        duration: 165,
        albumArt: countryImageUrl
      },
      {
        title: "Cruise",
        artist: "Florida Georgia Line",
        audioUrl: "https://www.youtube.com/watch?v=7aG4fNURQ1Q",
        duration: 200,
        albumArt: countryImageUrl
      },
      {
        title: "10,000 Hours",
        artist: "Dan + Shay & Justin Bieber",
        audioUrl: "https://www.youtube.com/watch?v=3GOYaIIeT28", 
        duration: 168,
        albumArt: countryImageUrl
      },
      {
        title: "I Hope",
        artist: "Gabby Barrett",
        audioUrl: "https://www.youtube.com/watch?v=mlPfN4heqBo", 
        duration: 213,
        albumArt: countryImageUrl
      },
      {
        title: "Meant to Be",
        artist: "Bebe Rexha & Florida Georgia Line",
        audioUrl: "https://www.youtube.com/watch?v=UZR4-9CCc-k", // To be filled in
        duration: 164,
        albumArt: countryImageUrl
      },
      {
        title: "You Proof",
        artist: "Morgan Wallen",
        audioUrl: "https://www.youtube.com/watch?v=oSBh6a0QJg8", 
        duration: 157,
        albumArt: countryImageUrl
      },
      {
        title: "Fancy Like",
        artist: "Walker Hayes",
        audioUrl: "https://www.youtube.com/watch?v=SVFA5iBqMes", // To be filled in
        duration: 163,
        albumArt: countryImageUrl
      },
      {
        title: "Wasted on You",
        artist: "Morgan Wallen",
        audioUrl: "https://www.youtube.com/watch?v=KE35_SlTdn4", 
        duration: 178,
        albumArt: countryImageUrl
      },
      {
        title: "Forever After All",
        artist: "Luke Combs",
        audioUrl: "https://www.youtube.com/watch?v=fmbLCMGtEQc", 
        duration: 235,
        albumArt: countryImageUrl
      },
      {
        title: "I Don't Want This Night to End",
        artist: "Luke Bryan",
        audioUrl: "https://www.youtube.com/watch?v=9ELldmxM_58", 
        duration: 220,
        albumArt: countryImageUrl
      },
      {
        title: "Dirt Road Anthem",
        artist: "Jason Aldean",
        audioUrl: "https://www.youtube.com/watch?v=dPkzzAeUQ7s", 
        duration: 231,
        albumArt: countryImageUrl
      },
      {
        title: "Tennessee Whiskey",
        artist: "Chris Stapleton",
        audioUrl: "https://www.youtube.com/watch?v=4zAThXFOy2c", 
        duration: 293,
        albumArt: countryImageUrl
      },
      {
        title: "Need You Now",
        artist: "Lady A",
        audioUrl: "https://www.youtube.com/watch?v=fbq7ZM0du-c", 
        duration: 273,
        albumArt: countryImageUrl
      }
    ];

    // Add all songs to the playlist
    console.log('Adding songs to Country Essentials playlist...');
    for (const song of countrySongs) {
      await addSongToPresetPlaylist(playlistId, song);
      console.log(`Added: ${song.title} by ${song.artist}`);
    }

    console.log('Country Essentials playlist uploaded successfully!');
    return playlistId;
  } catch (error) {
    console.error('Error uploading Country Essentials playlist:', error);
    throw error;
  }
};

// Upload all preset playlists (can be expanded later)
export const uploadAllPresetPlaylists = async (): Promise<void> => {
  try {
    console.log('Starting to upload preset playlists...');
    
    // Upload Pop Hits
    await uploadPopHitsPlaylist();
    
    // Upload Rap Essentials
    await uploadRapEssentialsPlaylist();
    
    // Upload 90s Essentials
    await upload90sEssentialsPlaylist();
    
    // Upload 2000s Essentials
    await upload2000sEssentialsPlaylist();
    
    // Upload Disney Essentials
    await uploadDisneyEssentialsPlaylist();
    
    // Upload Country Essentials
    await uploadCountryEssentialsPlaylist();
    
    // TODO: Add other playlists here
    // await uploadRockClassicsPlaylist();
    // await upload80sThrowbacksPlaylist();
    // etc.
    
    console.log('All preset playlists uploaded successfully!');
  } catch (error) {
    console.error('Error uploading preset playlists:', error);
    throw error;
  }
}; 