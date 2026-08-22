"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { getUserData } from "@/lib/authHelpers";

export default function SubjectDetails() {
  const params = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const stars = Array.from({ length: 20 });

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [notesUrl, setNotesUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // --------------------------------------------------
  // GET USER
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const data = await getUserData(u.uid);
        setUserData(data);
      }
    });

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // LOAD SUBJECT + LECTURES
  // --------------------------------------------------

  async function loadData() {
    setLoading(true);

    try {
      // ----------------------------------------------
      // SUBJECT
      // ----------------------------------------------

      const subjectRef = doc(db, "subjects", params.id);
      const subjectSnap = await getDoc(subjectRef);

      if (!subjectSnap.exists()) {
        setSubject(null);
        setLoading(false);
        return;
      }

      const subjectData = {
        id: subjectSnap.id,
        ...subjectSnap.data(),
      };

      setSubject(subjectData);

      // ----------------------------------------------
      // CHECK STUDENT'S SELECTED FIELD
      // ----------------------------------------------

      const savedField = localStorage.getItem("selectedField");

      if (savedField) {
        try {
          const selected = JSON.parse(savedField);

          const selectedField = selected.field;
          const selectedSubField = selected.subField;

          // ------------------------------------------
          // Agar subject kisi specific class ka hai
          // aur student ki selected class different hai
          // to subject access nahi hoga.
          // ------------------------------------------

          if (
            subjectData.field &&
            subjectData.subField &&
            (subjectData.field !== selectedField ||
              subjectData.subField !== selectedSubField)
          ) {
            setSubject(null);
            setLectures([]);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error(
            "Error reading selected field:",
            error
          );
        }
      }

      // ----------------------------------------------
      // LECTURES
      // ----------------------------------------------

      const lectureQuery = query(
        collection(db, "lectures"),
        where("subjectId", "==", params.id)
      );

      const lectureSnap = await getDocs(lectureQuery);

      setLectures(
        lectureSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (error) {
      console.error("Error loading subject:", error);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  // --------------------------------------------------
  // ADMIN / TEACHER
  // --------------------------------------------------

  const isAdmin =
    userData?.email &&
    userData.email.toLowerCase() ===
      "hafizshaheerahmedkhan@gmail.com";

  const isTeacher = userData?.role === "teacher";

  const canManage = isAdmin || isTeacher;

  // --------------------------------------------------
  // ADD LECTURE
  // --------------------------------------------------

  async function handleAddLecture(e) {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "lectures"), {
        subjectId: params.id,
        subjectName: subject?.name || "",

        // Subject ki field/class bhi lecture ke saath save
        field: subject?.field || "",
        subField: subject?.subField || "",

        title: title.trim(),
        videoUrl: videoUrl.trim(),
        notesUrl: notesUrl.trim(),

        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setVideoUrl("");
      setNotesUrl("");

      await loadData();
    } catch (error) {
      console.error("Error adding lecture:", error);
      alert("Lecture add nahi ho saka.");
    }

    setSaving(false);
  }

  // --------------------------------------------------
  // DELETE LECTURE
  // --------------------------------------------------

  async function handleDeleteLecture(
    lectureId,
    lectureTitle
  ) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${lectureTitle}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(lectureId);

    try {
      await deleteDoc(
        doc(db, "lectures", lectureId)
      );

      await loadData();
    } catch (error) {
      console.error(
        "Error deleting lecture:",
        error
      );

      alert("Lecture delete nahi ho saka.");
    }

    setDeletingId(null);
  }

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

  // --------------------------------------------------
  // SUBJECT NOT FOUND / NOT ALLOWED
  // --------------------------------------------------

  if (!subject) {
    return (
      <main
        className="hero-bg-animated"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "var(--color-cream)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 420,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              marginBottom: 12,
            }}
          >
            Subject not available
          </h1>

          <p
            style={{
              color: "rgba(246,243,234,0.65)",
              marginBottom: 24,
            }}
          >
            This subject is not available for your
            selected class.
          </p>

          <Link
            href="/courses"
            className="btn btn-primary"
            style={{
              display: "inline-block",
              padding: "12px 22px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to Subjects
          </Link>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
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
      {/* Gold Blob */}

      <div
        className="mesh-blob"
        style={{
          top: "-10%",
          left: "0%",
          width: "400px",
          height: "400px",
          color: "var(--color-gold)",
          background: "rgba(255,182,39,0.16)",
          animationDuration: "11s",
        }}
      />

      {/* Emerald Blob */}

      <div
        className="mesh-blob"
        style={{
          bottom: "-15%",
          right: "0%",
          width: "380px",
          height: "380px",
          color: "var(--color-emerald)",
          background: "rgba(45,212,191,0.16)",
          animationDuration: "13s",
          animationDelay: "1s",
        }}
      />

      {/* Stars */}

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

      {/* NAVBAR */}

      <nav className="navbar">
        <Link
          href="/"
          className="navbar-logo"
        >
          NOOR-E-<span>ILM</span>
        </Link>

        <div className="navbar-links">
          <Link
            href="/courses"
            className="navbar-link"
          >
            Subjects
          </Link>
        </div>
      </nav>

      {/* CONTENT */}

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          paddingTop: 120,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* SUBJECT TITLE */}

        <h1
          style={{
            fontSize:
              "clamp(26px, 5vw, 34px)",
            fontWeight: 800,
            marginBottom: 6,
            color: "var(--color-cream)",
          }}
        >
          {subject.name}
        </h1>

        {/* LEVEL */}

        <p
          style={{
            color: "var(--color-gold)",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {subject.level}
        </p>

        {/* FIELD / CLASS */}

        {subject.subField && (
          <p
            style={{
              color: "rgba(246,243,234,0.55)",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {subject.field === "secondary"
              ? "Secondary"
              : "Intermediate"}{" "}
            •{" "}
            {subject.subField === "nine"
              ? "NINE"
              : subject.subField === "matric"
              ? "MATRIC"
              : subject.subField ===
                "first-year-engineering"
              ? "First Year (ENGINEERING)"
              : subject.subField ===
                "second-year-engineering"
              ? "Second Year (ENGINEERING)"
              : subject.subField}
          </p>
        )}

        {/* QUIZ */}

        <Link
          href={`/courses/${params.id}/quiz`}
          className="btn btn-outline"
          style={{
            display: "inline-block",
            marginBottom: 28,
            padding: "10px 20px",
            borderRadius: 999,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          📝 Take Quiz
        </Link>

        {/* ------------------------------------------------
            ADD LECTURE
        ------------------------------------------------ */}

        {canManage && (
          <form
            onSubmit={handleAddLecture}
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
            }}
          >
            <h2
              style={{
                fontSize: 16,
                color: "var(--color-gold)",
                fontWeight: 700,
                margin: 0,
              }}
            >
              + Add New Lecture
            </h2>

            <input
              placeholder="Lecture title (e.g. Chapter 1: Motion)"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="form-input"
              style={inputStyle}
            />

            <input
              placeholder="Video URL (YouTube link)"
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(e.target.value)
              }
              className="form-input"
              style={inputStyle}
            />

            <input
              placeholder="Notes URL (PDF link)"
              value={notesUrl}
              onChange={(e) =>
                setNotesUrl(e.target.value)
              }
              className="form-input"
              style={inputStyle}
            />

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
              }}
            >
              {saving
                ? "Saving..."
                : "Add Lecture"}
            </button>
          </form>
        )}

        {/* ------------------------------------------------
            LECTURES
        ------------------------------------------------ */}

        <h2
          style={{
            fontSize: 18,
            marginBottom: 14,
            color: "var(--color-cream)",
            fontWeight: 700,
          }}
        >
          Lectures
        </h2>

        {lectures.length === 0 && (
          <p
            style={{
              color:
                "rgba(246,243,234,0.6)",
            }}
          >
            No lectures yet.
          </p>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="subject-card"
              style={{
                cursor: "default",
              }}
            >
              {/* TITLE */}

              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color:
                    "var(--color-cream)",
                  marginBottom: 8,
                }}
              >
                {lecture.title}
              </div>

              {/* LINKS */}

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  alignItems: "center",
                  fontSize: 13,
                }}
              >
                {lecture.videoUrl && (
                  <a
                    href={lecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color:
                        "var(--color-gold)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    ▶ Watch Video
                  </a>
                )}

                {lecture.notesUrl && (
                  <a
                    href={lecture.notesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color:
                        "var(--color-emerald)",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    📄 Download Notes
                  </a>
                )}

                {/* DELETE LECTURE */}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteLecture(
                        lecture.id,
                        lecture.title
                      )
                    }
                    disabled={
                      deletingId ===
                      lecture.id
                    }
                    style={{
                      marginLeft: "auto",
                      padding:
                        "7px 12px",
                      borderRadius: 8,
                      border:
                        "1px solid rgba(255,107,74,0.35)",
                      background:
                        "rgba(255,107,74,0.08)",
                      color:
                        "var(--color-coral)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor:
                        deletingId ===
                        lecture.id
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        deletingId ===
                        lecture.id
                          ? 0.6
                          : 1,
                    }}
                  >
                    {deletingId ===
                    lecture.id
                      ? "..."
                      : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// --------------------------------------------------
// INPUT STYLE
// --------------------------------------------------

const inputStyle = {
  padding: "12px 14px",
  borderRadius: 10,
  border:
    "1px solid rgba(255,182,39,0.3)",
  background:
    "rgba(255,255,255,0.05)",
  color: "var(--color-cream)",
  fontSize: 14,
};
