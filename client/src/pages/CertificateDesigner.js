import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { toBlob } from "html-to-image";

const generateCertNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CERT-${year}-${random}`;
};

export default function CertificateDesigner() {
  const previewRef = useRef(null);

  const [approvedUsers, setApprovedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    template: "formalBlue",
    title: "Certificate of Completion",
    recipientName: "",
    course: "",
    dateIssued: "",
    issuerName: "",
    schoolName: "BlockCert Driving Academy",
    certificateNumber: generateCertNumber(),
    description:
      "This certifies that the recipient has successfully completed the required training and demonstrated satisfactory performance.",
    logoUrl: "",
    signatureUrl: "",
  });

  const token = localStorage.getItem("token");

  const templateStyles = {
    formalBlue: {
      border: "10px solid #1d4ed8",
      accent: "#1d4ed8",
      subAccent: "#1e3a8a",
      bg: "#ffffff",
      text: "#0f172a",
    },
    goldClassic: {
      border: "10px solid #b45309",
      accent: "#b45309",
      subAccent: "#92400e",
      bg: "#fffdf7",
      text: "#3b2f1a",
    },
    modernDark: {
      border: "10px solid #0f172a",
      accent: "#0f172a",
      subAccent: "#334155",
      bg: "#f8fafc",
      text: "#0f172a",
    },
  };

  const activeTemplate = useMemo(
    () => templateStyles[form.template] || templateStyles.formalBlue,
    [form.template]
  );

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await axios.get(`${API_URL}/api/issuer/approved-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApprovedUsers(res.data || []);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load approved users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchApprovedUsers();
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      [fieldName]: fileUrl,
    }));
  };

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);

    const selectedUser = approvedUsers.find((user) => user._id === userId);
    if (!selectedUser) return;

    setForm((prev) => ({
      ...prev,
      recipientName: selectedUser.fullName || prev.recipientName,
    }));
  };

  const handleAssignCertificate = async () => {
    try {
      setMessage("");

      if (!selectedUserId) {
        setMessage("Please select a registered user first.");
        return;
      }

      if (!form.recipientName || !form.course || !form.dateIssued || !form.issuerName) {
        setMessage("Please complete all required certificate details first.");
        return;
      }

      if (!previewRef.current) {
        setMessage("Certificate preview is not ready.");
        return;
      }

      setAssigning(true);

      const blob = await toBlob(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: activeTemplate.bg,
      });

      if (!blob) {
        setMessage("Failed to generate certificate image.");
        setAssigning(false);
        return;
      }

      const certificateFile = new File(
        [blob],
        `${form.certificateNumber}.png`,
        { type: "image/png" }
      );

      const formData = new FormData();
      formData.append("userId", selectedUserId);
      formData.append("title", form.title);
      formData.append("recipientName", form.recipientName);
      formData.append("course", form.course);
      formData.append("dateIssued", form.dateIssued);
      formData.append("issuerName", form.issuerName);
      formData.append("schoolName", form.schoolName);
      formData.append("description", form.description);
      formData.append("template", form.template);
      formData.append("certificateFile", certificateFile);

      const res = await axios.post(
        `${API_URL}/api/issuer/designer/assign-certificate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data?.message || "Certificate assigned successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to assign certificate");
    } finally {
      setAssigning(false);
    }
  };

  const handleReset = () => {
    setSelectedUserId("");
    setMessage("");
    setForm({
      template: "formalBlue",
      title: "Certificate of Completion",
      recipientName: "",
      course: "",
      dateIssued: "",
      issuerName: "",
      schoolName: "BlockCert Driving Academy",
      certificateNumber: generateCertNumber(),
      description:
        "This certifies that the recipient has successfully completed the required training and demonstrated satisfactory performance.",
      logoUrl: "",
      signatureUrl: "",
    });
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        .designer-grid {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .designer-panel,
        .designer-preview-shell {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 26px rgba(0,0,0,0.18);
        }

        .designer-panel {
          padding: 20px;
          position: sticky;
          top: 96px;
        }

        .designer-preview-shell {
          padding: 20px;
        }

        .designer-section-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.78);
          margin: 18px 0 10px;
        }

        .designer-heading {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          color: #fff;
        }

        .designer-subtext {
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .designer-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .designer-button {
          background-color: #dc2626;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }

        .designer-button:hover {
          background-color: #b91c1c;
          transform: translateY(-1px);
        }

        .designer-button.secondary {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.35);
        }

        .designer-button.secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: #fff;
        }

        .designer-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .designer-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .designer-preview-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          color: #fff;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .designer-preview-note {
          font-size: 13px;
          color: rgba(255,255,255,0.74);
        }

        .certificate-preview {
          width: 100%;
          min-height: 760px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 18px 36px rgba(0,0,0,0.22);
        }

        .designer-message {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-size: 14px;
        }

        select option {
          color: #111827;
          background: #ffffff;
        }

        @media (max-width: 1080px) {
          .designer-grid {
            grid-template-columns: 1fr;
          }

          .designer-panel {
            position: static;
          }
        }
      `}</style>

      <div className="designer-grid">
        <div className="designer-panel">
          <div className="designer-heading">Certificate Designer</div>
          <p className="designer-subtext">
            Build a cleaner certificate using structured fields, branding, and a live preview.
          </p>

          <div className="designer-section-title">Assign to Registered User</div>
          <select value={selectedUserId} onChange={handleUserSelect} style={styles.select}>
            <option value="">
              {loadingUsers ? "Loading approved users..." : "Select approved user"}
            </option>
            {approvedUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullName} {user.username ? `(${user.username})` : ""}
              </option>
            ))}
          </select>

          <div className="designer-section-title">Template</div>
          <select name="template" value={form.template} onChange={handleChange} style={styles.select}>
            <option value="formalBlue">Formal Blue</option>
            <option value="goldClassic">Gold Classic</option>
            <option value="modernDark">Modern Dark</option>
          </select>

          <div className="designer-section-title">Certificate Details</div>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Certificate Title" style={styles.input} />
          <input name="recipientName" value={form.recipientName} onChange={handleChange} placeholder="Recipient Name" style={styles.input} />
          <input name="course" value={form.course} onChange={handleChange} placeholder="Course / Program" style={styles.input} />
          <input name="dateIssued" value={form.dateIssued} onChange={handleChange} placeholder="Date Issued" style={styles.input} />

          <label style={styles.label}>Certificate Number (Auto Generated)</label>
          <input value={form.certificateNumber} readOnly style={{ ...styles.input, opacity: 0.78, cursor: "not-allowed" }} />

          <div className="designer-section-title">Issuer Details</div>
          <input name="issuerName" value={form.issuerName} onChange={handleChange} placeholder="Issuer Name" style={styles.input} />
          <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="School / Organization" style={styles.input} />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Certificate body text" style={{ ...styles.input, minHeight: "110px", resize: "vertical" }} />

          <div className="designer-section-title">Branding</div>
          <label style={styles.label}>Upload Logo</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logoUrl")} style={styles.fileInput} />

          <label style={styles.label}>Upload Signature</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "signatureUrl")} style={styles.fileInput} />

          <div className="designer-actions">
            <button type="button" className="designer-button" onClick={handleAssignCertificate} disabled={assigning}>
              {assigning ? "Uploading..." : "Upload to User"}
            </button>

            <button type="button" className="designer-button secondary" onClick={handleReset}>
              Reset
            </button>
          </div>

          {message && <div className="designer-message">{message}</div>}
        </div>

        <div className="designer-preview-shell">
          <div className="designer-preview-header">
            <div>
              <h3 className="designer-preview-title">Live Preview</h3>
              <div className="designer-preview-note">
                What you see here is the formatted certificate layout.
              </div>
            </div>
          </div>

          <div
            ref={previewRef}
            className="certificate-preview"
            style={{
              background: activeTemplate.bg,
              color: activeTemplate.text,
              border: activeTemplate.border,
              padding: "48px 56px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "28px",
                  gap: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: activeTemplate.subAccent,
                      fontWeight: 700,
                      marginBottom: "10px",
                    }}
                  >
                    Official Digital Credential
                  </div>

                  <div
                    style={{
                      fontSize: "48px",
                      lineHeight: 1.05,
                      fontWeight: 700,
                      color: activeTemplate.accent,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      marginBottom: "12px",
                    }}
                  >
                    {form.title || "Certificate of Completion"}
                  </div>

                  <div
                    style={{
                      fontSize: "18px",
                      color: "#64748b",
                      maxWidth: "720px",
                      lineHeight: 1.6,
                    }}
                  >
                    Presented in recognition of successful completion and verified participation.
                  </div>
                </div>

                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "90px",
                      height: "90px",
                      border: `2px dashed ${activeTemplate.accent}`,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: activeTemplate.accent,
                      fontSize: "12px",
                      textAlign: "center",
                      padding: "8px",
                    }}
                  >
                    Logo
                  </div>
                )}
              </div>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "30px",
                  marginBottom: "34px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    color: "#64748b",
                    marginBottom: "16px",
                  }}
                >
                  This certifies that
                </div>

                <div
                  style={{
                    fontSize: "52px",
                    fontWeight: 700,
                    color: activeTemplate.text,
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    borderBottom: `2px solid ${activeTemplate.accent}`,
                    display: "inline-block",
                    paddingBottom: "8px",
                    minWidth: "420px",
                  }}
                >
                  {form.recipientName || "Recipient Name"}
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    color: "#64748b",
                    marginTop: "28px",
                    marginBottom: "14px",
                  }}
                >
                  has successfully completed
                </div>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: activeTemplate.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "20px",
                  }}
                >
                  {form.course || "Course / Program"}
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    color: "#475569",
                    maxWidth: "760px",
                    margin: "0 auto",
                    lineHeight: 1.8,
                  }}
                >
                  {form.description}
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "28px",
                  alignItems: "end",
                  marginTop: "34px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Date Issued
                  </div>
                  <div
                    style={{
                      borderTop: `2px solid ${activeTemplate.accent}`,
                      paddingTop: "10px",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    {form.dateIssued || "MM/DD/YYYY"}
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  {form.signatureUrl ? (
                    <img
                      src={form.signatureUrl}
                      alt="Signature"
                      style={{
                        maxWidth: "180px",
                        maxHeight: "70px",
                        objectFit: "contain",
                        marginBottom: "8px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "70px",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        color: "#94a3b8",
                        fontStyle: "italic",
                        marginBottom: "8px",
                      }}
                    >
                      Signature
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: `2px solid ${activeTemplate.accent}`,
                      paddingTop: "10px",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    {form.issuerName || "Issuer Name"}
                  </div>
                  <div style={{ fontSize: "14px", color: "#64748b", marginTop: "6px" }}>
                    Authorized Signatory
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Certificate No.
                  </div>
                  <div
                    style={{
                      borderTop: `2px solid ${activeTemplate.accent}`,
                      paddingTop: "10px",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    {form.certificateNumber}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "34px",
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: activeTemplate.subAccent,
                  letterSpacing: "0.04em",
                }}
              >
                {form.schoolName || "School / Organization"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
  },
  input: {
    width: "100%",
    marginBottom: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    marginBottom: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  fileInput: {
    width: "100%",
    marginBottom: "12px",
    padding: "10px 0",
    color: "#fff",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.92)",
    fontSize: "14px",
  },
};