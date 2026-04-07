import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import ThemeShell from "../components/ThemeShell";

const drivingSchools = [
  {
    name: "A-1 Driving Company",
    location: "Las Piñas / Metro Manila",
    programs: "TDC, PDC, Driving Lessons",
    contact: "Visit official website",
  },
  {
    name: "Smart Driving School",
    location: "Bacoor, Cavite / Metro Manila",
    programs: "TDC, PDC, Driving Lessons",
    contact: "Visit official website",
  },
  {
    name: "Socialites Driving School",
    location: "Metro Manila (Mayon, Fairview, Cubao, Caloocan)",
    programs: "TDC, PDC, LTO-accredited services",
    contact: "Visit official website",
  },
  {
    name: "Precision Driving School",
    location: "Antipolo / nearby NCR-Rizal area",
    programs: "Driving Programs, TDC, PDC",
    contact: "Visit official website",
  },
];

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedSchool, setSelectedSchool] = useState("");
  const [savingSchool, setSavingSchool] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
        setCertificate(res.data.user.certificate || null);
        setSelectedSchool(res.data.user.schoolName || "");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };

    fetchMe();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleSaveSchool = async () => {
    try {
      setMessage("");
      setError("");

      if (!selectedSchool) {
        setError("Please choose a driving school first.");
        return;
      }

      const token = localStorage.getItem("token");
      setSavingSchool(true);

      const res = await axios.patch(
        `${API_URL}/api/auth/update-school`,
        { schoolName: selectedSchool },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Driving school updated successfully.");
      setUser((prev) => ({
        ...prev,
        schoolName: selectedSchool,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update driving school");
    } finally {
      setSavingSchool(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        setError("Please complete both password fields.");
        return;
      }

      const token = localStorage.getItem("token");
      setChangingPassword(true);

      const res = await axios.patch(
        `${API_URL}/api/auth/change-password`,
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Password changed successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
      setShowChangePassword(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const selectedSchoolDetails = drivingSchools.find(
    (school) => school.name === selectedSchool
  );

  return (
    <ThemeShell
      title="User Dashboard"
      subtitle="View your profile, choose a driving school, and manage your account and certificate."
      wide
    >
      <style>{`
        .user-school-select option {
          color: #111827;
          background: #ffffff;
        }
      `}</style>

      {error && <div className="message error">{error}</div>}
      {message && <div className="message success">{message}</div>}

      {user && (
        <div className="card">
          <h3 className="theme-section-title">My Profile</h3>
          <p><strong>Name:</strong> {user.fullName}</p>
          <p><strong>Username:</strong> {user.username}</p>
          {user.email && <p><strong>Email:</strong> {user.email}</p>}
          <p><strong>Status:</strong> {user.registrationStatus}</p>
          <p><strong>Selected Driving School:</strong> {user.schoolName || "None yet"}</p>
        </div>
      )}

      <div className="card" style={{ marginTop: "20px" }}>
        <h3 className="theme-section-title">Choose Driving School</h3>

        <select
          className="user-school-select"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">Select a driving school</option>
          {drivingSchools.map((school) => (
            <option key={school.name} value={school.name}>
              {school.name}
            </option>
          ))}
        </select>

        <div className="nav-links">
          <button onClick={handleSaveSchool} disabled={savingSchool}>
            {savingSchool ? "Saving..." : "Apply / Save School"}
          </button>
          <Link to="/schools" className="btn">View Driving Schools</Link>
        </div>

        {selectedSchoolDetails && (
          <div className="card" style={{ marginTop: "18px" }}>
            <p><strong>School Name:</strong> {selectedSchoolDetails.name}</p>
            <p><strong>Location:</strong> {selectedSchoolDetails.location}</p>
            <p><strong>Programs:</strong> {selectedSchoolDetails.programs}</p>
            <p><strong>Contact:</strong> {selectedSchoolDetails.contact}</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <h3 className="theme-section-title">Account Security</h3>

        {!showChangePassword ? (
          <div className="nav-links">
            <button onClick={() => setShowChangePassword(true)}>
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
            />

            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />

            <div className="nav-links">
              <button type="submit" disabled={changingPassword}>
                {changingPassword ? "Saving..." : "Save New Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {certificate ? (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 className="theme-section-title">My Certificate</h3>
          <p><strong>Certificate Number:</strong> {certificate.certificateNumber}</p>
          <p><strong>Course:</strong> {certificate.courseName}</p>
          <p><strong>School:</strong> {certificate.schoolName}</p>
          <p><strong>Hash:</strong> {certificate.certificateHash}</p>
          <p><strong>Blockchain TX:</strong> {certificate.blockchainTxHash}</p>

          {certificate.qrCodeDataUrl && (
            <div style={{ marginTop: "18px", marginBottom: "18px" }}>
              <img
                src={certificate.qrCodeDataUrl}
                alt="Certificate QR"
                style={{
                  width: "180px",
                  maxWidth: "100%",
                  borderRadius: "10px",
                  background: "#fff",
                  padding: "8px",
                }}
              />
            </div>
          )}

          <div className="nav-links">

            <Link to={`/certificate-view/${certificate.certificateNumber}`} className="btn">
              View Certificate
            </Link>
          </div>
        </div>
      ) : (
        <div className="message" style={{ marginTop: "20px" }}>
          No certificate has been issued yet.
        </div>
      )}

      <div className="nav-links" style={{ marginTop: "24px" }}>
        <button onClick={logout}>Logout</button>
      </div>
    </ThemeShell>
  );
}