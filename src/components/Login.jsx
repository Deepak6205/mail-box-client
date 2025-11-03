import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../configure/firebase";
import "../style/SignUp.css"; 
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

    
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("authToken", token);

      console.log("User logged in successfully:", userCredential.user.email);
      setLoggedIn(true);
    } catch (err) {
      console.error("Login error:", err.message);
      alert("Invalid email or password. Please try again.");
      setError("Invalid credentials");
    }
  };

  if (loggedIn) {
    return (
      <div className="welcome-screen">
        <h2>Welcome to your mail box</h2>
      </div>
    );
  }

  return (
    <div className="signup-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ width: "400px" }}>
        <h3 className="mb-3 text-center">Login to MailBox</h3>

        <form onSubmit={handleLogin}>
          
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          
          {error && <div className="text-danger mb-2">{error}</div>}

          
          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-lg">
              Login
            </button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
