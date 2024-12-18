import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";

// Import encryption and decryption functions
import { encryptData, decryptData } from "../lib/encryption";

// Define the structure of a player's data
interface UserGameData {
  email: string; // Ensure the email is always a string
  level: number;
  totalScore: number;
  lossCount: number; // Add lossCount to gameData
}

interface UserGameContextType {
  gameData: UserGameData;
  incrementLevel: () => void;
  updatetotalScore: (newtotalScore: number) => void;
  resetGameData: () => void;
  registerLoss: () => void; // Increment loss count
  saveGame: () => void;
}

// Retrieve and decrypt email from sessionStorage
const emaildata = sessionStorage.getItem("user");
const email = emaildata ? decryptData(emaildata) : ""; // Ensure a fallback if decryption fails
console.log(email, "email is");

const initialGameData: UserGameData = {
  email: email, // Ensure email is a string
  level: 1,
  totalScore: 0,
  lossCount: 0, // Initialize lossCount
};

const UserGameContext = createContext<UserGameContextType | undefined>(
  undefined
);

export const UserGameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameData, setGameData] = useState<UserGameData>(() => {
    const email = sessionStorage.getItem("user");
    const savedGameData = localStorage.getItem("userGameData");

    if (!savedGameData) {
      return { ...initialGameData, email: email ? decryptData(email) : "" }; // Decrypt if available
    }

    try {
      // Decrypt the saved game data
      const decryptedGameData = decryptData(savedGameData);
      const parsedGameData: { [key: string]: UserGameData } = decryptedGameData
        ? JSON.parse(decryptedGameData)
        : {};

      const userEmail = email || ""; // Ensure email is a valid string

      return (
        parsedGameData[userEmail] || {
          ...initialGameData,
          email: userEmail ? decryptData(userEmail) : "", // Decrypt email here if necessary
        }
      );
    } catch (error) {
      console.error("Error decrypting game data:", error);
      return { ...initialGameData, email: email ? decryptData(email) : "" }; // Fallback to initial data if decryption fails
    }
  });

  // Update localStorage with the current user's game data (encrypted)
  const updateLocalStorage = useCallback((newGameData: UserGameData) => {
    const savedGameData = localStorage.getItem("userGameData");
    const parsedGameData = savedGameData ? JSON.parse(savedGameData) : {};
    parsedGameData[newGameData.email] = newGameData;

    try {
      // Encrypt the game data before saving it
      const encryptedData = encryptData(JSON.stringify(parsedGameData));
      localStorage.setItem("userGameData", encryptedData);
    } catch (error) {
      console.error("Error encrypting game data:", error);
    }
  }, []);

  // Method to increment level
  const incrementLevel = useCallback(() => {
    const updatedGameData = {
      ...gameData,
      level: gameData.level + 1,
      lossCount: 0, // Reset lossCount on level progression
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

  // Method to register a loss
  const registerLoss = useCallback(() => {
    const updatedLossCount = gameData.lossCount + 1;

    if (updatedLossCount >= 3) {
      // Reset game data after 3 consecutive losses
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

  // Method to save the current game data explicitly
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
