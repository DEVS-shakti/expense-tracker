import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase";
import "./AuthForm.css";
import { MoveLeft } from "lucide-react";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Registered with Google!");
      // You can navigate or set user context here
    } catch (error) {
      console.error("Google sign-up error", error);
      alert("Google sign-up failed");
    }
  };
  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, Email, Password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User registered:", user);
        alert("Registration successful!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Registration error:", errorCode, errorMessage);
        alert("Registration failed");
      });
    setEmail("");
    setPassword("");
    navigate("/dashboard");
  };
  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleRegister}>
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
        <button type="submit">Register</button>
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignUp}
        >
          Sign up with Google
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
      <div className="w-fit h-fit flex items-center text-sm justify-evenly">
        <MoveLeft className="text-blue-500 text-sm mr-1" />
        <Link to="/"> Back to Home.</Link>
      </div>
    </div>
  );
};

export default RegisterForm;
