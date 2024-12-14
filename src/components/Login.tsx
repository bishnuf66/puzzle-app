import { useState } from "react";
import { decryptData } from "../lib/encryption";
import SignupModal from "./SignupModal";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Handle user login
  const handleLogin = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Find the user by comparing the decrypted email and password
    const user = users.find((user: { email: string; password: string }) => {
      const decryptedEmail = decryptData(user.email);
      const decryptedPassword = decryptData(user.password);
      return decryptedEmail === email && decryptedPassword === password;
    });

    if (user) {
      toast.success("Login successful!");
      console.log("Logged in as", email);
    } else {
      toast.error("Invalid credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
          onClick={() => handleLogin(loginEmail, loginPassword)}
        >
          Log In
        </button>

        <div
          className="text-blue-400 cursor-pointer mt-4"
          onClick={() => setShowSignupModal(true)} // Fixed this line
        >
          Don't have an account? Sign up
        </div>
      </div>
      {showSignupModal && (
        <SignupModal onClose={() => setShowSignupModal(false)} />
      )}{" "}
    </div>
  );
};

export default Login;
