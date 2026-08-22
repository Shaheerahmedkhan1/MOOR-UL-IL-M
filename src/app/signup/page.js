"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpWithEmail, logInWithGoogle } from "@/lib/authHelpers";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("student");

  const [board, setBoard] = useState("");
  const [program, setProgram] = useState("");

  const [error, setError] = useState("");

  const router = useRouter();
  const stars = Array.from({ length: 20 });

  const programOptions = {
    sindh: [
      {
        value: "secondary-9",
        label: "Class 9 — Secondary",
      },
      {
        value: "secondary-10",
        label: "Class 10 — Secondary",
      },
      {
        value: "first-year-engineering",
        label: "First Year — Engineering",
      },
      {
        value: "second-year-engineering",
        label: "Second Year — Engineering",
      },
      {
        value: "first-year-medical",
        label: "First Year — Medical",
      },
      {
        value: "second-year-medical",
        label: "Second Year — Medical",
      },
    ],

    federal: [
      {
        value: "secondary-9",
        label: "Class 9 — Secondary",
      },
      {
        value: "secondary-10",
        label: "Class 10 — Secondary",
      },
      {
        value: "first-year-engineering",
        label: "First Year — Engineering",
      },
      {
        value: "second-year-engineering",
        label: "Second Year — Engineering",
      },
      {
        value: "first-year-medical",
        label: "First Year — Medical",
      },
      {
        value: "second-year-medical",
        label: "Second Year — Medical",
      },
    ],
  };

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    try {
      await signUpWithEmail(name, email, password, role);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGoogle() {
    setError("");

    try {
      await logInWithGoogle(role);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

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
      {/* BLOBS */}

      <div
        className="mesh-blob"
        style={{
          top: "-10%",
          right: "5%",
          width: "400px",
          height: "400px",
          color: "var(--color-emerald)",
          background: "rgba(45,212,191,0.18)",
          animationDuration: "10s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          bottom: "-15%",
          left: "0%",
          width: "380px",
          height: "380px",
          color: "var(--color-gold)",
          background: "rgba(255,182,39,0.16)",
          animationDuration: "13s",
          animationDelay: "1s",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          top: "35%",
          left: "-12%",
          width: "220px",
          height: "220px",
          color: "var(--color-coral)",
          background: "rgba(255,107,74,0.12)",
          animationDuration: "9s",
          animationDelay: "2s",
        }}
      />

      {/* STARS */}

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

      {/* MAIN CARD */}

      <div
        style={{
          maxWidth: 420,
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
            marginBottom: 30,
            fontSize: 22,
          }}
        >
          NOOR-E-<span>ILM</span>
        </Link>

        <div
          style={{
            border: "1px solid rgba(255,182,39,0.25)",
            borderRadius: 20,
            padding: "32px 28px",
            background: "rgba(255,182,39,0.05)",
            backdropFilter: "blur(14px)",
          }}
        >
          {/* TITLE */}

          <h1
            style={{
              fontSize: 25,
              marginBottom: 8,
              color: "var(--color-cream)",
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            Create account
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "rgba(246,243,234,0.55)",
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            Join NOOR-E-ILM and start your learning journey
          </p>

          {/* ROLE */}

          <div
            style={{
              fontSize: 13,
              color: "rgba(246,243,234,0.65)",
              marginBottom: 8,
            }}
          >
            Account type
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <RoleButton
              label="I'm a student"
              active={role === "student"}
              onClick={() => setRole("student")}
            />

            <RoleButton
              label="I'm a teacher"
              active={role === "teacher"}
              onClick={() => setRole("teacher")}
            />
          </div>

          {/* STUDY / TEACH HEADING */}

          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--color-gold)",
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            {role === "teacher"
              ? "Which field do you want to teach?"
              : "Which field do you want to study?"}
          </div>

          {/* BOARD */}

          <div
            style={{
              fontSize: 13,
              color: "rgba(246,243,234,0.65)",
              marginBottom: 8,
            }}
          >
            Select your board
          </div>

          <AnimatedSelect
            value={board}
            placeholder="Select Board"
            options={[
              {
                value: "sindh",
                label: "Sindh Board",
                color: "gold",
              },
              {
                value: "federal",
                label: "Federal Board",
                color: "emerald",
              },
            ]}
            onChange={(value) => {
              setBoard(value);
              setProgram("");
            }}
          />

          {/* CLASS / PROGRAM */}

          {board && (
            <div
              style={{
                animation: "fadeIn 0.3s ease",
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(246,243,234,0.65)",
                  marginBottom: 8,
                }}
              >
                {role === "teacher"
                  ? "Select the class / program you want to teach"
                  : "Select the class / program you want to study"}
              </div>

              <AnimatedSelect
                value={program}
                placeholder="Select Class / Program"
                options={programOptions[board].map((item) => ({
                  ...item,
                  color:
                    item.value.includes("secondary")
                      ? "gold"
                      : "emerald",
                }))}
                onChange={(value) => setProgram(value)}
              />
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
              style={inputStyle}
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              style={inputStyle}
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="form-input"
              style={inputStyle}
            />

            {error && (
              <p
                style={{
                  color: "var(--color-coral)",
                  fontSize: 13,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Sign up
            </button>
          </form>

          {/* GOOGLE */}

          <button
            onClick={handleGoogle}
            className="btn btn-outline"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            Continue with Google
          </button>

          {/* LOGIN */}

          <p
            style={{
              fontSize: 13,
              marginTop: 20,
              textAlign: "center",
              color: "rgba(246,243,234,0.6)",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--color-gold)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ANIMATED SELECT
========================================================= */

function AnimatedSelect({
  value,
  placeholder,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        marginBottom: 16,
      }}
    >
      {/* SELECT BUTTON */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="animated-select-button"
        style={{
          width: "100%",
          minHeight: 46,
          padding: "12px 42px 12px 14px",
          borderRadius: 10,
          border: open
            ? "1px solid var(--color-gold)"
            : "1px solid rgba(255,182,39,0.3)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
          color: selectedOption
            ? "var(--color-cream)"
            : "rgba(246,243,234,0.7)",
          fontSize: 14,
          textAlign: "left",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          outline: "none",
          boxSizing: "border-box",
          transition:
            "border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease",
          boxShadow: open
            ? "0 0 16px rgba(255,182,39,0.35)"
            : "none",
        }}
      >
        {/* SMALL BLOBS INSIDE FIELD */}

        <span
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background:
              "rgba(45,212,191,0.10)",
            filter: "blur(20px)",
            top: -35,
            right: 30,
            pointerEvents: "none",
            animation:
              "selectBlobOne 5s ease-in-out infinite",
          }}
        />

        <span
          style={{
            position: "absolute",
            width: 70,
            height: 70,
            borderRadius: "50%",
            background:
              "rgba(255,182,39,0.09)",
            filter: "blur(20px)",
            bottom: -35,
            left: 25,
            pointerEvents: "none",
            animation:
              "selectBlobTwo 6s ease-in-out infinite",
          }}
        />

        <span
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        {/* ARROW */}

        <span
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: `translateY(-50%) ${
              open ? "rotate(180deg)" : "rotate(0deg)"
            }`,
            transition: "transform 0.25s ease",
            color: "var(--color-cream)",
            fontSize: 14,
            zIndex: 2,
          }}
        >
          ▼
        </span>
      </button>

      {/* DROPDOWN */}

      {open && (
        <div
          className="animated-select-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            borderRadius: 10,
            border:
              "1px solid rgba(255,182,39,0.35)",
            background:
              "linear-gradient(135deg, #292451, #211e46, #182d2b)",
            boxShadow:
              "0 14px 35px rgba(0,0,0,0.45), 0 0 20px rgba(255,182,39,0.12)",
            overflow: "hidden",
            backdropFilter: "blur(16px)",
            animation:
              "selectMenuIn 0.22s ease forwards",
          }}
        >
          {/* DROPDOWN BLOBS */}

          <span
            style={{
              position: "absolute",
              width: 130,
              height: 130,
              borderRadius: "50%",
              background:
                "rgba(45,212,191,0.13)",
              filter: "blur(30px)",
              top: -70,
              right: -30,
              pointerEvents: "none",
              animation:
                "selectBlobOne 5s ease-in-out infinite",
            }}
          />

          <span
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              background:
                "rgba(255,182,39,0.10)",
              filter: "blur(28px)",
              bottom: -55,
              left: -25,
              pointerEvents: "none",
              animation:
                "selectBlobTwo 6s ease-in-out infinite",
            }}
          />

          {/* OPTIONS */}

          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: 5,
            }}
          >
            {options.map((option) => {
              const selected =
                option.value === value;

              const isEmerald =
                option.color === "emerald";

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={
                    isEmerald
                      ? "animated-option animated-option-emerald"
                      : "animated-option animated-option-gold"
                  }
                  style={{
                    width: "100%",
                    border: selected
                      ? isEmerald
                        ? "1px solid var(--color-emerald)"
                        : "1px solid var(--color-gold)"
                      : "1px solid transparent",
                    borderRadius: 7,
                    padding: "10px 12px",
                    background: selected
                      ? isEmerald
                        ? "rgba(45,212,191,0.12)"
                        : "rgba(255,182,39,0.12)"
                      : "transparent",
                    color: selected
                      ? isEmerald
                        ? "var(--color-emerald)"
                        : "var(--color-gold)"
                      : "rgba(246,243,234,0.8)",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 14,
                    fontFamily: "inherit",
                    marginBottom: 2,
                    transition:
                      "all 0.25s ease",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ROLE BUTTON
========================================================= */

function RoleButton({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn role-btn"
      style={{
        flex: 1,
        padding: "10px 12px",
        borderRadius: 10,
        border: active
          ? "1px solid var(--color-gold)"
          : "1px solid rgba(255,182,39,0.2)",
        background: active
          ? "rgba(255,182,39,0.15)"
          : "rgba(255,255,255,0.03)",
        color: active
          ? "var(--color-gold)"
          : "rgba(246,243,234,0.7)",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 13,
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}

/* =========================================================
   INPUT STYLE
========================================================= */

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border:
    "1px solid rgba(255,182,39,0.3)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--color-cream)",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

/* =========================================================
   ANIMATED SELECT CSS
========================================================= */

const selectAnimationStyle = `
@keyframes selectBlobOne {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.65;
  }

  50% {
    transform: translate3d(-25px, 12px, 0) scale(1.25);
    opacity: 1;
  }
}

@keyframes selectBlobTwo {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.55;
  }

  50% {
    transform: translate3d(25px, -15px, 0) scale(1.2);
    opacity: 0.9;
  }
}

@keyframes selectMenuIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animated-option-gold:hover {
  border-color: var(--color-gold) !important;
  background: rgba(255,182,39,0.13) !important;
  color: var(--color-gold) !important;
  box-shadow: 0 0 14px rgba(255,182,39,0.22);
  transform: translateX(2px);
}

.animated-option-emerald:hover {
  border-color: var(--color-emerald) !important;
  background: rgba(45,212,191,0.11) !important;
  color: var(--color-emerald) !important;
  box-shadow: 0 0 14px rgba(45,212,191,0.22);
  transform: translateX(2px);
}

.animated-select-button:hover {
  border-color: var(--color-gold) !important;
  box-shadow: 0 0 14px rgba(255,182,39,0.25);
}
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("signup-select-animation")
) {
  const style = document.createElement("style");
  style.id = "signup-select-animation";
  style.innerHTML = selectAnimationStyle;
  document.head.appendChild(style);
}