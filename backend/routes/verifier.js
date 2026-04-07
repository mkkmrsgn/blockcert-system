const express = require("express");
const Certificate = require("../models/Certificate");
const { verifyCertificateOnChain } = require("../services/blockchainService");

const router = express.Router();

router.get("/certificate/:certificateNumber", async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateNumber: req.params.certificateNumber,
    });

    if (!certificate) {
      return res.status(404).json({ valid: false, message: "Certificate not found" });
    }

    const onChain = await verifyCertificateOnChain(req.params.certificateNumber);

    if (!onChain[7]) {
      return res.status(404).json({ valid: false, message: "Certificate not found on blockchain" });
    }

    if (!onChain[6]) {
      return res.status(400).json({ valid: false, message: "Certificate is revoked on blockchain" });
    }

    res.json({
      valid: true,
      certificate,
      blockchain: {
        certificateNumber: onChain[0],
        studentName: onChain[1],
        courseName: onChain[2],
        schoolName: onChain[3],
        certificateHash: onChain[4],
        issueDate: onChain[5].toString(),
        isValid: onChain[6],
        exists: onChain[7],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;