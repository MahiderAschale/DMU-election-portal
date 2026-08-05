// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorMiddleware");
const path = require("path");

// Import models
const { sequelize } = require("./models");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");
const positionRoutes = require("./routes/position.routes");
const vacancyRoutes = require("./routes/vacancy.routes");
const applicationRoutes = require("./routes/application.routes");
const screeningRoutes = require("./routes/screening.routes");
const electionRoutes = require("./routes/election.routes");
const candidateRoutes = require("./routes/candidate.routes");
const voterRoutes = require("./routes/voter.routes");   
const manifestoRoutes = require("./routes/manifesto.routes");
const voteRoutes = require("./routes/vote.routes");
const resultRoutes = require("./routes/result.routes");
const complaintRoutes = require("./routes/complaint.routes");
const votingCardRoutes = require("./routes/votingCard.routes");
const hrRoutes = require("./routes/hr.routes");
const deanUploadRoutes = require("./routes/deanUpload.routes");
const voterValidationRoutes = require("./routes/validation.routes");
const adminRoutes = require("./routes/admin.routes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("E-Voting API Running...");
});

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/vacancies", vacancyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/screening", screeningRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/voters", voterRoutes);    
app.use("/api/manifesto", manifestoRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/voting-cards", votingCardRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/voter", require("./routes/voter.routes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/complaints", complaintRoutes);
app.use("/api/dean-upload", require("./routes/deanUpload.routes"));
app.use("/api/dean", require("./routes/deanUpload.routes"));
app.use("/api/voter-validation", voterValidationRoutes);
app.use("/api/admin", adminRoutes);
// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(` Server running on port ${PORT}`);

  try {
    await sequelize.authenticate();
    console.log(" PostgreSQL connected successfully");
  } catch (error) {
    console.error(" Database connection failed:", error.message);
    process.exit(1);
  }
});
