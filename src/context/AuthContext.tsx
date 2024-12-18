import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Import the encryption and decryption functions
import { encryptData, decryptData } from "../lib/encryption";

interface AuthContextType {
  user: string | null;
  isLoading: boolean;
  login: (user: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component to wrap the app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on initial load
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedExpirationTime = sessionStorage.getItem("expirationTime");

    if (storedUser && storedExpirationTime) {
      try {
        // Decrypt user data before setting it
        const decryptedUser = decryptData(storedUser);

        // Decrypt expiration time before comparing
        const decryptedExpirationTime = decryptData(storedExpirationTime);
        const currentTime = Date.now();

        // Check if the expiration time is valid (not null or expired)
        if (
          decryptedExpirationTime &&
          currentTime < Number(decryptedExpirationTime)
        ) {
          // If the session is still valid, set the user data
          setUser(decryptedUser);
        } else {
          // If session expired, clear the user data
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("expirationTime");
        }
      } catch (error: unknown) {
        console.log(error);
        // Clear invalid stored data if decryption fails
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("expirationTime");
      }
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData: string) => {
    // Encrypt user data before saving to sessionStorage
    const encryptedUserData = encryptData(userData);

    // Set expiration time (24 hours from now)
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const encryptedExpirationTime = encryptData(expirationTime.toString());

    // Save encrypted user data and expiration time to sessionStorage
    setUser(userData);
    sessionStorage.setItem("user", encryptedUserData);
    sessionStorage.setItem("expirationTime", encryptedExpirationTime);
  };

  // Logout function
  const logout = () => {
    // Clear user data from state and sessionStorage
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("expirationTime");
  };

  // Context value to be provided
  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated:
      !!user && // Ensure `user` exists
      !!sessionStorage.getItem("expirationTime") && // Ensure expiration time exists
      !!decryptData(sessionStorage.getItem("expirationTime")!) && // Ensure expiration time is decrypted
      Date.now() <
        Number(decryptData(sessionStorage.getItem("expirationTime")!) || 0), // Compare expiration time with current time
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
