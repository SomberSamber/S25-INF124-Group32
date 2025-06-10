import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    // Account settings
    username: currentUser?.displayName || 'User123',
    email: currentUser?.email || 'user@example.com',
    
    // Game preferences
    difficulty: 'medium',
    autoPlay: true,
    showHints: true,
    
    // Display preferences
    darkMode: true,
    showAnimations: true,
    
    // Audio settings
    sound: true,
    music: true,
    volume: 75,
    
    // Privacy settings
    showInLeaderboards: true,
    shareGameHistory: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleInputChange = (setting: keyof typeof settings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveChanges = () => {
    // TODO: Implement saving settings to backend/localStorage
    alert('Settings saved successfully!');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // TODO: Implement password change functionality
    alert('Password change functionality would be implemented here');
  };

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
          <Link to="/settings" className="text-gray-300 hover:text-white font-bold border-b-2 border-purple-500">Settings</Link>
          <Link to="/" className="text-gray-300 hover:text-white">Logout</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Settings
          </h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          {/* Account Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isEditing ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

        

          {/* Display Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Display</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Dark Mode</span>
                <button
                  onClick={() => handleToggle('darkMode')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.darkMode ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Show in Leaderboards</span>
                <button
                  onClick={() => handleToggle('showInLeaderboards')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.showInLeaderboards ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    settings.showInLeaderboards ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Share Game History</span>
                <button
                  onClick={() => handleToggle('shareGameHistory')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.shareGameHistory ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                    settings.shareGameHistory ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => alert('Account deletion functionality would be implemented here')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;

