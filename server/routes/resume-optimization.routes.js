import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";
import optimizeResumeForJob from "../services/ai/resume-optimization.service.js";

const router = express.Router();

/*
  POST /api/resume-optimization

  Optimizes a user's analyzed resume
  for a specific analyzed job description.
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
        Find the user's resume
        and its AI analysis.
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

    if (!resume.analysis) {
      return res.status(400).json({
        message: "Please analyze the resume with AI before optimizing it.",
      });
    }

    /*
        Find the user's job description.
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
        Make sure the job has been analyzed.
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
          "Please analyze the job description with AI before optimizing the resume.",
      });
    }

    /*
        Find the existing job match.

        Resume optimization uses the match
        to understand where the resume currently
        aligns with the target job.
      */
    const jobMatch = await prisma.jobMatch.findUnique({
      where: {
        resumeId_jobDescriptionId: {
          resumeId,
          jobDescriptionId,
        },
      },
    });

    if (!jobMatch) {
      return res.status(400).json({
        message:
          "Please analyze the resume and job match before optimizing the resume.",
      });
    }

    console.log(
      `Starting resume optimization: resume ${resumeId}, job ${jobDescriptionId}...`,
    );

    /*
        Run AI optimization.
      */
    const optimization = await optimizeResumeForJob({
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

      jobMatch: {
        overallScore: jobMatch.overallScore,

        skillScore: jobMatch.skillScore,

        experienceScore: jobMatch.experienceScore,

        educationScore: jobMatch.educationScore,

        keywordScore: jobMatch.keywordScore,

        summary: jobMatch.summary,

        matchedSkills: jobMatch.matchedSkills,

        missingSkills: jobMatch.missingSkills,

        strengths: jobMatch.strengths,

        recommendations: jobMatch.recommendations,
      },
    });

    console.log(
      `Resume optimization completed: resume ${resumeId}, job ${jobDescriptionId}.`,
    );

    /*
        Return the optimization.

        We are NOT modifying the original resume yet.
        The frontend will show the suggestions first.
      */
    res.json({
      message: "Resume optimized successfully.",

      optimization: {
        resumeId,

        jobDescriptionId,

        optimizedSummary: optimization.optimizedSummary || "",

        optimizedSkills: optimization.optimizedSkills || [],

        optimizedExperience: optimization.optimizedExperience || [],

        optimizedProjects: optimization.optimizedProjects || [],

        atsKeywordsAdded: optimization.atsKeywordsAdded || [],

        missingSkills: optimization.missingSkills || [],

        improvementAreas: optimization.improvementAreas || [],

        recommendations: optimization.recommendations || [],
      },
    });
  } catch (error) {
    console.error("Resume optimization error:", error);

    res.status(500).json({
      message:
        error.message || "Something went wrong while optimizing the resume.",
    });
  }
});

export default router;
