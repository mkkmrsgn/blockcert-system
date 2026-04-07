import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Users,
  Zap,
  ArrowRight,
  Link as ChainIcon,
} from "lucide-react";
import SiteNavbar from "../components/SiteNavbar";

export default function HomeDashboard() {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const dashboardPath =
    storedUser?.role === "admin" || storedUser?.role === "issuer"
      ? "/issuer"
      : "/user";

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          margin: 0;
          padding: 0;
          background: #0d1b3e;
          width: 100%;
          overflow-x: hidden;
        }

        @keyframes pulse-glow {
          0%   { box-shadow: 0 4px 15px rgba(220,38,38,0.5); }
          50%  { box-shadow: 0 4px 30px rgba(220,38,38,0.85), 0 0 0 6px rgba(220,38,38,0.15); }
          100% { box-shadow: 0 4px 15px rgba(220,38,38,0.5); }
        }

        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-logo { animation: fadeInUp 0.7s ease both; }
        .hero-title { animation: fadeInUp 0.7s 0.15s ease both; }
        .hero-subtitle { animation: fadeInUp 0.7s 0.3s ease both; }
        .hero-buttons { animation: fadeInUp 0.7s 0.45s ease both; }

        .register-btn {
          background-color: #dc2626;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 6px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: pulse-glow 2s ease-in-out infinite;
          transition: background-color 0.2s ease, transform 0.15s ease;
          letter-spacing: 0.08em;
          font-family: 'Barlow', sans-serif;
        }

        .register-btn:hover {
          background-color: #b91c1c;
          transform: scale(1.05);
          animation: none;
          box-shadow: 0 6px 20px rgba(220,38,38,0.7);
        }

        .register-btn:hover .btn-arrow {
          animation: bounce-right 0.6s ease infinite;
        }

        .login-btn {
          background-color: transparent;
          border: 2px solid rgba(255,255,255,0.7);
          color: #fff;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 15px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.08em;
          font-family: 'Barlow', sans-serif;
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
        }

        .login-btn:hover {
          background-color: #fff;
          color: #0d1b3e;
          border-color: #fff;
          transform: scale(1.05);
        }

        .feature-card-hover {
          transition: transform 0.25s ease, background 0.25s ease;
        }

        .feature-card-hover:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.14) !important;
        }

        .welcome-card {
          margin-top: 28px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          padding: 22px 20px;
          backdrop-filter: blur(10px);
          max-width: 820px;
          width: 100%;
        }

        .welcome-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          letter-spacing: 0.04em;
          margin-bottom: 10px;
        }

        .welcome-text {
          color: rgba(255,255,255,0.82);
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .welcome-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .welcome-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background-color: #dc2626;
          color: #fff;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          font-family: 'Barlow', sans-serif;
        }

        .welcome-link:hover {
          background-color: #b91c1c;
        }

        .welcome-link.outline {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.5);
        }

        .welcome-link.outline:hover {
          background: rgba(255,255,255,0.1);
          border-color: #fff;
        }

        @media (max-width: 768px) {
          .hero-title-text {
            font-size: 56px !important;
            letter-spacing: 0.14em !important;
          }

          .hero-subtitle-text {
            font-size: 18px !important;
            line-height: 1.7 !important;
          }

          .hero-buttons-row {
            flex-direction: column;
            align-items: center;
          }

          .stats-row {
            flex-direction: column;
            gap: 14px;
          }

          .stats-divider {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .hero-title-text {
            font-size: 42px !important;
          }
        }
      `}</style>

      <SiteNavbar />

      <div style={styles.hero}>
        <div style={styles.heroBgOverlay} />

        <div style={styles.heroContainer}>
          <div style={styles.heroLogoWrap} className="hero-logo">
            <Shield size={140} color="#ffffff" strokeWidth={1.2} />

            <div style={styles.heroLogoInner}>
              <ChainIcon size={34} color="#ffffff" />

              <div style={{ ...styles.block, top: "-8px", left: "8px" }} />
              <div style={{ ...styles.block, bottom: "-8px", right: "8px" }} />
              <div style={{ ...styles.blockSmall, top: "6px", right: "-10px" }} />
              <div style={{ ...styles.blockSmall, bottom: "6px", left: "-10px" }} />
            </div>
          </div>

          <h1 style={styles.title} className="hero-title hero-title-text">
            BLOCKCERT
          </h1>

          <p style={styles.subtitle} className="hero-subtitle hero-subtitle-text">
            Official Blockchain Certificate Verification System for Paperless and
            Tamper-Proof Digital Credentials
          </p>

          {!storedUser ? (
            <div style={styles.heroButtons} className="hero-buttons hero-buttons-row">
              <Link to="/register" style={{ textDecoration: "none" }}>
                <button className="register-btn">
                  REGISTER NOW <ArrowRight size={18} className="btn-arrow" />
                </button>
              </Link>

              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="login-btn">LOG IN</button>
              </Link>
            </div>
          ) : (
            <div className="welcome-card hero-buttons">
              <div className="welcome-title">
                Welcome back, {storedUser.fullName || storedUser.username}
              </div>
              <div className="welcome-text">
                You are still logged in. You can go back to your dashboard or continue browsing the site without signing out.
              </div>

              <div className="welcome-actions">
                <Link to={dashboardPath} className="welcome-link">
                  Go to Dashboard
                </Link>

                <Link to="/schools" className="welcome-link outline">
                  View Driving Schools
                </Link>
              </div>
            </div>
          )}

          <div style={styles.statsRow} className="hero-buttons stats-row">
            {[
              { num: "Ethereum", label: "Wireframe" },
              { num: "3 Roles", label: "Supported" },
              { num: "Real-time", label: "Verification" },
            ].map((s, i, arr) => (
              <React.Fragment key={i}>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{s.num}</span>
                  <span style={styles.statLabel}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div style={styles.statDivider} className="stats-divider" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Why Choose BlockCert?</h2>
        <div style={styles.titleUnderline} />

        <div style={styles.featuresTopRow}>
          {[
            {
              icon: Shield,
              title: "Paperless Certificate Records",
              desc: "Certificates are stored with cryptographic hashes for authenticity and integrity.",
            },
            {
              icon: Lock,
              title: "Blockchain Verification",
              desc: "Each issued certificate can be verified against a blockchain-backed record.",
            },
            {
              icon: Users,
              title: "Multi-Role Platform",
              desc: "Supports users, issuers, and verifiers in one secure certificate ecosystem.",
            },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard} className="feature-card-hover">
              <f.icon size={40} color="#60a5fa" />
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={styles.featuresBottomRow}>
          <div style={{ ...styles.featureCard, ...styles.featureCardStem }} className="feature-card-hover">
            <Zap size={40} color="#60a5fa" />
            <h3 style={styles.featureTitle}>Instant QR Validation</h3>
            <p style={styles.featureDesc}>
              Scan a QR code or enter a certificate number to verify authenticity in real time.
            </p>
          </div>
        </div>
      </div>

      <div style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <h2 style={styles.ctaTitle}>Ready to Secure Your Certificate Records?</h2>
          <p style={styles.ctaText}>
            Join the next generation of secure and verifiable certificate systems.
          </p>

          {!storedUser ? (
            <Link to="/register" style={{ textDecoration: "none" }}>
              <button className="register-btn" style={{ margin: "0 auto" }}>
                Create Your BlockCert <Shield size={18} />
              </button>
            </Link>
          ) : (
            <Link to={dashboardPath} className="welcome-link" style={{ margin: "0 auto" }}>
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>Release 1.0.0</span>
        <span style={styles.footerText}>© 2026 BlockCert — Powered by Blockchain Technology</span>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    background: "#0d1b3e",
    color: "#fff",
    fontFamily: "'Barlow', sans-serif",
  },

  hero: {
    minHeight: "78vh",
    position: "relative",
    background:
      "radial-gradient(circle at center, rgba(44,92,180,0.28), rgba(13,27,62,0.98)), linear-gradient(180deg, #10255a 0%, #0d1b3e 100%)",
    overflow: "hidden",
  },

  heroBgOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
    opacity: 0.42,
    pointerEvents: "none",
  },

  heroContainer: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    minHeight: "78vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "60px 20px 70px",
  },

  heroLogoWrap: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "24px",
  },

  heroLogoInner: {
    position: "absolute",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 25px rgba(37,99,235,0.6)",
  },

  block: {
    position: "absolute",
    width: "12px",
    height: "12px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "2px",
    boxShadow: "0 0 12px rgba(255,255,255,0.35)",
  },

  blockSmall: {
    position: "absolute",
    width: "8px",
    height: "8px",
    background: "rgba(255,255,255,0.85)",
    borderRadius: "2px",
    boxShadow: "0 0 10px rgba(255,255,255,0.25)",
  },

  title: {
    fontSize: "78px",
    fontWeight: 900,
    letterSpacing: "0.25em",
    marginBottom: "18px",
    fontFamily: "'Barlow Condensed', sans-serif",
    textTransform: "uppercase",
    textShadow: "0 4px 22px rgba(0,0,0,0.35)",
  },

  subtitle: {
    maxWidth: "760px",
    fontSize: "22px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.82)",
    marginBottom: "34px",
  },

  heroButtons: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "36px",
    flexWrap: "wrap",
  },

  statsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "14px 22px",
    backdropFilter: "blur(8px)",
    flexWrap: "wrap",
  },

  statItem: {
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 10px",
  },

  statNum: {
    fontWeight: 800,
    fontSize: "24px",
    color: "#fff",
  },

  statLabel: {
    fontSize: "13px",
    opacity: 0.78,
    marginTop: "4px",
    letterSpacing: "0.05em",
  },

  statDivider: {
    width: "1px",
    height: "44px",
    background: "rgba(255,255,255,0.16)",
  },

  featuresSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "70px 20px 50px",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: "36px",
    fontWeight: 800,
    marginBottom: "10px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.06em",
  },

  titleUnderline: {
    width: "96px",
    height: "4px",
    background: "#dc2626",
    margin: "0 auto 34px",
    borderRadius: "999px",
  },

  featuresTopRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px",
    marginBottom: "22px",
  },

  featuresBottomRow: {
    display: "flex",
    justifyContent: "center",
  },

  featureCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    padding: "28px 24px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },

  featureCardStem: {
    maxWidth: "420px",
    width: "100%",
  },

  featureTitle: {
    fontSize: "22px",
    fontWeight: 700,
    marginTop: "18px",
    marginBottom: "12px",
  },

  featureDesc: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.8)",
  },

  ctaSection: {
    padding: "40px 20px 70px",
  },

  ctaBox: {
    maxWidth: "980px",
    margin: "0 auto",
    background: "linear-gradient(135deg, rgba(37,99,235,0.24), rgba(220,38,38,0.2))",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "22px",
    padding: "40px 24px",
    textAlign: "center",
    backdropFilter: "blur(12px)",
  },

  ctaTitle: {
    fontSize: "34px",
    fontWeight: 800,
    marginBottom: "14px",
    fontFamily: "'Barlow Condensed', sans-serif",
  },

  ctaText: {
    fontSize: "17px",
    color: "rgba(255,255,255,0.85)",
    marginBottom: "24px",
    lineHeight: 1.7,
  },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.12)",
    padding: "18px 20px 26px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  footerText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
  },
};