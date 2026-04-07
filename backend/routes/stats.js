const express = require("express");
const User = require("../models/User");
const Certificate = require("../models/Certificate");
const auth = require("../middleware/authMiddleware");
const allow = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", auth, allow("issuer", "admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const pendingUsers = await User.countDocuments({ role: "user", registrationStatus: "pending" });
    const approvedUsers = await User.countDocuments({ role: "user", registrationStatus: "approved" });
    const rejectedUsers = await User.countDocuments({ role: "user", registrationStatus: "rejected" });
    const totalCertificates = await Certificate.countDocuments();

    const bySchool = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: "$schoolName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      totalCertificates,
      bySchool,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;