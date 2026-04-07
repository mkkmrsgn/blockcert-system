import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useParams, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import ThemeShell from "../components/ThemeShell";

export default function VerifyPage() {
  const { certificateNumber: paramCertificateNumber } = useParams();
  const [certificateNumber, setCertificateNumber] = useState(paramCertificateNumber || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  const verifyCertificate = async (certNo) => {
    try {
      setError("");
      setResult(null);
      const res = await axios.get(`${API_URL}/api/verifier/certificate/${certNo}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  useEffect(() => {
    if (paramCertificateNumber) {
      verifyCertificate(paramCertificateNumber);
    }
  }, [paramCertificateNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!certificateNumber) return;
    verifyCertificate(certificateNumber);
  };

  const startScanner = async () => {
    try {
      setError("");
      if (scannerRef.current) return;

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          const certNo = decodedText.includes("/verify/")
            ? decodedText.split("/verify/").pop()
            : decodedText;

          setCertificateNumber(certNo);
          verifyCertificate(certNo);
          stopScanner();
        },
        () => {}
      );

      setScannerActive(true);
    } catch (err) {
      setError("Unable to access camera for QR scanning");
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {}
    setScannerActive(false);
  };

  const handleQrImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const html5QrCode = new Html5Qrcode("qr-reader-file");
      const decodedText = await html5QrCode.scanFile(file, true);

      const certNo = decodedText.includes("/verify/")
        ? decodedText.split("/verify/").pop()
        : decodedText;

      setCertificateNumber(certNo);
      verifyCertificate(certNo);
    } catch (err) {
      setError("Could not read QR from uploaded image");
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const hasVerifiedResult = !!result;

  return (
    <ThemeShell
      title="Certificate Verification"
      subtitle="Verify authenticity using certificate number, QR scan, or uploaded QR image."
      wide
    >
      {!hasVerifiedResult && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Enter Certificate Number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
            />

            <div className="nav-links">
              <button type="submit">Verify</button>
            </div>
          </form>

          <div className="nav-links" style={{ marginTop: "12px" }}>
            {!scannerActive ? (
              <button type="button" onClick={startScanner}>
                Scan QR with Camera
              </button>
            ) : (
              <button type="button" onClick={stopScanner}>
                Stop Camera
              </button>
            )}
          </div>

          <div className="card" style={{ marginTop: "16px" }}>
            <label>Upload QR Image</label>
            <input type="file" accept="image/*" onChange={handleQrImageUpload} />
          </div>

          <div
            id="qr-reader"
            style={{ width: "100%", maxWidth: "360px", marginTop: "16px" }}
          />
          <div id="qr-reader-file" style={{ display: "none" }} />
        </div>
      )}

      {error && <div className="message error">{error}</div>}

      {result && (
        <div className="card">
          <h3 style={{ color: result.valid ? "#22c55e" : "#ef4444" }}>
            {result.valid ? "✔ VALID CERTIFICATE" : "✖ INVALID CERTIFICATE"}
          </h3>

          <p><strong>Certificate Number:</strong> {result.certificate.certificateNumber}</p>
          <p><strong>Full Name:</strong> {result.certificate.fullName}</p>
          <p><strong>Course:</strong> {result.certificate.courseName}</p>
          <p><strong>School:</strong> {result.certificate.schoolName}</p>
          <p><strong>Date Issued:</strong> {new Date(result.certificate.issuedAt).toLocaleString()}</p>

          <hr />

          <p><strong>Certificate Hash:</strong></p>
          <p className="small">{result.certificate.certificateHash}</p>

          <p><strong>Blockchain Transaction:</strong></p>
          <p className="small">{result.certificate.blockchainTxHash}</p>

          {result.certificate.certificateFileUrl && (
            <p>
              <strong>Certificate File:</strong>{" "}
              <Link to={`/certificate-view/${result.certificate.certificateNumber}`}>
                Open Certificate Viewer
              </Link>
            </p>
          )}

          {result.certificate.qrCodeDataUrl && (
            <div style={{ marginTop: "16px" }}>
              <img
                src={result.certificate.qrCodeDataUrl}
                alt="QR Code"
                style={{
                  width: "180px",
                  borderRadius: "10px",
                  background: "#fff",
                  padding: "8px",
                }}
              />
            </div>
          )}

          <div className="nav-links" style={{ marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setCertificateNumber("");
                setError("");
              }}
            >
              Verify Another Certificate
            </button>
          </div>
        </div>
      )}

      <div className="nav-links" style={{ marginTop: "20px" }}>

      </div>
    </ThemeShell>
  );
}