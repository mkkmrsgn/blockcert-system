import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useParams, Link } from "react-router-dom";
import ThemeShell from "../components/ThemeShell";

export default function CertificateViewerPage() {
  const { certificateNumber } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/verifier/certificate/${certificateNumber}`);
        setCertificate(res.data.certificate);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load certificate");
      }
    };

    if (certificateNumber) {
      loadCertificate();
    }
  }, [certificateNumber]);

  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!certificate?.certificateFileUrl) return;

    const fileUrl = `${API_URL}/uploads/${certificate.certificateFileUrl}`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = certificate.certificateFileUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <ThemeShell
        title="Certificate Viewer"
        subtitle="Official certificate display for verification and presentation."
        wide
      >
        <div className="message error">{error}</div>
        <div className="nav-links" style={{ marginTop: "20px" }}>
          <Link to="/" className="btn">Back Home</Link>
        </div>
      </ThemeShell>
    );
  }

  return (
    <ThemeShell
      title="Official Certificate Viewer"
      subtitle="This view is for verification and presentation only."
      wide
    >
      <style>{`
        .viewer-frame,
        .viewer-image {
          width: 100%;
          border: none;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 12px 28px rgba(0,0,0,0.18);
        }

        .viewer-frame {
          min-height: 820px;
        }

        .viewer-image {
          max-width: 100%;
          display: block;
          margin: 0 auto;
        }

        .viewer-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .viewer-label {
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .viewer-value {
          word-break: break-word;
          line-height: 1.7;
        }

        @media print {
          nav,
          .nav-links,
          .no-print {
            display: none !important;
          }

          body {
            background: #fff !important;
          }

          .card {
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
          }
        }
      `}</style>

      {certificate ? (
        <>
          <div className="card" style={{ marginBottom: "22px" }}>
            <div className="viewer-meta-grid">
              <div>
                <div className="viewer-label">Certificate Number</div>
                <div className="viewer-value">{certificate.certificateNumber}</div>

                <div className="viewer-label" style={{ marginTop: "14px" }}>Full Name</div>
                <div className="viewer-value">{certificate.fullName}</div>

                <div className="viewer-label" style={{ marginTop: "14px" }}>Course</div>
                <div className="viewer-value">{certificate.courseName}</div>

                <div className="viewer-label" style={{ marginTop: "14px" }}>School</div>
                <div className="viewer-value">{certificate.schoolName}</div>
              </div>

              <div>
                <div className="viewer-label">Status</div>
                <div className="viewer-value">{certificate.status}</div>

                <div className="viewer-label" style={{ marginTop: "14px" }}>Date Issued</div>
                <div className="viewer-value">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-PH", {
                    timeZone: "Asia/Manila",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>

                <div className="viewer-label" style={{ marginTop: "14px" }}>Certificate Hash</div>
                <div className="viewer-value small">{certificate.certificateHash}</div>

                <div className="viewer-label" style={{ marginTop: "14px" }}>Blockchain TX</div>
                <div className="viewer-value small">
                  {certificate.blockchainTxHash || "No transaction hash available"}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="theme-section-title">Certificate Preview</h3>

            {certificate.certificateFileUrl ? (
              <>
                {certificate.certificateFileUrl.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    title="Certificate PDF"
                    src={`${API_URL}/uploads/${certificate.certificateFileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="viewer-frame"
                  />
                ) : (
                  <img
                    src={`${API_URL}/uploads/${certificate.certificateFileUrl}`}
                    alt="Certificate"
                    className="viewer-image"
                    draggable="false"
                  />
                )}
              </>
            ) : (
              <div className="message">No certificate file available.</div>
            )}
          </div>
        </>
      ) : (
        <div className="message">Loading certificate...</div>
      )}

      <div className="nav-links no-print" style={{ marginTop: "24px" }}>
        <button onClick={handlePrint}>Print Certificate</button>

        {certificate?.certificateFileUrl && (
          <button onClick={handleDownload}>Download Certificate</button>
        )}

        <Link to={`/verify/${certificateNumber}`} className="btn">Back to Verification</Link>
        <Link to="/" className="btn">Home</Link>
      </div>
    </ThemeShell>
  );
}