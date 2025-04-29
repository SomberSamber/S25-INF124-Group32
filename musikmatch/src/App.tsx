import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GameMode from './pages/GameMode'; // Assuming this is the next step after login/register

function App() {
  return (
    <Router>
      {/* Set background, min height, and flex column layout */}
      <div className="App bg-gray-900 text-white min-h-screen flex flex-col">
        <NavBar />
        {/* Make main content area grow to push footer down */}
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/select-mode" element={<GameMode />} />
            {/* Add other routes as needed, e.g., /contact, /game/:mode */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
