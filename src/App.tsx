import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';

function App() {
  return (
    <Router>
      {/* Set background, min height, and flex column layout */}
      <div className="App bg-gray-900 text-white min-h-screen flex flex-col">
        {/* Make main content area grow to push footer down */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            {/* Add other routes as needed, e.g., /contact, /game/:mode */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
