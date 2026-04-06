import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Training.css";

export default function Training() {
  const navigate = useNavigate();

  // Initialize the progress state dynamically for 3 days
  const [progress, setProgress] = useState({
    dayCompleted: 0,
    totalDays: 3,
  });

  // Score card modal state
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [scoreData, setScoreData] = useState({
    day1Score: 0,
    day2Score: 0,
    day3Score: 0,
    averageScore: 0,
    totalScore: 0,
  });

  // Use token stored in sessionStorage (set at login)
  const fetchProgress = useCallback(async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.warn("token missing, redirecting to login");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/progress/progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        // Unauthorized - send user to login
        navigate("/login");
        return;
      }

      const data = await res.json();

      // Backend returns completedDays; update UI accordingly
      setProgress({
        dayCompleted: data.completedDays || 0,
        totalDays: 3,
      });

      // Extract scores from individual days
      const daysData = data.progress || {};
      const scores = {
        day1Score: daysData["1"]?.score || 0,
        day2Score: daysData["2"]?.score || 0,
        day3Score: daysData["3"]?.score || 0,
        averageScore: parseInt(data.averageScore) || 0,
        totalScore: 0,
      };

      // Calculate total score (sum of all completed days)
      scores.totalScore = scores.day1Score + scores.day2Score + scores.day3Score;

      setScoreData(scores);
    } catch (err) {
      console.error("Failed to load progress", err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Re-fetch when progress is updated elsewhere in the app
  useEffect(() => {
    const handler = () => fetchProgress();
    window.addEventListener("progressUpdate", handler);
    return () => window.removeEventListener("progressUpdate", handler);
  }, [fetchProgress]);

  // Function to handle day click: only navigate, do NOT mark complete
  const handleDayClick = (day) => {
    if (day <= progress.dayCompleted + 1) {
      navigate(`/courses/5g-training/day${day}`);
    }
  };

  return (
    <div className="training-page">
      {/* Navbar - matches Dashboard style */}
      <div className="dashboard-header-wrapper">
        <header className="dashboard-header">
          <div className="dashboard-nav-container">
            <nav className="dashboard-nav">
              <div className="logo-wrap">
                <img src="/images/Logo.png" alt="RoboHub Logo" />
              </div>
              <div className="dashboard-auth-buttons">
                <button
                  className="button-secondary"
                  onClick={() => navigate("/dashboard/student")}
                >
                  <i className="fas fa-arrow-left"></i> Dashboard
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* Training Module Content */}
      <div className="training-container">
        <h1 className="training-title">ROS 2 <span>Training</span> </h1>
        <p className="training-subtitle">
          Complete each day to unlock the next module
        </p>

        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div
              className="progress-fill"
              style={{
                width: `${(progress.dayCompleted / progress.totalDays) * 100}%`,
              }}
            ></div>
          </div>
          <span className="progress-text">
            {Math.round((progress.dayCompleted / progress.totalDays) * 100)}%
            Complete
          </span>
        </div>

        {/* Days list */}
        <div className="days-list">
          {/* Day 1 */}
          <div
            className={`day-item ${progress.dayCompleted >= 1 ? "completed" : ""
              } ${progress.dayCompleted === 0 ? "clickable" : "locked"}`}
            onClick={() => handleDayClick(1)}
          >
            <div className="day-icon">
              {progress.dayCompleted >= 1 ? (
                <i className="fas fa-check-circle"></i>
              ) : (
                <div className="circle" />
              )}
            </div>
            <div className="day-info">
              <strong>Day 1: Foundation of ROS2: Core Architecture, Communication, and Basic Control</strong>
              <p>
                {progress.dayCompleted >= 1 ? "Completed" : "Ready to start"}
              </p>
            </div>
            {progress.dayCompleted < 1 && (
              <i className="fas fa-lock lock-icon"></i>
            )}
            {progress.dayCompleted === 0 && (
              <button
                className="start-day-btn"
                onClick={() => handleDayClick(1)}
              >
                Start Day
              </button>
            )}
            {progress.dayCompleted >= 1 && (
              <span className="completed-label"></span>
            )}
          </div>

          {/* Day 2 and 3 - locked or clickable */}
          {[2, 3].map((day) => (
            <div
              key={day}
              className={`day-item ${progress.dayCompleted >= day ? "completed" : ""
                } ${day === progress.dayCompleted + 1 ? "clickable" : "locked"}`}
              onClick={() =>
                day === progress.dayCompleted + 1 ? handleDayClick(day) : null
              }
            >
              <div className="day-icon">
                {progress.dayCompleted >= day ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <div className="circle" />
                )}
              </div>
              <div className="day-info">
                <strong>
                  {`Day ${day}: ${{
                    2: "Virtualizing the Robot: Transform Frames, URDF Modeling, and Simulation",
                    3: "Autonomy in Action: Mapping (SLAM), Navigation, and Remote Deployment"
                  }[day]
                    }`}
                </strong>
                <p>
                  {progress.dayCompleted >= day
                    ? "Completed"
                    : "Locked - Complete previous day first"}
                </p>
              </div>
              {day !== progress.dayCompleted + 1 && (
                <i className="fas fa-lock lock-icon"></i>
              )}
              {day === progress.dayCompleted + 1 && (
                <button
                  className="start-day-btn"
                  onClick={() => handleDayClick(day)}
                >
                  Start Day
                </button>
              )}
            </div>
          ))}

          {/* Course Score Card */}
          <div className="final-assessment">
            <h3>
              <i className="fas fa-trophy"></i>{" "}
              <span className="final-assessment-title">Course Score Card</span>
            </h3>
            <p className="final-assessment-desc">
              Complete all 3 days to unlock your final course score card
            </p>
            <button
              className={progress.dayCompleted === progress.totalDays ? "complete-attempted" : "complete-locked"}
              disabled={progress.dayCompleted < progress.totalDays}
              onClick={() => {
                if (progress.dayCompleted === progress.totalDays) {
                  // Open score card modal instead of navigating
                  setShowScoreCard(true);
                }
              }}
              style={{
                cursor:
                  progress.dayCompleted === progress.totalDays
                    ? "pointer"
                    : "not-allowed",
                // Overriding the gray style dynamically if unlocked
                background: progress.dayCompleted === progress.totalDays ? "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)" : "",
                opacity: progress.dayCompleted === progress.totalDays ? "1" : "",
                boxShadow: progress.dayCompleted === progress.totalDays ? "0 4px 16px rgba(0, 87, 255, 0.3)" : ""
              }}
            >
              {progress.dayCompleted === progress.totalDays ? (
                <>
                  <i
                    className="fas fa-chart-bar finish-icon"
                    style={{ marginRight: "8px", color: "white" }}
                  ></i>
                  <span style={{ color: "white" }}>View Score Card</span>
                </>
              ) : (
                <>
                  <i
                    className="fas fa-lock finish-icon"
                    style={{ marginRight: "8px" }}
                  ></i>
                  Complete All 3 Days First ({progress.dayCompleted}/
                  {progress.totalDays} completed)
                </>
              )}
            </button>
          </div>

        </div>

        {/* Score Card Modal */}
        {showScoreCard && (
          <div className="modal-overlay" onClick={() => setShowScoreCard(false)}>
            <div className="score-card-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                onClick={() => setShowScoreCard(false)}
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="score-card-header">
                <i className="fas fa-trophy score-icon"></i>
                <h2>Course Completion Summary</h2>
                <p>ROS 2 Training - All Days Combined</p>
              </div>

              <div className="score-card-content">
                {/* Individual Day Scores */}
                <div className="day-scores-grid">
                  <div className="day-score-card">
                    <h4>Day 1</h4>
                    <div className="score-circle">
                      <span className="score-value">{scoreData.day1Score}</span>
                      <span className="score-unit">%</span>
                    </div>
                    <p className="score-label">Foundation of ROS2</p>
                  </div>

                  <div className="day-score-card">
                    <h4>Day 2</h4>
                    <div className="score-circle">
                      <span className="score-value">{scoreData.day2Score}</span>
                      <span className="score-unit">%</span>
                    </div>
                    <p className="score-label">Virtualizing the Robot</p>
                  </div>

                  <div className="day-score-card">
                    <h4>Day 3</h4>
                    <div className="score-circle">
                      <span className="score-value">{scoreData.day3Score}</span>
                      <span className="score-unit">%</span>
                    </div>
                    <p className="score-label">Autonomy in Action</p>
                  </div>
                </div>

                {/* Cumulative Statistics */}
                <div className="cumulative-stats">
                  <div className="stat-item">
                    <label>Average Score</label>
                    <div className="stat-value">{scoreData.averageScore}%</div>
                  </div>

                  <div className="stat-item">
                    <label>Total Points</label>
                    <div className="stat-value">{scoreData.totalScore}</div>
                  </div>

                  <div className="stat-item">
                    <label>Completion Status</label>
                    <div className="stat-value">
                      <span className="status-badge">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Performance Feedback */}
                <div className="performance-feedback">
                  {scoreData.averageScore >= 80 && (
                    <div className="feedback excellent">
                      <i className="fas fa-star"></i>
                      <p>Excellent! You've mastered the ROS 2 training course!</p>
                    </div>
                  )}
                  {scoreData.averageScore >= 60 && scoreData.averageScore < 80 && (
                    <div className="feedback good">
                      <i className="fas fa-thumbs-up"></i>
                      <p>Great job! You have a solid understanding of ROS 2 concepts.</p>
                    </div>
                  )}
                  {scoreData.averageScore < 60 && scoreData.averageScore > 0 && (
                    <div className="feedback fair">
                      <i className="fas fa-lightbulb"></i>
                      <p>Good effort! Keep practicing to master the concepts.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="score-card-actions">
                <button
                  className="action-btn secondary-btn"
                  onClick={() => setShowScoreCard(false)}
                >
                  Close
                </button>
                <button
                  className="action-btn primary-btn"
                  onClick={() => {
                    setShowScoreCard(false);
                    navigate("/dashboard/student");
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}