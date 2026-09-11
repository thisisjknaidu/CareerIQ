import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";
import generateInterviewPrep from "../services/ai/interview-prep.service.js";

const router = express.Router();

/*
  POST /api/interview-prep

  Generates interview preparation using:
  - analyzed resume
  - analyzed job description
  - existing job match
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
        message:
          "Please analyze the resume with AI before preparing for the interview.",
      });
    }

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
          "Please analyze the job description with AI before preparing for the interview.",
      });
    }

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
          "Please analyze the resume and job match before preparing for the interview.",
      });
    }

    console.log(
      `Starting interview preparation: resume ${resumeId}, job ${jobDescriptionId}...`,
    );

    const interviewPrep = await generateInterviewPrep({
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
      `Interview preparation completed: resume ${resumeId}, job ${jobDescriptionId}.`,
    );

    res.json({
      message: "Interview preparation generated successfully.",

      interviewPrep: {
        resumeId,

        jobDescriptionId,

        interviewSummary: interviewPrep.interviewSummary || "",

        technicalQuestions: interviewPrep.technicalQuestions || [],

        resumeQuestions: interviewPrep.resumeQuestions || [],

        behavioralQuestions: interviewPrep.behavioralQuestions || [],

        jobSpecificQuestions: interviewPrep.jobSpecificQuestions || [],

        strongAreas: interviewPrep.strongAreas || [],

        revisionTopics: interviewPrep.revisionTopics || [],

        riskAreas: interviewPrep.riskAreas || [],

        interviewTips: interviewPrep.interviewTips || [],
      },
    });
  } catch (error) {
    console.error("Interview preparation error:", error);

    res.status(500).json({
      message:
        error.message ||
        "Something went wrong while generating interview preparation.",
    });
  }
});

export default router;
