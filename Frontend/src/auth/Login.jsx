import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";

// 1. Added setToken as a prop
export default function Login({ setToken }) {
  const navigate = useNavigate();

  // Role state is removed from UI, we will just send "student" automatically
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. Added role: "student" to the payload so the Python backend accepts it
    const payload = { role: "student", email: email.trim(), password };

    try {
      // 3. Fixed URL to point to port 5000 and /api/login
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend returned HTTP error
        setToast({ message: data.message || "Login failed", type: "error" });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      if (data.token) {
        // Show success toast
        setToast({
          message: `Welcome back, ${data.fullName || "Student"}!`,
          type: "success",
        });
        setShowToast(true);

        // 4. ADDED ALL THE TOKEN & SESSION LOGIC HERE
        if (setToken) setToken(data.token);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role || "student");
        
        if (data.fullName) {
          sessionStorage.setItem("fullName", data.fullName);
        }
        
        // Also keep localStorage just in case your quizzes need it
        localStorage.setItem("user", JSON.stringify(data));

        // 5. Redirect directly to the student dashboard after a short delay
        setTimeout(() => {
          setShowToast(false);
          navigate("/dashboard/student"); 
        }, 1500);

      } else {
        setToast({ message: "Login failed: No token received", type: "error" });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }

    } catch (error) {
      console.error("Login error:", error);
      setToast({
        message: "Server error. Is the Python backend running?",
        type: "error",
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Effect to toggle show class for sliding animation
  useEffect(() => {
    if (showToast) {
      const toastEl = document.querySelector(".toast");
      if (toastEl) toastEl.classList.add("show");
    }
  }, [showToast]);

  return (
    <div className="login-page-wrapper">
      {/* Toast Notification */}
      {showToast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Mini Navbar just for Login Page */}
      <header className="login-hero-section">
        <div className="login-container">
          <nav className="login-nav">
            <div className="logo-wrap">
              <img src="/images/Logo.png" alt="RoboHub Logo" />
            </div>
            <div className="auth-buttons">
              <button
                className="btn-back-home"
                onClick={() => navigate("/")}
              >
                <i className="fas fa-arrow-left"></i> Home
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Login Section */}
      <section className="login-main-section">
        <div className="login-content-container">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Log in to continue your robotics journey
          </p>

          <div className="login-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="login-submit-button">
                Log In
              </button>
            </form>
          </div>

          <p className="login-footer-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>
      </section>
    </div>
  );
}