import React, { useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import ThemeShell from "../components/ThemeShell";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    idImage: null,
    selfieImage: null,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
          cameraMode === "selfie" ? "selfie-capture.jpg" : "id-capture.jpg";

        const capturedFile = new File([blob], filename, { type: "image/jpeg" });

        if (cameraMode === "selfie") {
          setForm((prev) => ({ ...prev, selfieImage: capturedFile }));
        } else {
          setForm((prev) => ({ ...prev, idImage: capturedFile }));
        }

        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("username", form.username);
      formData.append("password", form.password);

      if (form.idImage) formData.append("idImage", form.idImage);
      if (form.selfieImage) formData.append("selfieImage", form.selfieImage);

      const res = await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setForm({
        fullName: "",
        email: "",
        username: "",
        password: "",
        idImage: null,
        selfieImage: null,
      });

      document.querySelectorAll('input[type="file"]').forEach((input) => {
        input.value = "";
      });

      stopCamera();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <ThemeShell
      title="User Registration"
      subtitle="Upload or take a picture of your valid ID and selfie. Wait for approval before logging in."
    >
      <div className="theme-card">
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
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

          {form.idImage && <p className="small">Selected ID file: {form.idImage.name}</p>}

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

          {form.selfieImage && (
            <p className="small">Selected Selfie file: {form.selfieImage.name}</p>
          )}

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
                  Cancel Camera
                </button>
              </div>
            </div>
          )}

          <div className="nav-links" style={{ marginTop: "18px" }}>
            <button type="submit">Register</button>
            <Link to="/" className="btn">Back Home</Link>
          </div>
        </form>
      </div>
    </ThemeShell>
  );
}