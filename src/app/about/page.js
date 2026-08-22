import Link from "next/link";

export default function About() {
  const stars = Array.from({ length: 25 });

  return (
    <main className="hero-bg-animated" style={{ minHeight: "100vh", padding: "24px", position: "relative", overflow: "hidden" }}>

      <div className="mesh-blob" style={{
        top: "-10%",
        left: "5%",
        width: "420px",
        height: "420px",
        color: "var(--color-gold)",
        background: "rgba(255,182,39,0.18)",
        animationDuration: "10s",
      }} />
      <div className="mesh-blob" style={{
        bottom: "-15%",
        right: "0%",
        width: "400px",
        height: "400px",
        color: "var(--color-emerald)",
        background: "rgba(45,212,191,0.18)",
        animationDuration: "13s",
        animationDelay: "1s",
      }} />
      <div className="mesh-blob" style={{
        top: "10%",
        right: "10%",
        width: "240px",
        height: "240px",
        color: "var(--color-coral)",
        background: "rgba(255,107,74,0.15)",
        animationDuration: "9s",
        animationDelay: "2s",
      }} />
      <div className="mesh-blob" style={{
        bottom: "20%",
        left: "15%",
        width: "220px",
        height: "220px",
        color: "var(--color-gold)",
        background: "rgba(255,182,39,0.14)",
        animationDuration: "11s",
        animationDelay: "1.5s",
      }} />

      {stars.map((_, i) => (
        <span key={i} className="star" style={{ top: `${(i * 37) % 100}%`, left: `${(i * 53) % 100}%`, width: 2 + (i % 3), height: 2 + (i % 3), animationDuration: `${2 + (i % 4)}s`, animationDelay: `${i * 0.2}s` }} />
      ))}

      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          NOOR-E-<span>ILM</span>
        </Link>
        <div className="navbar-links">
          <Link href="/" className="navbar-link">Home</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 140, paddingBottom: 60, textAlign: "center", position: "relative" }}>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800, marginBottom: 20, color: "var(--color-cream)" }}>
          About <span style={{ color: "var(--color-gold)" }}>NOOR-E-ILM</span>
        </h1>

        <p style={{ color: "rgba(246,243,234,0.8)", fontSize: 18, lineHeight: 1.8, marginBottom: 10 }}>
          NOOR-E-ILM is an online platform built for Secondary and Intermediate students, bringing expert teachers and quality lectures straight to your screen. Every subject, every chapter, and every lesson is designed to help you understand better and score higher, no matter where you live.
        </p>
        <p className="urdu-text" style={{ color: "rgba(246,243,234,0.75)", fontSize: 17, marginBottom: 40 }}>
          نور علم سیکنڈری اور انٹرمیڈیٹ کے طلبہ کے لیے بنایا گیا ایک آن لائن پلیٹ فارم ہے، جو بہترین اساتذہ اور معیاری لیکچرز آپ کی سکرین تک پہنچاتا ہے۔ ہر مضمون، ہر باب اور ہر سبق اس طرح تیار کیا گیا ہے کہ آپ بہتر سمجھ سکیں اور اچھے نمبر حاصل کر سکیں، چاہے آپ کہیں بھی ہوں۔
        </p>

        <div style={{
          border: "1px solid rgba(255,182,39,0.3)",
          borderRadius: 20,
          padding: "36px 28px",
          background: "rgba(255,182,39,0.06)",
          marginBottom: 20,
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-gold), var(--color-coral))",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            color: "#1E1B4B",
          }}>
            HS
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-cream)", marginBottom: 4 }}>
            Hafiz Shaheer Ahmed Khan
          </h2>
          <p style={{ color: "var(--color-gold)", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Founder & Teacher
          </p>
          <p style={{ color: "rgba(246,243,234,0.75)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            Hafiz Shaheer Ahmed Khan founded NOOR-E-ILM with a simple mission: make quality education accessible to every Secondary and Intermediate student, no matter where they live.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <a href="mailto:Hafizshaheerahmedkhan@gmail.com" style={{
              color: "var(--color-emerald)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
            }}>
              📧 Hafizshaheerahmedkhan@gmail.com
            </a>
            <a href="tel:03496456490" style={{
              color: "var(--color-emerald)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
            }}>
              📞 0349-6456490
            </a>
          </div>
        </div>

        <p style={{ color: "var(--color-gold)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          Your success is our mission.
        </p>
        <p className="urdu-text" style={{ color: "var(--color-gold)", fontSize: 20, fontWeight: 600 }}>
          آپ کی کامیابی ہمارا مشن ہے۔
        </p>
      </div>
    </main>
  );
}