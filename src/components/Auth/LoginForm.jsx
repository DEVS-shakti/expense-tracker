import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { MoveLeft } from "lucide-react";
import { auth, provider } from "../../firebase/auth";
import "./AuthForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      navigate("/dashboard");
    } catch (firebaseError) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", firebaseError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (firebaseError) {
      setError("Google sign-in failed. Please try again.");
      console.error("Google sign-in error:", firebaseError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <p className="auth-tag">ExpenseTrack</p>
          <h1>Welcome back</h1>
          <p className="auth-brand-copy">
            Sign in to continue managing budgets, transactions, and insights in
            one place.
          </p>
        </div>

        <div className="auth-container">
          <h2>Login</h2>
          <p className="auth-subtitle">Use your email and password to continue.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
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

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (<span className="inline-flex items-center gap-2"><span className="btn-spinner" /> Signing in...</span>) : ("Login")}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait..." : "Continue with Google"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
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

export default LoginForm;


