import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const categories = [
  { key: 'general', label: 'General' },
  { key: 'gameplay', label: 'Gameplay' },
  { key: 'display', label: 'Display' },
  { key: 'social', label: 'Social' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'accessibility', label: 'Accessibility' },
];

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timeZone: 'auto',
    preferredGenre: 'any',
    autoLogin: false,
    
    // Gameplay
    difficulty: 'medium',
    autoPlay: true,
    showHints: true,
    practiceMode: true,
    
    // Display
    darkMode: true,
    showAnimations: true,
    compactMode: false,
    
    // Social
    showOnlineStatus: true,
    allowChallenges: true,
    showInLeaderboards: true,
    
    // Notifications
    gameInvites: true,
    dailyQuiz: true,
    achievementAlerts: true,
    
    // Privacy
    shareGameHistory: true,
    showLocation: false,
    
    // Accessibility
    highContrast: false,
    textSize: 'medium',
    screenReader: false,
    
    // Audio
    sound: true,
    music: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelect = (setting: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Gradient background for the main panel
  const gradientBg = 'bg-gradient-to-br from-purple-700 via-purple-900 to-gray-900';

  // Sidebar styles
  const sidebarBg = 'bg-gradient-to-b from-gray-900 via-purple-900 to-purple-800';

  // Modern toggle style
  const toggleClass = (on: boolean) =>
    `w-16 h-8 flex items-center rounded-full p-1 duration-300 ease-in-out cursor-pointer ${on ? 'bg-purple-500' : 'bg-gray-600'}`;
  const knobClass = (on: boolean) =>
    `bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${on ? 'translate-x-8' : 'translate-x-0'}`;

  // Render settings for the selected category
  const renderSettings = () => {
    switch (selectedCategory) {
      case 'general':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Language</span>
              <select
                value={settings.language}
                onChange={e => handleSelect('language', e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-purple-500 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Time Zone</span>
              <select
                value={settings.timeZone}
                onChange={e => handleSelect('timeZone', e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-purple-500 focus:outline-none"
              >
                <option value="auto">Auto-detect</option>
                <option value="PST">PST</option>
                <option value="MST">MST</option>
                <option value="CST">CST</option>
                <option value="EST">EST</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Preferred Genre for Solo Mode</span>
              <select
                value={settings.preferredGenre}
                onChange={e => handleSelect('preferredGenre', e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-purple-500 focus:outline-none"
              >
                <option value="any">Any</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="hiphop">Hip-Hop</option>
                <option value="electronic">Electronic</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
                <option value="country">Country</option>
                <option value="rnb">R&B</option>
                <option value="latin">Latin</option>
                <option value="kpop">K-Pop</option>
                <option value="metal">Metal</option>
                <option value="reggae">Reggae</option>
                <option value="blues">Blues</option>
                <option value="folk">Folk</option>
                <option value="indie">Indie</option>
                <option value="soundtrack">Soundtrack</option>
                <option value="world">World</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Auto-login on this device</span>
              <div className={toggleClass(settings.autoLogin)} onClick={() => handleToggle('autoLogin')}>
                <div className={knobClass(settings.autoLogin)} />
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-colors"
                onClick={() => alert('Account deletion is not implemented in this demo.')}
              >
                Delete Account
              </button>
            </div>
          </>
        );
      case 'gameplay':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Auto-Play Next Round</span>
              <div className={toggleClass(settings.autoPlay)} onClick={() => handleToggle('autoPlay')}>
                <div className={knobClass(settings.autoPlay)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Show Hints</span>
              <div className={toggleClass(settings.showHints)} onClick={() => handleToggle('showHints')}>
                <div className={knobClass(settings.showHints)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Practice Mode Available Offline</span>
              <div className={toggleClass(settings.practiceMode)} onClick={() => handleToggle('practiceMode')}>
                <div className={knobClass(settings.practiceMode)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Difficulty Level</span>
              <select
                value={settings.difficulty}
                onChange={e => handleSelect('difficulty', e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-purple-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </>
        );
      case 'display':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Dark Mode</span>
              <div className={toggleClass(settings.darkMode)} onClick={() => handleToggle('darkMode')}>
                <div className={knobClass(settings.darkMode)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Show Animations</span>
              <div className={toggleClass(settings.showAnimations)} onClick={() => handleToggle('showAnimations')}>
                <div className={knobClass(settings.showAnimations)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Compact Mode</span>
              <div className={toggleClass(settings.compactMode)} onClick={() => handleToggle('compactMode')}>
                <div className={knobClass(settings.compactMode)} />
              </div>
            </div>
          </>
        );
      case 'social':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Show Online Status</span>
              <div className={toggleClass(settings.showOnlineStatus)} onClick={() => handleToggle('showOnlineStatus')}>
                <div className={knobClass(settings.showOnlineStatus)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Allow Challenges</span>
              <div className={toggleClass(settings.allowChallenges)} onClick={() => handleToggle('allowChallenges')}>
                <div className={knobClass(settings.allowChallenges)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Show in Leaderboards</span>
              <div className={toggleClass(settings.showInLeaderboards)} onClick={() => handleToggle('showInLeaderboards')}>
                <div className={knobClass(settings.showInLeaderboards)} />
              </div>
            </div>
          </>
        );
      case 'notifications':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Game Invites</span>
              <div className={toggleClass(settings.gameInvites)} onClick={() => handleToggle('gameInvites')}>
                <div className={knobClass(settings.gameInvites)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Daily Quiz Reminders</span>
              <div className={toggleClass(settings.dailyQuiz)} onClick={() => handleToggle('dailyQuiz')}>
                <div className={knobClass(settings.dailyQuiz)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Achievement Alerts</span>
              <div className={toggleClass(settings.achievementAlerts)} onClick={() => handleToggle('achievementAlerts')}>
                <div className={knobClass(settings.achievementAlerts)} />
              </div>
            </div>
          </>
        );
      case 'privacy':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Share Game History</span>
              <div className={toggleClass(settings.shareGameHistory)} onClick={() => handleToggle('shareGameHistory')}>
                <div className={knobClass(settings.shareGameHistory)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Show Location in Rankings</span>
              <div className={toggleClass(settings.showLocation)} onClick={() => handleToggle('showLocation')}>
                <div className={knobClass(settings.showLocation)} />
              </div>
            </div>
          </>
        );
      case 'accessibility':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">High Contrast Mode</span>
              <div className={toggleClass(settings.highContrast)} onClick={() => handleToggle('highContrast')}>
                <div className={knobClass(settings.highContrast)} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Text Size</span>
              <select
                value={settings.textSize}
                onChange={e => handleSelect('textSize', e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-purple-500 focus:outline-none"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg">Screen Reader Support</span>
              <div className={toggleClass(settings.screenReader)} onClick={() => handleToggle('screenReader')}>
                <div className={knobClass(settings.screenReader)} />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Header navigation */}
      <header className="relative z-10 w-full flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center">
          <Link to="/">
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

      {/* Background with gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-indigo-900/40 to-gray-900">
        <div className="spotlight spotlight-primary"></div>
        <div className="spotlight spotlight-secondary"></div>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] w-full">
        {/* Sidebar */}
        <aside className={`w-64 p-6 ${sidebarBg} flex flex-col justify-between shrink-0`}>
          <div>
            <h2 className="text-2xl font-bold text-purple-300 mb-8 tracking-widest">Settings</h2>
            <nav className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 text-lg font-medium tracking-wide ${selectedCategory === cat.key ? 'bg-purple-700 text-white' : 'text-purple-200 hover:bg-purple-800'}`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors text-lg font-semibold"
          >
            Back to Home
          </button>
        </aside>
        {/* Main Panel */}
        <main className="flex-1 flex items-center justify-center p-12 w-full">
          <div className="w-full max-w-2xl rounded-3xl shadow-2xl p-10 bg-opacity-80" style={{background: 'linear-gradient(135deg, #7c3aed 60%, #a78bfa 100%)'}}>
            <h1 className="text-4xl font-bold text-white mb-10 tracking-wider text-center drop-shadow-lg">{categories.find(c => c.key === selectedCategory)?.label} Settings</h1>
            {renderSettings()}
            <div className="flex justify-end mt-10">
              <button
                onClick={() => navigate('/home')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 