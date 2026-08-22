"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  logInWithName,
  logInWithGoogle,
  saveUserField,
  getUserRole,
} from "@/lib/authHelpers";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showFieldSelection, setShowFieldSelection] =
    useState(false);

  const [board, setBoard] = useState("");
  const [field, setField] = useState("");
  const [subField, setSubField] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userRole, setUserRole] = useState("student");

  const router = useRouter();

  const stars = Array.from({ length: 25 });

  // ========================================
  // LOGIN
  // ========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await logInWithName(name, password);

      setLoggedInUser(user);

      const role = await getUserRole(user.uid);
      setUserRole(role || "student");

      setShowFieldSelection(true);
    } catch (err) {
      console.error(err);

      if (err.message === "User name not found.") {
        setError("Yeh naam registered nahi hai.");
      } else if (err.code === "auth/wrong-password") {
        setError("Password ghalat hai.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Naam ya password ghalat hai.");
      } else {
        setError(err.message || "Login nahi ho saka.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // GOOGLE LOGIN
  // ========================================

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const user = await logInWithGoogle("student");

      setLoggedInUser(user);

      const role = await getUserRole(user.uid);
      setUserRole(role || "student");

      setShowFieldSelection(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Google login nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // CONTINUE
  // ========================================

  async function continueToDashboard() {
    setError("");

    if (!board) {
      setError("Please select your board.");
      return;
    }

    if (!field) {
      setError("Please select Secondary or Intermediate.");
      return;
    }

    if (!subField) {
      setError("Please select your class/group.");
      return;
    }

    setLoading(true);

    try {
      if (loggedInUser?.uid) {
        await saveUserField(
          loggedInUser.uid,
          board,
          field,
          subField
        );
      }

      // Save complete selection in browser
      localStorage.setItem(
        "selectedField",
        JSON.stringify({
          board,
          field,
          subField,
        })
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Selection save nahi ho saki."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // RESET CLASS WHEN LEVEL CHANGES
  // ========================================

  function selectField(value) {
    setField(value);
    setSubField("");
    setError("");
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main
      className="hero-bg-animated"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* =========================
          HOVER GLOW STYLES
          (sirf isi page ke buttons ke liye)
      ========================== */}

      <style>{`
        .glow-hover-gold:hover {
          border-color: var(--color-gold) !important;
          box-shadow: 0 0 18px rgba(255,182,39,0.35) !important;
        }

        .glow-hover-emerald:hover {
          border-color: var(--color-emerald) !important;
          box-shadow: 0 0 18px rgba(45,212,191,0.35) !important;
        }
      `}</style>

      {/* =========================
          BACKGROUND BLOBS
      ========================== */}

      <div
        className="mesh-blob"
        style={{
          top: "-6%",
          left: "7%",
          width: "350px",
          height: "350px",
          color: "var(--color-gold)",
          background: "rgba(255,182,39,0.18)",
          animationDuration: "10s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          bottom: "-8%",
          right: "7%",
          width: "340px",
          height: "340px",
          color: "var(--color-emerald)",
          background: "rgba(45,212,191,0.18)",
          animationDuration: "13s",
          animationDelay: "1s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          top: "10%",
          right: "13%",
          width: "200px",
          height: "200px",
          color: "var(--color-coral)",
          background: "rgba(255,107,74,0.15)",
          animationDuration: "9s",
          animationDelay: "2s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          bottom: "12%",
          left: "12%",
          width: "180px",
          height: "180px",
          color: "var(--color-gold)",
          background: "rgba(255,182,39,0.14)",
          animationDuration: "11s",
          animationDelay: "1.5s",
        }}
      />

      {/* =========================
          STARS
      ========================== */}

      {stars.map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            animationDuration: `${2 + (i % 4)}s`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}

      {/* =========================
          MAIN CONTAINER
      ========================== */}

      <div
        style={{
          maxWidth: 400,
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* LOGO */}

        <Link
          href="/"
          className="navbar-logo"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: 32,
            fontSize: 22,
          }}
        >
          NOOR-E-<span>ILM</span>
        </Link>

        {/* CARD */}

        <div
          style={{
            border:
              "1px solid rgba(255,182,39,0.25)",
            borderRadius: 20,
            padding: "36px 28px",
            background:
              "rgba(255,182,39,0.05)",
            backdropFilter: "blur(10px)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          {/* ========================================
              LOGIN SCREEN
          ======================================== */}

          {!showFieldSelection ? (
            <>
              <h1
                style={{
                  fontSize: 24,
                  marginBottom: 8,
                  color: "var(--color-cream)",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                Log in
              </h1>

              <p
                style={{
                  color:
                    "rgba(246,243,234,0.6)",
                  fontSize: 13,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Apne naam aur password se login
                karein
              </p>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <input
                  placeholder="Your name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  autoComplete="username"
                  className="form-input"
                  style={inputStyle}
                />

                <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                  className="form-input"
                  style={inputStyle}
                />

                {error && (
                  <p
                    style={{
                      color:
                        "var(--color-coral)",
                      fontSize: 13,
                      margin: "2px 0",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "none",
                    fontWeight: 700,
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    marginTop: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? "Logging in..."
                    : "Log in"}
                </button>
              </form>

              {/* DIVIDER */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "20px 0",
                  color:
                    "rgba(246,243,234,0.35)",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "rgba(246,243,234,0.12)",
                  }}
                />

                OR

                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "rgba(246,243,234,0.12)",
                  }}
                />
              </div>

              {/* GOOGLE */}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn btn-outline"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                Continue with Google
              </button>

              <p
                style={{
                  fontSize: 13,
                  marginTop: 20,
                  textAlign: "center",
                  color:
                    "rgba(246,243,234,0.6)",
                }}
              >
                No account?{" "}
                <Link
                  href="/signup"
                  style={{
                    color:
                      "var(--color-gold)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            /* ========================================
               SELECTION SCREEN
            ======================================== */

            <>
              <h1
                style={{
                  fontSize: 24,
                  marginBottom: 8,
                  color:
                    "var(--color-cream)",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                {userRole === "teacher"
                  ? "Which field do you want to teach?"
                  : "Which field do you want to study?"}
              </h1>

              <p
                style={{
                  color:
                    "rgba(246,243,234,0.65)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  textAlign: "center",
                  marginBottom: 26,
                }}
              >
                Pehle board select karein, phir
                apni class/group.
              </p>

              {/* ==================================
                  BOARD
              ================================== */}

              <div style={{ marginBottom: 22 }}>
                <p style={sectionTitleStyle}>
                  1. Select Board
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setBoard("sindh");
                      setError("");
                    }}
                    className="btn btn-outline glow-hover-gold"
                    style={selectionButtonStyle(
                      board === "sindh",
                      "gold"
                    )}
                  >
                    Sindh Board
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBoard("federal");
                      setError("");
                    }}
                    className="btn btn-outline glow-hover-emerald"
                    style={selectionButtonStyle(
                      board === "federal",
                      "emerald"
                    )}
                  >
                    Federal Board
                  </button>
                </div>
              </div>

              {/* ==================================
                  LEVEL
              ================================== */}

              <div style={{ marginBottom: 22 }}>
                <p style={sectionTitleStyle}>
                  2. Select Level
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      selectField("secondary")
                    }
                    className="btn btn-outline glow-hover-gold"
                    style={selectionButtonStyle(
                      field === "secondary",
                      "gold"
                    )}
                  >
                    Secondary
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectField("intermediate")
                    }
                    className="btn btn-outline glow-hover-emerald"
                    style={selectionButtonStyle(
                      field === "intermediate",
                      "emerald"
                    )}
                  >
                    Intermediate
                  </button>
                </div>
              </div>

              {/* ==================================
                  SECONDARY
              ================================== */}

              {field === "secondary" && (
                <div style={{ marginBottom: 22 }}>
                  <p style={sectionTitleStyle}>
                    3. Select Class
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSubField("nine")
                      }
                      className="btn btn-outline glow-hover-gold"
                      style={subButtonStyle(
                        subField === "nine",
                        "gold"
                      )}
                    >
                      9th Class
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSubField("matric")
                      }
                      className="btn btn-outline glow-hover-gold"
                      style={subButtonStyle(
                        subField === "matric",
                        "gold"
                      )}
                    >
                      10th Class
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================
                  INTERMEDIATE
              ================================== */}

              {field === "intermediate" && (
                <div style={{ marginBottom: 22 }}>
                  <p style={sectionTitleStyle}>
                    3. Select Group / Year
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSubField(
                          "first-year-medical"
                        )
                      }
                      className="btn btn-outline glow-hover-emerald"
                      style={subButtonStyle(
                        subField ===
                          "first-year-medical",
                        "emerald"
                      )}
                    >
                      First Year (MEDICAL)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSubField(
                          "first-year-engineering"
                        )
                      }
                      className="btn btn-outline glow-hover-emerald"
                      style={subButtonStyle(
                        subField ===
                          "first-year-engineering",
                        "emerald"
                      )}
                    >
                      First Year (ENGINEERING)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSubField(
                          "second-year-medical"
                        )
                      }
                      className="btn btn-outline glow-hover-emerald"
                      style={subButtonStyle(
                        subField ===
                          "second-year-medical",
                        "emerald"
                      )}
                    >
                      Second Year (MEDICAL)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSubField(
                          "second-year-engineering"
                        )
                      }
                      className="btn btn-outline glow-hover-emerald"
                      style={subButtonStyle(
                        subField ===
                          "second-year-engineering",
                        "emerald"
                      )}
                    >
                      Second Year (ENGINEERING)
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <p
                  style={{
                    color:
                      "var(--color-coral)",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
              )}

              {/* CONTINUE */}

              <button
                type="button"
                onClick={continueToDashboard}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 700,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? "Saving..."
                  : "Continue"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// ========================================
// SECTION TITLE
// ========================================

const sectionTitleStyle = {
  fontSize: 13,
  color: "var(--color-gold)",
  fontWeight: 700,
  marginBottom: 10,
};

// ========================================
// SELECTION BUTTON
// ========================================

function selectionButtonStyle(
  selected,
  color
) {
  const isGold = color === "gold";

  return {
    padding: "14px 10px",
    borderRadius: 12,
    cursor: "pointer",
    borderColor: selected
      ? isGold
        ? "var(--color-gold)"
        : "var(--color-emerald)"
      : "rgba(246,243,234,0.15)",
    background: selected
      ? isGold
        ? "rgba(255,182,39,0.15)"
        : "rgba(45,212,191,0.12)"
      : "rgba(255,255,255,0.03)",
    color: selected
      ? isGold
        ? "var(--color-gold)"
        : "var(--color-emerald)"
      : "rgba(246,243,234,0.75)",
    fontWeight: 700,
    boxShadow: selected
      ? isGold
        ? "0 0 18px rgba(255,182,39,0.35)"
        : "0 0 18px rgba(45,212,191,0.35)"
      : "none",
  };
}

// ========================================
// SUBFIELD BUTTON
// ========================================

function subButtonStyle(
  selected,
  color
) {
  const isGold = color === "gold";

  return {
    padding: "13px 12px",
    borderRadius: 10,
    cursor: "pointer",

    borderColor: selected
      ? isGold
        ? "var(--color-gold)"
        : "var(--color-emerald)"
      : "rgba(246,243,234,0.15)",

    background: selected
      ? isGold
        ? "rgba(255,182,39,0.15)"
        : "rgba(45,212,191,0.12)"
      : "rgba(255,255,255,0.03)",

    color: selected
      ? isGold
        ? "var(--color-gold)"
        : "var(--color-emerald)"
      : "rgba(246,243,234,0.75)",

    fontWeight: 600,

    boxShadow: selected
      ? isGold
        ? "0 0 18px rgba(255,182,39,0.35)"
        : "0 0 18px rgba(45,212,191,0.35)"
      : "none",
  };
}

// ========================================
// INPUT STYLE
// ========================================

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border:
    "1px solid rgba(255,182,39,0.3)",
  background:
    "rgba(255,255,255,0.05)",
  color: "var(--color-cream)",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};