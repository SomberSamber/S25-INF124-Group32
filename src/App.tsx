import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import Solo from './pages/game/solo';
import GamePlay from './pages/game/play';
import Multiplayer from './pages/game/multiplayer';

const AppContent: React.FC = () => {
  const location = useLocation();
  const showFooterSettings = !location.pathname.includes('/settings');
  const showFooterLibrary = !location.pathname.includes('/library');
  const showFooterSolo = !location.pathname.includes('/game/solo');
  const showFooterPlay = !location.pathname.includes('/game/play');
  const showFooterMultiplayer = !location.pathname.includes('/game/multiplayer');

  return (
    <div className="App bg-gray-900 text-white min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/game/solo" element={<Solo />} />
          <Route path="/game/play" element={<GamePlay />} />
          <Route path="/game/multiplayer" element={<Multiplayer />} />
        </Routes>
      </main>
      {showFooterLibrary && showFooterSettings && showFooterSolo && showFooterPlay && showFooterMultiplayer && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
