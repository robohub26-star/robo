import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Dashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [completedDays, setCompletedDays] = useState(0);
  const [testsPassed, setTestsPassed] = useState(0);
  const [averageScore, setAverageScore] = useState("0%");
  const [progress, setProgress] = useState({});
  const [fullName, setFullName] = useState(
    sessionStorage.getItem("fullName") || "Student"
  );

  useEffect(() => {
    // fetch function so we can call it on mount and on progressUpdate events
    const fetchProgressData = async () => {
      const authToken = sessionStorage.getItem("token") || token;

      if (!authToken) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/progress/progress", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          navigate("/login");
          return;
        }

        const data = await res.json();

        setProgress(data.progress || {});
        setCompletedDays(data.completedDays || 0);
        setTestsPassed(data.testsPassed || 0);
        setAverageScore(data.averageScore || "0%");
        // Only update fullName if backend returned one; otherwise keep stored value
        if (data.fullName) setFullName(data.fullName);
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    // initial load
    fetchProgressData();

    // Listen for updates triggered elsewhere (e.g., after completing a test)
    const handler = () => fetchProgressData();
    window.addEventListener("progressUpdate", handler);
    return () => window.removeEventListener("progressUpdate", handler);
  }, [navigate, token]); // token included in dependency array

  return (
    <div className="dashboard-page-wrapper">

      {/* Navbar */}
      {/* 2. Renamed all header classes so App.css doesn't break them */}
      <div className="dashboard-header-wrapper">
        <header className="dashboard-header">
          <div className="dashboard-nav-container">
            <nav className="dashboard-nav">
              <div className="logo-wrap">
                <img src="/images/Logo.png" alt="RoboHub Logo" />
              </div>
              <div className="dashboard-auth-buttons">
                <span className="student-name">{fullName}</span>
                <button
                  className="button-secondary"
                  onClick={async () => {
                    const authToken = sessionStorage.getItem("token") || token;

                    if (authToken) {
                      try {
                        await fetch("http://localhost:5000/api/logout", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                          },
                        });
                      } catch (err) {
                        console.error("Logout API failed:", err);
                      }
                    }

                    setToken(null);
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("fullName");
                    sessionStorage.removeItem("role");
                    navigate("/");
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-container">
        <h1 className="dashboard-title">Student Dashboard</h1>
        <p className="dashboard-subtitle">
          Track your progress and continue learning
        </p>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <i className="fas fa-book stat-icon"></i>
            <div className="stat-text">
              <h2>1</h2>
              <p>Enrolled Courses</p>
            </div>
          </div>

          <div className="stat-card green">
            <i className="fas fa-trophy stat-icon"></i>
            <div className="stat-text">
              <h2>{testsPassed}</h2>
              <p>Tests Completed</p>
            </div>
          </div>

          <div className="stat-card purple">
            <i className="fas fa-award stat-icon"></i>
            <div className="stat-text">
              <h2>
                {averageScore}
                {/* <small>(out of {MAX_SCORE_PER_DAY})</small> */}
              </h2>
              <p>Average Score</p>
            </div>
          </div>

          <div className="stat-card orange">
            <i className="fas fa-bolt stat-icon"></i>
            <div className="stat-text">
              <div style={{ maxHeight: "70px", overflowY: "auto" }}>
                {Object.entries(progress).map(([day, info]) => (
                  <div
                    key={day}
                    style={{ display: "inline-block", width: "100%" }}
                  >
                    <h3
                      style={{ display: "inline-block", marginRight: "20px" }}
                    >
                      Day {day}:
                    </h3>
                    <div
                      style={{
                        display: "inline-block",
                        position: "relative",
                        top: "8px",
                      }}
                    >
                      <p>Status: {info.completed ? "Completed" : "Pending"}</p>
                      <p>Score: {info.completed ? `${info.score}` : "-"}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p>Daily Score</p>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <h2 className="section-title">My Courses</h2>
        <div className="course-card">
          <span className="badge">In Progress</span>
          <h3>5G Technology Training</h3>
          <p>
            5-day comprehensive training on 5G networks, architecture, and
            implementation
          </p>

          <div className="progress-section">
            <div className="progress-labels">
              <span>Progress</span>
              <span>{completedDays} of 5 days</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedDays / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <button
            className="primary-btn"
            onClick={() => navigate("/courses/5g-training")}
          >
            Start Learning →
          </button>
        </div>
      </div>
    </div>
  );
}
