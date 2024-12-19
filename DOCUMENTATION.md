## Overview

The Puzzle App is a full-fledged game application that includes user authentication, game state management, puzzle gameplay mechanics, and a leaderboard. The app allows users to log in, play a draga and drop puzzle game, track their progress, and view the leaderboard. The app uses modern web technologies such as **React**, **localStorage**, and **Context API** for state management.

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
   - The sign-up logic could be extended to store more details in localStorage (such as email and password) for persistent storage across sessions.

3. **Authentication Context (AuthProvider)**:
   - The `AuthProvider` component manages the authentication state, including the current user, loading state, and login/logout functionality.
   - The `useAuth` custom hook allows other components to access authentication data and perform login/logout actions.

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

## 3. **Puzzle Gameplay**

**Shuffling Workflow**:

- The puzzle is shuffled upon initialization or when the user restarts the game and swaps pieces to randomize their order.

### **Game Level and Progression**

The app supports multiple levels of difficulty, with each level increasing the complexity of the puzzle (e.g., moving from a 2x2 puzzle to a 3x3 puzzle). When a player progresses to the next level:

- The puzzle board size increases.
- The loss count is reset, and the game continues.
- The total score is updated, and the player’s progress is saved.

### **Game Reset and Next Level**

The app supports restarting the game or moving to the next level by:

- Resetting the puzzle to its initial state.
- Shuffling the puzzle pieces.
- Updating the state to reflect the new level and score.

## 4. **Leaderboard and Top Players**

### **Leaderboard Management**

The app allows users to see a leaderboard based on their total score. The leaderboard is built using the **TopPlayersContext** to manage and display the top 5 players. Players are sorted by their total score in descending order.

1. **TopPlayersContext**:

   - The leaderboard is updated based on the current player’s total score and the top 5 players with highest score are shown in leaderboard.

2. **Leaderboard Workflow**:
   - When a player's score is updated, their new score is added to the leaderboard (stored in users game data **localStorage**).
   - The app updates the leaderboard by decrypting and parsing the game data, sorting the players by their scores, and displaying the top 5 players.

## Conclusion

The Puzzle App is a complex, interactive game built with a focus on performance, scalability, and user experience. With efficient state management through React hooks, localStorage for persistence, and algorithms for shuffling puzzles and managing leaderboard data, the app ensures a smooth and engaging gameplay experience. The app is easily extendable for future features such as multiplayer support, additional puzzle types, and advanced game logic.
