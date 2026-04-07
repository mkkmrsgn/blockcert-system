const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/issuer", require("./routes/issuer"));
app.use("/api/verifier", require("./routes/verifier"));
app.use("/api/stats", require("./routes/stats"));

app.get("/", (req, res) => {
  res.send("BlockCert MVP backend is running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});