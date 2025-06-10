import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPresetPlaylists, PresetPlaylist } from '../../lib/presetPlaylists';
import { getUserPlaylists, UserPlaylist } from '../../lib/userPlaylists';

const Multiplayer: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [rounds, setRounds] = useState<number>(3);
  const [customRounds, setCustomRounds] = useState<number>(10);
  const [isCustomRounds, setIsCustomRounds] = useState<boolean>(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedPlaylistType, setSelectedPlaylistType] = useState<'preset' | 'user' | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', keyBind: 'A', color: 'bg-blue-500' },
    { id: 2, name: 'Player 2', keyBind: 'L', color: 'bg-red-500' },
  ]);
  const customRoundsRef = useRef<HTMLInputElement>(null);
  
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
    
    // Determine final rounds count
    const finalRounds = isCustomRounds ? customRounds : rounds;
    
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
        mode: 'multiplayer',
        rounds: finalRounds,
        playlistId: selectedPlaylist,
        playlistName,
        playlistType: selectedPlaylistType,
        players
      } 
    });
  };

  // Update custom rounds value
  const handleCustomRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numbers
    if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) >= 1 && parseInt(value) <= 99)) {
      setCustomRounds(value === '' ? '' as any : parseInt(value));
    }
  };

  // Update player key binding
  const handleKeyBindChange = (playerId: number, key: string) => {
    // Only allow single character key binds
    if (key.length > 1) key = key.charAt(0).toUpperCase();
    
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, keyBind: key.toUpperCase() } : player
    ));
  };

  // Update player name
  const handlePlayerNameChange = (playerId: number, name: string) => {
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, name } : player
    ));
  };

  // Add another player (up to 4)
  const addPlayer = () => {
    if (players.length < 4) {
      const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'];
      const defaultKeys = ['A', 'L', 'J', 'Z'];
      
      setPlayers([
        ...players, 
        { 
          id: players.length + 1, 
          name: `Player ${players.length + 1}`, 
          keyBind: defaultKeys[players.length], 
          color: colors[players.length]
        }
      ]);
    }
  };

  // Remove a player
  const removePlayer = (playerId: number) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== playerId));
    }
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Multiplayer Mode
          </h1>
          <p className="text-gray-400">Compete with friends to see who knows music best!</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          {/* Round Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Number of Rounds</h2>
            <div className="flex justify-center space-x-6 mb-4">
              <button 
                className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                  !isCustomRounds && rounds === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => {
                  setRounds(3);
                  setIsCustomRounds(false);
                }}
              >
                3 Rounds
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                  !isCustomRounds && rounds === 5 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => {
                  setRounds(5);
                  setIsCustomRounds(false);
                }}
              >
                5 Rounds
              </button>
              <button 
                className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                  !isCustomRounds && rounds === 10 ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => {
                  setRounds(10);
                  setIsCustomRounds(false);
                }}
              >
                10 Rounds
              </button>
            </div>
            
            {/* Custom rounds */}
            <div className="flex justify-center items-center space-x-4">
              <button 
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isCustomRounds ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => {
                  setIsCustomRounds(true);
                  // Focus the input after state update
                  setTimeout(() => customRoundsRef.current?.focus(), 100);
                }}
              >
                Custom:
              </button>
              <input
                ref={customRoundsRef}
                type="number"
                min="1"
                max="99"
                className="w-20 bg-gray-700 text-white text-center py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={customRounds}
                onChange={handleCustomRoundsChange}
                onFocus={() => setIsCustomRounds(true)}
                placeholder="10"
              />
              <span className="text-gray-400">rounds</span>
            </div>
          </div>

          {/* Playlist Selection */}
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

          {/* Player Setup */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Player Setup</h2>
            <div className="space-y-4 mb-6">
              {players.map((player) => (
                <div key={player.id} className="bg-gray-700 rounded-lg p-4 flex items-center">
                  <div className={`w-10 h-10 ${player.color} rounded-full flex items-center justify-center font-bold text-white mr-4`}>
                    {player.id}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex-grow min-w-[180px]">
                        <label className="block text-gray-400 text-sm mb-1">Name</label>
                        <input 
                          type="text" 
                          value={player.name}
                          onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                          className="w-full bg-gray-600 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          maxLength={15}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Key Bind</label>
                        <input 
                          type="text" 
                          value={player.keyBind}
                          onChange={(e) => handleKeyBindChange(player.id, e.target.value)}
                          className="w-16 bg-gray-600 text-white text-center py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                          maxLength={1}
                        />
                      </div>
                      {players.length > 2 && (
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Remove player"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add player button */}
            {players.length < 4 && (
              <div className="flex justify-center">
                <button
                  onClick={addPlayer}
                  className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Player
                </button>
              </div>
            )}
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
                  <p className="text-gray-300">Each player uses their assigned key to buzz in when they know the answer.</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">The first player to buzz in gets a chance to answer.</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">Correct answers earn points; wrong answers give other players a chance.</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1 mr-3">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300">The player with the most points wins!</p>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-700 rounded-lg p-3 text-left">
                <p className="text-indigo-300 font-medium">Good luck and have fun competing!</p>
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

export default Multiplayer; 