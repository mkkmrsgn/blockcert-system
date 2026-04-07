import React, { useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import ThemeShell from "../components/ThemeShell";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    idImage: null,
    selfieImage: null,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cameraMode, setCameraMode] = useState("");
  const [cameraStream, setCameraStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const startCamera = async (mode) => {
    try {
      setError("");
      stopCamera();

      const constraints =
        mode === "selfie"
          ? { video: { facingMode: "user" }, audio: false }
          : { video: { facingMode: { ideal: "environment" } }, audio: false };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraMode(mode);
      setCameraStream(stream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setError("Unable to access camera.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraMode("");
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraMode) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const filename =
          cameraMode === "selfie" ? "selfie-reset.jpg" : "id-reset.jpg";

        const file = new File([blob], filename, { type: "image/jpeg" });

        if (cameraMode === "selfie") {
          setForm((prev) => ({ ...prev, selfieImage: file }));
        } else {
          setForm((prev) => ({ ...prev, idImage: file }));
        }

        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = new FormData();
      data.append("email", form.email);
      data.append("username", form.username);

      if (form.idImage) data.append("idImage", form.idImage);
      if (form.selfieImage) data.append("selfieImage", form.selfieImage);

      const res = await axios.post(`${API_URL}/api/auth/forgot-password-request`, data);

      setMessage(res.data.message || "Request submitted. Please wait for admin approval.");
      setForm({
        email: "",
        username: "",
        idImage: null,
        selfieImage: null,
      });

      document.querySelectorAll('input[type="file"]').forEach((input) => {
        input.value = "";
      });

      stopCamera();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
    }
  };

  return (
    <ThemeShell
      title="Forgot Password"
      subtitle="Enter your email and username, then upload or capture your ID and selfie for review."
    >
      <div className="theme-card">
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Upload Valid ID</label>
          <input
            type="file"
            name="idImage"
            accept="image/*"
            onChange={handleChange}
            required={!form.idImage}
          />
          <button type="button" onClick={() => startCamera("id")}>
            Use Camera for ID
          </button>

          {form.idImage && <p className="small">Selected ID: {form.idImage.name}</p>}

          <br />
          <br />

          <label>Upload Selfie</label>
          <input
            type="file"
            name="selfieImage"
            accept="image/*"
            onChange={handleChange}
            required={!form.selfieImage}
          />
          <button type="button" onClick={() => startCamera("selfie")}>
            Use Camera for Selfie
          </button>

          {form.selfieImage && <p className="small">Selected Selfie: {form.selfieImage.name}</p>}

          {cameraMode && (
            <div className="card" style={{ marginTop: "18px" }}>
              <h3 className="theme-section-title">
                {cameraMode === "selfie" ? "Take Selfie" : "Take ID Picture"}
              </h3>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
              />

              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div className="nav-links">
                <button type="button" onClick={capturePhoto}>
                  Capture Photo
                </button>
                <button type="button" onClick={stopCamera}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="nav-links" style={{ marginTop: "18px" }}>
            <button type="submit">Submit Request</button>
            <Link to="/login" className="btn">Back to Login</Link>
          </div>
        </form>
      </div>
    </ThemeShell>
  );
}