const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorUsername: { type: String, default: "" },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    targetCertificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate", default: null },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);