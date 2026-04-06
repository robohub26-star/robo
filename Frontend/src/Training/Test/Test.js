import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Test.css";
import { useLocation } from "react-router-dom";

const Button = ({ onClick, children, disabled, style }) => (
  <button
    className="btn"
    onClick={!disabled ? onClick : undefined}
    disabled={disabled}
    style={style}
  >
    {children}
  </button>
);

const testLevels = {
  1: [
    {
      key: "beginner",
      icon: "📘",
      title: "Beginner",
      description:
        "Ubuntu basics, ROS2 setup, and core concepts (Nodes & Topics)",
      mcqs: 15,
    },
    {
      key: "intermediate",
      icon: "📙",
      title: "Intermediate",
      description:
        "Publisher/Subscriber architecture and essential CLI commands",
      mcqs: 15,
    },
    {
      key: "advanced",
      icon: "🎓",
      title: "Advanced",
      description: "Turtlesim hands-on, topic echoing, and cmd_vel mechanics",
      mcqs: 15,
    },
  ],
  2: [
    {
      key: "beginner",
      icon: "📘",
      title: "Beginner",
      description:
        "Understanding URDF robot structure, links, joints, and basic TF concepts",
      mcqs: 15,
    },
    {
      key: "intermediate",
      icon: "📙",
      title: "Intermediate",
      description:
        "Dive into frame hierarchy and data visualization using RViz",
      mcqs: 15,
    },
    {
      key: "advanced",
      icon: "🎓",
      title: "Advanced",
      description:
        "Gazebo 3D simulation, environment physics, and commanding simulated robots",
      mcqs: 15,
    },
  ],
  3: [
    {
      key: "beginner",
      icon: "📘",
      title: "Beginner",
      description:
        "Basic SLAM concepts, mapping vs. localization, and core topics (/map, /scan)",
      mcqs: 15,
    },
    {
      key: "intermediate",
      icon: "📙",
      title: "Intermediate",
      description:
        "Intermediate Nav2 architecture, goal flow, planners, and controllers",
      mcqs: 15,
    },
    {
      key: "advanced",
      icon: "🎓",
      title: "Advanced",
      description:
        "Advanced TortoiseBot simulation, rqt_graph debugging, and remote SSH access",
      mcqs: 15,
    },
  ],
};

const RadioGroup = ({ value, onValueChange, children }) => (
  <div className="radio-group">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        onChange: onValueChange,
        checked: value === child.props.value,
      }),
    )}
  </div>
);

const RadioGroupItem = ({ value, onChange, checked, children }) => (
  <label className="radio-group-item">
    <input
      type="radio"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      checked={checked}
    />
    {children}
  </label>
);

export default function Test() {
  const location = useLocation();
  const navigate = useNavigate();
  const [skillLevel, setSkillLevel] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState({ mcq: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const MAX_WARNINGS = 3;

  const dayFromPath = Number(location.pathname.match(/day(\d+)/)?.[1]) || 1;
  const [day] = useState(dayFromPath);

  const [timerSeconds, setTimerSeconds] = useState(10 * 60); // 7 minutes
  const timerRef = useRef(null);
  const isAutoSubmitting = useRef(false);

  // ── Normalize API response → only MCQs ──────────────────────────────────
  const normalizeQuestions = (data) => {
    const mcq = (data?.mcqs || []).map((q) => ({
      question: q.question,
      options: Object.values(q.options || {}),
      correctAnswer:
        typeof q.correct === "string"
          ? q.correct.charCodeAt(0) - 65
          : q.correct,
      explanation: q.explanation || "",
    }));
    return { mcq };
  };

  // ── Fetch questions when skill level chosen ──────────────────────────────
  useEffect(() => {
    if (!skillLevel) return;
    setLoading(true);
    const fetchQuestions = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/generate-questions",
          { day, level: skillLevel },
        );
        const normalized = normalizeQuestions(response.data);
        setQuestions(normalized);
        setMcqAnswers(Array(normalized.mcq.length).fill(undefined));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [day, skillLevel]);

  // ── Derived helpers ──────────────────────────────────────────────────────
  const isLastQuestion = currentQuestion === questions.mcq.length - 1;
  const allAnswered = mcqAnswers.every((a) => a !== undefined && a !== null);

  const handleMcqAnswer = (answerIndex) => {
    const updated = [...mcqAnswers];
    updated[currentQuestion] = answerIndex;
    setMcqAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < questions.mcq.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const submitTestInternal = useCallback(async () => {
    const totalMcqs = questions.mcq.length;
    let correctMcqs = 0;
    mcqAnswers.forEach((answer, idx) => {
      if (answer === questions.mcq[idx]?.correctAnswer) correctMcqs++;
    });
    const finalScore =
      totalMcqs > 0 ? Math.round((correctMcqs / totalMcqs) * 100) : 0;

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

      const payloadQuestions = questions.mcq.map((q, idx) => ({
        question: q.question,
        type: "mcq",
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        selectedAnswer: mcqAnswers[idx],
        difficulty: skillLevel,
      }));

      const res = await fetch("http://localhost:5000/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          day,
          score: finalScore,
          completed: true,
          level: skillLevel,
          questions: payloadQuestions,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new Event("progressUpdate"));
      } else {
        console.error("Progress update failed", res.status);
      }
    } catch (err) {
      console.error("Failed to send progress update", err);
    }

    setScore(finalScore);
    setTestCompleted(true);
    setSubmitting(false);
  }, [questions.mcq, mcqAnswers, day, skillLevel]);

  const handleSubmit = () => submitTestInternal();

  // ── Anti-cheat ───────────────────────────────────────────────────────────
  const lastWarningTime = useRef(0);
  const autoSubmitTest = useCallback(() => {
    isAutoSubmitting.current = true;
    alert("🚫 Test auto-submitted due to repeated rule violations.");
    submitTestInternal();
  }, [submitTestInternal]);

  const registerCheatAttempt = useCallback(
    (reason) => {
      if (isAutoSubmitting.current) return;
      const now = Date.now();
      if (now - lastWarningTime.current < 5000) return;
      lastWarningTime.current = now;
      setCheatWarnings((prev) => {
        const next = prev + 1;
        alert(
          `⚠️ Warning ${next}/${MAX_WARNINGS}\n\n${reason}.\n\n` +
            (next >= MAX_WARNINGS
              ? "Test will be auto-submitted."
              : "Further violations will auto-submit your test."),
        );
        if (next >= MAX_WARNINGS) autoSubmitTest();
        return next;
      });
    },
    [autoSubmitTest],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) registerCheatAttempt("Tab switch detected");
    };
    const handleBlur = () => registerCheatAttempt("Window lost focus");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [registerCheatAttempt]);

  useEffect(() => {
    const blockCopy = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a"].includes(e.key.toLowerCase())
      )
        e.preventDefault();
    };
    document.addEventListener("keydown", blockCopy);
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    return () => {
      document.removeEventListener("keydown", blockCopy);
    };
  }, []);

  const getLearningDegree = (s) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Average";
    return "Needs Improvement";
  };

  const getDegreeColor = (s) => {
    if (s >= 80) return "#4caf50";
    if (s >= 60) return "#2979ff";
    if (s >= 40) return "#f5a623";
    return "#e53935";
  };

  // ── TIMER ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!skillLevel || loading || testCompleted) return;

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          isAutoSubmitting.current = true
          submitTestInternal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [skillLevel, loading, testCompleted, submitTestInternal]);

  // Add this helper below getLearningDegree
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── RESULTS SCREEN ───────────────────────────────────────────────────────
  if (testCompleted) {
    const correctCount = mcqAnswers.filter(
      (a, i) => a === questions.mcq[i]?.correctAnswer,
    ).length;

    return (
      <div className="test-page-container results-page">
        {/* Header */}
        <div className="results-header">
          <div className="results-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 className="results-title">Assessment Completed!</h2>
          <p className="results-subtitle">
            Day {day} — {skillLevel} Level
          </p>
        </div>

        {/* Score Card */}
        <div className="results-score-card">
          <h1
            className="results-score-number"
            style={{ color: getDegreeColor(score) }}
          >
            {score}%
          </h1>
          <p className="results-score-detail">
            {correctCount} / {questions.mcq.length} correct
          </p>
          <div className="results-score-bar">
            <div
              className="results-score-fill"
              style={{ width: `${score}%` }}
            />
          </div>
          <div
            className="results-degree"
            style={{ color: getDegreeColor(score) }}
          >
            {getLearningDegree(score)}
          </div>
        </div>

        {/* Stats row */}
        <div className="results-stats">
          <div className="results-stat">
            <div className="results-stat-value correct"> {correctCount} </div>
            <div className="results-stat-label">Correct</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value wrong">
              {" "}
              {questions.mcq.length - correctCount}{" "}
            </div>
            <div className="results-stat-label">Wrong</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value total">
              {" "}
              {questions.mcq.length}{" "}
            </div>
            <div className="results-stat-label">Total</div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="results-review">
          <h3 className="results-review-title">Answer Review</h3>
          {questions.mcq.map((q, idx) => {
            const userAnswer = mcqAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div
                key={idx}
                className={`results-review-item ${isCorrect ? "correct-border" : "wrong-border"}`}
              >
                <div className="results-review-question-header">
                  <span className="results-review-question-number">
                    Question {idx + 1}
                  </span>
                  <span
                    className={`results-review-status ${isCorrect ? "status-correct" : "status-wrong"}`}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </span>
                </div>
                <p className="results-review-question-text">{q.question}</p>
                {q.options.map((option, oIdx) => {
                  const isUserChoice = oIdx === userAnswer;
                  const isAnswer = oIdx === q.correctAnswer;
                  let optionClass = "results-review-option";
                  if (isAnswer) optionClass += " option-correct";
                  if (isUserChoice && !isAnswer)
                    optionClass += " option-wrong-choice";
                  return (
                    <div key={oIdx} className={optionClass}>
                      <span>{option}</span>
                      {isAnswer && (
                        <span className="option-correct-mark">✓ Correct</span>
                      )}
                      {isUserChoice && !isAnswer && (
                        <span className="option-wrong-mark">✗ Your answer</span>
                      )}
                    </div>
                  );
                })}
                {q.explanation && (
                  <div className="results-review-explanation">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/courses/5g-training")}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Training
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard/student")}
          >
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── LEVEL SELECTION ──────────────────────────────────────────────────────
  if (!skillLevel) {
    return (
      <div className="test-page-container no-select">
        <h2 className="level-selection-title">
          Choose Your Test Level — Day {day}
        </h2>
        <div className="level-selection-grid">
          {testLevels[day].map((lvl) => (
            <div
              key={lvl.key}
              className="test-option"
              onClick={() => setSkillLevel(lvl.key)}
            >
              <div className="test-icon">{lvl.icon}</div>
              <h2>{lvl.title}</h2>
              <p>{lvl.description}</p>
              <ul>
                <li>{lvl.mcqs} MCQs</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="test-page-container loading-container">
        <i className="fas fa-spinner fa-spin loading-spinner"></i>
        <p className="loading-text">Loading questions...</p>
      </div>
    );
  }

  if (!questions.mcq.length) {
    return (
      <div className="error-message">
        No questions available. Please try again.
      </div>
    );
  }

  const currentQ = questions.mcq[currentQuestion];

  // ── QUIZ SCREEN ──────────────────────────────────────────────────────────
  return (
    <div className="test-page-container no-select">
      {/* Progress Header */}
      <div className="test-header">
        <div className="test-progress-section">
          <div className="test-progress-labels">
            <span>
              Day {day} — {skillLevel} Level — Multiple Choice
            </span>
            <span>
              Question {currentQuestion + 1} of {questions.mcq.length}
            </span>
          </div>
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{
                width: `${((currentQuestion + 1) / questions.mcq.length) * 100}%`,
              }}
            />
          </div>
          <div className="test-progress-labels">
            <span>
              Overall Progress: {currentQuestion + 1} of {questions.mcq.length}
            </span>
          </div>
        </div>

        {/* ← Timer added here — fixes both unused-vars warnings */}
        <div
          className={`test-timer ${timerSeconds <= 60 ? "timer-critical" : timerSeconds <= 120 ? "timer-warning" : ""}`}
        >
          <i className="fas fa-clock"></i>
          <span>{formatTime(timerSeconds)}</span>
          <div className="timer-bar">
            <div
              className="timer-bar-fill"
              style={{ width: `${(timerSeconds / (10 * 60)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="test-test-container">
        {/* Cheat Warning Banner */}
        {cheatWarnings > 0 && cheatWarnings < MAX_WARNINGS && (
          <div className="cheat-warning-banner">
            ⚠️ Warning {cheatWarnings}/{MAX_WARNINGS}: Do not switch tabs or
            apps.
          </div>
        )}

        {/* Answered counter */}
        <div className="answered-counter">
          <span>
            Answered: {mcqAnswers.filter((a) => a !== undefined).length} /{" "}
            {questions.mcq.length}
          </span>
        </div>

        <div className="test-question-wrapper">
          <h2 className="test-question-title">{currentQ?.question}</h2>
          <RadioGroup
            value={mcqAnswers[currentQuestion]?.toString()}
            onValueChange={(val) => handleMcqAnswer(parseInt(val))}
          >
            {currentQ?.options?.map((option, idx) => (
              <RadioGroupItem key={idx} value={idx.toString()}>
                {option}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="test-button">
        <Button onClick={handlePrevious} disabled={currentQuestion === 0}>
          <i className="fas fa-arrow-left"></i>&nbsp;Previous
        </Button>

        {/* ── SUBMIT on last question ── */}
        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={allAnswered ? "btn-submit-ready" : "btn-submit-disabled"}
            style={{
              background: allAnswered
                ? "linear-gradient(90deg,#2979ff,#8e2de2)"
                : "#444",
              color: "white",
              opacity: allAnswered ? 1 : 0.6,
              cursor: allAnswered ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>&nbsp;Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>&nbsp;Submit Test
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next Question&nbsp;<i className="fas fa-arrow-right"></i>
          </Button>
        )}
      </div>

      {/* Warning: unanswered questions on last screen */}
      {isLastQuestion && !allAnswered && (
        <p className="unanswered-warning">
          ⚠️ Please answer all {questions.mcq.length} questions before
          submitting. ({mcqAnswers.filter((a) => a !== undefined).length} /{" "}
          {questions.mcq.length} answered)
        </p>
      )}
    </div>
  );
}
