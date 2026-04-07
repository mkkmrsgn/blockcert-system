const express = require("express");
const router = express.Router();
const contract = require("../services/blockchain");

router.post("/issue", async (req, res) => {
  try {
    const { walletAddress, certHash } = req.body;

    const tx = await contract.issueCertificate(walletAddress, certHash);
    await tx.wait();

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Blockchain error" });
  }
});

router.get("/verify/:address", async (req, res) => {
  try {
    const result = await contract.verifyCertificate(req.params.address);
    res.json({ certificate: result });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;