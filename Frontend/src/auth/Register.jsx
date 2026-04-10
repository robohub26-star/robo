import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Register.css";
import API_BASE_URL from "../config";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if mentor mode is activated via URL parameter
  const queryParams = new URLSearchParams(location.search);
  const isMentorMode =
    queryParams.get("mode") === "mentor" || queryParams.get("admin") === "true";

  const [role, setRole] = useState(null);
  const [showMentorOption, setShowMentorOption] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setTapCount] = useState(0);
  const tapTimerRef = React.useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    extra: "",
    password: "",
    confirmPassword: "",
  });

  const [toast, setToast] = useState({ message: "", type: "", show: false });

  const showNotification = (msg, type) => {
    setToast({ message: msg, type, show: true });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // Handle logo tap detection (5 taps to unlock) - Mobile only
  const handleLogoTap = () => {
    // Check if device is mobile/touch-enabled
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (window.innerWidth <= 768 && window.innerHeight <= 1024);

    if (!isMobile) return; // Only work on mobile devices

    setTapCount((prevCount) => {
      const newCount = prevCount + 1;

      if (newCount === 5) {
        setShowMentorOption(true);
        showNotification("Mentor mode unlocked", "success");
        setTapCount(0);
        return 0;
      }

      // Reset tap count after 2 seconds of inactivity
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);

      return newCount;
    });
  };

  // Secret key combination (Ctrl + Shift + R)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        setShowMentorOption(true);
        showNotification("Mentor registration unlocked", "success");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSecretSubmit = async () => {
    if (!adminSecret.trim()) {
      showNotification("Please enter the admin secret", "error");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      adminSecret: adminSecret.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(data.message, "success");
        setShowSecretModal(false);
        setAdminSecret("");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showNotification(data.message || "Registration failed", "error");
      }
    } catch (error) {
      showNotification("Server connection error. Is Flask running?", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    if (role === "mentor") {
      setShowSecretModal(true);
      return;
    }

    // Student registration
    setIsSubmitting(true);

    const payload = {
      ...formData,
      role: "student",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showNotification(data.message, "success");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showNotification(data.message || "Registration failed", "error");
      }
    } catch (error) {
      showNotification("Server connection error. Is Flask running?", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (toast.show) {
      const toastEl = document.querySelector(".toast");
      if (toastEl) toastEl.classList.add("show");
    }
  }, [toast.show]);

  return (
    <div className="register-page-wrapper">
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      <header className="register-hero-section">
          <nav className="register-nav">
            <div
              className="logo-wrap"
              onClick={handleLogoTap}
              style={{
                cursor: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        ('ontouchstart' in window) ||
                        (window.innerWidth <= 768 && window.innerHeight <= 1024) ? 'pointer' : 'default'
              }}
            >
              <img src="/images/Logo.png" alt="RoboHub Logo" />
            </div>
            <div className="auth-buttons">
              <button className="btn-back-home" onClick={() => navigate("/")}>
                <i className="fas fa-arrow-left"></i> <span>Home</span>
              </button>
            </div>
          </nav>
      </header>

      <section className="register-main-section">
        <div className="register-content-container">
          <h1 className="register-title">Create Your Account</h1>
          <p className="register-subtitle">Join the robotics community today</p>

          <div className="register-card fade-in">
            {!role ? (
              <div className="role-selection-grid">
                <h3 className="role-heading">I want to join as a:</h3>

                {/* Student option - Always visible */}
                <div className="role-option" onClick={() => setRole("student")}>
                  <div className="icon-wrapper">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="role-text">
                    <h4>Student</h4>
                    <p>Take assessments and track scores</p>
                  </div>
                </div>

                {/* Mentor option - Hidden by default, shows with secret combo or URL param */}
                {(showMentorOption || isMentorMode) && (
                  <div
                    className="role-option mentor-option"
                    onClick={() => setRole("mentor")}
                  >
                    <div className="icon-wrapper">
                      <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div className="role-text">
                      <h4>
                        Mentor <span className="admin-badge">Admin</span>
                      </h4>
                      <p>Monitor student progress and scores</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="register-form fade-in">
                <div className="form-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+1 234 567 890"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>
                      {role === "student"
                        ? "Education Level"
                        : "Area of Expertise"}
                    </label>
                    <input
                      type="text"
                      name="extra"
                      placeholder={
                        role === "student"
                          ? "e.g. 3rd Year CS"
                          : "e.g. Robotics Engineer"
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-footer-actions">
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => setRole(null)}
                  >
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button type="submit" className="btn-submit">
                    Create Account
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Admin Secret Modal */}
          {showSecretModal && (
            <div className="secret-modal-overlay">
              <div className="secret-modal">
                <div className="modal-header">
                  <h2>🔐 Admin Secret Required</h2>
                  <button
                    className="modal-close-btn"
                    onClick={() => {
                      setShowSecretModal(false);
                      setAdminSecret("");
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-content">
                  <p className="modal-description">
                    Enter the admin secret code to complete mentor registration.
                  </p>

                  <div className="secret-input-group">
                    <label htmlFor="secret-input">Admin Secret</label>
                    <input
                      id="secret-input"
                      type="password"
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      placeholder="Enter admin secret..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSecretSubmit();
                      }}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowSecretModal(false);
                      setAdminSecret("");
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-confirm"
                    onClick={handleSecretSubmit}
                    disabled={isSubmitting || !adminSecret.trim()}
                  >
                    {isSubmitting ? "Verifying..." : "Verify Secret"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="register-footer-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </section>
    </div>
  );
}
