# Technical Documentation for the Puzzle App

## Overview

The Puzzle App is a full-fledged game application that includes user authentication, game state management, puzzle gameplay mechanics, and a leaderboard. The app allows users to log in, play a sliding puzzle game, track their progress, and view the leaderboard. The app uses modern web technologies such as **React**, **localStorage**, and **Context API** for state management.

This documentation provides a detailed technical breakdown of the app's architecture, algorithms, state management strategy, performance optimizations, and key features like user authentication, puzzle shuffling, game state, leaderboard functionality, and more.

## 1. **User Authentication**

### **Login and Sign Up**
1. **Login**:
   - The app allows users to log in with a username, which is stored in **sessionStorage**. The username is encrypted before storing it in the session storage to ensure privacy and security.
   - Upon successful login, the app stores the user information (like username and session expiration time) in the session storage for maintaining the login session.

   **Login Workflow**:
   - When the user logs in, their username is encrypted using an encryption function (`encryptData`) and stored in **sessionStorage**.
   - The session expiration time is also set to ensure that the session automatically expires after a defined period (e.g., 24 hours).
   - On app reload, the `useEffect` hook checks if the user is logged in by verifying the session storage, decrypting the stored username, and validating the session expiration time.

2. **Sign Up**:
   - The app can optionally allow new users to sign up by entering their username. This can be treated similarly to the login process where the username is encrypted and stored in sessionStorage.
   - The sign-up logic could be extended to store more details in localStorage (such as email and other information) for persistent storage across sessions.

3. **Authentication Context (AuthProvider)**:
   - The `AuthProvider` component manages the authentication state, including the current user, loading state, and login/logout functionality.
   - The `useAuth` custom hook allows other components to access authentication data and perform login/logout actions.

**Code Reference**:

```tsx
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const expirationTime = sessionStorage.getItem("expirationTime");

    if (storedUser && expirationTime) {
      const currentTime = Date.now();
      if (currentTime < Number(expirationTime)) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.log(error);
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("expirationTime");
        }
      } else {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("expirationTime");
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData: string) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem("expirationTime", expirationTime.toString());
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("expirationTime");
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && Date.now() < (Number(sessionStorage.getItem("expirationTime")) || 0),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
```

## 2. **Game State Management**

### **State Management with React**

The app manages the state of the puzzle game, including user progress, current level, score, losses, and game data. The `useState` and `useReducer` hooks are used for local state management.

#### **Game Data Context (UserGameProvider)**

1. **State Structure**:
   - **gameData**: Stores the current game configuration (e.g., puzzle level, total score, loss count, user email).
   - **incrementLevel**: Function to increase the level of the puzzle, resetting the loss count.
   - **updateTotalScore**: Function to update the total score based on user actions.
   - **resetGameData**: Function to reset the game to its initial state (e.g., when the player opts to restart).
   - **registerLoss**: Function to track losses, and if the player reaches three consecutive losses, the game is reset.
   - **saveGame**: Function to save the current state of the game to **localStorage**, encrypted to persist across sessions.

2. **State Workflow**:
   - The state is initialized from **localStorage** if available. The game data is encrypted and decrypted using `encryptData` and `decryptData` functions respectively before being saved and retrieved.
   - The app ensures that the game data is synced between the UI and the storage, providing persistence across app reloads.

3. **Puzzle Logic**:
   - Each puzzle piece is moved in response to user interaction. The `gameData` state is updated to reflect the new configuration.
   - The game checks if the puzzle is solved after each move and updates the user’s total score accordingly.

**Code Reference**:

```tsx
const UserGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<UserGameData>(() => {
    const savedGameData = localStorage.getItem("userGameData");
    if (!savedGameData) {
      return initialGameData;
    }

    try {
      const decryptedGameData = decryptData(savedGameData);
      const parsedGameData = decryptedGameData ? JSON.parse(decryptedGameData) : {};
      return parsedGameData[userEmail] || initialGameData;
    } catch (error) {
      console.error("Error decrypting game data:", error);
      return initialGameData;
    }
  });

  const updateLocalStorage = useCallback((newGameData: UserGameData) => {
    try {
      const encryptedData = encryptData(JSON.stringify(newGameData));
      localStorage.setItem("userGameData", encryptedData);
    } catch (error) {
      console.error("Error encrypting game data:", error);
    }
  }, []);

  const incrementLevel = useCallback(() => {
    const updatedGameData = { ...gameData, level: gameData.level + 1 };
    setGameData(updatedGameData);
    updateLocalStorage(updatedGameData);
  }, [gameData, updateLocalStorage]);

  return (
    <UserGameContext.Provider value={{ gameData, incrementLevel }}>
      {children}
    </UserGameContext.Provider>
  );
};
```

## 3. **Puzzle Gameplay**

### **Puzzle Shuffling Algorithm**

The puzzle's initial state is randomized using the **Fisher-Yates Shuffle** algorithm, ensuring each puzzle configuration is randomly generated and solvable. The app ensures the shuffled configuration is solvable by checking for inversion counts before finalizing the configuration.

**Shuffling Workflow**:
- The puzzle is shuffled upon initialization or when the user restarts the game.
- The Fisher-Yates algorithm swaps pieces to randomize their order.

### **Game Level and Progression**

The app supports multiple levels of difficulty, with each level increasing the complexity of the puzzle (e.g., moving from a 3x3 puzzle to a 4x4 puzzle). When a player progresses to the next level:
- The puzzle board size increases.
- The loss count is reset, and the game continues.
- The total score is updated, and the player’s progress is saved.

### **Game Reset and Next Level**
The app supports restarting the game or moving to the next level by:
- Resetting the puzzle to its initial state.
- Shuffling the puzzle pieces.
- Updating the state to reflect the new level and score.

**Code Reference for Level Increment**:

```tsx
const incrementLevel = useCallback(() => {
  const updatedGameData = { ...gameData, level: gameData.level + 1, lossCount: 0 };
  setGameData(updatedGameData);
  updateLocalStorage(updatedGameData);
}, [gameData, updateLocalStorage]);
```

## 4. **Leaderboard and Top Players**

### **Leaderboard Management**

The app allows users to see a leaderboard based on their total score. The leaderboard is built using the **TopPlayersContext** to manage and display the top 5 players. Players are sorted by their total score in descending order.

1. **TopPlayersContext**:
   - The leaderboard is updated based on the current player’s total score.
   - The app listens for changes in **localStorage** to reflect updates to the leaderboard in real time.

2. **Leaderboard Workflow**:
   - When a player's score is updated, their new score is added to the leaderboard (stored in **localStorage**).
   - The app updates the leaderboard by decrypting and parsing the game data, sorting the players by their scores, and displaying the top 5 players.

**Code Reference**:

```tsx
const fetchTopPlayers = useCallback(() => {
  const savedGameData = localStorage.getItem("userGameData");
  if (!savedGameData) return;

  const decryptedGameData = decryptData(savedGameData);
  const parsedGameData = decryptedGameData ? JSON.parse(decryptedGameData) : {};
  
 

 const players: PlayerData[] = Object.values(parsedGameData)
    .filter((player: any) => player.email && player.totalScore >= 0)
    .sort((a: PlayerData, b: PlayerData) => b.totalScore - a.totalScore)
    .slice(0, 5);

  setTopPlayers(players);
}, []);
```

## 5. **Performance Optimization**

### **Performance Considerations**
- **Lazy Loading**: For large puzzles, lazy loading is implemented to ensure that puzzle components and assets are only loaded when necessary, reducing the initial load time.
- **Memoization**: The app uses `useMemo` and `useCallback` to memoize expensive operations like sorting the leaderboard and updating the puzzle state, reducing unnecessary re-renders.
- **Efficient Re-renders**: React's built-in hooks and optimizations like `React.memo` ensure that only the necessary components are re-rendered when the state changes.
- **LocalStorage and Caching**: Game data and player progress are cached in **localStorage**, preventing unnecessary recalculations on reloads.

## Conclusion

The Puzzle App is a complex, interactive game built with a focus on performance, scalability, and user experience. With efficient state management through React hooks, localStorage for persistence, and algorithms for shuffling puzzles and managing leaderboard data, the app ensures a smooth and engaging gameplay experience. The app is easily extendable for future features such as multiplayer support, additional puzzle types, and advanced game logic.