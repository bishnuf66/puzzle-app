// GameLost.tsx
import React from "react";

interface GameLostProps {
  onRestart: () => void;
}

const GameLost: React.FC<GameLostProps> = ({ onRestart }) => {
  return (
    <div className="mt-5 text-red-600">
      <h2 className="text-2xl font-bold">Time's up! You lost the game.</h2>
      <button
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
        onClick={onRestart}
      >
        Restart Level
      </button>
    </div>
  );
};

export default GameLost;
