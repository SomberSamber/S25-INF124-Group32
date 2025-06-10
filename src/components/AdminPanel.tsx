import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getPresetPlaylists, 
  getPresetPlaylistSongs, 
  createPresetPlaylist, 
  addSongToPresetPlaylist,
  deleteSongFromPresetPlaylist,
  updateSongInPresetPlaylist,
  PresetPlaylist, 
  PresetSong 
} from '../lib/presetPlaylists';

// Mock user authentication - in real app this would come from Firebase Auth
const getCurrentUser = () => {
  // For demo purposes, you can change this to test different users
  return { email: 'admin@admin.com' }; // Change this to test different access levels
};

const AdminPanel: React.FC = () => {
  const [playlists, setPlaylists] = useState<PresetPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PresetPlaylist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<PresetSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);
  
  // Modal states
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [showNewSongModal, setShowNewSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<PresetSong | null>(null);
  
  // Form states
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    genre: '',
    description: '',
    coverImageUrl: ''
  });
  
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    audioUrl: ''
  });
  
  const [editSongData, setEditSongData] = useState({
    title: '',
    artist: '',
    audioUrl: ''
  });
  
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check admin authentication
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.email === 'admin@admin.com';

  // Load playlists on component mount
  useEffect(() => {
    if (isAdmin) {
      loadPlaylists();
    }
  }, [isAdmin]);

  // Load playlist songs when a playlist is selected
  useEffect(() => {
    if (selectedPlaylist) {
      loadPlaylistSongs(selectedPlaylist.id);
    }
  }, [selectedPlaylist]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const fetchedPlaylists = await getPresetPlaylists();
      setPlaylists(fetchedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
      setErrorMessage('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylistSongs = async (playlistId: string) => {
    try {
      setSongsLoading(true);
      const songs = await getPresetPlaylistSongs(playlistId);
      setPlaylistSongs(songs);
    } catch (error) {
      console.error('Error loading songs:', error);
      setErrorMessage('Failed to load playlist songs');
    } finally {
      setSongsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlaylist.name || !newPlaylist.genre) {
      setErrorMessage('Name and genre are required');
      return;
    }

    try {
      setStatusMessage('Creating playlist...');
      const playlistId = await createPresetPlaylist({
        name: newPlaylist.name,
        genre: newPlaylist.genre,
        description: newPlaylist.description,
        coverImageUrl: newPlaylist.coverImageUrl,
        isPreset: true
      });
      
      setStatusMessage('Playlist created successfully!');
      setNewPlaylist({ name: '', genre: '', description: '', coverImageUrl: '' });
      setShowNewPlaylistModal(false);
      await loadPlaylists(); // Refresh playlist list
      
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setErrorMessage('Failed to create playlist');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlaylist) {
      setErrorMessage('Please select a playlist first');
      return;
    }

    if (!newSong.title || !newSong.artist || !newSong.audioUrl) {
      setErrorMessage('Title, artist, and YouTube URL are required');
      return;
    }

    try {
      setStatusMessage('Adding song...');
      await addSongToPresetPlaylist(selectedPlaylist.id, {
        title: newSong.title,
        artist: newSong.artist,
        audioUrl: newSong.audioUrl,
        albumArt: selectedPlaylist.coverImageUrl
      });
      
      setStatusMessage('Song added successfully!');
      setNewSong({ title: '', artist: '', audioUrl: '' });
      setShowNewSongModal(false);
      await loadPlaylistSongs(selectedPlaylist.id); // Refresh songs list
      
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error adding song:', error);
      setErrorMessage('Failed to add song');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!selectedPlaylist) return;
    
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }

    try {
      setStatusMessage('Deleting song...');
      await deleteSongFromPresetPlaylist(selectedPlaylist.id, songId);
      setStatusMessage('Song deleted successfully!');
      await loadPlaylistSongs(selectedPlaylist.id); // Refresh songs list
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting song:', error);
      setErrorMessage('Failed to delete song');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEditSong = (song: PresetSong) => {
    setEditingSong(song);
    setEditSongData({
      title: song.title,
      artist: song.artist,
      audioUrl: song.audioUrl
    });
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSong || !selectedPlaylist) return;

    if (!editSongData.title || !editSongData.artist || !editSongData.audioUrl) {
      setErrorMessage('Title, artist, and YouTube URL are required');
      return;
    }

    try {
      setStatusMessage('Updating song...');
      await updateSongInPresetPlaylist(selectedPlaylist.id, editingSong.id, {
        title: editSongData.title,
        artist: editSongData.artist,
        audioUrl: editSongData.audioUrl,
        albumArt: selectedPlaylist.coverImageUrl
      });
      
      setStatusMessage('Song updated successfully!');
      setEditingSong(null);
      setEditSongData({ title: '', artist: '', audioUrl: '' });
      await loadPlaylistSongs(selectedPlaylist.id); // Refresh songs list
      
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error updating song:', error);
      setErrorMessage('Failed to update song');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">You must be an admin to access this page.</p>
          <p className="text-gray-400 mb-8">Current user: {currentUser?.email || 'Not logged in'}</p>
          <Link 
            to="/library" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/library" className="text-purple-400 font-bold text-2xl">
                MusikMatch
              </Link>
              <span className="text-gray-400">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-green-400">Admin: {currentUser.email}</span>
              <Link 
                to="/library" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Back to Library
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Playlists */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400">Preset Playlists</h2>
              <button
                onClick={() => setShowNewPlaylistModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                + New Playlist
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3">Loading playlists...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => setSelectedPlaylist(playlist)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-purple-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {playlist.coverImageUrl ? (
                          <img
                            src={playlist.coverImageUrl}
                            alt={playlist.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{playlist.name}</h3>
                        <p className="text-sm text-gray-300 truncate">{playlist.genre}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Songs */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400">
                {selectedPlaylist ? `Songs in "${selectedPlaylist.name}"` : 'Select a Playlist'}
              </h2>
              {selectedPlaylist && (
                <button
                  onClick={() => setShowNewSongModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  + Add Song
                </button>
              )}
            </div>

            {!selectedPlaylist ? (
              <div className="text-center py-8 text-gray-400">
                Select a playlist from the left to manage its songs
              </div>
            ) : songsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3">Loading songs...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {playlistSongs.map((song, index) => (
                  <div key={song.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <span className="text-gray-400 font-mono text-sm w-6 text-center inline-block">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          {song.albumArt ? (
                            <img
                              src={song.albumArt}
                              alt={song.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-600 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{song.title}</h4>
                          <p className="text-sm text-gray-300 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                        <button
                          onClick={() => handleEditSong(song)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                          title="Edit Song"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Delete Song"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <a
                          href={song.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors p-1"
                          title="Open in YouTube"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                
                {playlistSongs.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No songs in this playlist yet. Add some songs to get started!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {errorMessage}
          </div>
        )}
      </div>

      {/* New Playlist Modal */}
      {showNewPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="e.g., Rock Classics"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre *
                </label>
                <input
                  type="text"
                  value={newPlaylist.genre}
                  onChange={(e) => setNewPlaylist({...newPlaylist, genre: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="e.g., Rock, Pop, Hip Hop"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={newPlaylist.coverImageUrl}
                  onChange={(e) => setNewPlaylist({...newPlaylist, coverImageUrl: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewPlaylistModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Song Modal */}
      {showNewSongModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Add Song to "{selectedPlaylist?.name}"</h3>
            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="e.g., Bohemian Rhapsody"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="e.g., Queen"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={newSong.audioUrl}
                  onChange={(e) => setNewSong({...newSong, audioUrl: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              


              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewSongModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Add Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Song Modal */}
      {editingSong && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Edit Song: "{editingSong.title}"</h3>
            <form onSubmit={handleUpdateSong} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={editSongData.title}
                  onChange={(e) => setEditSongData({...editSongData, title: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="e.g., Bohemian Rhapsody"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  value={editSongData.artist}
                  onChange={(e) => setEditSongData({...editSongData, artist: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="e.g., Queen"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  value={editSongData.audioUrl}
                  onChange={(e) => setEditSongData({...editSongData, audioUrl: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSong(null);
                    setEditSongData({ title: '', artist: '', audioUrl: '' });
                  }}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Update Song
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 