import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";
import analyzeJobDescription from "../services/ai/job-analysis.service.js";
const router = express.Router();

/*
  GET /api/jobs

  Returns all job descriptions belonging to the
  logged-in user.
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const jobs = await prisma.jobDescription.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      message: "Something went wrong while fetching job descriptions.",
    });
  }
});

/*
  GET /api/jobs/:id

  Returns one job description belonging to
  the logged-in user.
*/
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await prisma.jobDescription.findFirst({
      where: {
        id: jobId,
        userId: req.userId,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job description not found.",
      });
    }

    res.json({
      job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      message: "Something went wrong while fetching the job description.",
    });
  }
});

/*
  POST /api/jobs

  Creates a new job description.
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, company, location, description, jobUrl, salary } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Job title is required.",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        message: "Job description is required.",
      });
    }

    const job = await prisma.jobDescription.create({
      data: {
        title: title.trim(),
        company: company?.trim() || null,
        location: location?.trim() || null,
        description: description.trim(),
        jobUrl: jobUrl?.trim() || null,
        salary: salary?.trim() || null,
        userId: req.userId,
      },
    });

    res.status(201).json({
      message: "Job description saved successfully.",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    res.status(500).json({
      message: "Something went wrong while saving the job description.",
    });
  }
});

/*
  DELETE /api/jobs/:id

  Deletes a job description belonging to
  the logged-in user.
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await prisma.jobDescription.findFirst({
      where: {
        id: jobId,
        userId: req.userId,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job description not found.",
      });
    }

    await prisma.jobDescription.delete({
      where: {
        id: jobId,
      },
    });

    res.json({
      message: "Job description deleted successfully.",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    res.status(500).json({
      message: "Something went wrong while deleting the job description.",
    });
  }
});

/*
  POST /api/jobs/:id/analyze

  Sends the saved job description to OpenAI,
  then stores the structured AI analysis.
*/
router.post("/:id/analyze", authMiddleware, async (req, res) => {
  try {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID.",
      });
    }

    const job = await prisma.jobDescription.findFirst({
      where: {
        id: jobId,
        userId: req.userId,
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job description not found.",
      });
    }

    if (!job.description?.trim()) {
      return res.status(400).json({
        message: "This job description does not contain any text.",
      });
    }

    console.log(`Starting AI analysis for job ${job.id}...`);

    const analysis = await analyzeJobDescription(job.description);

    const updatedJob = await prisma.jobDescription.update({
      where: {
        id: job.id,
      },

      data: {
        summary: analysis.summary || null,
        requiredSkills: analysis.requiredSkills || [],
        technologies: analysis.technologies || [],
        responsibilities: analysis.responsibilities || [],
        education: analysis.education || [],
        experience: analysis.experience || [],
        keywords: analysis.keywords || [],
      },
    });

    console.log(`AI analysis completed for job ${job.id}.`);

    res.json({
      message: "Job description analyzed successfully.",
      analysis: {
        summary: updatedJob.summary,
        requiredSkills: updatedJob.requiredSkills,
        technologies: updatedJob.technologies,
        responsibilities: updatedJob.responsibilities,
        education: updatedJob.education,
        experience: updatedJob.experience,
        keywords: updatedJob.keywords,
      },
    });
  } catch (error) {
    console.error("Analyze job description error:", error);

    res.status(500).json({
      message:
        error.message ||
        "Something went wrong while analyzing the job description.",
    });
  }
});

export default router;
