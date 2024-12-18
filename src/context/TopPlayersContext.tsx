import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

// Import encryption and decryption functions
import { decryptData } from "../lib/encryption";

// Define the structure of a player's data
interface PlayerData {
  email: string;
  totalScore: number;
}

// Context type definition
interface TopPlayersContextType {
  topPlayers: PlayerData[];
}

// Create the context
const TopPlayersContext = createContext<TopPlayersContextType | undefined>(
  undefined
);

// Provider component
export const TopPlayersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [topPlayers, setTopPlayers] = useState<PlayerData[]>([]);

  // Function to fetch and calculate top players from localStorage
  const fetchTopPlayers = useCallback(() => {
    const savedGameData = localStorage.getItem("userGameData");

    if (!savedGameData) {
      setTopPlayers([]);
      return;
    }

    try {
      // Decrypt the saved game data
      const decryptedGameData = decryptData(savedGameData);
      const parsedGameData = decryptedGameData
        ? JSON.parse(decryptedGameData)
        : {};

      // Extract players and sort by totalScore in descending order
      const players: PlayerData[] = Object.values(parsedGameData)
        .filter((player: any) => player.email && player.totalScore >= 0)
        .sort((a: PlayerData, b: PlayerData) => b.totalScore - a.totalScore)
        .slice(0, 5); // Take the top 5 players

      setTopPlayers(players);
    } catch (error) {
      console.error("Error decrypting game data:", error);
      setTopPlayers([]); // Set empty players if decryption fails
    }
  }, []);

  // Fetch top players on component mount
  useEffect(() => {
    fetchTopPlayers();

    // Listen to localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "userGameData") {
        fetchTopPlayers();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchTopPlayers]);

  // Re-fetch after local updates in the same tab
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, [key, value]);
    if (key === "userGameData") {
      fetchTopPlayers();
    }
  };

  // Context value
  const contextValue: TopPlayersContextType = {
    topPlayers,
  };

  return (
    <TopPlayersContext.Provider value={contextValue}>
      {children}
    </TopPlayersContext.Provider>
  );
};

// Custom hook to use TopPlayersContext
export const useTopPlayers = () => {
  const context = useContext(TopPlayersContext);

  if (!context) {
    throw new Error("useTopPlayers must be used within a TopPlayersProvider");
  }

  return context;
};
