import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPresetPlaylists, PresetPlaylist } from '../../lib/presetPlaylists';
import { getUserPlaylists, UserPlaylist } from '../../lib/userPlaylists';

const Solo: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [duration, setDuration] = useState<30 | 60>(30);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedPlaylistType, setSelectedPlaylistType] = useState<'preset' | 'user' | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  
  // Playlist data from Firebase
  const [presetPlaylists, setPresetPlaylists] = useState<PresetPlaylist[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  // Load preset playlists from Firebase
  useEffect(() => {
    const loadPresetPlaylists = async () => {
      try {
        setLoading(true);
        const fetchedPlaylists = await getPresetPlaylists();
        setPresetPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Error loading preset playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPresetPlaylists();
  }, []);

  // Load user playlists from Firebase
  useEffect(() => {
    const loadUserPlaylists = async () => {
      if (!currentUser) {
        setUserPlaylists([]);
        setUserLoading(false);
        return;
      }

      try {
        setUserLoading(true);
        const fetchedUserPlaylists = await getUserPlaylists(currentUser.uid);
        setUserPlaylists(fetchedUserPlaylists);
      } catch (error) {
        console.error('Error loading user playlists:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUserPlaylists();
  }, [currentUser]);

  // Handle starting the game
  const handleStartGame = () => {
    if (selectedPlaylist === null) {
      setPlaylistError('Please select a playlist before starting the game');
      // Scroll to the playlist selection section
      const playlistSection = document.getElementById('playlist-selection');
      if (playlistSection) {
        playlistSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
    // Clear any previous errors
    setPlaylistError(null);
    
    // Find the selected playlist name
    let playlistName = '';
    if (selectedPlaylistType === 'preset') {
      const playlist = presetPlaylists.find(p => p.id === selectedPlaylist);
      playlistName = playlist?.name || 'Unknown Playlist';
    } else if (selectedPlaylistType === 'user') {
      const playlist = userPlaylists.find(p => p.id === selectedPlaylist);
      playlistName = playlist?.name || 'Unknown Playlist';
    }
    
    // Navigate to game play page with parameters
    navigate('/game/play', { 
      state: { 
        mode: 'solo',
        duration,
        playlistId: selectedPlaylist,
        playlistName,
        playlistType: selectedPlaylistType
      } 
    });
  };

  // Show instructions modal
  const showInstructions = () => {
    setIsInstructionsOpen(true);
  };

  // Close instructions modal
  const closeInstructions = () => {
    setIsInstructionsOpen(false);
  };

  // Handle playlist selection change
  const handlePlaylistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedPlaylist(null);
      setSelectedPlaylistType(null);
    } else {
      const [type, id] = value.split(':');
      setSelectedPlaylist(id);
      setSelectedPlaylistType(type as 'preset' | 'user');
    }
    // Clear error when user selects a playlist
    setPlaylistError(null);
  };

  // Handle viewing leaderboard for preset playlists
  const handleViewLeaderboard = () => {
    if (selectedPlaylist && selectedPlaylistType === 'preset') {
      // TODO: Navigate to leaderboard page for this playlist
      console.log('View leaderboard for playlist:', selectedPlaylist);
      alert('Leaderboard feature coming soon!');
    }
  };

  // Get selected playlist details for preview
  const getSelectedPlaylistDetails = () => {
    if (!selectedPlaylist || !selectedPlaylistType) return null;

    if (selectedPlaylistType === 'preset') {
      return presetPlaylists.find(p => p.id === selectedPlaylist);
    } else if (selectedPlaylistType === 'user') {
      return userPlaylists.find(p => p.id === selectedPlaylist);
    }
    return null;
  };

  const selectedPlaylistDetails = getSelectedPlaylistDetails();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header navigation */}
      <header className="relative z-10 w-full flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center">
          <Link to="/home">
            <div className="text-purple-400 font-bold text-2xl">
              MusikMatch
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/home" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/library" className="text-gray-300 hover:text-white">Library</Link>
          <Link to="/settings" className="text-gray-300 hover:text-white">Settings</Link>
          <Link to="/" className="text-gray-300 hover:text-white">Logout</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Solo Mode
          </h1>
          <p className="text-gray-400">Test your music knowledge against the clock!</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          {/* Game Duration Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Game Duration</h2>
            <div className="flex justify-center space-x-6">
              <button 
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${duration === 30 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setDuration(30)}
              >
                30 Seconds
              </button>
              <button 
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${duration === 60 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setDuration(60)}
              >
                60 Seconds
              </button>
            </div>
          </div>

          {/* Playlist Selection - Dropdown */}
          <div id="playlist-selection" className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Select Playlist</h2>
            <div className="max-w-md mx-auto">
              <div className={`relative ${playlistError ? 'mb-2' : ''}`}>
                <select
                  className={`block appearance-none w-full bg-gray-700 border text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-600 ${
                    playlistError ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-purple-500'
                  }`}
                  value={selectedPlaylist && selectedPlaylistType ? `${selectedPlaylistType}:${selectedPlaylist}` : ''}
                  onChange={handlePlaylistChange}
                  aria-invalid={playlistError ? 'true' : 'false'}
                  disabled={loading && userLoading}
                >
                  <option value="" disabled>
                    {loading || userLoading ? 'Loading playlists...' : 'Choose a playlist'}
                  </option>
                  
                  {/* Preset Playlists */}
                  {presetPlaylists.length > 0 && (
                    <optgroup label="Featured Playlists">
                      {presetPlaylists.map(playlist => (
                        <option key={`preset:${playlist.id}`} value={`preset:${playlist.id}`}>
                          {playlist.name} ({playlist.genre})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* User Playlists */}
                  {userPlaylists.length > 0 && (
                    <optgroup label="Your Imported Playlists">
                      {userPlaylists.map(playlist => (
                        <option key={`user:${playlist.id}`} value={`user:${playlist.id}`}>
                          {playlist.name} ({playlist.source})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Show message if no playlists available */}
                  {!loading && !userLoading && presetPlaylists.length === 0 && userPlaylists.length === 0 && (
                    <option value="" disabled>No playlists available</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              {/* Error message */}
              {playlistError && (
                <div className="text-red-500 text-sm flex items-center mb-4">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {playlistError}
                </div>
              )}
              
              {/* Preview of selected playlist */}
              {selectedPlaylistDetails && (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center bg-gray-700 rounded-lg p-3 w-full">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-3">
                      {selectedPlaylistDetails.coverImageUrl ? (
                        <img 
                          src={selectedPlaylistDetails.coverImageUrl} 
                          alt="Playlist Cover" 
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <img 
                          src="/assets/icons/music-note.svg" 
                          alt="Music" 
                          className="h-6 w-6 text-white opacity-75"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{selectedPlaylistDetails.name}</p>
                      <p className="text-sm text-gray-400">
                        {'genre' in selectedPlaylistDetails 
                          ? selectedPlaylistDetails.genre 
                          : `${selectedPlaylistDetails.source} Import`}
                      </p>
                    </div>
                    {/* Show leaderboard button for preset playlists */}
                    {selectedPlaylistType === 'preset' && (
                      <button
                        onClick={handleViewLeaderboard}
                        className="ml-3 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 1L3 7v10a2 2 0 002 2h10a2 2 0 002-2V7l-7-6zM8 15V9h4v6H8z" clipRule="evenodd" />
                        </svg>
                        Leaderboard
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 mt-8">
            <button
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              onClick={showInstructions}
            >
              Instructions
            </button>
            <button
              className="px-10 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          </div>
        </div>
      </main>

      {/* Instructions Modal */}
      {isInstructionsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-purple-400">How to Play</h3>
              <button 
                onClick={closeInstructions}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">Listen to the song clip played from your selected playlist.</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">Type your guess for the song title and artist.</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">The faster you guess correctly, the more points you earn!</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">Use the "Skip" button if you're stuck on a song.</p>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-700 rounded-lg p-3 text-left">
                <p className="text-indigo-300 font-medium">Beat your high score and challenge friends!</p>
              </div>
            </div>
            
            {/* Modal footer */}
            <div className="border-t border-gray-700 p-4 flex justify-center">
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                onClick={closeInstructions}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Solo; 