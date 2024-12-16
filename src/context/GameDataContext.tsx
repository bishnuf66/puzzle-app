import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

interface UserGameData {
  email: string | null | object;
  level: number;
  totalScore: number;
}

interface UserGameContextType {
  gameData: UserGameData;
  incrementLevel: () => void;
  updatetotalScore: (newtotalScore: number) => void;
  resetGameData: () => void;
  saveGame: () => void;
}

// Initial game data
const email = sessionStorage.getItem("user");
console.log(email, "from gamedate");

const initialGameData: UserGameData = {
  email: email,
  level: 1,
  totalScore: 0,
};

const UserGameContext = createContext<UserGameContextType | undefined>(
  undefined
);

export const UserGameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameData, setGameData] = useState<UserGameData>(() => {
    // Retrieve the email from sessionStorage
    const email = sessionStorage.getItem("user");
    // Retrieve game data for the email from localStorage
    const savedGameData = localStorage.getItem("userGameData");
    const parsedGameData = savedGameData ? JSON.parse(savedGameData) : {};
    return parsedGameData[email] || { ...initialGameData, email };
  });

  // Update localStorage with the current user's game data
  const updateLocalStorage = useCallback((newGameData: UserGameData) => {
    const savedGameData = localStorage.getItem("userGameData");
    const parsedGameData = savedGameData ? JSON.parse(savedGameData) : {};
    parsedGameData[newGameData.email] = newGameData;
    localStorage.setItem("userGameData", JSON.stringify(parsedGameData));
  }, []);

  // Method to increment level
  const incrementLevel = useCallback(() => {
    const updatedGameData = {
      ...gameData,
      level: gameData.level + 1,
    };
    setGameData(updatedGameData);
    updateLocalStorage(updatedGameData);
  }, [gameData, updateLocalStorage]);

  // Method to update totalScore
  const updatetotalScore = useCallback(
    (newtotalScore: number) => {
      const updatedGameData = {
        ...gameData,
        totalScore: newtotalScore,
      };
      setGameData(updatedGameData);
      updateLocalStorage(updatedGameData);
    },
    [gameData, updateLocalStorage]
  );

  // Method to reset game data
  const resetGameData = useCallback(() => {
    const resetData = {
      ...initialGameData,
      email: gameData.email,
    };
    setGameData(resetData);
    updateLocalStorage(resetData);
  }, [gameData, updateLocalStorage]);

  // Method to save the current game data explicitly
  const saveGame = useCallback(() => {
    updateLocalStorage(gameData);
  }, [gameData, updateLocalStorage]);

  const contextValue: UserGameContextType = {
    gameData,
    incrementLevel,
    updatetotalScore,
    resetGameData,
    saveGame,
  };

  return (
    <UserGameContext.Provider value={contextValue}>
      {children}
    </UserGameContext.Provider>
  );
};

// Custom hook to use game context
export const useGameData = () => {
  const context = useContext(UserGameContext);

  if (!context) {
    throw new Error("useGameData must be used within a UserGameProvider");
  }

  return context;
};
