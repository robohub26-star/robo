import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";

export default function Login({ setToken }) {
  const navigate = useNavigate();

  // NEW: Added role and fullName states
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NEW: Dynamically change the payload based on the selected role
    const payload =
      role === "student"
        ? { role: "student", email: email.trim(), password }
        : { role: "mentor", fullName: fullName.trim(), password };

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || "Login failed", type: "error" });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }

      if (data.token) {
        // NEW: Update welcome message to handle mentor or student
        setToast({
          message: `Welcome back, ${data.fullName || (role === "student" ? "Student" : "Mentor")}!`,
          type: "success",
        });
        setShowToast(true);

        if (setToken) setToken(data.token);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role || role); // NEW: Save the correct role
        
        if (data.fullName) {
          sessionStorage.setItem("fullName", data.fullName);
        }
        
        localStorage.setItem("user", JSON.stringify(data));

        // NEW: Redirect dynamically based on the role
        setTimeout(() => {
          setShowToast(false);
          if (data.role === "mentor" || role === "mentor") {
            navigate("/dashboard/mentor");
          } else {
            navigate("/dashboard/student"); 
          }
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
            
            {/* NEW: Added Role Selection Toggle */}
            <div className="role-selection">
              <button
                type="button"
                className={`role-toggle-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${role === "mentor" ? "active" : ""}`}
                onClick={() => setRole("mentor")}
              >
                Mentor
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* NEW: Conditional Field Rendering */}
              {role === "student" ? (
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
              ) : (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

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
            <span onClick={() => navigate("/register")} style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}>Sign up</span>
          </p>
        </div>
      </section>
    </div>
  );
}