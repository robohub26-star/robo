import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Dashboard.css";

export default function MentorDashboard() {
  const navigate = useNavigate();

  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [fullName, setFullName] = useState(
    sessionStorage.getItem("fullName") || "Mentor"
  );

  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [testsReviewed, setTestsReviewed] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [students, setStudents] = useState([]);
  const [attemptsOpen, setAttemptsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchMentorDashboardData = async () => {
      const authToken = sessionStorage.getItem("token") || token;

      if (!authToken) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/mentor/dashboard", {
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

        setTotalCourses(data.totalCourses || 1);
        setTotalStudents(data.totalStudents || 0);
        setTestsReviewed(data.testsReviewed || 0);
        setActiveStudents(data.activeStudents || 0);
        setStudents(data.students || []);

        if (data.fullName) setFullName(data.fullName);
      } catch (err) {
        console.error("Failed to fetch mentor dashboard:", err);
      }
    };

    fetchMentorDashboardData();

    // 🔹 Poll every 15 seconds
    const intervalId = setInterval(fetchMentorDashboardData, 15000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [navigate, token]);

  const viewAttempts = async (student) => {
    const authToken = sessionStorage.getItem("token") || token;
    // Normalize day: incoming rows sometimes have values like "Day 1" or numeric
    const rawDay = student.lastDay || student.last_day || student.last || "1";
    let day = "1";
    if (typeof rawDay === "string") {
      const m = rawDay.match(/\d+/);
      day = m ? m[0] : rawDay;
    } else if (typeof rawDay === "number") {
      day = String(rawDay);
    }

    // Try a few common places the student id might appear
    const extractId = (s) => {
      if (!s) return null;
      if (typeof s === "string") return s;
      if (s._id && typeof s._id === "string") return s._id;
      if (s._id && s._id.$oid) return s._id.$oid; // some APIs return { _id: { $oid: "..." } }
      if (s.id && typeof s.id === "string") return s.id;
      if (s.userId && typeof s.userId === "string") return s.userId;
      if (s.user && s.user._id && typeof s.user._id === "string") return s.user._id;
      if (s.user && s.user._id && s.user._id.$oid) return s.user._id.$oid;
      // fallback: try to stringify a plain ObjectId-like value
      try {
        if (s._id && typeof s._id === "object" && s._id.toString) return s._id.toString();
      } catch (e) {}
      return null;
    };

    const id = extractId(student);
    // If no id, we'll attempt to fetch progress by email and allow day selection
    if (!id) {
      if (student && student.email) {
        try {
          const res = await fetch(`http://localhost:5000/progress/by-email/${encodeURIComponent(student.email)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });

          if (res.status === 401 || res.status === 403) {
            alert("Not authorized to view attempts");
            return;
          }

          const data = await res.json();
          if (!data.success) {
            alert(data.message || "Failed to load progress by email");
            return;
          }

          const daysObj = data.days || {};
          const days = Object.keys(daysObj).sort((a,b)=> Number(a)-Number(b));
          setAvailableDays(days);
          const defaultDay = days.length ? days[days.length-1] : day;
          setSelectedDay(defaultDay);
          setSelectedStudent(student);
          // fetch attempts for the default day using by-email attempts endpoint
          try {
            const r2 = await fetch(`http://localhost:5000/progress/attempts/by-email/${encodeURIComponent(student.email)}/${defaultDay}`, {
              method: "GET",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
            });
            const d2 = await r2.json();
            setAttemptData(d2);
            setAttemptsOpen(true);
          } catch (err2) {
            console.error("Failed fetching attempts by email for default day:", err2);
            setAttemptData({ mcq: [], theory: [] });
            setAttemptsOpen(true);
          }

          return;
        } catch (err) {
          console.error("Email progress lookup failed:", err, student);
          alert("Failed to lookup progress by email. Check console.");
          return;
        }
      }

      console.warn("Unable to determine student id for row:", student);
      alert("Student id not available for this row. Check console for the student object to debug.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/progress/attempts/${id}/${day}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        alert("Not authorized to view attempts");
        return;
      }

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to load attempts");
        return;
      }

      // Determine available days by fetching full progress (so mentor can switch days)
      try {
        const p = await fetch(`http://localhost:5000/progress/${id}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        const pjson = await p.json();
        const daysObj = pjson.progress || {};
        const days = Object.keys(daysObj).sort((a,b)=> Number(a)-Number(b));
        setAvailableDays(days);
        const defaultDay = days.length ? days[days.length-1] : day;
        setSelectedDay(defaultDay);
      } catch (e) {
        setAvailableDays([]);
        setSelectedDay(day);
      }

      setSelectedStudent(student);
      setAttemptData(data);
      setAttemptsOpen(true);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
      alert("Failed to load attempts");
    }
  };

  const changeDay = async (newDay) => {
    if (!selectedStudent) return;
    const authToken = sessionStorage.getItem("token") || token;
    setSelectedDay(newDay);

    // if we have a student id, prefer that
    const extractId = (s) => {
      if (!s) return null;
      if (typeof s === "string") return s;
      if (s._id && typeof s._id === "string") return s._id;
      if (s._id && s._id.$oid) return s._id.$oid;
      if (s.id && typeof s.id === "string") return s.id;
      if (s.userId && typeof s.userId === "string") return s.userId;
      if (s.user && s.user._id && typeof s.user._id === "string") return s.user._id;
      try { if (s._id && typeof s._id === "object" && s._id.toString) return s._id.toString(); } catch(e){}
      return null;
    };

    const id = extractId(selectedStudent);
    try {
      if (id) {
        const r = await fetch(`http://localhost:5000/progress/attempts/${id}/${newDay}`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` } });
        const d = await r.json();
        setAttemptData(d);
      } else if (selectedStudent.email) {
        const r = await fetch(`http://localhost:5000/progress/attempts/by-email/${encodeURIComponent(selectedStudent.email)}/${newDay}`, { method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` } });
        const d = await r.json();
        setAttemptData(d);
      }
    } catch (err) {
      console.error("Failed to change day attempts:", err);
      setAttemptData({ mcq: [], theory: [] });
    }
  };

  // Helper to determine learning degree from score
  const getLearningDegree = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Improvement";
  };

  // Helper to determine score badge color
  const getScoreBadgeClass = (score) => {
    if (score >= 85) return "green";
    if (score >= 70) return "yellow";
    if (score >= 50) return "orange";
    return "red";
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <header className="hero-section">
        <div className="container">
          <nav className="nav">
            <div className="logo">LearnFlow</div>
            <div className="auth-buttons">
              <span className="student-name">{fullName}</span>
              <button
                className="button button-secondary"
                onClick={async () => {
                  const authToken = sessionStorage.getItem("token") || token;

                  // Try to notify backend of logout (mentor token) — best effort
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

      {/* Dashboard Content */}
      <div className="dashboard-container">
        <h1 className="dashboard-title">Mentor Dashboard</h1>
        <p className="dashboard-subtitle">
          Manage courses and track student performance
        </p>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <i className="fas fa-book stat-icon"></i>
            <div className="stat-text">
              <h2>{totalCourses}</h2>
              <p>Active Courses</p>
            </div>
          </div>

          <div className="stat-card green">
            <i className="fas fa-users stat-icon"></i>
            <div className="stat-text">
              <h2>{totalStudents}</h2>
              <p>Total Students</p>
            </div>
          </div>

          <div className="stat-card purple">
            <i className="fas fa-check-circle stat-icon"></i>
            <div className="stat-text">
              <h2>{testsReviewed}</h2>
              <p>Tests Submitted</p>
            </div>
          </div>

          <div className="stat-card orange">
            <i className="fas fa-user-check stat-icon"></i>
            <div className="stat-text">
              <h2>
                {activeStudents}/{totalStudents}
              </h2>
              <p>Active Students</p>
            </div>
          </div>
        </div>

        {/* Student Progress Tracking */}
        <h2 className="section-title">Student Progress Tracking</h2>

        {/* Student Progress Table */}
        <div className="student-table-card">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Last Test</th>
                <th>Score</th>
                <th>Learning Degree</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={idx}>
                    <td data-label="Student">
                      <strong>{student.fullName}</strong>
                      <span className="email">{student.email}</span>
                      <div>
                        <button
                          className="view-attempts-btn"
                          onClick={() => viewAttempts(student)}
                          style={{ marginTop: 8 }}
                        >
                          View Attempts
                        </button>
                      </div>
                    </td>
                    <td data-label="Course">5G Technology Training</td>
                    <td data-label="Progress">
                      <div className="progress-cell">
                        <div className="mini-progress">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                        <span>{student.progressPercent}%</span>
                      </div>
                    </td>
                    <td data-label="Last Test">{student.lastDay}</td>
                    <td data-label="Score">
                      <span
                        className={`score-badge ${getScoreBadgeClass(
                          student.score
                        )}`}
                      >
                        {student.score}%
                      </span>
                    </td>
                    <td
                      data-label="Learning Degree"
                      className={`degree ${getLearningDegree(student.score)
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {getLearningDegree(student.score)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Attempts Modal */}
        {attemptsOpen && attemptData && (
          <div
            className="attempts-modal-overlay"
            onClick={() => setAttemptsOpen(false)}
          >
            <div className="attempts-modal" onClick={(e) => e.stopPropagation()}>
              <button className="attempts-close" onClick={() => setAttemptsOpen(false)}>×</button>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <h3 style={{margin:0}}>Attempts — {selectedStudent?.fullName || selectedStudent?.email}</h3>
                <div>
                  {availableDays && availableDays.length > 0 && (
                    <select value={selectedDay || ''} onChange={(e)=> changeDay(e.target.value)}>
                      {availableDays.map(d=> (
                        <option key={d} value={d}>{`Day ${d}`}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="attempts-section">
                <h4>MCQ Attempts</h4>
                {attemptData.mcq && attemptData.mcq.length ? (
                  <ul className="mcq-list">
                    {attemptData.mcq.map((q, i) => {
                      const options = q.options || [];
                      const rawSelected = q.selectedAnswer ?? q.selected;
                      const rawCorrect = q.correctAnswer ?? q.correct;

                      // resolve selected index and text
                      let selectedIdx = null;
                      let selectedText = "-";
                      if (typeof rawSelected === "number" || !isNaN(Number(rawSelected))) {
                        selectedIdx = Number(rawSelected);
                        selectedText = options[selectedIdx] ?? String(rawSelected);
                      } else if (typeof rawSelected === "string") {
                        // try to find option index by matching text
                        const idx = options.findIndex(opt => opt === rawSelected);
                        if (idx >= 0) {
                          selectedIdx = idx;
                          selectedText = options[idx];
                        } else {
                          selectedText = rawSelected;
                        }
                      }

                      let correctIdx = null;
                      let correctText = "-";
                      if (typeof rawCorrect === "number" || !isNaN(Number(rawCorrect))) {
                        correctIdx = Number(rawCorrect);
                        correctText = options[correctIdx] ?? String(rawCorrect);
                      } else if (typeof rawCorrect === "string") {
                        const idx = options.findIndex(opt => opt === rawCorrect);
                        if (idx >= 0) {
                          correctIdx = idx;
                          correctText = options[idx];
                        } else {
                          correctText = rawCorrect;
                        }
                      }

                      const isCorrect = correctIdx !== null && selectedIdx !== null && Number(selectedIdx) === Number(correctIdx);

                      return (
                        <li key={i} className="mcq-item">
                          <div className="mcq-q">{q.question}</div>

                          <div className="mcq-meta">
                            <div className={`mcq-selected ${isCorrect ? 'mcq-ok' : 'mcq-wrong'}`}>
                              <strong>Selected (Option {selectedIdx !== null ? selectedIdx : '-' }):</strong>
                              <span> {selectedText}</span>
                            </div>

                            {correctIdx !== null && (
                              <div className="mcq-correct">
                                <strong>Correct (Option {correctIdx}):</strong>
                                <span> {correctText}</span>
                              </div>
                            )}
                          </div>

                          {/* Option list with markers */}
                          {options && options.length > 0 && (
                            <ol className="mcq-options">
                              {options.map((opt, oi) => (
                                <li key={oi} className={`mcq-option-item ${oi === correctIdx ? 'option-correct' : ''} ${oi === selectedIdx && oi !== correctIdx ? 'option-selected-wrong' : ''}`}>
                                  <span className="option-index">{oi}.</span> <span className="option-text">{opt}</span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="empty">No MCQ attempts recorded.</div>
                )}
              </div>

              <div className="attempts-section">
                <h4>Theory Responses</h4>
                {attemptData.theory && attemptData.theory.length ? (
                  <ul className="theory-list">
                    {attemptData.theory.map((t, i) => {
                      const answerText = (t.selectedAnswer || t.answer || "").trim();
                      const expected = Array.isArray(t.expectedKeywords) ? t.expectedKeywords.filter(Boolean) : (t.expectedKeywords ? [t.expectedKeywords] : []);
                      const lowerAnswer = answerText.toLowerCase();
                      const matched = expected.filter(k => lowerAnswer.includes(String(k).toLowerCase()));
                      const wordCount = answerText ? answerText.split(/\s+/).filter(Boolean).length : 0;
                      const charCount = answerText.length;

                      return (
                        <li key={i} className="theory-item">
                          <div className="theory-q">{t.question}</div>

                          <div className="theory-meta">
                            <div className="theory-stats">{wordCount} words • {charCount} chars</div>
                            {expected && expected.length > 0 && (
                              <div className="expected-keywords">
                                <strong>Expected keywords:</strong>
                                <div className="keyword-list">
                                  {expected.map((k, ki) => (
                                    <span key={ki} className={`keyword-badge ${matched.includes(k) ? 'keyword-matched' : 'keyword-unmatched'}`}>
                                      {k}
                                    </span>
                                  ))}
                                </div>
                                <div className="keyword-summary">Matched {matched.length} of {expected.length}</div>
                              </div>
                            )}
                          </div>

                          <div className="theory-answer">{answerText || <em>No answer provided</em>}</div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="empty">No theory responses stored for this day.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
