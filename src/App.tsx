import { ToastContainer } from "react-toastify";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import "react-toastify/dist/ReactToastify.css";
import PuzzleGame from "./components/PuzzleGame";
import DashBoard from "./components/DashBoard";
import { AuthProvider } from "./context/AuthContext";
import { UserGameProvider } from "./context/GameDataContext";
import { TopPlayersProvider } from "./context/TopPlayersContext";
import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute component
import PerformanceStats from "./components/PerformanceStats";

function App() {
  return (
    <>
      <PerformanceStats />
      <TopPlayersProvider>
        <UserGameProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Route */}
                <Route path="/" element={<Login />} />

                {/* Protected Routes */}
                <Route
                  path="/game"
                  element={<PrivateRoute element={<PuzzleGame />} />}
                />
                <Route
                  path="/dashboard"
                  element={<PrivateRoute element={<DashBoard />} />}
                />
              </Routes>
            </Router>
            <ToastContainer />
          </AuthProvider>
        </UserGameProvider>
      </TopPlayersProvider>
    </>
  );
}

export default App;
