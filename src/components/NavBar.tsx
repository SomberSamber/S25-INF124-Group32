import React from 'react';
import { Link } from 'react-router-dom'; // Assuming use of React Router

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-purple-400 font-bold text-2xl">
        MusikMatch
      </Link>
      
      {/* Navigation Links */}
      <div className="flex space-x-6">
        <Link to="/" className="text-white hover:text-purple-300 transition-colors">
          Home
        </Link>
        <Link to="/login" className="text-white hover:text-purple-300 transition-colors">
          Login
        </Link>
        <Link to="/register" className="text-white hover:text-purple-300 transition-colors">
          Register
        </Link>
      </div>
    </nav>
  );
};

export default NavBar; 