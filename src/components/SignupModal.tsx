import { useState } from "react";
import { encryptData, decryptData } from "../lib/encryption";
import { toast } from "react-toastify";

const SignupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Handle user signup
  const handleSignup = (email: string, password: string) => {
    // Retrieve the users array from localStorage to check if user aleready exist
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = users.some((user: { email: string }) => {
      const decryptedEmail = decryptData(user.email);
      return decryptedEmail === email;
    });
    if (userExists) {
      toast.error("User already exists!");
      return;
    }
    const encryptedEmail = encryptData(email);
    const encryptedPassword = encryptData(password);
    const newUser = { email: encryptedEmail, password: encryptedPassword };
    users.push(newUser);

    //Add new user and store the updated users array in localStorage
    localStorage.setItem("users", JSON.stringify(users));
    toast.success("Signup successful! You can now log in.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
          onClick={() => handleSignup(signupEmail, signupPassword)}
        >
          Sign Up
        </button>
        <button className="mt-4 text-gray-600 underline" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
