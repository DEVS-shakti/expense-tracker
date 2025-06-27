import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import "./AuthForm.css";
import { MoveLeft, MoveLeftIcon } from "lucide-react";

const LoginForm = () => {
  const navigate = useNavigate();
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, Email, Password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User logged in:", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        alert("Login failed");
      });
    setEmail("");
    setPassword("");
    navigate("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Logged in with Google!");
      // You can navigate or set user context here
    } catch (error) {
      console.error("Google sign-in error", error);
      alert("Google sign-in failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          value={Email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        <input
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </button>
      </form>
      <p>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
      <div className="w-fit h-fit flex items-center text-sm justify-evenly">
        <MoveLeft className="text-blue-500 text-sm mr-1" />  
        <Link to="/"> Back to Home.</Link>
      </div>
    </div>
  );
};

export default LoginForm;
