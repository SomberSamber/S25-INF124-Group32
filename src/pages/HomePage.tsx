import React from 'react';
import { Link } from 'react-router-dom';
import UserStatus from '../components/UserStatus';

const HomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full overflow-hidden">
      {/* Header navigation */}
      <header className="relative z-10 w-full flex justify-between items-center p-4">
        <div className="flex items-center">
          <Link to="/">
            <div className="text-purple-400 font-bold text-2xl">
              MusikMatch
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/home" className="text-gray-300 hover:text-white font-bold border-b-2 border-purple-500">Home</Link>
          <Link to="/library" className="text-gray-300 hover:text-white">Library</Link>
          <Link to="/settings" className="text-gray-300 hover:text-white">Settings</Link>
          <UserStatus />
        </div>
      </header>
      
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900/40 to-gray-900">
        <div className="spotlight spotlight-primary"></div>
        <div className="spotlight spotlight-secondary"></div>
      </div>
      
      

      {/* Main content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center w-full">
        {/* Logo and title */}
        <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">
          MusikMatch
        </h1>
        
        {/* Audio waveform visualization */}
        <div className="w-full max-w-lg h-24 mb-12">
          <svg viewBox="0 0 600 100" className="w-full h-full">
            <path 
              d="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50 T550,50 T600,50" 
              fill="none" 
              stroke="rgba(139, 92, 246, 0.5)" 
              strokeWidth="2"
            />
            <path 
              d="M0,50 Q30,20 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50" 
              fill="none" 
              stroke="rgba(139, 92, 246, 0.8)" 
              strokeWidth="3"
            />
            <path 
              d="M0,50 Q40,5 80,50 T160,50 T240,50 T320,50 T400,50 T480,50 T560,50" 
              fill="none" 
              stroke="rgba(139, 92, 246, 1)" 
              strokeWidth="4"
            />
          </svg>
        </div>

        {/* Game mode buttons */}
        <div className="flex justify-center space-x-6 mb-8">
          <Link to="/game/solo" className="w-44">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Solo
            </button>
          </Link>
          
          <Link to="/game/multiplayer" className="w-44">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Multiplayer
            </button>
          </Link>
        </div>
      </main>   
    </div>
  );
};

export default HomePage; 