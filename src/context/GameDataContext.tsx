import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

// Import encryption and decryption functions
import { encryptData, decryptData } from "../lib/encryption";

// Define the structure of a player's data
interface UserGameData {
  email: string;
  level: number;
  totalScore: number;
  lossCount: number;
}

interface UserGameContextType {
  gameData: UserGameData;
  incrementLevel: () => void;
  updatetotalScore: (newtotalScore: number) => void;
  resetGameData: () => void;
  registerLoss: () => void;
  saveGame: () => void;
  refreshGameData: () => void;
}

// Initial data for the game
const initialGameData: UserGameData = {
  email: "",
  level: 1,
  totalScore: 0,
  lossCount: 0,
};

const UserGameContext = createContext<UserGameContextType | undefined>(
  undefined
);

export const UserGameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameData, setGameData] = useState<UserGameData>(initialGameData);

  const updateLocalStorage = useCallback((newGameData: UserGameData) => {
    const savedGameData = localStorage.getItem("userGameData");
    const parsedGameData = savedGameData
      ? JSON.parse(decryptData(savedGameData))
      : {};
    parsedGameData[newGameData.email] = newGameData;

    try {
      const encryptedData = encryptData(JSON.stringify(parsedGameData));
      localStorage.setItem("userGameData", encryptedData);
    } catch (error) {
      console.error("Error encrypting game data:", error);
    }
  }, []);

  // Fetch the latest game data for the logged-in user
  const refreshGameData = useCallback(() => {
    const emailData = sessionStorage.getItem("user");
    const email = emailData ? decryptData(emailData) : "";

    if (email) {
      const savedGameData = localStorage.getItem("userGameData");
      if (savedGameData) {
        try {
          const decryptedGameData = decryptData(savedGameData);
          const parsedGameData: { [key: string]: UserGameData } =
            decryptedGameData ? JSON.parse(decryptedGameData) : {};
          const updatedGameData = parsedGameData[email] || {
            ...initialGameData,
            email,
          };
          setGameData(updatedGameData);
        } catch (error) {
          console.error("Error decrypting game data:", error);
          setGameData({ ...initialGameData, email }); // Fallback to initial data
        }
      } else {
        setGameData({ ...initialGameData, email });
      }
    } else {
      setGameData(initialGameData); // Reset to initial data if no user is logged in
    }
  }, []);

  // Listen for changes in the logged-in user's email
  useEffect(() => {
    refreshGameData(); // Fetch game data when the component mounts

    // Optionally, listen for changes in `sessionStorage` (if email is updated dynamically)
    const handleStorageChange = () => {
      refreshGameData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshGameData]);

  // Other context methods
  const incrementLevel = useCallback(() => {
    const updatedGameData = {
      ...gameData,
      level: gameData.level + 1,
      lossCount: 0,
    };
    setGameData(updatedGameData);
    updateLocalStorage(updatedGameData);
  }, [gameData, updateLocalStorage]);

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

  const resetGameData = useCallback(() => {
    const resetData = {
      ...initialGameData,
      email: gameData.email,
    };
    setGameData(resetData);
    updateLocalStorage(resetData);
  }, [gameData, updateLocalStorage]);

  const registerLoss = useCallback(() => {
    const updatedLossCount = gameData.lossCount + 1;

    if (updatedLossCount >= 3) {
      resetGameData();
    } else {
      const updatedGameData = {
        ...gameData,
        lossCount: updatedLossCount,
      };
      setGameData(updatedGameData);
      updateLocalStorage(updatedGameData);
    }
  }, [gameData, resetGameData, updateLocalStorage]);

  const saveGame = useCallback(() => {
    updateLocalStorage(gameData);
  }, [gameData, updateLocalStorage]);

  const contextValue: UserGameContextType = {
    gameData,
    incrementLevel,
    updatetotalScore,
    resetGameData,
    registerLoss,
    saveGame,
    refreshGameData,
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

  return { ...context, refreshGameData: context.refreshGameData };
};
