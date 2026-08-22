import Link from "next/link";

export default function Home() {
  const stars = Array.from({ length: 15 });
  const particles = Array.from({ length: 8 });

  return (
    <main
      className="hero-bg-animated"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          NOOR-E-<span>ILM</span>
        </Link>

        <div className="navbar-links">
          <Link href="/about" className="navbar-link">
            About
          </Link>
        </div>
      </nav>

      {/* Gold Blob - moves toward centre */}
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

      {/* Emerald Blob - moves toward centre */}
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

      {/* Coral Blob - moves toward centre */}
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

      {/* Purple Blob - moves toward centre */}
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

      {stars.map((_, i) => {
        const size = 2 + (i % 3);

        return (
          <span
            key={i}
            className="star"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              width: size,
              height: size,
              animationDuration: `${2 + (i % 4)}s`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        );
      })}

      {particles.map((_, i) => (
        <span
          key={`p-${i}`}
          className="particle"
          style={{
            left: `${(i * 91) % 100}%`,
            animationDuration: `${6 + (i % 5)}s`,
            animationDelay: `${i * 0.7}s`,
            opacity: 0.6,
          }}
        />
      ))}

      <div className="hero-icon-wrap">
        <svg
          className="hero-icon-svg"
          width="90"
          height="90"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 20C42 15 28 13 18 16V70C28 67 42 69 50 74C58 69 72 67 82 70V16C72 13 58 15 50 20Z"
            stroke="#FFB627"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="rgba(255,182,39,0.12)"
          />
          <path
            d="M50 20V74"
            stroke="#FFB627"
            strokeWidth="3"
          />
          <path
            d="M25 28H40"
            stroke="#2DD4BF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M25 38H40"
            stroke="#2DD4BF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M60 28H75"
            stroke="#FF6B4A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M60 38H75"
            stroke="#FF6B4A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <span
          className="hero-sparkle"
          style={{
            top: -6,
            right: 2,
            fontSize: 18,
            animationDelay: "0s",
          }}
        >
          ✦
        </span>

        <span
          className="hero-sparkle"
          style={{
            bottom: 4,
            left: -10,
            fontSize: 14,
            animationDelay: "0.8s",
          }}
        >
          ✦
        </span>

        <span
          className="hero-sparkle"
          style={{
            top: 30,
            right: -14,
            fontSize: 12,
            animationDelay: "1.5s",
          }}
        >
          ✦
        </span>
      </div>

      <div
        className="hero-eyebrow"
        style={{
          fontSize: 13,
          letterSpacing: 3,
          color: "var(--color-gold)",
          fontWeight: 600,
          marginBottom: 16,
          textTransform: "uppercase",
          position: "relative",
        }}
      >
        Secondary & Intermediate
      </div>

      <h1
        className="hero-title hero-title-pop"
        style={{
          fontSize: "clamp(40px, 8vw, 72px)",
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: 20,
          maxWidth: 800,
          position: "relative",
        }}
      >
        NOOR-E-ILM
      </h1>

      <p
        className="hero-sub"
        style={{
          color: "var(--color-cream)",
          fontSize: 22,
          marginBottom: 0,
          maxWidth: 560,
          lineHeight: 1.6,
          fontWeight: 500,
          position: "relative",
        }}
      >
        Wherever you are, quality education and powerful lectures are always
        within your reach, built to help you achieve your dreams.
      </p>

      <p
        className="hero-urdu urdu-text"
        style={{
          color: "var(--color-emerald)",
          fontSize: 20,
          marginTop: "-4px",
          marginBottom: 40,
          maxWidth: 560,
          fontWeight: 600,
          lineHeight: 3.2,
          position: "relative",
        }}
      >
        آپ جہاں بھی ہوں، معیاری تعلیم اور بہترین لیکچرز ہمیشہ آپ کی دسترس میں
        ہیں، جو آپ کے خوابوں کی تکمیل کے لیے تیار کیے گئے ہیں۔
      </p>

      <div
        className="hero-buttons"
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        <Link
          href="/signup"
          className="btn btn-primary"
          style={{
            padding: "14px 32px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Get started
        </Link>

        <Link
          href="/login"
          className="btn btn-outline"
          style={{
            padding: "14px 32px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
