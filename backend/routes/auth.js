const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PasswordResetRequest = require("../models/PasswordResetRequest");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "idImage", maxCount: 1 },
    { name: "selfieImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body || {};
      const { fullName, email, username, password } = body;

      if (!fullName || !email || !username || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const idImageUrl = req.files?.idImage?.[0]?.filename || "";
      const selfieImageUrl = req.files?.selfieImage?.[0]?.filename || "";

      if (!idImageUrl || !selfieImageUrl) {
        return res.status(400).json({ message: "Valid ID and selfie are required" });
      }

      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username,
        passwordHash,
        idImageUrl,
        selfieImageUrl,
        registrationStatus: "pending",
      });

      res.status(201).json({
        message: "Registration submitted. Please wait for approval.",
        userId: user._id,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.registrationStatus !== "approved" && user.role === "user") {
      return res.status(403).json({
        message:
          user.registrationStatus === "pending"
            ? "Your registration is still pending approval."
            : `Registration rejected: ${user.rejectionReason || "Please register again."}`,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        registrationStatus: user.registrationStatus,
        schoolName: user.schoolName || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate("certificateId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        registrationStatus: user.registrationStatus,
        schoolName: user.schoolName || "",
        certificate: user.certificateId || null,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

router.patch("/update-school", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { schoolName } = req.body;

    if (!schoolName) {
      return res.status(400).json({ message: "School name is required" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.schoolName = schoolName;
    await user.save();

    res.json({
      message: "Driving school updated successfully",
      schoolName: user.schoolName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/forgot-password-request",
  upload.fields([
    { name: "idImage", maxCount: 1 },
    { name: "selfieImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email, username } = req.body || {};

      const idImageUrl = req.files?.idImage?.[0]?.filename || "";
      const selfieImageUrl = req.files?.selfieImage?.[0]?.filename || "";

      if (!email || !username || !idImageUrl || !selfieImageUrl) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
        username,
      });

      if (!user) {
        return res.status(404).json({ message: "No matching user found" });
      }

      await PasswordResetRequest.create({
        email: email.toLowerCase(),
        username,
        idImageUrl,
        selfieImageUrl,
        status: "pending",
      });

      res.status(201).json({
        message: "Password reset request submitted. Please wait for admin approval.",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;