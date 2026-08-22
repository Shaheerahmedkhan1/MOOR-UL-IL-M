"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { getUserData } from "@/lib/authHelpers";

export default function Quiz() {
  const params = useParams();
  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const stars = Array.from({ length: 20 });

  const [qText, setQText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [explanationUrdu, setExplanationUrdu] = useState("");
  const [saving, setSaving] = useState(false);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUserData(await getUserData(u.uid));
      }
    });
    return () => unsub();
  }, []);

  async function loadData() {
    const subjectRef = doc(db, "subjects", params.id);
    const subjectSnap = await getDoc(subjectRef);
    if (subjectSnap.exists()) {
      setSubject({ id: subjectSnap.id, ...subjectSnap.data() });
    }

    const quizRef = doc(db, "quizzes", params.id);
    const quizSnap = await getDoc(quizRef);
    if (quizSnap.exists()) {
      setQuestions(quizSnap.data().questions || []);
    } else {
      setQuestions([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function handleAddQuestion(e) {
    e.preventDefault();
    if (!qText || !opt1 || !opt2 || !opt3 || !opt4) return;
    setSaving(true);
    const quizRef = doc(db, "quizzes", params.id);
    await setDoc(
      quizRef,
      {
        questions: arrayUnion({
          question: qText,
          options: [opt1, opt2, opt3, opt4],
          correctIndex: Number(correctIndex),
          explanation: explanation,
          explanationUrdu: explanationUrdu,
        }),
      },
      { merge: true }
    );
    setQText("");
    setOpt1("");
    setOpt2("");
    setOpt3("");
    setOpt4("");
    setCorrectIndex(0);
    setExplanation("");
    setExplanationUrdu("");
    setSaving(false);
    loadData();
  }

  function selectAnswer(qIndex, optIndex) {
    if (answers[qIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  async function handleSubmitQuiz() {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);

    if (auth.currentUser) {
      await addDoc(collection(db, "results"), {
        studentId: auth.currentUser.uid,
        studentName: userData?.name || "Student",
        subjectId: params.id,
        subjectName: subject?.name || "",
        score: correctCount,
        total: questions.length,
        date: new Date().toISOString(),
      });
    }
  }

  const canManage = userData?.email && userData.email.toLowerCase() === "hafizshaheerahmedkhan@gmail.com";
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  if (loading) {
    return (
      <main className="hero-bg-animated" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-cream)" }}>
        Loading...
      </main>
    );
  }

  return (
    <main className="hero-bg-animated" style={{ minHeight: "100vh", padding: "24px", position: "relative", overflow: "hidden" }}>

     {/* Coral Blob */}
<div
  className="mesh-blob"
  style={{
    top: "-12%",
    left: "-5%",
    width: "360px",
    height: "360px",
    color: "var(--color-coral)",
    background: "rgba(255,107,74,0.16)",
    animationDuration: "10s",
  }}
/>

{/* Emerald Blob */}
<div
  className="mesh-blob"
  style={{
    bottom: "-12%",
    right: "-5%",
    width: "350px",
    height: "350px",
    color: "var(--color-emerald)",
    background: "rgba(45,212,191,0.16)",
    animationDuration: "12s",
    animationDelay: "1s",
  }}
/>

{/* Purple Blob */}
<div
  className="mesh-blob"
  style={{
    top: "12%",
    right: "6%",
    width: "220px",
    height: "220px",
    color: "#8B5CF6",
    background: "rgba(139,92,246,0.14)",
    animationDuration: "9s",
    animationDelay: "2s",
  }}
/>

{/* Blue Blob */}
<div
  className="mesh-blob"
  style={{
    bottom: "8%",
    left: "8%",
    width: "200px",
    height: "200px",
    color: "#38BDF8",
    background: "rgba(56,189,248,0.13)",
    animationDuration: "11s",
    animationDelay: "1.5s",
  }}
/>
      {stars.map((_, i) => (
        <span key={i} className="star" style={{ top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`, width: 2 + (i % 3), height: 2 + (i % 3), animationDuration: `${2 + (i % 4)}s`, animationDelay: `${i * 0.2}s` }} />
      ))}

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 48, position: "relative" }}>

        <Link href={`/courses/${params.id}`} className="btn btn-outline" style={{ display: "inline-block", marginBottom: 24, padding: "8px 16px", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          ← {subject ? subject.name : "Subject"}
        </Link>

        <h1 style={{ fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 800, marginBottom: 28, color: "var(--color-cream)" }}>
          Quiz
        </h1>

        {canManage && (
          <form
            onSubmit={handleAddQuestion}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              border: "1px solid rgba(255,182,39,0.25)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 32,
              background: "rgba(255,182,39,0.05)",
            }}
          >
            <h2 style={{ fontSize: 16, color: "var(--color-gold)", fontWeight: 700 }}>+ Add New Question</h2>
            <input
              placeholder="Question text"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              className="form-input"
              style={inputStyle}
            />
            <input placeholder="Option A" value={opt1} onChange={(e) => setOpt1(e.target.value)} className="form-input" style={inputStyle} />
            <input placeholder="Option B" value={opt2} onChange={(e) => setOpt2(e.target.value)} className="form-input" style={inputStyle} />
            <input placeholder="Option C" value={opt3} onChange={(e) => setOpt3(e.target.value)} className="form-input" style={inputStyle} />
            <input placeholder="Option D" value={opt4} onChange={(e) => setOpt4(e.target.value)} className="form-input" style={inputStyle} />

            <div style={{ fontSize: 13, color: "rgba(246,243,234,0.7)", marginTop: 4 }}>Correct option:</div>
            <div style={{ display: "flex", gap: 14 }}>
              {["A", "B", "C", "D"].map((label, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-cream)", fontSize: 14, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ fontSize: 13, color: "rgba(246,243,234,0.7)", marginTop: 8 }}>Explanation (shown after student answers):</div>
            <input
              placeholder="Explanation in English"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="form-input"
              style={inputStyle}
            />
            <input
              placeholder="وضاحت اردو میں"
              value={explanationUrdu}
              onChange={(e) => setExplanationUrdu(e.target.value)}
              className="form-input"
              style={{ ...inputStyle, fontFamily: "'Noto Nastaliq Urdu', serif", direction: "rtl", fontSize: 16 }}
            />

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "12px 20px", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
              {saving ? "Saving..." : "Add Question"}
            </button>
          </form>
        )}

        {questions.length === 0 && (
          <p style={{ color: "rgba(246,243,234,0.6)" }}>No questions yet.</p>
        )}

        {questions.length > 0 && !submitted && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {questions.map((q, qi) => {
              const answered = answers[qi] !== undefined;
              const isCorrect = answered && answers[qi] === q.correctIndex;
              return (
                <div key={qi} className="subject-card" style={{ cursor: "default" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-cream)", marginBottom: 12 }}>
                    {qi + 1}. {q.question}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, oi) => {
                      let borderColor = "rgba(255,182,39,0.15)";
                      let bg = "transparent";
                      if (answered && oi === q.correctIndex) {
                        borderColor = "var(--color-emerald)";
                        bg = "rgba(45,212,191,0.12)";
                      } else if (answered && oi === answers[qi] && oi !== q.correctIndex) {
                        borderColor = "var(--color-coral)";
                        bg = "rgba(255,107,74,0.12)";
                      } else if (!answered && answers[qi] === oi) {
                        borderColor = "var(--color-gold)";
                        bg = "rgba(255,182,39,0.1)";
                      }
                      return (
                        <label
                          key={oi}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: `1px solid ${borderColor}`,
                            background: bg,
                            color: "rgba(246,243,234,0.85)",
                            fontSize: 14,
                            cursor: answered ? "default" : "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name={`question-${qi}`}
                            checked={answers[qi] === oi}
                            disabled={answered}
                            onChange={() => selectAnswer(qi, oi)}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>

                  {answered && (q.explanation || q.explanationUrdu) && (
                    <div style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 16,
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: `1px solid ${isCorrect ? "rgba(45,212,191,0.4)" : "rgba(255,107,74,0.4)"}`,
                      background: isCorrect ? "rgba(45,212,191,0.08)" : "rgba(255,107,74,0.08)",
                    }}>
                      <div style={{ fontSize: 28, lineHeight: 1 }}>🦉</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: isCorrect ? "var(--color-emerald)" : "var(--color-coral)", fontSize: 14 }}>
                          {isCorrect ? "Correct!" : "Not quite!"}
                        </div>
                        {q.explanation && (
                          <p style={{ color: "rgba(246,243,234,0.85)", fontSize: 14, marginBottom: 6, lineHeight: 1.5 }}>
                            {q.explanation}
                          </p>
                        )}
                        {q.explanationUrdu && (
                          <p className="urdu-text" style={{ color: "rgba(246,243,234,0.85)", fontSize: 15 }}>
                            {q.explanationUrdu}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleSubmitQuiz}
              disabled={!allAnswered}
              className="btn btn-primary"
              style={{ padding: "14px 20px", borderRadius: 12, border: "none", fontWeight: 700, cursor: allAnswered ? "pointer" : "not-allowed", opacity: allAnswered ? 1 : 0.5 }}
            >
              Submit Quiz
            </button>
          </div>
        )}

        {submitted && (
          <div className="subject-card" style={{ textAlign: "center", padding: 32, cursor: "default" }}>
            <div style={{ fontSize: 15, color: "rgba(246,243,234,0.7)", marginBottom: 8 }}>Your Score</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "var(--color-gold)", marginBottom: 20 }}>
              {score} / {questions.length}
            </div>
            <Link href="/results" className="btn btn-primary" style={{ display: "inline-block", padding: "12px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}>
              View All Results
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,182,39,0.3)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--color-cream)",
  fontSize: 14,
};