import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { initializeFirestore } from './utils/initializeFirestore';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './components/AdminPanel';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import Solo from './pages/game/solo';
import GamePlay from './pages/game/play';
import Multiplayer from './pages/game/multiplayer';
function App() {
  useEffect(() => {
    // Initialize Firestore with preset data
    initializeFirestore();
  }, []);

  return (
    <AuthProvider>
      <Router>
        {/* Set background, min height, and flex column layout */}
        <div className="App bg-gray-900 text-white min-h-screen flex flex-col">
        {/* Make main content area grow to push footer down */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/game/solo" element={<ProtectedRoute><Solo /></ProtectedRoute>} />
            <Route path="/game/play" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
            <Route path="/game/multiplayer" element={<ProtectedRoute><Multiplayer /></ProtectedRoute>} />
            {/* Add other routes as needed, e.g., /contact, /game/:mode */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
