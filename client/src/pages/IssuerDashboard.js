import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import CertificateDesigner from "./CertificateDesigner";
import SiteNavbar from "../components/SiteNavbar";
import ThemeShell from "../components/ThemeShell";

export default function IssuerDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");
  const [rejectReasons, setRejectReasons] = useState({});
  const [certificateFiles, setCertificateFiles] = useState({});
  const [issuingUserId, setIssuingUserId] = useState("");
  const [revokingCertificateId, setRevokingCertificateId] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [resetRequests, setResetRequests] = useState([]);
  const [approvingResetId, setApprovingResetId] = useState("");
  const [rejectingResetId, setRejectingResetId] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const loadData = async () => {
    try {
      const [
        pendingRes,
        approvedRes,
        statsRes,
        issuedRes,
        logsRes,
        resetRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/issuer/pending-users`, authHeaders),
        axios.get(`${API_URL}/api/issuer/approved-users`, authHeaders),
        axios.get(`${API_URL}/api/stats`, authHeaders),
        axios.get(`${API_URL}/api/issuer/issued-certificates`, authHeaders),
        axios.get(`${API_URL}/api/issuer/audit-logs`, authHeaders),
        axios.get(`${API_URL}/api/issuer/reset-requests`, authHeaders),
      ]);

      setPendingUsers(pendingRes.data);
      setApprovedUsers(approvedRes.data);
      setStats(statsRes.data);
      setIssuedCertificates(issuedRes.data);
      setAuditLogs(logsRes.data);
      setResetRequests(resetRes.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load issuer data");
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const reviewUser = async (id, status) => {
    try {
      const payload =
        status === "rejected"
          ? {
              status,
              rejectionReason: rejectReasons[id] || "Invalid submission",
            }
          : { status };

      await axios.patch(`${API_URL}/api/issuer/review/${id}`, payload, authHeaders);
      setMessage(`User ${status} successfully.`);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Review failed");
    }
  };

  const handleRejectReasonChange = (id, value) => {
    setRejectReasons((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCertificateFileChange = (userId, file) => {
    setCertificateFiles((prev) => ({
      ...prev,
      [userId]: file,
    }));
  };

  const issueCertificate = async (userId) => {
    try {
      const selectedFile = certificateFiles[userId];

      if (!selectedFile) {
        setMessage("Please select a certificate file first.");
        return;
      }

      if (issuingUserId === userId) return;
      setIssuingUserId(userId);

      const formData = new FormData();
      formData.append("certificateFile", selectedFile);

      const res = await axios.post(
        `${API_URL}/api/issuer/issue-certificate/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(`Certificate issued: ${res.data.certificate.certificateNumber}`);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Certificate issuance failed");
    } finally {
      setIssuingUserId("");
    }
  };

  const revokeCertificate = async (certificateId) => {
    try {
      if (revokingCertificateId === certificateId) return;
      setRevokingCertificateId(certificateId);

      const res = await axios.patch(
        `${API_URL}/api/issuer/revoke-certificate/${certificateId}`,
        {},
        authHeaders
      );

      setMessage(res.data.message || "Certificate revoked successfully");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Certificate revocation failed");
    } finally {
      setRevokingCertificateId("");
    }
  };

  const approveReset = async (requestId) => {
    try {
      if (approvingResetId === requestId) return;
      setApprovingResetId(requestId);

      const res = await axios.patch(
        `${API_URL}/api/issuer/reset-requests/${requestId}/approve`,
        {},
        authHeaders
      );

      setMessage(res.data.message || "Password reset approved successfully.");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to approve password reset");
    } finally {
      setApprovingResetId("");
    }
  };

  const rejectReset = async (requestId) => {
    try {
      if (rejectingResetId === requestId) return;
      setRejectingResetId(requestId);

      const res = await axios.patch(
        `${API_URL}/api/issuer/reset-requests/${requestId}/reject`,
        {},
        authHeaders
      );

      setMessage(res.data.message || "Password reset request rejected.");
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reject password reset");
    } finally {
      setRejectingResetId("");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
  <ThemeShell
    title="Issuer / Admin Dashboard"
    subtitle="Manage registrations, certificate issuance, audit records, reset requests, and certificate design."
    wide
  >
    {message && <div className="message">{message}</div>}

        <div
          className="nav-links"
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button onClick={() => setActiveTab("pending")}>Pending Users</button>
          <button onClick={() => setActiveTab("approved")}>Approved Users</button>
          <button onClick={() => setActiveTab("issued")}>Issued Certificates</button>
          <button onClick={() => setActiveTab("logs")}>Audit Logs</button>
          <button onClick={() => setActiveTab("reset")}>Reset Requests</button>
          <button onClick={() => setActiveTab("designer")}>Designer</button>
          <button onClick={loadData}>Refresh</button>
        </div>

        {activeTab === "dashboard" && stats && (
          <>
            <h3 style={{ marginTop: "10px" }}>System Overview</h3>
            <div className="grid grid-2">
              <div className="card"><strong>Total Users:</strong> {stats.totalUsers}</div>
              <div className="card"><strong>Pending Users:</strong> {stats.pendingUsers}</div>
              <div className="card"><strong>Approved Users:</strong> {stats.approvedUsers}</div>
              <div className="card"><strong>Rejected Users:</strong> {stats.rejectedUsers}</div>
              <div className="card"><strong>Total Certificates:</strong> {stats.totalCertificates}</div>
              <div className="card"><strong>Pending Reset Requests:</strong> {resetRequests.length}</div>
            </div>
          </>
        )}

        {activeTab === "pending" && (
          <>
            <h3 style={{ marginTop: "24px" }}>Pending Users</h3>
            {pendingUsers.length === 0 ? (
              <p>No pending users.</p>
            ) : (
              pendingUsers.map((user) => (
                <div className="card" key={user._id}>
                  <p><strong>Name:</strong> {user.fullName}</p>
                  <p><strong>Username:</strong> {user.username}</p>

                  <div className="grid grid-2">
                    <div>
                      <p><strong>Uploaded Valid ID</strong></p>
                      {user.idImageUrl ? (
                        <img
                          src={`${API_URL}/uploads/${user.idImageUrl}`}
                          alt="Valid ID"
                          style={{ width: "100%", maxWidth: "320px", borderRadius: "8px" }}
                        />
                      ) : (
                        <p className="small">No ID uploaded</p>
                      )}
                    </div>

                    <div>
                      <p><strong>Uploaded Selfie</strong></p>
                      {user.selfieImageUrl ? (
                        <img
                          src={`${API_URL}/uploads/${user.selfieImageUrl}`}
                          alt="Selfie"
                          style={{ width: "100%", maxWidth: "320px", borderRadius: "8px" }}
                        />
                      ) : (
                        <p className="small">No selfie uploaded</p>
                      )}
                    </div>
                  </div>

                  <textarea
                    placeholder="Rejection reason (for rejected users only)"
                    value={rejectReasons[user._id] || ""}
                    onChange={(e) => handleRejectReasonChange(user._id, e.target.value)}
                  />

                  <div className="nav-links">
                    <button onClick={() => reviewUser(user._id, "approved")}>Approve</button>
                    <button onClick={() => reviewUser(user._id, "rejected")}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "approved" && (
          <>
            <h3 style={{ marginTop: "24px" }}>Approved Users</h3>
            {approvedUsers.length === 0 ? (
              <p>No approved users.</p>
            ) : (
              approvedUsers.map((user) => (
                <div className="card" key={user._id}>
                  <p><strong>Name:</strong> {user.fullName}</p>
                  <p><strong>Username:</strong> {user.username}</p>

                  {user.certificateId ? (
                    <div className="message success">
                      Certificate already issued for this user.
                    </div>
                  ) : (
                    <>
                      <label>Upload Certificate File (PDF or Image)</label>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) =>
                          handleCertificateFileChange(user._id, e.target.files[0])
                        }
                      />

                      <button
                        onClick={() => issueCertificate(user._id)}
                        disabled={issuingUserId === user._id}
                      >
                        {issuingUserId === user._id ? "Issuing..." : "Issue Certificate"}
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "issued" && (
          <>
            <h3 style={{ marginTop: "24px" }}>Issued Certificates</h3>
            {issuedCertificates.length === 0 ? (
              <p>No issued certificates.</p>
            ) : (
              issuedCertificates.map((cert) => (
                <div className="card" key={cert._id}>
                  <p><strong>Certificate Number:</strong> {cert.certificateNumber}</p>
                  <p><strong>Name:</strong> {cert.fullName}</p>
                  <p><strong>School:</strong> {cert.schoolName}</p>
                  <p><strong>Status:</strong> {cert.status}</p>
                  <p><strong>Hash:</strong> {cert.certificateHash}</p>
                  <p><strong>Blockchain TX:</strong> {cert.blockchainTxHash}</p>

                  <div className="nav-links">


                    {cert.status !== "revoked" && (
                      <button
                        onClick={() => revokeCertificate(cert._id)}
                        disabled={revokingCertificateId === cert._id}
                      >
                        {revokingCertificateId === cert._id ? "Revoking..." : "Revoke Certificate"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "logs" && (
          <>
            <h3 style={{ marginTop: "24px" }}>Audit Logs</h3>
            {auditLogs.length === 0 ? (
              <p>No audit logs yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div className="card" key={log._id}>
                  <p><strong>Action:</strong> {log.action}</p>
                  <p><strong>Actor:</strong> {log.actorUsername || "Unknown"}</p>
                  <p><strong>Details:</strong> {log.details}</p>
                  <p><strong>Time:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "reset" && (
          <>
            <h3 style={{ marginTop: "24px" }}>Password Reset Requests</h3>

            {resetRequests.length === 0 ? (
              <p>No reset requests.</p>
            ) : (
              resetRequests.map((req) => (
                <div className="card" key={req._id}>
                  <p><strong>Email:</strong> {req.email}</p>
                  <p><strong>Username:</strong> {req.username}</p>
                  <p><strong>Status:</strong> {req.status}</p>

                  <div className="grid grid-2">
                    <div>
                      <p><strong>Uploaded Valid ID</strong></p>
                      {req.idImageUrl ? (
                        <img
                          src={`${API_URL}/uploads/${req.idImageUrl}`}
                          alt="Reset Valid ID"
                          style={{ width: "100%", maxWidth: "320px", borderRadius: "8px" }}
                        />
                      ) : (
                        <p className="small">No ID uploaded</p>
                      )}
                    </div>

                    <div>
                      <p><strong>Uploaded Selfie</strong></p>
                      {req.selfieImageUrl ? (
                        <img
                          src={`${API_URL}/uploads/${req.selfieImageUrl}`}
                          alt="Reset Selfie"
                          style={{ width: "100%", maxWidth: "320px", borderRadius: "8px" }}
                        />
                      ) : (
                        <p className="small">No selfie uploaded</p>
                      )}
                    </div>
                  </div>

                  <div className="nav-links">
                    <button
                      onClick={() => approveReset(req._id)}
                      disabled={approvingResetId === req._id}
                    >
                      {approvingResetId === req._id ? "Approving..." : "Approve Reset"}
                    </button>

                    <button
                      onClick={() => rejectReset(req._id)}
                      disabled={rejectingResetId === req._id}
                    >
                      {rejectingResetId === req._id ? "Rejecting..." : "Reject Reset"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "designer" && (
          <>
            <h3 style={{ marginTop: "24px" }}>Certificate Designer</h3>
            <CertificateDesigner />
          </>
        )}

        <div className="nav-links" style={{ marginTop: "24px" }}>
          <button onClick={logout}>Logout</button>
        </div>
    </ThemeShell>
);
}