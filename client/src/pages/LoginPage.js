import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate, Link } from "react-router-dom";
import ThemeShell from "../components/ThemeShell";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin" || res.data.user.role === "issuer") {
        navigate("/issuer");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <ThemeShell
      title="Login"
      subtitle="Securely access your BlockCert account using your approved credentials."
    >
      <div className="theme-card">
        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="nav-links">
            <button type="submit">Login</button>
            <Link to="/forgot-password" className="btn">Forgot Password?</Link>
            <Link to="/" className="btn">Back Home</Link>
          </div>
        </form>
      </div>
    </ThemeShell>
  );
}