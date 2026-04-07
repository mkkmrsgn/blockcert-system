import React from "react";
import SiteNavbar from "./SiteNavbar";

export default function ThemeShell({ title, subtitle, children, wide = false }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');

        html, body, #root {
          margin: 0;
          padding: 0;
          background: #0d1b3e;
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
          font-family: 'Barlow', sans-serif;
        }

        .theme-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at center, rgba(44,92,180,0.18), rgba(13,27,62,0.98)),
            linear-gradient(180deg, #10255a 0%, #0d1b3e 100%);
          color: #fff;
        }

        .theme-overlay {
          min-height: calc(100vh - 76px);
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .theme-container {
          max-width: ${wide ? "1280px" : "780px"};
          margin: 0 auto;
          padding: 42px 20px 60px;
        }

        .theme-header {
          text-align: center;
          margin-bottom: 26px;
        }

        .theme-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 42px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .theme-subtitle {
          color: rgba(255,255,255,0.82);
          font-size: 16px;
          line-height: 1.7;
          max-width: 780px;
          margin: 0 auto;
        }

        .theme-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          padding: 26px 22px;
          backdrop-filter: blur(10px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.22);
        }

        .theme-section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 14px;
        }

        .theme-button {
          background-color: #dc2626;
          color: #fff;
          border: none;
          padding: 12px 22px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.06em;
          font-family: 'Barlow', sans-serif;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .theme-button:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .theme-button.secondary {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.45);
        }

        .theme-button.secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: #fff;
        }

        .theme-link-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          background-color: #dc2626;
          color: #fff;
          border: none;
          padding: 12px 22px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.06em;
          font-family: 'Barlow', sans-serif;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .theme-link-button:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .theme-link-button.outline {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.45);
        }

        .theme-link-button.outline:hover {
          background: rgba(255,255,255,0.08);
          border-color: #fff;
        }

        .theme-page input,
        .theme-page textarea,
        .theme-page select {
          width: 100%;
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .theme-page input::placeholder,
        .theme-page textarea::placeholder {
          color: rgba(255,255,255,0.6);
        }

        .theme-page label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
        }

        .theme-page .message {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .theme-page .message.success {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .theme-page .message.error {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .theme-page .small {
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          line-height: 1.6;
        }

        .theme-page .grid {
          display: grid;
          gap: 18px;
        }

        .theme-page .grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .theme-page .card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          padding: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 26px rgba(0,0,0,0.18);
        }

        .theme-page .nav-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 12px;
        }

        .theme-page .nav-links button,
        .theme-page button {
          background-color: #dc2626;
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .theme-page button:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .theme-page button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .theme-page a.btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          background: transparent;
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.45);
          padding: 10px 18px;
          border-radius: 6px;
          font-weight: 700;
        }

        .theme-page a.btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: #fff;
        }

        @media (max-width: 768px) {
          .theme-title {
            font-size: 34px;
          }

          .theme-container {
            padding-top: 30px;
          }
        }
      `}</style>

      <div className="theme-page">
        <SiteNavbar />
        <div className="theme-overlay">
          <div className="theme-container">
            {(title || subtitle) && (
              <div className="theme-header">
                {title && <h1 className="theme-title">{title}</h1>}
                {subtitle && <p className="theme-subtitle">{subtitle}</p>}
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </>
  );
}