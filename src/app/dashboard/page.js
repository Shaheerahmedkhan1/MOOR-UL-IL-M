"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { getUserData, logOut } from "@/lib/authHelpers";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const stars = Array.from({ length: 25 });

  // --------------------------------------------------
  // GET LOGGED IN USER
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }

      setUser(u);

      try {
        const data = await getUserData(u.uid);
        setUserData(data);
      } catch (error) {
        console.error("Error getting user data:", error);
      }

      const savedField = localStorage.getItem("selectedField");

      if (savedField) {
        try {
          setSelectedField(JSON.parse(savedField));
        } catch {
          setSelectedField(null);
        }
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main
        className="hero-bg-animated"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-cream)",
        }}
      >
        Loading...
      </main>
    );
  }

  const role = userData?.role;
  const status = userData?.status;

  // --------------------------------------------------
  // FIELD NAME
  // --------------------------------------------------

  function getFieldName(field) {
    switch (field) {
      case "secondary":
        return "Secondary";

      case "intermediate":
        return "Intermediate";

      default:
        return field || "";
    }
  }

  // --------------------------------------------------
  // BOARD NAME
  // --------------------------------------------------

  function getBoardName(board) {
    if (!board) {
      return "";
    }

    switch (board) {
      case "sindh":
        return "Sindh Board";

      case "federal":
        return "Federal Board";

      default:
        if (
          typeof board === "string" &&
          board.toLowerCase().includes("sindh")
        ) {
          return "Sindh Board";
        }

        if (
          typeof board === "string" &&
          board.toLowerCase().includes("federal")
        ) {
          return "Federal Board";
        }

        return board;
    }
  }

  // --------------------------------------------------
  // CLASS / PROGRAM NAME
  // --------------------------------------------------

  function getSubFieldName(subField) {
    switch (subField) {
      // ------------------------------------------------
      // OLD VALUES
      // ------------------------------------------------

      case "nine":
        return "Class 9";

      case "matric":
        return "Class 10";

      // ------------------------------------------------
      // SECONDARY
      // ------------------------------------------------

      case "secondary-9":
        return "Class 9";

      case "secondary-10":
        return "Class 10";

      case "nine-sindh":
        return "Class 9";

      case "matric-sindh":
        return "Class 10";

      // ------------------------------------------------
      // ENGINEERING
      // ------------------------------------------------

      case "first-year-engineering":
        return "First Year — Engineering";

      case "second-year-engineering":
        return "Second Year — Engineering";

      case "first-year-engineering-sindh":
        return "First Year — Engineering";

      case "second-year-engineering-sindh":
        return "Second Year — Engineering";

      case "first-year-engineering-federal":
        return "First Year — Engineering";

      case "second-year-engineering-federal":
        return "Second Year — Engineering";

      // ------------------------------------------------
      // MEDICAL
      // ------------------------------------------------

      case "first-year-medical":
        return "First Year — Medical";

      case "second-year-medical":
        return "Second Year — Medical";

      case "first-year-medical-sindh":
        return "First Year — Medical";

      case "second-year-medical-sindh":
        return "Second Year — Medical";

      case "first-year-medical-federal":
        return "First Year — Medical";

      case "second-year-medical-federal":
        return "Second Year — Medical";

      // ------------------------------------------------
      // DEFAULT
      // ------------------------------------------------

      default:
        return subField || "";
    }
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    try {
      await logOut();

      localStorage.removeItem("selectedField");

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // --------------------------------------------------
  // USERNAME
  // --------------------------------------------------

  const username =
    userData?.name ||
    userData?.username ||
    user?.displayName ||
    "Student";

  // --------------------------------------------------
  // BOARD
  // --------------------------------------------------

  const board =
    selectedField?.board ||
    userData?.board ||
    "";

  // --------------------------------------------------
  // TEACHER PENDING APPROVAL
  // --------------------------------------------------

  if (role === "teacher" && status === "pending") {
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
        {/* ------------------------------------------------
            GOLD BLOB
        ------------------------------------------------ */}

        <div
          className="mesh-blob"
          style={{
            top: "-12%",
            left: "-2%",
            width: "380px",
            height: "380px",
            color: "var(--color-gold)",
            background: "rgba(255,182,39,0.18)",
            animationDuration: "8s",
          }}
        />

        {/* ------------------------------------------------
            EMERALD BLOB
        ------------------------------------------------ */}

        <div
          className="mesh-blob"
          style={{
            bottom: "-12%",
            right: "-2%",
            width: "370px",
            height: "370px",
            color: "var(--color-emerald)",
            background: "rgba(45,212,191,0.18)",
            animationDuration: "10s",
            animationDelay: "1s",
          }}
        />

        {/* ------------------------------------------------
            CORAL BLOB
        ------------------------------------------------ */}

        <div
          className="mesh-blob"
          style={{
            top: "3%",
            right: "5%",
            width: "220px",
            height: "220px",
            color: "var(--color-coral)",
            background: "rgba(255,107,74,0.15)",
            animationDuration: "8s",
            animationDelay: "2s",
          }}
        />

        {/* ------------------------------------------------
            PURPLE BLOB
        ------------------------------------------------ */}

        <div
          className="mesh-blob"
          style={{
            bottom: "5%",
            left: "5%",
            width: "200px",
            height: "200px",
            color: "#8B5CF6",
            background: "rgba(139,92,246,0.14)",
            animationDuration: "9s",
            animationDelay: "1.5s",
          }}
        />

        {/* ------------------------------------------------
            STARS
        ------------------------------------------------ */}

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

        {/* ------------------------------------------------
            PENDING CARD
        ------------------------------------------------ */}

        <div
          style={{
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(246,243,234,0.08)",
            borderRadius: 20,
            padding: "40px 28px",
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(10px)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 40,
              marginBottom: 12,
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              fontSize: 22,
              marginBottom: 12,
              color: "var(--color-cream)",
            }}
          >
            Account Pending Approval
          </h1>

          <p
            style={{
              color: "rgba(246,243,234,0.7)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Your teacher account is waiting for admin
            approval. You&apos;ll be able to add courses
            and lectures once approved.
          </p>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{
              fontSize: 14,
              borderRadius: 999,
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // MAIN DASHBOARD
  // --------------------------------------------------

  return (
    <main
      className="hero-bg-animated"
      style={{
        minHeight: "100vh",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ------------------------------------------------
          GOLD BLOB
      ------------------------------------------------ */}

      <div
        className="mesh-blob"
        style={{
          top: "-12%",
          left: "-2%",
          width: "380px",
          height: "380px",
          color: "var(--color-gold)",
          background: "rgba(255,182,39,0.18)",
          animationDuration: "8s",
        }}
      />

      {/* ------------------------------------------------
          EMERALD BLOB
      ------------------------------------------------ */}

      <div
        className="mesh-blob"
        style={{
          bottom: "-12%",
          right: "-2%",
          width: "370px",
          height: "370px",
          color: "var(--color-emerald)",
          background: "rgba(45,212,191,0.18)",
          animationDuration: "10s",
          animationDelay: "1s",
        }}
      />

      {/* ------------------------------------------------
          CORAL BLOB
      ------------------------------------------------ */}

      <div
        className="mesh-blob"
        style={{
          top: "3%",
          right: "5%",
          width: "220px",
          height: "220px",
          color: "var(--color-coral)",
          background: "rgba(255,107,74,0.15)",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
      />

      {/* ------------------------------------------------
          PURPLE BLOB
      ------------------------------------------------ */}

      <div
        className="mesh-blob"
        style={{
          bottom: "5%",
          left: "5%",
          width: "200px",
          height: "200px",
          color: "#8B5CF6",
          background: "rgba(139,92,246,0.14)",
          animationDuration: "9s",
          animationDelay: "1.5s",
        }}
      />

      {/* ------------------------------------------------
          STARS
      ------------------------------------------------ */}

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

      {/* ------------------------------------------------
          MAIN CONTENT
      ------------------------------------------------ */}

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          paddingTop: 48,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ------------------------------------------------
            HEADER
        ------------------------------------------------ */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: 2,
              color: "var(--color-gold)",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Dashboard
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-outline"
            style={{
              fontSize: 13,
              borderRadius: 999,
              padding: "6px 16px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>

        {/* ------------------------------------------------
            WELCOME
        ------------------------------------------------ */}

        <h1
          style={{
            fontSize: "clamp(26px, 5vw, 34px)",
            fontWeight: 800,
            marginBottom: 8,
            color: "var(--color-cream)",
          }}
        >
          Welcome, {username}
        </h1>

        {/* ------------------------------------------------
            ROLE
        ------------------------------------------------ */}

        <p
          style={{
            color: "rgba(246,243,234,0.65)",
            marginBottom: 20,
            lineHeight: 1.7,
          }}
        >
          You&apos;re signed in as{" "}
          <strong
            style={{
              color: "var(--color-emerald)",
            }}
          >
            {role}
          </strong>
          .
        </p>

        {/* ------------------------------------------------
            STUDY INFORMATION
        ------------------------------------------------ */}

        {selectedField && (
          <div
            style={{
              border: "1px solid rgba(246,243,234,0.08)",
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 28,
              background: "rgba(255,255,255,0.035)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* CARD TITLE */}

            <div
              style={{
                fontSize: 12,
                color: "rgba(246,243,234,0.55)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 14,
              }}
            >
              Your Study Information
            </div>

            {/* ------------------------------------------------
                FIELD
            ------------------------------------------------ */}

            <div
              style={{
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(246,243,234,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Field
              </div>

              <div
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "var(--color-gold)",
                }}
              >
                {getFieldName(selectedField.field)}
              </div>
            </div>

            {/* ------------------------------------------------
                BOARD
            ------------------------------------------------ */}

            {board && (
              <div
                style={{
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(246,243,234,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  Board
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--color-emerald)",
                  }}
                >
                  {getBoardName(board)}
                </div>
              </div>
            )}

            {/* ------------------------------------------------
                CLASS / PROGRAM
            ------------------------------------------------ */}

            {selectedField.subField && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(246,243,234,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  Class / Program
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "var(--color-cream)",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {getSubFieldName(
                    selectedField.subField
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------
            BUTTONS
        ------------------------------------------------ */}

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/courses"
            className="btn btn-primary"
            style={{
              padding: "14px 24px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            📚{" "}
            {role === "teacher"
              ? "Manage courses"
              : "Browse courses"}
          </Link>

          {/* ------------------------------------------------
              STUDENT RESULTS
          ------------------------------------------------ */}

          {role === "student" && (
            <Link
              href="/results"
              className="btn btn-outline"
              style={{
                padding: "14px 24px",
                borderRadius: 14,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              🏆 My Results
            </Link>
          )}
        </div>

        {/* ------------------------------------------------
            ADMIN PANEL
        ------------------------------------------------ */}

        {user.email &&
          user.email.toLowerCase() ===
            "hafizshaheerahmedkhan@gmail.com" && (
            <Link
              href="/admin"
              className="btn btn-outline"
              style={{
                display: "inline-block",
                marginTop: 24,
                padding: "12px 22px",
                borderRadius: 14,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              🛠️ Go to Admin Panel
            </Link>
          )}
      </div>
    </main>
  );
}