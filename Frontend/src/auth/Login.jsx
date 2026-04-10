import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";
import API_BASE_URL from "../config";

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isMentorMode =
    queryParams.get("mode") === "mentor" || queryParams.get("admin") === "true";

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showMentorToggle, setShowMentorToggle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setTapCount] = useState(0);
  const tapTimerRef = React.useRef(null);

  const [toast, setToast] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);

  const isMobileDevice = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    "ontouchstart" in window ||
    (window.innerWidth <= 768 && window.innerHeight <= 1024);

  const showNotification = (message, type, duration = 3000) => {
    setToast({ message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  const handleLogoTap = () => {
    if (!isMobileDevice()) return;

    setTapCount((prevCount) => {
      const newCount = prevCount + 1;

      if (newCount === 5) {
        setShowMentorToggle(true);
        showNotification("Mentor mode unlocked", "success", 2000);
        return 0;
      }

      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => setTapCount(0), 2000);

      return newCount;
    });
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "X") {
        setShowMentorToggle(true);
        showNotification("Mentor mode activated", "success", 2000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload =
      role === "student"
        ? { role: "student", email: email.trim(), password }
        : { role: "mentor", fullName: fullName.trim(), password };

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.message || "Login failed", "error");
        return;
      }

      if (data.token) {
        showNotification(
          `Welcome back, ${data.fullName || (role === "student" ? "Student" : "Mentor")}!`,
          "success"
        );

        if (setToken) setToken(data.token);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role || role);
        if (data.fullName) sessionStorage.setItem("fullName", data.fullName);
        localStorage.setItem("user", JSON.stringify(data));

        setTimeout(() => {
          setShowToast(false);
          if (data.role === "mentor" || role === "mentor") {
            navigate("/dashboard/mentor");
          } else {
            navigate("/dashboard/student");
          }
        }, 1500);
      } else {
        showNotification("Login failed: No token received", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification("Server error. Is the Python backend running?", "error");
    } finally {
      setIsSubmitting(false);
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
      {showToast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      <header className="login-hero-section">
        <nav className="login-nav">
          <div
            className="logo-wrap"
            onClick={handleLogoTap}
            style={{ cursor: isMobileDevice() ? "pointer" : "default" }}
          >
            <img src="/images/Logo.png" alt="RoboHub Logo" />
          </div>
          <div className="auth-buttons">
            <button className="btn-back-home" onClick={() => navigate("/")}>
              <i className="fas fa-arrow-left"></i>
              <span>Home</span>
            </button>
          </div>
        </nav>
      </header>

      <section className="login-main-section">
        <div className="login-content-container">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Log in to continue your robotics journey
          </p>

          <div className="login-card">
            {(showMentorToggle || isMentorMode) && (
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
                  Mentor 👨‍🏫
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {role === "student" ? (
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
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
                    autoComplete="name"
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
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="login-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>

          <p className="login-footer-text">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>
      </section>
    </div>
  );
}