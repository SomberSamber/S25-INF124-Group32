import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

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
  playlistId: number;
  playlistName: string;
  players?: Player[];  // For multiplayer mode
}

const GamePlay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<string>("Loading next song...");
  const [score, setScore] = useState<number>(0);
  
  // Multiplayer specific states
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [buzzedPlayerId, setBuzzedPlayerId] = useState<number | null>(null);

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
    
    // Initialize based on game mode
    if (state.mode === 'solo') {
      if (state.duration) setTimeLeft(state.duration);
    } else if (state.mode === 'multiplayer') {
      setCurrentRound(1);
      // Initialize player scores to 0
      if (state.players) {
        setPlayers(state.players.map(player => ({
          ...player,
          score: 0
        })));
      }
    }
  }, [location, navigate]);

  // Set up keyboard event listeners for multiplayer
  useEffect(() => {
    if (!gameState || gameState.mode !== 'multiplayer' || !isPlaying) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // If game is not playing or someone already buzzed in, ignore keypress
      if (!isPlaying || buzzedPlayerId !== null) return;
      
      const keyPressed = e.key.toUpperCase();
      const player = players.find(p => p.keyBind.toUpperCase() === keyPressed);
      
      if (player) {
        setBuzzedPlayerId(player.id);
        // In a real implementation, you would pause the song here
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isPlaying, players, buzzedPlayerId]);

  // Timer countdown effect (solo mode)
  useEffect(() => {
    if (!gameState || gameState.mode !== 'solo' || !isPlaying || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPlaying, timeLeft, gameState]);

  // Start the game
  const startGame = () => {
    setIsPlaying(true);
    // Reset buzzer state for multiplayer
    if (gameState?.mode === 'multiplayer') {
      setBuzzedPlayerId(null);
    }
    // In a real implementation, this would fetch the first song from the API
    setCurrentSong("Song Title - Artist Name");
  };

  // End the game
  const handleGameEnd = useCallback(() => {
    setIsPlaying(false);
    
    if (gameState?.mode === 'solo') {
      // Solo mode end
      if (gameState.duration) setTimeLeft(gameState.duration);
      alert(`Game Over! Your score: ${score}`);
    } else if (gameState?.mode === 'multiplayer') {
      // Multiplayer mode end
      const winningPlayer = players.reduce((prev, current) => 
        (prev.score || 0) > (current.score || 0) ? prev : current
      );
      alert(`Game Over! ${winningPlayer.name} wins with ${winningPlayer.score} points!`);
    }
  }, [gameState, score, players]);

  // Skip the current song
  const skipSong = () => {
    // Reset buzzer state for multiplayer
    if (gameState?.mode === 'multiplayer') {
      setBuzzedPlayerId(null);
    }
    // In a real implementation, this would fetch the next song
    setCurrentSong("New Song - New Artist");
  };

  // Handle answer submission in multiplayer mode
  const handleAnswerSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const answerInput = document.getElementById('player-answer') as HTMLInputElement;
    if (!answerInput || !answerInput.value.trim()) return;
    
    const playerAnswer = answerInput.value.trim();
    
    // In a real implementation, you would compare the answer with the correct one
    // For now, we'll just simulate a correct answer
    const isCorrect = true; // This would actually check if the answer is correct
    
    if (isCorrect && buzzedPlayerId !== null) {
      // Add point to the player who buzzed in
      setPlayers(players.map(player => 
        player.id === buzzedPlayerId 
          ? { ...player, score: (player.score || 0) + 1 } 
          : player
      ));
      
      // Check if the round should end
      const winningPlayer = players.find(p => p.id === buzzedPlayerId);
      if (winningPlayer && winningPlayer.score !== undefined && winningPlayer.score + 1 >= Math.ceil((gameState?.rounds || 5) / 2)) {
        handleGameEnd();
      } else if (currentRound < (gameState?.rounds || 5)) {
        // Move to next round
        setCurrentRound(currentRound + 1);
        setBuzzedPlayerId(null);
        skipSong();
      } else {
        // End game if we've reached the max rounds
        handleGameEnd();
      }
    } else {
      // Allow other players to buzz in
      setBuzzedPlayerId(null);
    }
    
    // Clear the input
    answerInput.value = '';
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!gameState) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

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
        <div className="flex items-center">
          <div className="mr-4 px-4 py-2 bg-gray-800 rounded-lg">
            
            <span className="text-gray-400 mr-2">Playlist:</span>
            <span className="text-purple-300 font-semibold">{gameState.playlistName}</span>
          </div>
          {gameState.mode === 'solo' && (
            <div className="px-4 py-2 bg-gray-800 rounded-lg">
              <span className="text-gray-400 mr-2">Score:</span>
              <span className="text-indigo-300 font-semibold">{score}</span>
            </div>
          )}
        </div>
      </header>

      {/* Player information row (Multiplayer) */}
      {gameState.mode === 'multiplayer' && (
        <div className="w-full flex justify-center py-4 border-b border-gray-800">
          <div className="flex space-x-4 md:space-x-8">
            {players.map(player => (
              <div 
                key={player.id} 
                className={`flex flex-col items-center px-4 py-2 rounded-lg ${
                  buzzedPlayerId === player.id ? 'bg-gray-700 ring-2 ring-yellow-400' : 'bg-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  <div className={`w-8 h-8 ${player.color} rounded-full flex items-center justify-center font-bold text-white mr-2`}>
                    {player.id}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-xs text-gray-400 mr-3">
                    Key: <span className="text-white font-bold">{player.keyBind}</span>
                  </div>
                  <div className="text-indigo-300 font-bold">
                    {player.score || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Timer Display (Solo) or Round Counter (Multiplayer) */}
        <div className="mb-8 text-center">
          {gameState.mode === 'solo' ? (
            <>
              <div className="text-6xl font-bold bg-gray-800 px-8 py-4 rounded-xl text-indigo-300 mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-gray-400">
                {isPlaying ? 'Time Remaining' : 'Ready to Play'}
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl font-bold bg-gray-800 px-8 py-4 rounded-xl text-indigo-300 mb-2">
                {currentRound} / {gameState.rounds}
              </div>
              <div className="text-gray-400">
                {isPlaying ? 'Current Round' : 'Ready to Play'}
              </div>
            </>
          )}
        </div>

        {/* Game Content Area */}
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-2xl shadow-lg mb-8">
          {!isPlaying ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-purple-300">Ready to Play?</h2>
              <p className="text-gray-300 mb-8">
                {gameState.mode === 'solo' ? (
                  <>
                    You'll be listening to songs from the {gameState.playlistName} playlist.
                    <br />Guess the song and artist as fast as you can!
                  </>
                ) : (
                  <>
                    Get ready for {gameState.rounds} rounds of music trivia!
                    <br />Each player: Press your key to buzz in when you know the answer.
                  </>
                )}
              </p>
              <button
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                onClick={startGame}
              >
                Start Playing
              </button>
            </div>
          ) : (
            <div>
              {/* Song display and audio player would go here in a real implementation */}
              <div className="mb-6 text-center">
                <div className="w-full h-40 bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg flex items-center justify-center mb-4">
                  <img 
                    src="/assets/icons/music-note.svg" 
                    alt="Music" 
                    className="h-16 w-16 text-white opacity-75"
                  />
                </div>
                <div className="text-xl font-semibold text-white">{currentSong}</div>
              </div>

              {/* Input field for answers (solo) or Buzzed Player (multiplayer) */}
              {gameState.mode === 'solo' ? (
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Type your guess here..."
                    className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ) : (
                <div className="mb-6">
                  {buzzedPlayerId ? (
                    <div className="text-center">
                      <div className="bg-gray-700 rounded-lg p-4 mb-4">
                        <p className="text-lg font-semibold mb-3">
                          {players.find(p => p.id === buzzedPlayerId)?.name}'s turn to answer!
                        </p>
                        <form onSubmit={handleAnswerSubmit} className="flex flex-col items-center">
                          <input
                            id="player-answer"
                            type="text"
                            placeholder="Type your answer..."
                            autoFocus
                            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                          />
                          <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Submit Answer
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xl font-medium text-gray-300">
                        Press your key to buzz in!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Game controls */}
              <div className="flex justify-between">
                {gameState.mode === 'solo' ? (
                  <>
                    <button
                      className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      onClick={skipSong}
                    >
                      Skip Song
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      onClick={handleGameEnd}
                    >
                      End Game
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      onClick={skipSong}
                      disabled={buzzedPlayerId !== null}
                    >
                      Skip Song
                    </button>
                    <button
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      onClick={handleGameEnd}
                    >
                      End Game
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GamePlay; 