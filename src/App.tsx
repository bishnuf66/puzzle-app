import { ToastContainer } from "react-toastify";
import "./App.css";
import Login from "./components/Login";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <Login />
      <ToastContainer />
    </div>
  );
}

export default App;
