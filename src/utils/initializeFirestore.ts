import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Sample preset playlists data
const presetPlaylists = [
  {
    name: 'Pop Hits',
    description: 'The biggest pop songs right now',
    userId: '', // Will be empty for preset playlists
    isPreset: true,
    genre: 'Pop',
    coverImageUrl: '/assets/covers/pop.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Rock Classics',
    description: 'Timeless rock anthems',
    userId: '',
    isPreset: true,
    genre: 'Rock',
    coverImageUrl: '/assets/covers/rock.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Rap Essentials',
    description: 'Must-know rap tracks',
    userId: '',
    isPreset: true,
    genre: 'Hip Hop',
    coverImageUrl: '/assets/covers/rap.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '80s Throwbacks',
    description: 'The best of the 80s',
    userId: '',
    isPreset: true,
    genre: '80s',
    coverImageUrl: '/assets/covers/80s.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '90s Nostalgia',
    description: 'Classic 90s hits',
    userId: '',
    isPreset: true,
    genre: '90s',
    coverImageUrl: '/assets/covers/90s.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '2000s Hits',
    description: 'The sound of the 2000s',
    userId: '',
    isPreset: true,
    genre: '2000s',
    coverImageUrl: '/assets/covers/2000s.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Country Favorites',
    description: 'Top country tracks',
    userId: '',
    isPreset: true,
    genre: 'Country',
    coverImageUrl: '/assets/covers/country.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Disney Songs',
    description: 'Disney classics for all ages',
    userId: '',
    isPreset: true,
    genre: 'Disney',
    coverImageUrl: '/assets/covers/disney.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const initializePresetPlaylists = async () => {
  try {
    // Check if preset playlists already exist
    const presetQuery = query(
      collection(db, 'playlists'),
      where('isPreset', '==', true)
    );
    
    const existingPresets = await getDocs(presetQuery);
    
    if (existingPresets.empty) {
      console.log('Initializing preset playlists...');
      
      // Add each preset playlist to Firestore
      const promises = presetPlaylists.map(playlist => 
        addDoc(collection(db, 'playlists'), playlist)
      );
      
      await Promise.all(promises);
      console.log('Preset playlists initialized successfully!');
    } else {
      console.log('Preset playlists already exist, skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing preset playlists:', error);
  }
};

// Call this function when your app starts
export const initializeFirestore = async () => {
}; 