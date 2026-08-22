"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { getUserData } from "@/lib/authHelpers";

export default function Courses() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const stars = Array.from({ length: 20 });

  // ==================================================
  // SUBJECT FORM
  // ==================================================

  const [name, setName] = useState("");
  const [chapterCount, setChapterCount] = useState("");

  // ==================================================
  // BOARD / FIELD / CLASS
  // ==================================================

  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSubField, setSelectedSubField] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ==================================================
  // GET LOGGED IN USER
  // ==================================================

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);
      }
    });

    return () => unsub();
  }, []);

  // ==================================================
  // LOAD SAVED SELECTION
  // ==================================================

  useEffect(() => {
    const savedField = localStorage.getItem("selectedField");

    if (!savedField) {
      loadSubjects();
      return;
    }

    try {
      const parsed = JSON.parse(savedField);

      setSelectedBoard(parsed.board || "");
      setSelectedField(parsed.field || "");
      setSelectedSubField(parsed.subField || "");

      loadSubjects(
        parsed.board || "",
        parsed.field || "",
        parsed.subField || ""
      );
    } catch (error) {
      console.error("Error reading selected field:", error);
      loadSubjects();
    }
  }, []);

  // ==================================================
  // LOAD SUBJECTS
  // ==================================================

  async function loadSubjects(
    boardValue = "",
    fieldValue = "",
    subFieldValue = ""
  ) {
    setLoading(true);

    try {
      let q;

      if (boardValue && fieldValue && subFieldValue) {
        q = query(
          collection(db, "subjects"),
          where("board", "==", boardValue),
          where("field", "==", fieldValue),
          where("subField", "==", subFieldValue)
        );
      } else if (boardValue && fieldValue) {
        q = query(
          collection(db, "subjects"),
          where("board", "==", boardValue),
          where("field", "==", fieldValue)
        );
      } else if (boardValue) {
        q = query(
          collection(db, "subjects"),
          where("board", "==", boardValue)
        );
      } else {
        q = collection(db, "subjects");
      }

      const snap = await getDocs(q);

      setSubjects(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (error) {
      console.error("Error loading subjects:", error);

      // Fallback for older Firebase data
      try {
        const snap = await getDocs(collection(db, "subjects"));

        let data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        if (boardValue) {
          data = data.filter(
            (item) => item.board === boardValue
          );
        }

        if (fieldValue) {
          data = data.filter(
            (item) => item.field === fieldValue
          );
        }

        if (subFieldValue) {
          data = data.filter(
            (item) => item.subField === subFieldValue
          );
        }

        setSubjects(data);
      } catch (fallbackError) {
        console.error(
          "Fallback loading error:",
          fallbackError
        );
      }
    }

    setLoading(false);
  }

  // ==================================================
  // ADMIN / TEACHER CHECK
  // ==================================================

  const isAdmin =
    userData?.email &&
    userData.email.toLowerCase() ===
      "hafizshaheerahmedkhan@gmail.com";

  const isTeacher = userData?.role === "teacher";

  const canManage = isAdmin || isTeacher;

  // ==================================================
  // BOARD OPTIONS
  // ==================================================

  const boards = [
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
  ];

  // ==================================================
  // FIELD OPTIONS
  // ==================================================

  const fields = [
    {
      value: "secondary",
      label: "Secondary",
      color: "gold",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      color: "emerald",
    },
  ];

  // ==================================================
  // SUB FIELD OPTIONS
  // ==================================================

  const subFields = {
    secondary: [
      {
        value: "nine",
        label: "9th Class",
      },
      {
        value: "matric",
        label: "10th Class",
      },
    ],

    intermediate: [
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

  // ==================================================
  // GET BOARD SPECIFIC SUBFIELDS
  // ==================================================

  function getSubFieldOptions() {
    if (!selectedField) {
      return [];
    }

    const options = subFields[selectedField] || [];

    return options.map((item) => {
      if (selectedField === "intermediate") {
        const boardLabel =
          selectedBoard === "federal"
            ? "Federal Board"
            : "Sindh Board";

        return {
          ...item,
          label: `${item.label} — ${boardLabel}`,
          color: "emerald",
        };
      }

      return {
        ...item,
        color: "gold",
      };
    });
  }

  // ==================================================
  // SELECT BOARD
  // ==================================================

  function selectBoard(value) {
    setSelectedBoard(value);
    setSelectedField("");
    setSelectedSubField("");
    setSubjects([]);
  }

  // ==================================================
  // SELECT FIELD
  // ==================================================

  function selectField(value) {
    setSelectedField(value);
    setSelectedSubField("");
    setSubjects([]);
  }

  // ==================================================
  // SELECT CLASS
  // ==================================================

  function selectSubField(value) {
    setSelectedSubField(value);
  }

  // ==================================================
  // ADD SUBJECT
  // ==================================================

  async function handleAddSubject(e) {
    e.preventDefault();

    if (!selectedBoard) {
      alert("Please select your board.");
      return;
    }

    if (!selectedField) {
      alert("Please select Secondary or Intermediate.");
      return;
    }

    if (!selectedSubField) {
      alert("Please select your class/group.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter subject name.");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "subjects"), {
        name: name.trim(),
        chapterCount: Number(chapterCount) || 0,
        board: selectedBoard,
        field: selectedField,
        subField: selectedSubField,
        createdAt: new Date().toISOString(),
      });

      setName("");
      setChapterCount("");

      await loadSubjects(
        selectedBoard,
        selectedField,
        selectedSubField
      );
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Subject add nahi ho saka.");
    }

    setSaving(false);
  }

  // ==================================================
  // DELETE SUBJECT
  // ==================================================

  async function handleDeleteSubject(
    subjectId,
    subjectName
  ) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${subjectName}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(subjectId);

    try {
      await deleteDoc(doc(db, "subjects", subjectId));

      await loadSubjects(
        selectedBoard,
        selectedField,
        selectedSubField
      );
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Subject delete nahi ho saka.");
    }

    setDeletingId(null);
  }

  // ==================================================
  // GET BOARD LABEL
  // ==================================================

  function getBoardLabel(board) {
    switch (board) {
      case "sindh":
        return "Sindh Board";

      case "federal":
        return "Federal Board";

      default:
        return board || "";
    }
  }

  // ==================================================
  // GET FIELD LABEL
  // ==================================================

  function getFieldLabel(field) {
    switch (field) {
      case "secondary":
        return "Secondary";

      case "intermediate":
        return "Intermediate";

      default:
        return field || "";
    }
  }

  // ==================================================
  // GET SUB FIELD LABEL
  // ==================================================

  function getSubFieldLabel(subField) {
    switch (subField) {
      case "nine":
      case "nine-sindh":
        return "9th Class";

      case "matric":
      case "matric-sindh":
        return "10th Class";

      case "first-year-medical":
      case "first-year-medical-sindh":
      case "first-year-medical-federal":
        return "First Year — Medical";

      case "first-year-engineering":
      case "first-year-engineering-sindh":
      case "first-year-engineering-federal":
        return "First Year — Engineering";

      case "second-year-medical":
      case "second-year-medical-sindh":
      case "second-year-medical-federal":
        return "Second Year — Medical";

      case "second-year-engineering":
      case "second-year-engineering-sindh":
      case "second-year-engineering-federal":
        return "Second Year — Engineering";

      default:
        return subField || "";
    }
  }

  // ==================================================
  // SUBJECT INFORMATION
  // ==================================================

  function getSubjectInfo(subject) {
    const board = getBoardLabel(subject.board);
    const field = getFieldLabel(subject.field);
    const subField = getSubFieldLabel(subject.subField);

    const parts = [];

    if (board) {
      parts.push(board);
    }

    if (field) {
      parts.push(field);
    }

    if (subField) {
      parts.push(subField);
    }

    return parts.join(" • ");
  }

  // ==================================================
  // PAGE
  // ==================================================

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
      {/* ==================================================
          BACKGROUND BLOBS
          These are intentionally kept.
      ================================================== */}

      {/* Emerald */}
      <div
        className="mesh-blob"
        style={{
          top: "-10%",
          right: "0%",
          width: "400px",
          height: "400px",
          color: "var(--color-emerald)",
          background: "rgba(45,212,191,0.16)",
          animationDuration: "11s",
        }}
      />

      {/* Gold */}
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

      {/* Coral */}
      <div
        className="mesh-blob"
        style={{
          top: "30%",
          left: "-10%",
          width: "230px",
          height: "230px",
          color: "var(--color-coral)",
          background: "rgba(255,107,74,0.12)",
          animationDuration: "9s",
          animationDelay: "2s",
        }}
      />

      {/* Purple */}
      <div
        className="mesh-blob"
        style={{
          bottom: "5%",
          right: "5%",
          width: "250px",
          height: "250px",
          color: "#8B5CF6",
          background: "rgba(139,92,246,0.10)",
          animationDuration: "12s",
          animationDelay: "1.5s",
        }}
      />

      {/* ==================================================
          STARS
      ================================================== */}

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

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          paddingTop: 48,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* HEADER */}

        <div
          style={{
            fontSize: 13,
            letterSpacing: 2,
            color: "var(--color-gold)",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Explore
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            fontWeight: 800,
            marginBottom: 32,
            color: "var(--color-cream)",
          }}
        >
          Subjects
        </h1>

        {/* ==================================================
            ADD SUBJECT FORM
        ================================================== */}

        {canManage && (
          <form
            onSubmit={handleAddSubject}
            className="subject-form-glass"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              border:
                "1px solid rgba(255,182,39,0.25)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 32,
              background:
                "rgba(255,182,39,0.05)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              position: "relative",
              overflow: "visible",

              /*
                Keep the whole form above the subject
                message/list so an open dropdown can never
                have lower content showing through it.
              */
              zIndex: 50,
            }}
          >
            {/* No decorative blobs inside this form. */}

            <h2
              style={{
                fontSize: 16,
                color: "var(--color-gold)",
                fontWeight: 700,
                margin: 0,
                position: "relative",
                zIndex: 5,
              }}
            >
              + Add New Subject
            </h2>

            {/* ==================================================
                BOARD
            ================================================== */}

            <div
              style={{
                position: "relative",
                zIndex: 30,
              }}
            >
              <p style={sectionTitleStyle}>
                1. Select Board
              </p>

              <AnimatedSelect
                value={selectedBoard}
                placeholder="Select Board"
                options={boards}
                onChange={selectBoard}
              />
            </div>

            {/* ==================================================
                LEVEL
            ================================================== */}

            {selectedBoard && (
              <div
                style={{
                  position: "relative",
                  zIndex: 29,
                  animation:
                    "selectReveal 0.35s ease",
                }}
              >
                <p
                  style={{
                    ...sectionTitleStyle,
                    color:
                      selectedField ===
                      "intermediate"
                        ? "var(--color-emerald)"
                        : "var(--color-gold)",
                  }}
                >
                  2. Select Field
                </p>

                <AnimatedSelect
                  value={selectedField}
                  placeholder="Select Field"
                  options={fields}
                  emeraldFocus={
                    selectedField ===
                    "intermediate"
                  }
                  onChange={selectField}
                />
              </div>
            )}

            {/* ==================================================
                CLASS / GROUP
            ================================================== */}

            {selectedBoard &&
              selectedField && (
                <div
                  style={{
                    position: "relative",
                    zIndex: 28,
                    animation:
                      "selectReveal 0.35s ease",
                  }}
                >
                  <p
                    style={{
                      ...sectionTitleStyle,
                      color:
                        selectedField ===
                        "intermediate"
                          ? "var(--color-emerald)"
                          : "var(--color-gold)",
                    }}
                  >
                    3.{" "}
                    {selectedField ===
                    "secondary"
                      ? "Select Class"
                      : "Select Group / Year"}
                  </p>

                  <AnimatedSelect
                    value={selectedSubField}
                    placeholder={
                      selectedField ===
                      "secondary"
                        ? "Select Class"
                        : "Select Group / Year"
                    }
                    options={getSubFieldOptions()}
                    emeraldFocus={
                      selectedField ===
                      "intermediate"
                    }
                    onChange={
                      selectSubField
                    }
                  />
                </div>
              )}

            {/* ==================================================
                SUBJECT NAME
            ================================================== */}

            {selectedSubField && (
              <>
                <input
                  placeholder="Subject name (e.g. Chemistry)"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="form-input animated-input"
                  style={inputStyle}
                />

                {/* ==================================================
                    CHAPTER COUNT
                ================================================== */}

                <input
                  placeholder="Number of chapters"
                  type="number"
                  min="0"
                  value={chapterCount}
                  onChange={(e) =>
                    setChapterCount(
                      e.target.value
                    )
                  }
                  className="form-input animated-input"
                  style={inputStyle}
                />

                {/* ==================================================
                    ADD BUTTON
                ================================================== */}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{
                    padding: "12px 20px",
                    borderRadius: 10,
                    border: "none",
                    fontWeight: 600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    opacity: saving ? 0.7 : 1,
                    position: "relative",
                    zIndex: 5,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Add Subject"}
                </button>
              </>
            )}
          </form>
        )}

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <p
            style={{
              color:
                "rgba(246,243,234,0.6)",
              position: "relative",
              zIndex: 1,
            }}
          >
            Loading...
          </p>
        )}

        {/* ==================================================
            NO SUBJECTS
        ================================================== */}

        {!loading &&
          subjects.length === 0 && (
            <div
              style={{
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 24,
                textAlign: "center",
                background:
                  "rgba(255,255,255,0.03)",
                backdropFilter: "blur(10px)",
                position: "relative",
                zIndex: 1,
                overflow: "hidden",
              }}
            >
              <p
                style={{
                  color:
                    "rgba(246,243,234,0.6)",
                  margin: 0,
                }}
              >
                No subjects available for
                this class yet.
              </p>
            </div>
          )}

        {/* ==================================================
            SUBJECT LIST
        ================================================== */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
            zIndex: 1,
          }}
        >
          {subjects.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* SUBJECT CARD */}

              <Link
                href={`/courses/${s.id}`}
                style={{
                  textDecoration: "none",
                  flex: 1,
                }}
              >
                <div className="subject-card">
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      color:
                        "var(--color-cream)",
                      marginBottom: 4,
                    }}
                  >
                    {s.name}
                  </div>

                  {s.subField && (
                    <div
                      style={{
                        fontSize: 12,
                        color:
                          "rgba(246,243,234,0.55)",
                        marginTop: 6,
                        lineHeight: 1.6,
                      }}
                    >
                      {getSubjectInfo(s)}
                    </div>
                  )}
                </div>
              </Link>

              {/* DELETE */}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteSubject(
                      s.id,
                      s.name
                    )
                  }
                  disabled={
                    deletingId === s.id
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border:
                      "1px solid rgba(255,107,74,0.35)",
                    background:
                      "rgba(255,107,74,0.08)",
                    color:
                      "var(--color-coral)",
                    fontWeight: 700,
                    cursor:
                      deletingId === s.id
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      deletingId === s.id
                        ? 0.6
                        : 1,
                  }}
                >
                  {deletingId === s.id
                    ? "..."
                    : "Delete"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          ALL SELECT / INPUT ANIMATIONS
      ================================================== */}

      <style jsx global>{`
        /* ==================================================
           SELECT WRAPPER
        ================================================== */

        .animated-select-wrapper {
          position: relative;
          width: 100%;
          margin-bottom: 16px;
          z-index: 100;
        }

        /* ==================================================
           SELECT BUTTON
        ================================================== */

        .animated-select-button {
          width: 100%;
          min-height: 46px;
          padding: 12px 42px 12px 14px;
          border-radius: 10px;

          border: 1px solid
            rgba(255, 182, 39, 0.3);

          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.055),
              rgba(255, 255, 255, 0.025)
            );

          color: var(--color-cream);

          font-size: 14px;
          font-family: inherit;
          text-align: left;
          cursor: pointer;

          position: relative;
          overflow: hidden;
          outline: none;
          box-sizing: border-box;

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease,
            transform 0.2s ease;

          animation:
            fieldFloat 5s ease-in-out infinite;
        }

        .animated-select-button:hover {
          border-color:
            var(--color-gold) !important;

          box-shadow:
            0 0 14px
              rgba(255, 182, 39, 0.25),
            inset 0 0 12px
              rgba(255, 182, 39, 0.035);

          transform: translateY(-1px);
        }

        .animated-select-button.is-open {
          border-color:
            var(--color-gold) !important;

          box-shadow:
            0 0 0 2px
              rgba(255, 182, 39, 0.07),
            0 0 22px
              rgba(255, 182, 39, 0.22),
            inset 0 0 18px
              rgba(255, 182, 39, 0.04);

          animation:
            selectFocus 1.8s ease-in-out infinite;
        }

        .animated-select-button.is-emerald {
          border-color:
            rgba(45, 212, 191, 0.45);
        }

        .animated-select-button.is-emerald:hover {
          border-color:
            var(--color-emerald) !important;

          box-shadow:
            0 0 16px
              rgba(45, 212, 191, 0.22),
            inset 0 0 14px
              rgba(45, 212, 191, 0.04);

          transform: translateY(-1px);
        }

        .animated-select-button.is-emerald.is-open {
          border-color:
            var(--color-emerald) !important;

          box-shadow:
            0 0 0 2px
              rgba(45, 212, 191, 0.08),
            0 0 24px
              rgba(45, 212, 191, 0.24),
            inset 0 0 18px
              rgba(45, 212, 191, 0.05);

          animation:
            emeraldSelectFocus 1.8s ease-in-out infinite;
        }

        /* ==================================================
           DROPDOWN MENU
        ================================================== */

        .animated-select-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;

          /*
            High z-index + opaque dark background.
            This keeps the dropdown above every following
            field, label, subject message and card.
          */
          z-index: 999999;

          border-radius: 10px;

          border:
            1px solid rgba(255, 182, 39, 0.45);

          background:
            linear-gradient(
              135deg,
              rgba(34, 29, 68, 0.99),
              rgba(25, 25, 57, 0.99),
              rgba(20, 43, 41, 0.99)
            );

          box-shadow:
            0 18px 40px
              rgba(0, 0, 0, 0.55),
            0 0 24px
              rgba(255, 182, 39, 0.14);

          overflow: hidden;

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          animation:
            selectMenuIn 0.22s ease forwards;
        }

        .animated-select-menu.is-emerald {
          border-color:
            rgba(45, 212, 191, 0.5);

          box-shadow:
            0 18px 40px
              rgba(0, 0, 0, 0.55),
            0 0 24px
              rgba(45, 212, 191, 0.14);
        }

        /* ==================================================
           OPTIONS
        ================================================== */

        .animated-option {
          width: 100%;

          border: 1px solid transparent;

          border-radius: 7px;

          padding: 10px 12px;

          background: transparent;

          color:
            rgba(246, 243, 234, 0.82);

          text-align: left;

          cursor: pointer;

          font-size: 14px;
          font-family: inherit;

          margin-bottom: 2px;

          transition:
            border-color 0.25s ease,
            background 0.25s ease,
            color 0.25s ease,
            box-shadow 0.25s ease,
            transform 0.25s ease;
        }

        .animated-option:last-child {
          margin-bottom: 0;
        }

        /*
          GOLD FIELD HOVER GLOW
        */

        .animated-option-gold:hover {
          border-color:
            var(--color-gold) !important;

          background:
            rgba(255, 182, 39, 0.13) !important;

          color:
            var(--color-gold) !important;

          box-shadow:
            0 0 14px
              rgba(255, 182, 39, 0.25),
            inset 0 0 10px
              rgba(255, 182, 39, 0.035);

          transform:
            translateX(2px)
            scale(1.005);
        }

        /*
          EMERALD FIELD HOVER GLOW
        */

        .animated-option-emerald:hover {
          border-color:
            var(--color-emerald) !important;

          background:
            rgba(45, 212, 191, 0.12) !important;

          color:
            var(--color-emerald) !important;

          box-shadow:
            0 0 16px
              rgba(45, 212, 191, 0.26),
            inset 0 0 10px
              rgba(45, 212, 191, 0.04);

          transform:
            translateX(2px)
            scale(1.005);
        }

        /*
          Extra hover glow for the selected field/button
          without changing its existing visual language.
        */

        .animated-option-gold:focus-visible {
          outline: none;

          border-color:
            var(--color-gold) !important;

          background:
            rgba(255, 182, 39, 0.13) !important;

          color:
            var(--color-gold) !important;

          box-shadow:
            0 0 0 2px
              rgba(255, 182, 39, 0.08),
            0 0 18px
              rgba(255, 182, 39, 0.28);
        }

        .animated-option-emerald:focus-visible {
          outline: none;

          border-color:
            var(--color-emerald) !important;

          background:
            rgba(45, 212, 191, 0.12) !important;

          color:
            var(--color-emerald) !important;

          box-shadow:
            0 0 0 2px
              rgba(45, 212, 191, 0.08),
            0 0 20px
              rgba(45, 212, 191, 0.30);
        }

        .animated-option-gold.selected {
          border-color:
            var(--color-gold);

          background:
            rgba(255, 182, 39, 0.13);

          color:
            var(--color-gold);

          box-shadow:
            0 0 12px
              rgba(255, 182, 39, 0.18);
        }

        .animated-option-emerald.selected {
          border-color:
            var(--color-emerald);

          background:
            rgba(45, 212, 191, 0.12);

          color:
            var(--color-emerald);

          box-shadow:
            0 0 14px
              rgba(45, 212, 191, 0.20);
        }

        /* ==================================================
           INPUT
        ================================================== */

        .animated-input {
          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease,
            transform 0.2s ease;
        }

        .animated-input:hover {
          border-color:
            rgba(255, 182, 39, 0.55) !important;

          transform: translateY(-1px);
        }

        .animated-input:focus {
          outline: none;

          border-color:
            var(--color-gold) !important;

          background:
            rgba(255, 255, 255, 0.06) !important;

          box-shadow:
            0 0 0 2px
              rgba(255, 182, 39, 0.07),
            0 0 20px
              rgba(255, 182, 39, 0.14);
        }

        /* ==================================================
           REVEAL ANIMATION
        ================================================== */

        @keyframes selectReveal {
          from {
            opacity: 0;
            transform: translateY(-7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ==================================================
           FIELD FLOAT
        ================================================== */

        @keyframes fieldFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-1px);
          }
        }

        /* ==================================================
           GOLD FOCUS GLOW
        ================================================== */

        @keyframes selectFocus {
          0%,
          100% {
            box-shadow:
              0 0 0 2px
                rgba(255, 182, 39, 0.08),
              0 0 18px
                rgba(255, 182, 39, 0.15);
          }

          50% {
            box-shadow:
              0 0 0 2px
                rgba(255, 182, 39, 0.11),
              0 0 30px
                rgba(255, 182, 39, 0.27);
          }
        }

        /* ==================================================
           EMERALD FOCUS GLOW
        ================================================== */

        @keyframes emeraldSelectFocus {
          0%,
          100% {
            box-shadow:
              0 0 0 2px
                rgba(45, 212, 191, 0.08),
              0 0 19px
                rgba(45, 212, 191, 0.16);
          }

          50% {
            box-shadow:
              0 0 0 2px
                rgba(45, 212, 191, 0.12),
              0 0 31px
                rgba(45, 212, 191, 0.28);
          }
        }

        /* ==================================================
           MENU ANIMATION
        ================================================== */

        @keyframes selectMenuIn {
          from {
            opacity: 0;
            transform:
              translateY(-7px)
              scale(0.985);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 600px) {
          .animated-select-button {
            font-size: 14px;
          }

          .animated-option {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}

// ==================================================
// ANIMATED SELECT COMPONENT
// ==================================================

function AnimatedSelect({
  value,
  placeholder,
  options,
  onChange,
  emeraldFocus = false,
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
        !wrapperRef.current.contains(
          event.target
        )
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
      className="animated-select-wrapper"
    >
      {/* ==================================================
          SELECT BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`animated-select-button ${
          emeraldFocus
            ? "is-emerald"
            : ""
        } ${open ? "is-open" : ""}`}
      >
        <span
          style={{
            position: "relative",
            zIndex: 2,
            color: selectedOption
              ? "var(--color-cream)"
              : "rgba(246,243,234,0.7)",
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
              open
                ? "rotate(180deg)"
                : "rotate(0deg)"
            }`,
            transition:
              "transform 0.25s ease",
            color: emeraldFocus
              ? "var(--color-emerald)"
              : "var(--color-gold)",
            fontSize: 14,
            zIndex: 3,
          }}
        >
          ▼
        </span>
      </button>

      {/* ==================================================
          DROPDOWN
      ================================================== */}

      {open && (
        <div
          className={`animated-select-menu ${
            emeraldFocus
              ? "is-emerald"
              : ""
          }`}
        >
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
                option.color ===
                "emerald";

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`animated-option ${
                    isEmerald
                      ? "animated-option-emerald"
                      : "animated-option-gold"
                  } ${
                    selected
                      ? "selected"
                      : ""
                  }`}
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

// ==================================================
// SECTION TITLE
// ==================================================

const sectionTitleStyle = {
  fontSize: 13,
  color: "var(--color-gold)",
  fontWeight: 700,
  marginBottom: 10,
};

// ==================================================
// INPUT STYLE
// ==================================================

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