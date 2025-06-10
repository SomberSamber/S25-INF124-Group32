
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPresetPlaylistSongs } from '../../lib/presetPlaylists';
import { getUserPlaylistSongs } from '../../lib/userPlaylists';

interface Player {
  id: number;
  name: string;
  keyBind: string;
  color: string;
  score?: number;
}

interface GameState {
  mode: 'solo' | 'multiplayer';
  duration?: 30 | 60;  // For solo mode
  rounds?: number;     // For multiplayer mode
  playlistId: string;  // Changed from number to string
  playlistName: string;
  playlistType: 'preset' | 'user';  // Added playlist type
  players?: Player[];  // For multiplayer mode
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration?: number;
  albumArt?: string;
}

interface GameSong extends Song {
  hasBeenPlayed: boolean;
}

const GamePlay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  
  // Song management
  const [availableSongs, setAvailableSongs] = useState<GameSong[]>([]);
  const [currentSong, setCurrentSong] = useState<GameSong | null>(null);
  const [loadingSongs, setLoadingSongs] = useState<boolean>(true);
  const [allPlaylistSongs, setAllPlaylistSongs] = useState<Song[]>([]);
  const [songsLoadedCount, setSongsLoadedCount] = useState<number>(0);
  
  // Simplified audio system
  const audioPlayerRef = useRef<HTMLIFrameElement>(null);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const hasAutoStarted = useRef<boolean>(false);
  const currentAudioUrl = useRef<string>('');
  
  // Banner system for feedback
  const [banner, setBanner] = useState<{
    show: boolean;
    type: 'correct' | 'incorrect';
    message: string;
  }>({ show: false, type: 'correct', message: '' });
  
  // Score system for solo mode
  const [correctSongs, setCorrectSongs] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [showEndScreen, setShowEndScreen] = useState<boolean>(false);
  const [songResults, setSongResults] = useState<Array<{
    song: GameSong;
    correct: boolean;
    userGuess?: string;
  }>>([]);
  
  // Autocomplete dropdown states
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Multiplayer specific states
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [buzzedPlayerId, setBuzzedPlayerId] = useState<number | null>(null);
  const [buzzOrder, setBuzzOrder] = useState<number[]>([]);
  const [canBuzzIn, setCanBuzzIn] = useState<boolean>(true);

  // Load all playlist songs (for random selection)
  const loadAllPlaylistSongs = useCallback(async (gameState: GameState) => {
    try {
      setLoadingSongs(true);
      let songs: Song[] = [];
      
      if (gameState.playlistType === 'preset') {
        const presetSongs = await getPresetPlaylistSongs(gameState.playlistId);
        // Convert PresetSong to Song interface
        songs = presetSongs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          audioUrl: song.audioUrl,
          duration: song.duration,
          albumArt: song.albumArt
        }));
      } else if (gameState.playlistType === 'user' && currentUser) {
        const userSongs = await getUserPlaylistSongs(currentUser.uid, gameState.playlistId);
        // Convert UserSong to Song interface
        songs = userSongs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          audioUrl: song.audioUrl,
          duration: song.duration,
          albumArt: song.albumArt
        }));
      }
      
      setAllPlaylistSongs(songs);
      console.log(`Found ${songs.length} total songs in playlist`);
      
      // Load first batch of random songs
      loadNextBatch(songs, []);
    } catch (error) {
      console.error('Error loading playlist songs:', error);
      alert('Failed to load playlist songs. Please try again.');
      navigate('/game/solo');
    } finally {
      setLoadingSongs(false);
    }
  }, [currentUser, navigate]);

  // Load a batch of random songs
  const loadNextBatch = useCallback((allSongs: Song[], playedSongIds: string[], batchSize: number = 5, isReset: boolean = false) => {
    const unplayedSongs = allSongs.filter(song => !playedSongIds.includes(song.id));
    
    if (unplayedSongs.length === 0 && !isReset) {
      // All songs have been played, reset
      const randomBatch = allSongs
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(batchSize, allSongs.length))
        .map(song => ({ ...song, hasBeenPlayed: false }));
      
      setAvailableSongs(randomBatch);
      setSongsLoadedCount(randomBatch.length);
      console.log('All songs played, reset and loaded', randomBatch.length, 'songs');
      return;
    }
    
    // Select random songs from unplayed (or all if reset)
    const songsToChooseFrom = isReset ? allSongs : unplayedSongs;
    const randomBatch = songsToChooseFrom
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(batchSize, songsToChooseFrom.length))
      .map(song => ({ ...song, hasBeenPlayed: false }));
    
    if (isReset) {
      setAvailableSongs(randomBatch);
      setSongsLoadedCount(randomBatch.length);
      console.log('Reset and loaded', randomBatch.length, 'songs');
    } else {
      setAvailableSongs(prev => [...prev, ...randomBatch]);
      setSongsLoadedCount(prev => prev + randomBatch.length);
      console.log('Loaded batch of', randomBatch.length, 'songs');
    }
  }, []);

  // Get random song that hasn't been played
  const getRandomUnplayedSong = useCallback((): GameSong | null => {
    const unplayedSongs = availableSongs.filter(song => !song.hasBeenPlayed);
    
    // If we're running low on unplayed songs, load more
    if (unplayedSongs.length <= 2 && allPlaylistSongs.length > songsLoadedCount) {
      const playedSongIds = availableSongs.filter(song => song.hasBeenPlayed).map(song => song.id);
      loadNextBatch(allPlaylistSongs, playedSongIds);
    }
    
    if (unplayedSongs.length === 0) {
      // All available songs have been played
      if (allPlaylistSongs.length > availableSongs.length) {
        // Load more songs
        const playedSongIds = availableSongs.map(song => song.id);
        loadNextBatch(allPlaylistSongs, playedSongIds);
        return null; // Will get song on next call
      } else {
        // All songs have been played, reset
        const resetSongs = availableSongs.map(song => ({ ...song, hasBeenPlayed: false }));
        setAvailableSongs(resetSongs);
        return resetSongs[Math.floor(Math.random() * resetSongs.length)] || null;
      }
    }
    
    return unplayedSongs[Math.floor(Math.random() * unplayedSongs.length)] || null;
  }, [availableSongs, allPlaylistSongs, songsLoadedCount, loadNextBatch]);

  // Mark song as played
  const markSongAsPlayed = useCallback((songId: string) => {
    setAvailableSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, hasBeenPlayed: true } : song
    ));
  }, []);

    // Show banner with auto-hide
  const showBanner = useCallback((type: 'correct' | 'incorrect', message: string) => {
    setBanner({ show: true, type, message });
    // Auto-hide banner after 3 seconds
    setTimeout(() => {
      setBanner(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Filter songs for autocomplete
  const filterSongs = useCallback((input: string) => {
    if (!input.trim() || input.length < 2) {
      setFilteredSongs([]);
      setShowDropdown(false);
      return;
    }

    const normalizeString = (str: string) => 
      str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    const normalizedInput = normalizeString(input);
    
    const matches = allPlaylistSongs.filter(song => {
      const normalizedTitle = normalizeString(song.title);
      const normalizedArtist = normalizeString(song.artist);
      const normalizedFull = normalizeString(`${song.title} ${song.artist}`);
      
      return normalizedTitle.includes(normalizedInput) ||
             normalizedArtist.includes(normalizedInput) ||
             normalizedFull.includes(normalizedInput);
    }).slice(0, 5); // Limit to 5 suggestions

    setFilteredSongs(matches);
    setShowDropdown(matches.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [allPlaylistSongs]);

  // Handle selecting a suggestion
  const selectSuggestion = useCallback((song: Song) => {
    setUserGuess(`${song.title} ${song.artist}`);
    setShowDropdown(false);
    setFilteredSongs([]);
    setSelectedSuggestionIndex(-1);
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Start game timer
  const startGameTimer = useCallback((duration: number) => {
    // Clear any existing timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Set initial time
    setTimeRemaining(duration);
    setGameEnded(false);
    
    // Start countdown timer - decrease by 1 every second
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Game ended
          setGameEnded(true);
          setShowEndScreen(true);
          if (gameTimerRef.current) {
            clearInterval(gameTimerRef.current);
            gameTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Stop game timer
  const stopGameTimer = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  // Check if user guess is correct
  const checkAnswer = useCallback((guess: string): boolean => {
    if (!currentSong) return false;
    
    const normalizeString = (str: string) => 
      str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    const normalizedGuess = normalizeString(guess);
    const normalizedTitle = normalizeString(currentSong.title);
    const normalizedArtist = normalizeString(currentSong.artist);
    const normalizedFull = normalizeString(`${currentSong.title} ${currentSong.artist}`);
    
    // Check if guess matches title, artist, or combination
    return normalizedGuess === normalizedTitle || 
           normalizedGuess === normalizedArtist || 
           normalizedGuess === normalizedFull ||
           (normalizedGuess.includes(normalizedTitle) && normalizedGuess.includes(normalizedArtist));
  }, [currentSong]);

  // Initialize game when component mounts
  useEffect(() => {
    // Get game parameters from location state
    const state = location.state as GameState;
    
    if (!state) {
      // If there's no state, redirect back to setup
      navigate('/game/solo');
      return;
    }
    
    setGameState(state);
    hasAutoStarted.current = false; // Reset auto-start flag
    
    // Reset score for solo mode
    if (state.mode === 'solo') {
      setCorrectSongs(0);
      setTimeRemaining(state.duration || 30);
      setGameEnded(false);
      setShowEndScreen(false);
      setSongResults([]);
      stopGameTimer();
    }
    
    // Initialize based on game mode
    if (state.mode === 'multiplayer') {
      setCurrentRound(1);
      // Initialize player scores to 0
      if (state.players) {
        setPlayers(state.players.map(player => ({
          ...player,
          score: 0
        })));
      }
    }
    
    // Load playlist songs
    loadAllPlaylistSongs(state);
  }, [location, navigate, loadAllPlaylistSongs]);

  // Start next song with immediate audio
  const startNextSong = useCallback(() => {
    const nextSong = getRandomUnplayedSong();
    if (!nextSong) {
      console.log('No more songs available');
      return;
    }
    
    setCurrentSong(nextSong);
    setUserGuess('');
    setAudioLoading(true);
    
    // Reset multiplayer buzzer state
    setBuzzedPlayerId(null);
    setBuzzOrder([]);
    setCanBuzzIn(true);
    
    // Update audio URL reference to prevent iframe recreation
    const audioUrl = `https://www.youtube.com/embed/${nextSong.audioUrl.split('v=')[1]?.split('&')[0]}?autoplay=1&start=${Math.max(0, Math.floor(Math.random() * Math.max(1, (nextSong.duration || 180) - 30)))}&controls=0&rel=0&modestbranding=1`;
    currentAudioUrl.current = audioUrl;
    
    // Mark song as played
    markSongAsPlayed(nextSong.id);
    
    console.log('Now playing:', nextSong.title, 'by', nextSong.artist);
  }, [getRandomUnplayedSong, markSongAsPlayed]);

  // Auto-start first song when songs become available
  useEffect(() => {
    if (!loadingSongs && availableSongs.length > 0 && !currentSong && !hasAutoStarted.current) {
      console.log('Starting first song automatically');
      hasAutoStarted.current = true;
      startNextSong();
    }
    }, [loadingSongs, availableSongs.length, currentSong]);

  // Start game timer when first song begins
  useEffect(() => {
    if (gameState?.mode === 'solo' && currentSong && !gameEnded && timeRemaining === (gameState.duration || 30)) {
      // Only start timer if we're at the initial time (haven't started yet)
      startGameTimer(gameState.duration || 30);
    }
  }, [gameState, currentSong, gameEnded, timeRemaining, startGameTimer]);

  // Handle buzzer key presses for multiplayer
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState?.mode !== 'multiplayer' || !canBuzzIn || gameEnded) return;
      
      const key = event.key.toUpperCase();
      const player = players.find(p => p.keyBind === key);
      
      if (player && !buzzOrder.includes(player.id)) {
        // Player buzzed in
        setBuzzOrder(prev => [...prev, player.id]);
        if (buzzedPlayerId === null) {
          setBuzzedPlayerId(player.id);
          setCanBuzzIn(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState?.mode, players, canBuzzIn, buzzOrder, buzzedPlayerId, gameEnded]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  // Skip the current song
  const skipSong = () => {
    // Don't allow skipping if game has ended
    if (gameEnded) return;
    
    // Record skipped song for solo mode
    if (gameState?.mode === 'solo' && currentSong) {
      setSongResults(prev => [...prev, {
        song: currentSong,
        correct: false,
        userGuess: 'Skipped'
      }]);
    }
    
    // For multiplayer, check if we should go to next round
    if (gameState?.mode === 'multiplayer') {
      const nextRound = currentRound + 1;
      if (nextRound > (gameState.rounds || 3)) {
        // Game ended
        setGameEnded(true);
        setShowEndScreen(true);
        return;
      }
      setCurrentRound(nextRound);
    }
    
    // Start next song immediately
    startNextSong();
  };

  // Handle input change with autocomplete
  const handleInputChange = (value: string) => {
    setUserGuess(value);
    filterSongs(value);
  };

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showDropdown || filteredSongs.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSongs.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          event.preventDefault();
          selectSuggestion(filteredSongs[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Handle user input submission
  const handleGuessSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userGuess.trim() || !currentSong) return;
    
    // Hide dropdown on submit
    setShowDropdown(false);
    
    const isCorrect = checkAnswer(userGuess);
    
    if (isCorrect) {
      // Don't allow guessing if game has ended
      if (gameEnded) return;
      
      if (gameState?.mode === 'solo') {
        // Solo mode scoring
        setCorrectSongs(prev => prev + 1);
        setSongResults(prev => [...prev, {
          song: currentSong,
          correct: true,
          userGuess: userGuess.trim()
        }]);
        
        showBanner('correct', `Correct! "${currentSong.title}" by ${currentSong.artist}`);
        startNextSong();
      } else if (gameState?.mode === 'multiplayer' && buzzedPlayerId !== null) {
        // Multiplayer mode scoring
        setPlayers(prev => prev.map(player => 
          player.id === buzzedPlayerId 
            ? { ...player, score: (player.score || 0) + 1 }
            : player
        ));
        
        const buzzedPlayer = players.find(p => p.id === buzzedPlayerId);
        showBanner('correct', `${buzzedPlayer?.name} got it! "${currentSong.title}" by ${currentSong.artist}`);
        
        // Check if game should end (round-based)
        const nextRound = currentRound + 1;
        if (nextRound > (gameState.rounds || 3)) {
          setGameEnded(true);
          setShowEndScreen(true);
          return;
        }
        setCurrentRound(nextRound);
        startNextSong();
      }
    } else {
      // Wrong answer
      if (gameState?.mode === 'solo') {
        setUserGuess('');
        showBanner('incorrect', 'Incorrect guess. Keep trying!');
      } else if (gameState?.mode === 'multiplayer' && buzzedPlayerId !== null) {
        // Wrong answer in multiplayer - let next player try
        const currentBuzzIndex = buzzOrder.findIndex(id => id === buzzedPlayerId);
        if (currentBuzzIndex + 1 < buzzOrder.length) {
          // There's another player who buzzed in
          setBuzzedPlayerId(buzzOrder[currentBuzzIndex + 1]);
          setUserGuess('');
          const nextPlayer = players.find(p => p.id === buzzOrder[currentBuzzIndex + 1]);
          showBanner('incorrect', `Wrong! ${nextPlayer?.name}'s turn to answer.`);
        } else {
          // No more players, reveal answer and continue
          setUserGuess('');
          showBanner('incorrect', `No one got it! It was "${currentSong.title}" by ${currentSong.artist}`);
          setTimeout(() => {
            const nextRound = currentRound + 1;
            if (nextRound > (gameState.rounds || 3)) {
              setGameEnded(true);
              setShowEndScreen(true);
              return;
            }
            setCurrentRound(nextRound);
            startNextSong();
          }, 3000);
        }
      }
    }
  };

  if (!gameState) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  // Show end screen if game ended or user clicked End Game
  if (showEndScreen) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="relative z-10 w-full flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center">
            <Link to="/home">
              <div className="text-purple-400 font-bold text-2xl">
                MusikMatch
              </div>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              Game Complete!
            </h1>
            <div className="text-6xl mb-4">🎵</div>
            
            {gameState.mode === 'solo' ? (
              <>
                <div className="text-2xl font-semibold mb-2">
                  You got <span className="text-green-400">{correctSongs}</span> out of <span className="text-blue-400">{songResults.length}</span> songs correct!
                </div>
                <div className="text-gray-400 mb-6">
                  Duration: {gameState.duration}s • Playlist: {gameState.playlistName}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold mb-4">
                  {(() => {
                    const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
                    const winner = sortedPlayers[0];
                    const isITie = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;
                    
                    if (isITie) {
                      const topScore = sortedPlayers[0].score || 0;
                      const winners = sortedPlayers.filter(p => p.score === topScore);
                      return `It's a tie! ${winners.map(p => p.name).join(' and ')} win with ${topScore} points each!`;
                    } else {
                      return `🏆 ${winner.name} wins with ${winner.score || 0} points!`;
                    }
                  })()}
                </div>
                <div className="text-gray-400 mb-6">
                  Rounds: {gameState.rounds} • Playlist: {gameState.playlistName}
                </div>
                
                {/* Final Scoreboard */}
                <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
                  {[...players].sort((a, b) => (b.score || 0) - (a.score || 0)).map((player, index) => (
                    <div key={player.id} className={`p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-600' : 'bg-gray-700'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center font-bold text-white text-sm mr-3`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-white">{player.name}</div>
                          <div className="text-sm text-gray-300">{player.score || 0} points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Results List */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Song Results</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {songResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  result.correct 
                    ? 'bg-green-900/30 border-green-500' 
                    : 'bg-red-900/30 border-red-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        "{result.song.title}" by {result.song.artist}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Your answer: <span className={result.correct ? 'text-green-400' : 'text-red-400'}>
                          {result.userGuess || 'No answer'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {result.correct ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              onClick={() => navigate('/game/solo')}
            >
              Play Again
            </button>
            <button
              className="px-8 py-3 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              onClick={() => navigate('/home')}
            >
              Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with game info */}
      <header className="relative z-10 w-full flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center">
          <Link to="/home">
            <div className="text-purple-400 font-bold text-2xl">
              MusikMatch
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {gameState.mode === 'solo' && (
            <div className="px-3 py-2 bg-gray-700 rounded-lg">
              <span className="text-gray-300 mr-2">Correct:</span>
              <span className="text-white font-medium">{correctSongs}</span>
            </div>
          )}
          {gameState.mode === 'multiplayer' && (
            <div className="px-3 py-2 bg-indigo-600 rounded-lg">
              <span className="text-gray-200 mr-2">Round:</span>
              <span className="text-white font-medium">{currentRound} / {gameState.rounds}</span>
            </div>
          )}
          <div className="px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-gray-400 mr-2">Playlist:</span>
            <span className="text-purple-300 font-semibold">{gameState.playlistName}</span>
            <span className="text-gray-500 text-sm ml-2">
              ({gameState.playlistType === 'preset' ? 'Featured' : 'Imported'})
            </span>
          </div>
        </div>
      </header>

      {/* Success/Error Banner */}
      {banner.show && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
          banner.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
            banner.type === 'correct' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {banner.type === 'correct' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{banner.message}</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Game Content Area */}
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-lg mb-8">
          <div>
            {/* Song display and audio player */}
            <div className="mb-6 text-center">
              <div className="w-full h-40 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg flex items-center justify-center mb-4 relative">
                {/* Album art or music icon */}
                {currentSong?.albumArt ? (
                  <img 
                    src={currentSong.albumArt} 
                    alt="Album Art" 
                    className="h-32 w-32 rounded-lg object-cover opacity-50"
                  />
                ) : (
                  <div className="w-16 h-16 text-white opacity-75">🎵</div>
                )}
                
               
              </div>
              
              {/* YouTube audio player */}
              {currentSong && currentAudioUrl.current && (
                <div className="fixed -bottom-10 -left-10 w-80 h-48 opacity-0 pointer-events-none">
                  <iframe
                    key={currentSong.id}
                    ref={audioPlayerRef}
                    width="320"
                    height="180"
                    src={currentAudioUrl.current}
                    title="YouTube audio player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onLoad={() => {
                      console.log('YouTube iframe loaded and playing');
                      setAudioLoading(false);
                    }}
                  />
                </div>
              )}
              
              <div className="text-xl font-semibold text-white">
                {loadingSongs ? 'Loading songs...' : 
                 audioLoading ? 'Loading audio...' :
                 currentSong ? 'Guess this song!' : 'Ready to start!'}
              </div>
            </div>

            {/* Game Timer for Solo Mode */}
            {gameState.mode === 'solo' && (
              <div className="mb-6 text-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-lg text-2xl font-bold ${
                  gameEnded ? 'bg-red-600 text-white' :
                  timeRemaining <= 10 ? 'bg-red-500 text-white animate-pulse' :
                  timeRemaining <= 30 ? 'bg-yellow-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {gameEnded ? 'Time\'s Up!' : 
                   `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`}
                </div>
                {gameEnded && (
                  <div className="mt-2 text-gray-400">
                    Final Score: {correctSongs} song{correctSongs !== 1 ? 's' : ''} correct
                  </div>
                )}
              </div>
            )}

            {/* Multiplayer Status and Scoreboard */}
            {gameState.mode === 'multiplayer' && (
              <div className="mb-6">
                {/* Buzzer Status */}
                <div className="text-center mb-4">
                  {!buzzedPlayerId && canBuzzIn ? (
                    <div className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg text-xl font-semibold animate-pulse">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 17H9l-5 5v-5z" />
                      </svg>
                      Press your key to buzz in!
                    </div>
                  ) : buzzedPlayerId ? (
                    <div className={`inline-flex items-center px-6 py-3 rounded-lg text-xl font-semibold ${
                      players.find(p => p.id === buzzedPlayerId)?.color || 'bg-gray-500'
                    } text-white`}>
                      {players.find(p => p.id === buzzedPlayerId)?.name}'s turn to answer!
                    </div>
                  ) : null}
                </div>

                {/* Player Scoreboard */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {players.map(player => (
                    <div key={player.id} className={`p-3 rounded-lg border-2 ${
                      buzzedPlayerId === player.id ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 bg-gray-800'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center font-bold text-white text-sm mr-3`}>
                          {player.keyBind}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{player.name}</div>
                          <div className="text-gray-400 text-sm">Score: {player.score || 0}</div>
                        </div>
                        {buzzOrder.includes(player.id) && (
                          <div className="text-yellow-400 text-sm">
                            #{buzzOrder.indexOf(player.id) + 1}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input field for answers */}
            <div className="mb-6">
              <form onSubmit={handleGuessSubmit}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={userGuess}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      gameEnded ? "Game Over! Start a new game to play again." :
                      gameState?.mode === 'multiplayer' && !buzzedPlayerId ? "Buzz in first to answer!" :
                      "Type your guess here (song title, artist, or both)..."
                    }
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={!currentSong || gameEnded || (gameState?.mode === 'multiplayer' && !buzzedPlayerId)}
                    autoComplete="off"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showDropdown && filteredSongs.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 shadow-lg z-50 max-h-48 overflow-y-auto">
                      {filteredSongs.map((song, index) => (
                        <div
                          key={song.id}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-700 last:border-b-0 hover:bg-gray-700 ${
                            index === selectedSuggestionIndex ? 'bg-gray-700' : ''
                          }`}
                          onClick={() => selectSuggestion(song)}
                        >
                          <div className="font-medium text-white">{song.title}</div>
                          <div className="text-sm text-gray-400">{song.artist}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
              {currentSong && !gameEnded && (
                <div className="text-xs text-gray-400 mt-2">
                  Press Enter to submit • Use ↑↓ arrows to navigate suggestions
                </div>
              )}
            </div>

            {/* Game controls */}
            <div className="flex justify-between">
              <button
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  gameEnded 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={skipSong}
                disabled={gameEnded}
              >
                Skip Song
              </button>
              <button
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                onClick={() => setShowEndScreen(true)}
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePlay; 