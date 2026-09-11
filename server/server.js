import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobRoutes from "./routes/job.routes.js";
import jobMatchRoutes from "./routes/job-match.routes.js";
import resumeOptimizationRoutes from "./routes/resume-optimization.routes.js";
import coverLetterRoutes from "./routes/cover-letter.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import interviewPrepRoutes from "./routes/interview-prep.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CareerIQ API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CareerIQ backend is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-matches", jobMatchRoutes);
app.use("/api/resume-optimization", resumeOptimizationRoutes);
app.use("/api/cover-letter", coverLetterRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interview-prep", interviewPrepRoutes);

app.listen(PORT, () => {
  console.log(`CareerIQ server running on http://localhost:${PORT}`);
});
