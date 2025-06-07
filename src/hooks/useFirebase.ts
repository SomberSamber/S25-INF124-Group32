import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage, Playlist, Song, GameSession } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

// Hook for managing playlists
export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchPlaylists = async () => {
    if (!currentUser) {
      setPlaylists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const playlistsRef = collection(db, 'playlists');
      
      // Get both user's playlists and preset playlists
      const userPlaylistsQuery = query(
        playlistsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const presetPlaylistsQuery = query(
        playlistsRef,
        where('isPreset', '==', true),
        orderBy('createdAt', 'desc')
      );

      const [userPlaylistsSnapshot, presetPlaylistsSnapshot] = await Promise.all([
        getDocs(userPlaylistsQuery),
        getDocs(presetPlaylistsQuery)
      ]);

      const userPlaylists = userPlaylistsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];

      const presetPlaylists = presetPlaylistsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];

      setPlaylists([...userPlaylists, ...presetPlaylists]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (playlistData: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return { data: null, error: 'User not authenticated' };

    try {
      const newPlaylist = {
        ...playlistData,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'playlists'), newPlaylist);
      const createdPlaylist = { id: docRef.id, ...newPlaylist } as Playlist;
      
      setPlaylists(prev => [createdPlaylist, ...prev]);
      return { data: createdPlaylist, error: null };
    } catch (err: any) {
      console.error('Error creating playlist:', err);
      return { data: null, error: err.message };
    }
  };

  const updatePlaylist = async (playlistId: string, updates: Partial<Playlist>) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        ...updates,
        updatedAt: new Date()
      });

      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, ...updates, updatedAt: new Date() }
          : playlist
      ));
      return { error: null };
    } catch (err: any) {
      console.error('Error updating playlist:', err);
      return { error: err.message };
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
      setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting playlist:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPlaylists();
    }
  }, [currentUser]);

  return {
    playlists,
    loading,
    error,
    fetchPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist
  };
};

// Hook for managing songs in a playlist
export const useSongs = (playlistId: string | null) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = async () => {
    if (!playlistId) {
      setSongs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const songsQuery = query(
        collection(db, 'songs'),
        where('playlistId', '==', playlistId),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(songsQuery);
      const fetchedSongs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Song[];

      setSongs(fetchedSongs);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSong = async (songData: Omit<Song, 'id' | 'createdAt'>) => {
    try {
      const newSong = {
        ...songData,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'songs'), newSong);
      const createdSong = { id: docRef.id, ...newSong } as Song;
      
      setSongs(prev => [...prev, createdSong]);
      return { data: createdSong, error: null };
    } catch (err: any) {
      console.error('Error adding song:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteSong = async (songId: string) => {
    try {
      await deleteDoc(doc(db, 'songs', songId));
      setSongs(prev => prev.filter(song => song.id !== songId));
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting song:', err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [playlistId]);

  return {
    songs,
    loading,
    error,
    fetchSongs,
    addSong,
    deleteSong
  };
};

// Hook for managing game sessions
export const useGameSessions = () => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchSessions = async () => {
    if (!currentUser) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessionsQuery = query(
        collection(db, 'gameSessions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(sessionsQuery);
      const fetchedSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GameSession[];

      setSessions(fetchedSessions);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching game sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveGameSession = async (sessionData: Omit<GameSession, 'id' | 'createdAt'>) => {
    if (!currentUser) return { data: null, error: 'User not authenticated' };

    try {
      const newSession = {
        ...sessionData,
        userId: currentUser.uid,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'gameSessions'), newSession);
      const createdSession = { id: docRef.id, ...newSession } as GameSession;
      
      setSessions(prev => [createdSession, ...prev]);
      return { data: createdSession, error: null };
    } catch (err: any) {
      console.error('Error saving game session:', err);
      return { data: null, error: err.message };
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    }
  }, [currentUser]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    saveGameSession
  };
};

// Hook for file uploads (audio files)
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const uploadAudioFile = async (file: File, fileName: string) => {
    if (!currentUser) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      setUploading(true);
      setError(null);

      // Create a reference to the file location
      const storageRef = ref(storage, `audio/${currentUser.uid}/${fileName}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { 
        data: { 
          url: downloadURL, 
          path: snapshot.ref.fullPath,
          name: fileName 
        }, 
        error: null 
      };
    } catch (err: any) {
      setError(err.message);
      console.error('Error uploading file:', err);
      return { data: null, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  const deleteAudioFile = async (filePath: string) => {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting file:', err);
      return { error: err.message };
    }
  };

  return {
    uploading,
    error,
    uploadAudioFile,
    deleteAudioFile
  };
}; 