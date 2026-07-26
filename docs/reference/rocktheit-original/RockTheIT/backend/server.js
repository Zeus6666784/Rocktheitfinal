require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// Serve generated certificate PDFs statically
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

app.get("/api/health", (req, res) => res.json({ status: "RockTheIT API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/certificates", certificateRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`RockTheIT server running on port ${PORT}`));
