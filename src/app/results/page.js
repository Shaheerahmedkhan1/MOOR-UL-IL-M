"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const stars = Array.from({ length: 20 });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      const q = query(collection(db, "results"), where("studentId", "==", u.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setResults(list);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return (
    <main className="hero-bg-animated" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-cream)" }}>
      Loading...
    </main>
  );

  return (
    <main className="hero-bg-animated" style={{ minHeight: "100vh", padding: "24px", position: "relative", overflow: "hidden" }}>

      <div className="mesh-blob" style={{ top: "-10%", right: "0%", width: "400px", height: "400px", background: "rgba(255,182,39,0.16)", animationDuration: "10s" }} />
      <div className="mesh-blob" style={{ bottom: "-15%", left: "0%", width: "380px", height: "380px", background: "rgba(45,212,191,0.16)", animationDuration: "13s", animationDelay: "1s" }} />

      {stars.map((_, i) => (
        <span key={i} className="star" style={{ top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`, width: 2 + (i % 3), height: 2 + (i % 3), animationDuration: `${2 + (i % 4)}s`, animationDelay: `${i * 0.2}s` }} />
      ))}

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 48, position: "relative" }}>

        <Link href="/dashboard" className="btn btn-outline" style={{ display: "inline-block", marginBottom: 24, padding: "8px 16px", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
          ← Dashboard
        </Link>

        <div style={{ fontSize: 13, letterSpacing: 2, color: "var(--color-gold)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
          Performance
        </div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 34px)", fontWeight: 800, marginBottom: 32, color: "var(--color-cream)" }}>
          My Results
        </h1>

        {results.length === 0 && <p style={{ color: "rgba(246,243,234,0.6)" }}>No quiz results yet.</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {results.map((r) => {
            const percent = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
            const good = percent >= 50;
            return (
              <div key={r.id} className="subject-card" style={{ cursor: "default", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-cream)" }}>{r.subjectName}</div>
                  <div style={{ fontSize: 12, color: "rgba(246,243,234,0.5)" }}>{new Date(r.date).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "var(--color-cream)" }}>{r.score} / {r.total}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: good ? "var(--color-emerald)" : "var(--color-coral)" }}>{percent}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}