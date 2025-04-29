import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-indigo-900/40 to-gray-900">
        <div className="spotlight spotlight-primary"></div>
        <div className="spotlight spotlight-secondary"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 text-center p-8 max-w-lg">
        <h2 className="text-2xl font-semibold mb-2 text-gray-300">Welcome To</h2>
        <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600">
          MusikMatch
        </h1>
        
        {/* App description */}
        <p className="text-gray-300 mb-8 text-lg">
          A real-time music guessing game!
        </p>
        
        {/* Buttons container - horizontal layout */}
        <div className="flex justify-center space-x-4">
          {/* Login button */}
          <Link to="/login" className="flex-1">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Login
            </button>
          </Link>
          
          {/* Register button */}
          <Link to="/register" className="flex-1">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 