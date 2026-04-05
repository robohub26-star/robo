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
    { key: "beginner", icon: "📘", title: "Beginner", description: "Ubuntu basics, ROS2 setup, and core concepts (Nodes & Topics)", mcqs: 15 },
    { key: "intermediate", icon: "📙", title: "Intermediate", description: "Publisher/Subscriber architecture and essential CLI commands", mcqs: 15 },
    { key: "advanced", icon: "🎓", title: "Advanced", description: "Turtlesim hands-on, topic echoing, and cmd_vel mechanics", mcqs: 15 },
  ],
  2: [
    { key: "beginner", icon: "📘", title: "Beginner", description: "Understanding URDF robot structure, links, joints, and basic TF concepts", mcqs: 15 },
    { key: "intermediate", icon: "📙", title: "Intermediate", description: "Dive into frame hierarchy and data visualization using RViz", mcqs: 15 },
    { key: "advanced", icon: "🎓", title: "Advanced", description: "Gazebo 3D simulation, environment physics, and commanding simulated robots", mcqs: 15 },
  ],
  3: [
    { key: "beginner", icon: "📘", title: "Beginner", description: "Basic SLAM concepts, mapping vs. localization, and core topics (/map, /scan)", mcqs: 15 },
    { key: "intermediate", icon: "📙", title: "Intermediate", description: "Intermediate Nav2 architecture, goal flow, planners, and controllers", mcqs: 15 },
    { key: "advanced", icon: "🎓", title: "Advanced", description: "Advanced TortoiseBot simulation, rqt_graph debugging, and remote SSH access", mcqs: 15 },
  ],
};

const RadioGroup = ({ value, onValueChange, children }) => (
  <div className="radio-group">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        onChange: onValueChange,
        checked: value === child.props.value,
      })
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
          { day, level: skillLevel }
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
    const finalScore = totalMcqs > 0 ? Math.round((correctMcqs / totalMcqs) * 100) : 0;

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
    alert("🚫 Test auto-submitted due to repeated rule violations.");
    submitTestInternal();
  }, [submitTestInternal]);

  const registerCheatAttempt = useCallback((reason) => {
    const now = Date.now();
    if (now - lastWarningTime.current < 5000) return;
    lastWarningTime.current = now;
    setCheatWarnings((prev) => {
      const next = prev + 1;
      alert(
        `⚠️ Warning ${next}/${MAX_WARNINGS}\n\n${reason}.\n\n` +
        (next >= MAX_WARNINGS ? "Test will be auto-submitted." : "Further violations will auto-submit your test.")
      );
      if (next >= MAX_WARNINGS) autoSubmitTest();
      return next;
    });
  }, [autoSubmitTest]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden) registerCheatAttempt("Tab switch detected"); };
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
      if ((e.ctrlKey || e.metaKey) && ["c","v","x","a"].includes(e.key.toLowerCase())) e.preventDefault();
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

  // ── RESULTS SCREEN ───────────────────────────────────────────────────────
  if (testCompleted) {
    const correctCount = mcqAnswers.filter((a, i) => a === questions.mcq[i]?.correctAnswer).length;

    return (
      <div className="test-page-container" style={{ maxWidth: 700, margin: "40px auto", padding: 40, background: "#161616", borderRadius: 14, boxShadow: "0 0 40px rgba(0,0,0,0.6)", textAlign: "center" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 50, color: "#f5a623", marginBottom: 10 }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 style={{ color: "white" }}>Assessment Completed!</h2>
          <p style={{ color: "#aaa" }}>Day {day} — {skillLevel} Level</p>
        </div>

        {/* Score Card */}
        <div style={{ background: "#1f1f1f", padding: 30, borderRadius: 12, marginBottom: 30 }}>
          <h1 style={{ fontSize: 56, margin: 0, color: getDegreeColor(score) }}>{score}%</h1>
          <p style={{ color: "#aaa", marginTop: 4 }}>
            {correctCount} / {questions.mcq.length} correct
          </p>
          <div style={{ marginTop: 16, height: 12, background: "#333", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ width: `${score}%`, height: "100%", background: "linear-gradient(90deg,#2979ff,#8e2de2)", borderRadius: 10, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: getDegreeColor(score) }}>
            {getLearningDegree(score)}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
          {[
            { label: "Correct", value: correctCount, color: "#4caf50" },
            { label: "Wrong", value: questions.mcq.length - correctCount, color: "#e53935" },
            { label: "Total", value: questions.mcq.length, color: "#2979ff" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#1f1f1f", borderRadius: 10, padding: "16px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ color: "#aaa", fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Answer Review */}
        <div style={{ textAlign: "left" }}>
          <h3 style={{ color: "white", marginBottom: 16 }}>Answer Review</h3>
          {questions.mcq.map((q, idx) => {
            const userAnswer = mcqAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={idx} style={{ background: "#1f1f1f", padding: 16, borderRadius: 10, marginBottom: 16, borderLeft: `4px solid ${isCorrect ? "#4caf50" : "#e53935"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: "#aaa", fontSize: 13 }}>Question {idx + 1}</span>
                  <span style={{ color: isCorrect ? "#4caf50" : "#e53935", fontWeight: 700, fontSize: 13 }}>
                    {isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </span>
                </div>
                <p style={{ color: "white", marginBottom: 12, fontWeight: 600 }}>{q.question}</p>
                {q.options.map((option, oIdx) => {
                  const isUserChoice = oIdx === userAnswer;
                  const isAnswer = oIdx === q.correctAnswer;
                  let bg = "#2c2c2c";
                  if (isAnswer) bg = "#0a522f";
                  if (isUserChoice && !isAnswer) bg = "#4a1212";
                  return (
                    <div key={oIdx} style={{ background: bg, color: "white", padding: "10px 14px", borderRadius: 6, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{option}</span>
                      {isAnswer && <span style={{ color: "#4caf50", fontSize: 12 }}>✓ Correct</span>}
                      {isUserChoice && !isAnswer && <span style={{ color: "#e57373", fontSize: 12 }}>✗ Your answer</span>}
                    </div>
                  );
                })}
                {q.explanation && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "#1a2a1a", borderRadius: 6, color: "#81c784", fontSize: 13 }}>
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 36, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={() => navigate("/courses/5g-training")}
            style={{ background: "linear-gradient(90deg,#2979ff,#8e2de2)", color: "white", padding: "13px 28px", borderRadius: 8, fontSize: 15, border: "none" }}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: 8 }}></i>
            Back to Training
          </button>
          <button
            className="btn"
            onClick={() => navigate("/dashboard/student")}
            style={{ background: "#2c2c2c", color: "white", padding: "13px 28px", borderRadius: 8, fontSize: 15, border: "1px solid #444" }}
          >
            <i className="fas fa-tachometer-alt" style={{ marginRight: 8 }}></i>
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
        <h2 style={{ marginTop: 40, color: "white" }}>Choose Your Test Level — Day {day}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40, flexWrap: "wrap" }}>
          {testLevels[day].map((lvl) => (
            <div key={lvl.key} className="test-option" onClick={() => setSkillLevel(lvl.key)}>
              <div className="test-icon">{lvl.icon}</div>
              <h2>{lvl.title}</h2>
              <p>{lvl.description}</p>
              <ul><li>{lvl.mcqs} MCQs</li></ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="test-page-container" style={{ textAlign: "center", paddingTop: 80 }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: 36, color: "#2979ff" }}></i>
        <p style={{ color: "#aaa", marginTop: 16 }}>Loading questions...</p>
      </div>
    );
  }

  if (!questions.mcq.length) {
    return <div style={{ color: "white", textAlign: "center", marginTop: 80 }}>No questions available. Please try again.</div>;
  }

  const currentQ = questions.mcq[currentQuestion];

  // ── QUIZ SCREEN ──────────────────────────────────────────────────────────
  return (
    <div className="test-page-container no-select">

      {/* Progress Header */}
      <div className="test-header">
        <div className="test-progress-section">
          <div className="test-progress-labels">
            <span>Day {day} — {skillLevel} Level — Multiple Choice</span>
            <span>Question {currentQuestion + 1} of {questions.mcq.length}</span>
          </div>
          <div className="test-progress-bar">
            <div
              className="test-progress-fill"
              style={{ width: `${((currentQuestion + 1) / questions.mcq.length) * 100}%` }}
            />
          </div>
          <div className="test-progress-labels">
            <span>Overall Progress: {currentQuestion + 1} of {questions.mcq.length}</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="test-test-container" style={{ maxWidth: 700, margin: "30px auto", padding: 40, background: "#161616", borderRadius: 14, boxShadow: "0 0 40px rgba(0,0,0,0.6)" }}>

        {/* Cheat Warning Banner */}
        {cheatWarnings > 0 && cheatWarnings < MAX_WARNINGS && (
          <div style={{ background: "#4a1212", color: "#fff", padding: 10, borderRadius: 6, marginBottom: 15, fontWeight: "bold" }}>
            ⚠️ Warning {cheatWarnings}/{MAX_WARNINGS}: Do not switch tabs or apps.
          </div>
        )}

        {/* Answered counter */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "#aaa" }}>
            Answered: {mcqAnswers.filter((a) => a !== undefined).length} / {questions.mcq.length}
          </span>
        </div>

        <div className="test-question-wrapper">
          <h2 className="test-question-title" style={{ color: "white", textAlign: "left" }}>
            {currentQ?.question}
          </h2>
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
            style={{
              background: allAnswered ? "linear-gradient(90deg,#2979ff,#8e2de2)" : "#444",
              color: "white",
              opacity: allAnswered ? 1 : 0.6,
              cursor: allAnswered ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? (
              <><i className="fas fa-spinner fa-spin"></i>&nbsp;Submitting...</>
            ) : (
              <><i className="fas fa-check"></i>&nbsp;Submit Test</>
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
        <p style={{ textAlign: "center", color: "#f5a623", marginTop: 10, fontSize: 14 }}>
          ⚠️ Please answer all {questions.mcq.length} questions before submitting.
          ({mcqAnswers.filter((a) => a !== undefined).length} / {questions.mcq.length} answered)
        </p>
      )}
    </div>
  );
}