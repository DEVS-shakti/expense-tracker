import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { MoveLeft } from "lucide-react";
import { auth, provider } from "../../firebase/firebase";
import "./AuthForm.css";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(userCredential.user, {
        displayName: fullName.trim(),
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/dashboard");
    } catch (firebaseError) {
      setError("Registration failed. Please review your details and try again.");
      console.error("Registration error:", firebaseError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (firebaseError) {
      setError("Google sign-up failed. Please try again.");
      console.error("Google sign-up error:", firebaseError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <p className="auth-tag">ExpenseTrack</p>
          <h1>Create account</h1>
          <p className="auth-brand-copy">
            Build smarter money habits with a clean dashboard and clear spending
            insights.
          </p>
        </div>

        <div className="auth-container">
          <h2>Register</h2>
          <p className="auth-subtitle">Create your account to get started.</p>

          <form className="auth-form" onSubmit={handleRegister}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="Full name"
              required
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
            />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Confirm password"
              required
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (<span className="inline-flex items-center gap-2"><span className="btn-spinner" /> Creating account...</span>) : ("Register")}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Continue with Google"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <div className="auth-back">
            <MoveLeft size={16} />
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

