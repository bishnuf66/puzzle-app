import { useGameData } from "../context/GameDataContext";
import TopPlayersList from "./TopPlayersList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const GameDashboard = () => {
  const { logout } = useAuth();
  const { gameData } = useGameData();
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate("/game");
  };

  const handleLogout = () => {
    toast.error("logging out");
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      <div className="bg-gray-100 p-6 border rounded-lg shadow-md flex-1">
        <div className="flex flex-row justify-between">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Game Dashboard
          </h1>
          <button
            className="text-xl px-2 py-1 font-bold text-white bg-red-500 rounded-md hover:bg-red-600 mb-6"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="space-y-4  ">
          <p>
            <strong className="text-gray-700">Email:</strong>{" "}
            {gameData.email || "Not Logged In"}
          </p>
          <p>
            <strong className="text-gray-700">Level:</strong>{" "}
            {gameData.level || "N/A"}
          </p>
          <p>
            <strong className="text-gray-700">Total Score:</strong>{" "}
            {gameData.totalScore || 0}
          </p>
        </div>

        <div className="mt-6">
          <button
            className="px-6 py-3 text-white rounded-lg primary-btn transition duration-300"
            onClick={handleStartGame}
          >
            Start Game
          </button>
        </div>
      </div>

      <TopPlayersList />
    </div>
  );
};

export default GameDashboard;
