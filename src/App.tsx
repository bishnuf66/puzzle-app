import { ToastContainer } from "react-toastify";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import "react-toastify/dist/ReactToastify.css";
import PuzzleGame from "./components/PuzzleGame";
import DashBoard from "./components/DashBoard";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/game" element={<PuzzleGame />} />
            <Route path="/dashboard" element={<DashBoard />} />
          </Routes>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </>
  );
}

export default App;
