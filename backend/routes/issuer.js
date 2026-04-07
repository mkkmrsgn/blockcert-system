const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Certificate = require("../models/Certificate");
const AuditLog = require("../models/AuditLog");
const PasswordResetRequest = require("../models/PasswordResetRequest");

const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  issueCertificateOnChain,
  revokeCertificateOnChain,
} = require("../services/blockchainService");

const router = express.Router();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const deleteIfExists = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CERT-${year}-${random}`;
};

const getUniqueCertificateNumber = async () => {
  let certificateNumber = generateCertificateNumber();
  let exists = await Certificate.findOne({ certificateNumber });

  while (exists) {
    certificateNumber = generateCertificateNumber();
    exists = await Certificate.findOne({ certificateNumber });
  }

  return certificateNumber;
};

router.get("/pending-users", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const users = await User.find({
      registrationStatus: "pending",
      role: "user",
    }).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/review/:id", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    deleteIfExists(user.idImageUrl);
    deleteIfExists(user.selfieImageUrl);

    user.registrationStatus = status;
    user.rejectionReason =
      status === "rejected" ? rejectionReason || "Invalid submission" : "";
    user.idImageUrl = "";
    user.selfieImageUrl = "";

    await user.save();

    await AuditLog.create({
      action: `user_${status}`,
      actorId: req.user.id,
      actorUsername: req.user.username,
      targetUserId: user._id,
      details:
        status === "rejected"
          ? user.rejectionReason || "Rejected"
          : "Approved user registration",
    });

    res.json({ message: `User ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/issue-certificate/:userId",
  auth,
  allow("issuer", "admin"),
  upload.single("certificateFile"),
  async (req, res) => {
    let uploadedFilePath = "";

    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.registrationStatus !== "approved") {
        return res.status(400).json({ message: "User is not approved" });
      }

      if (user.certificateId) {
        return res.status(400).json({ message: "Certificate already issued for this user" });
      }

      const existingCertificate = await Certificate.findOne({ userId: user._id });
      if (existingCertificate) {
        return res.status(400).json({ message: "Certificate already issued for this user" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Certificate file is required" });
      }

      uploadedFilePath = path.join(__dirname, "..", "uploads", req.file.filename);

      const certificateNumber = await getUniqueCertificateNumber();
      const courseName = "Driving Course Completion";
      const certificateFileUrl = req.file.filename;

      const fileBuffer = fs.readFileSync(uploadedFilePath);
      const certificateHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

      const chainResult = await issueCertificateOnChain(
        certificateNumber,
        user.fullName,
        courseName,
        user.schoolName || "Driving School",
        certificateHash
      );

      const qrCodeDataUrl = await QRCode.toDataURL(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${certificateNumber}`
      );

      const certificate = await Certificate.create({
        userId: user._id,
        fullName: user.fullName,
        schoolName: user.schoolName || "Driving School",
        certificateNumber,
        courseName,
        certificateFileUrl,
        certificateHash,
        blockchainTxHash: chainResult.txHash,
        qrCodeDataUrl,
      });

      user.certificateId = certificate._id;
      await user.save();

      await AuditLog.create({
        action: "certificate_issued",
        actorId: req.user.id,
        actorUsername: req.user.username,
        targetUserId: user._id,
        targetCertificateId: certificate._id,
        details: `Issued certificate ${certificate.certificateNumber}`,
      });

      res.status(201).json({
        message: "Certificate issued successfully",
        certificate,
      });
    } catch (error) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Certificate already issued for this user",
        });
      }

      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/designer/assign-certificate",
  auth,
  allow("issuer", "admin"),
  upload.single("certificateFile"),
  async (req, res) => {
    try {
      const {
        userId,
        recipientName,
        course,
        dateIssued,
        issuerName,
        schoolName,
      } = req.body;

      if (!userId || !recipientName || !course || !dateIssued || !issuerName) {
        return res.status(400).json({
          message: "Missing required certificate fields",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.registrationStatus !== "approved") {
        return res.status(400).json({ message: "User is not approved" });
      }

      if (user.certificateId) {
        return res.status(400).json({
          message: "Certificate already issued for this user",
        });
      }

      const existingCertificate = await Certificate.findOne({ userId: user._id });
      if (existingCertificate) {
        return res.status(400).json({
          message: "Certificate already issued for this user",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Generated certificate file is required" });
      }

      const certificateNumber = await getUniqueCertificateNumber();
      const certificateFileUrl = req.file.filename;

      const uploadedFilePath = path.join(__dirname, "..", "uploads", req.file.filename);
      const fileBuffer = fs.readFileSync(uploadedFilePath);

      const certificateHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

      const chainResult = await issueCertificateOnChain(
        certificateNumber,
        recipientName,
        course,
        schoolName || "BlockCert Driving Academy",
        certificateHash
      );

      const qrCodeDataUrl = await QRCode.toDataURL(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${certificateNumber}`
      );

      const certificate = await Certificate.create({
        userId: user._id,
        fullName: recipientName,
        schoolName: schoolName || "BlockCert Driving Academy",
        certificateNumber,
        courseName: course,
        certificateFileUrl,
        certificateHash,
        blockchainTxHash: chainResult.txHash,
        qrCodeDataUrl,
        issuedAt: new Date(dateIssued),
      });

      user.certificateId = certificate._id;
      await user.save();

      await AuditLog.create({
        action: "certificate_designed_and_assigned",
        actorId: req.user.id,
        actorUsername: req.user.username,
        targetUserId: user._id,
        targetCertificateId: certificate._id,
        details: `Designed and assigned certificate ${certificate.certificateNumber}`,
      });

      res.status(201).json({
        message: "Certificate assigned successfully",
        certificate,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Duplicate certificate detected. Please try again.",
        });
      }

      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/approved-users", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const users = await User.find({
      registrationStatus: "approved",
      role: "user",
      certificateId: null,
    }).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/revoke-certificate/:certificateId", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.certificateId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (certificate.status === "revoked") {
      return res.status(400).json({ message: "Certificate already revoked" });
    }

    const chainResult = await revokeCertificateOnChain(
      certificate.certificateNumber
    );

    certificate.status = "revoked";
    certificate.blockchainTxHash =
      chainResult.txHash || certificate.blockchainTxHash;
    await certificate.save();

    await AuditLog.create({
      action: "certificate_revoked",
      actorId: req.user.id,
      actorUsername: req.user.username,
      targetUserId: certificate.userId,
      targetCertificateId: certificate._id,
      details: `Revoked certificate ${certificate.certificateNumber}`,
    });

    res.json({
      message: "Certificate revoked successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/issued-certificates", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/audit-logs", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/reset-requests", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reset requests" });
  }
});

router.patch("/reset-requests/:id/approve", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const user = await User.findOne({
      username: request.username,
      email: request.email,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPassword = `Temp${Math.floor(100000 + Math.random() * 900000)}`;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = passwordHash;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "BlockCert Password Reset Approved",
      html: `
        <h2>Password Reset Approved</h2>
        <p>Hello ${user.fullName},</p>
        <p>Your BlockCert password reset request has been approved.</p>
        <p><strong>Temporary Password:</strong> ${newPassword}</p>
        <p>Please log in and change it as soon as possible.</p>
      `,
    });

    deleteIfExists(request.idImageUrl);
    deleteIfExists(request.selfieImageUrl);

    await PasswordResetRequest.findByIdAndDelete(request._id);

    await AuditLog.create({
      action: "password_reset_approved",
      actorId: req.user.id,
      actorUsername: req.user.username,
      targetUserId: user._id,
      details: `Approved password reset for ${user.username}`,
    });

    res.json({
      message: `Password reset approved and emailed to ${user.email}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to approve reset" });
  }
});

router.patch("/reset-requests/:id/reject", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    deleteIfExists(request.idImageUrl);
    deleteIfExists(request.selfieImageUrl);

    await PasswordResetRequest.findByIdAndDelete(request._id);

    await AuditLog.create({
      action: "password_reset_rejected",
      actorId: req.user.id,
      actorUsername: req.user.username,
      details: `Rejected password reset for ${request.username}`,
    });

    res.json({ message: "Reset request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject reset" });
  }
});

module.exports = router;