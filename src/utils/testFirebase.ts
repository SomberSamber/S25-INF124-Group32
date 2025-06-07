import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test 1: Write to Firestore
    const testDoc = {
      message: 'Firebase connection test',
      timestamp: new Date(),
      source: 'MusikMatch App'
    };
    
    const docRef = await addDoc(collection(db, 'connectionTest'), testDoc);
    console.log('✅ Successfully wrote to Firestore with ID:', docRef.id);
    
    // Test 2: Read from Firestore
    const snapshot = await getDocs(collection(db, 'connectionTest'));
    console.log('✅ Successfully read from Firestore. Documents found:', snapshot.size);
    
    // Test 3: Check playlists collection
    const playlistsSnapshot = await getDocs(collection(db, 'playlists'));
    console.log('✅ Playlists collection exists with', playlistsSnapshot.size, 'documents');
    
    return {
      success: true,
      message: 'Firebase connection successful!',
      details: {
        canWrite: true,
        canRead: true,
        playlistsCount: playlistsSnapshot.size
      }
    };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      message: 'Firebase connection failed',
      error: error
    };
  }
}; 