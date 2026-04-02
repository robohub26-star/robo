import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    extra: "",
    password: "",
    confirmPassword: ""
  });

  const [toast, setToast] = useState({ message: "", type: "", show: false });

  const showNotification = (msg, type) => {
    setToast({ message: msg, type, show: true });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    try {
      // 1. FIXED THE ROUTE: Changed to port 5000 and added /api/register
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2. FIXED THE ROLE: Hardcoded role as "student" since we removed the Mentor option
        body: JSON.stringify({ 
          ...formData, 
          role: "student" 
        }),
      });

      if (res.ok) {
        showNotification("Account created successfully!", "success");
        // Wait 2 seconds, then jump to the login page
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const errorData = await res.json();
        showNotification(errorData.message || "Registration failed", "error");
      }
    } catch (error) {
      showNotification("Server connection error. Is Flask running?", "error");
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
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Mini Navbar to match Login page */}
      <header className="register-hero-section">
        <div className="register-container">
          <nav className="register-nav">
            <div className="register-logo" onClick={() => navigate("/")} style={{cursor: 'pointer'}}>
              RoboHub
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

      {/* Main Content */}
      <section className="register-main-section">
        <div className="register-content-container">
          <h1 className="register-title">Create Your Account</h1>
          <p className="register-subtitle">
            Join the robotics community today
          </p>

          <div className="register-card fade-in">
            {!role ? (
              <div className="role-selection-grid">
                <h3 className="role-heading">I want to join as a:</h3>
                <div className="role-option" onClick={() => setRole("student")}>
                  <div className="icon-wrapper">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="role-text">
                    <h4>Student</h4>
                    <p>Take assessments and track scores</p>
                  </div>
                </div>
                <div className="role-option" onClick={() => setRole("mentor")}>
                  <div className="icon-wrapper">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div className="role-text">
                    <h4>Mentor</h4>
                    <p>Monitor student progress and scores</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="register-form fade-in">
                <div className="form-row">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" placeholder="John Doe" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="name@example.com" onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" placeholder="+1 234 567 890" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>{role === "student" ? "Education Level" : "Area of Expertise"}</label>
                    <input type="text" name="extra" placeholder={role === "student" ? "e.g. 3rd Year CS" : "e.g. Robotics Engineer"} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-footer-actions">
                  <button type="button" className="btn-back" onClick={() => setRole(null)}>
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button type="submit" className="btn-submit">Create Account</button>
                </div>
              </form>
            )}
          </div>

          <p className="register-footer-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </section>
    </div>
  );
}