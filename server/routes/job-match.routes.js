import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";
import analyzeJobMatch from "../services/ai/job-matching.service.js";

const router = express.Router();

/*
  GET /api/job-matches

  Returns all job matches belonging to
  the currently logged-in user.
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const matches = await prisma.jobMatch.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            fileName: true,
            score: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salary: true,
            jobUrl: true,
          },
        },
      },
      orderBy: {
        overallScore: "desc",
      },
    });

    res.json({
      matches,
    });
  } catch (error) {
    console.error("Get job matches error:", error);

    res.status(500).json({
      message:
        error.message || "Something went wrong while loading job matches.",
    });
  }
});

/*
  POST /api/job-matches

  Compares a user's resume analysis
  with a saved job description analysis.
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const resumeId = Number(req.body.resumeId);
    const jobDescriptionId = Number(req.body.jobDescriptionId);

    if (!Number.isInteger(resumeId)) {
      return res.status(400).json({
        message: "Invalid resume ID.",
      });
    }

    if (!Number.isInteger(jobDescriptionId)) {
      return res.status(400).json({
        message: "Invalid job description ID.",
      });
    }

    /*
      Get the resume and make sure it belongs
      to the logged-in user.
    */
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId,
      },
      include: {
        analysis: true,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    /*
      The resume must already have an AI analysis.
    */
    if (!resume.analysis) {
      return res.status(400).json({
        message:
          "Please analyze the resume with AI before matching it with a job.",
      });
    }

    /*
      Get the job description and make sure it
      belongs to the logged-in user.
    */
    const jobDescription = await prisma.jobDescription.findFirst({
      where: {
        id: jobDescriptionId,
        userId: req.userId,
      },
    });

    if (!jobDescription) {
      return res.status(404).json({
        message: "Job description not found.",
      });
    }

    /*
      Check that the job description has already
      been analyzed by AI.
    */
    const hasJobAnalysis =
      jobDescription.summary ||
      jobDescription.requiredSkills ||
      jobDescription.technologies ||
      jobDescription.responsibilities ||
      jobDescription.education ||
      jobDescription.experience ||
      jobDescription.keywords;

    if (!hasJobAnalysis) {
      return res.status(400).json({
        message:
          "Please analyze the job description with AI before matching it with a resume.",
      });
    }

    console.log(
      `Starting AI job match: resume ${resumeId}, job ${jobDescriptionId}...`,
    );

    /*
      Send the structured resume analysis and
      job analysis to OpenAI.
    */
    const matchAnalysis = await analyzeJobMatch({
      resumeAnalysis: resume.analysis,
      jobAnalysis: {
        title: jobDescription.title,
        company: jobDescription.company,
        location: jobDescription.location,
        salary: jobDescription.salary,
        summary: jobDescription.summary,
        requiredSkills: jobDescription.requiredSkills,
        technologies: jobDescription.technologies,
        responsibilities: jobDescription.responsibilities,
        education: jobDescription.education,
        experience: jobDescription.experience,
        keywords: jobDescription.keywords,
      },
    });

    /*
      Save the AI matching result.

      Because resumeId + jobDescriptionId is unique,
      we use upsert so the user can analyze the
      same resume/job combination again later.
    */
    const savedMatch = await prisma.jobMatch.upsert({
      where: {
        resumeId_jobDescriptionId: {
          resumeId,
          jobDescriptionId,
        },
      },

      update: {
        overallScore: matchAnalysis.overallScore ?? null,
        skillScore: matchAnalysis.skillScore ?? null,
        experienceScore: matchAnalysis.experienceScore ?? null,
        educationScore: matchAnalysis.educationScore ?? null,
        keywordScore: matchAnalysis.keywordScore ?? null,

        summary: matchAnalysis.summary || null,

        matchedSkills: matchAnalysis.matchedSkills || [],
        missingSkills: matchAnalysis.missingSkills || [],
        strengths: matchAnalysis.strengths || [],
        recommendations: matchAnalysis.recommendations || [],
      },

      create: {
        userId: req.userId,
        resumeId,
        jobDescriptionId,

        overallScore: matchAnalysis.overallScore ?? null,
        skillScore: matchAnalysis.skillScore ?? null,
        experienceScore: matchAnalysis.experienceScore ?? null,
        educationScore: matchAnalysis.educationScore ?? null,
        keywordScore: matchAnalysis.keywordScore ?? null,

        summary: matchAnalysis.summary || null,

        matchedSkills: matchAnalysis.matchedSkills || [],
        missingSkills: matchAnalysis.missingSkills || [],
        strengths: matchAnalysis.strengths || [],
        recommendations: matchAnalysis.recommendations || [],
      },
    });

    console.log(
      `AI job match completed: resume ${resumeId}, job ${jobDescriptionId}.`,
    );

    res.json({
      message: "Job match analyzed successfully.",

      match: {
        id: savedMatch.id,

        resumeId: savedMatch.resumeId,

        jobDescriptionId: savedMatch.jobDescriptionId,

        overallScore: savedMatch.overallScore,

        skillScore: savedMatch.skillScore,

        experienceScore: savedMatch.experienceScore,

        educationScore: savedMatch.educationScore,

        keywordScore: savedMatch.keywordScore,

        summary: savedMatch.summary,

        matchedSkills: savedMatch.matchedSkills,

        missingSkills: savedMatch.missingSkills,

        strengths: savedMatch.strengths,

        recommendations: savedMatch.recommendations,

        createdAt: savedMatch.createdAt,

        updatedAt: savedMatch.updatedAt,
      },
    });
  } catch (error) {
    console.error("Job matching error:", error);

    res.status(500).json({
      message:
        error.message || "Something went wrong while analyzing the job match.",
    });
  }
});

export default router;
