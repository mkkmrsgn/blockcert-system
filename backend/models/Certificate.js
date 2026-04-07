const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      trim: true,
    },
    fullName: { type: String, required: true },
    schoolName: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true },
    courseName: { type: String, default: "Driving Course Completion" },
    certificateFileUrl: { type: String, default: "" },
    certificateHash: { type: String, required: true },
    blockchainTxHash: { type: String, default: "" },
    qrCodeDataUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["valid", "revoked"],
      default: "valid",
    },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);