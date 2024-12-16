import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

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
    // Check if user is already logged in (e.g., from sessionStorage)
    const storedUser = sessionStorage.getItem("user");
    const expirationTime = sessionStorage.getItem("expirationTime");

    if (storedUser && expirationTime) {
      const currentTime = Date.now();
      if (currentTime < Number(expirationTime)) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error: unknown) {
          console.log(error);
          // Clear invalid stored data
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("expirationTime");
        }
      } else {
        // If session expired, clear the user data
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("expirationTime");
      }
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData: string) => {
    // Save user data to state and sessionStorage
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));

    // Set expiration time (24 hours from now)
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem("expirationTime", expirationTime.toString());
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
      !!user &&
      Date.now() < (Number(sessionStorage.getItem("expirationTime")) || 0),
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
