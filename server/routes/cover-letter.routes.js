import express from "express";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";
import generateCoverLetter from "../services/ai/cover-letter.service.js";

const router = express.Router();

/*
  POST /api/cover-letter

  Generates a personalized cover letter
  using the user's resume, target job,
  and existing job match analysis.
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
        message:
          "Please analyze the resume with AI before generating a cover letter.",
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
        Make sure the job has AI analysis.
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
          "Please analyze the job description with AI before generating a cover letter.",
      });
    }

    /*
        Find the existing job match.

        The cover letter uses the match
        to understand which candidate strengths
        are most relevant to the target job.
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
          "Please analyze the resume and job match before generating a cover letter.",
      });
    }

    console.log(
      `Starting cover letter generation: resume ${resumeId}, job ${jobDescriptionId}...`,
    );

    /*
        Generate the cover letter with AI.
      */
    const coverLetter = await generateCoverLetter({
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
      `Cover letter generation completed: resume ${resumeId}, job ${jobDescriptionId}.`,
    );

    res.json({
      message: "Cover letter generated successfully.",

      coverLetter: {
        resumeId,

        jobDescriptionId,

        coverLetter: coverLetter.coverLetter || "",

        subjectSuggestion: coverLetter.subjectSuggestion || "",

        highlightedStrengths: coverLetter.highlightedStrengths || [],

        mentionedSkills: coverLetter.mentionedSkills || [],
      },
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);

    res.status(500).json({
      message:
        error.message ||
        "Something went wrong while generating the cover letter.",
    });
  }
});

export default router;
