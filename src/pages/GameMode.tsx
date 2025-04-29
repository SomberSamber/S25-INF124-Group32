import React from 'react';
import { Link } from 'react-router-dom';

const GameMode: React.FC = () => {
  return (
    <div>
      <h1>Select Game Mode</h1>
      {/* Add styling and logic for mode selection */}
      <Link to="/game/solo"><button>Solo</button></Link>
      <Link to="/game/multiplayer"><button>Multiplayer</button></Link>
    </div>
  );
};

export default GameMode; 