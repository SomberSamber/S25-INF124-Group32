import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  playlistId: string;
  playlistName: string;
  score: number;
  duration: number; // in seconds for solo mode
  mode: 'solo' | 'multiplayer';
  createdAt: Date;
}

// Save a game score to the leaderboard
export const saveLeaderboardScore = async (
  scoreData: Omit<LeaderboardEntry, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const docRef = await addDoc(leaderboardRef, {
      ...scoreData,
      createdAt: serverTimestamp()
    });
    
    console.log('Leaderboard score saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving leaderboard score:', error);
    throw error;
  }
};

// Get leaderboard entries for a specific playlist
export const getPlaylistLeaderboard = async (
  playlistId: string,
  mode: 'solo' | 'multiplayer' = 'solo',
  limitCount: number = 10
): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      where('playlistId', '==', playlistId),
      where('mode', '==', mode),
      orderBy('score', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching playlist leaderboard:', error);
    throw error;
  }
};

// Get global leaderboard across all playlists
export const getGlobalLeaderboard = async (
  mode: 'solo' | 'multiplayer' = 'solo',
  limitCount: number = 10
): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      where('mode', '==', mode),
      orderBy('score', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
};

// Get user's best scores for a specific playlist
export const getUserPlaylistScores = async (
  userId: string,
  playlistId: string,
  mode: 'solo' | 'multiplayer' = 'solo',
  limitCount: number = 5
): Promise<LeaderboardEntry[]> => {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      where('userId', '==', userId),
      where('playlistId', '==', playlistId),
      where('mode', '==', mode),
      orderBy('score', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date()
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching user playlist scores:', error);
    throw error;
  }
};

// Get user's rank for a specific playlist
export const getUserPlaylistRank = async (
  userId: string,
  playlistId: string,
  mode: 'solo' | 'multiplayer' = 'solo'
): Promise<number> => {
  try {
    // Get user's best score for this playlist
    const userScores = await getUserPlaylistScores(userId, playlistId, mode, 1);
    if (userScores.length === 0) return -1; // User has no scores
    
    const userBestScore = userScores[0].score;
    
    // Get all scores better than user's best score
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
      leaderboardRef,
      where('playlistId', '==', playlistId),
      where('mode', '==', mode),
      where('score', '>', userBestScore)
    );
    
    const snapshot = await getDocs(q);
    
    // Rank is number of users with better scores + 1
    return snapshot.size + 1;
  } catch (error) {
    console.error('Error calculating user playlist rank:', error);
    return -1;
  }
}; 