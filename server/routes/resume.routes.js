import express from "express";
import path from "path";

import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import parseResumeFile from "../services/resume/parser.service.js";
import analyzeResumeWithAI from "../services/ai/openai.service.js";

const router = express.Router();

/*
  GET /api/resumes

  Returns all resumes belonging to the logged-in user.
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        analysis: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      resumes,
    });
  } catch (error) {
    console.error("Get resumes error:", error);

    res.status(500).json({
      message: "Something went wrong while fetching resumes",
    });
  }
});

/*
  GET /api/resumes/:id

  Returns one resume belonging to the logged-in user.
*/
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId)) {
      return res.status(400).json({
        message: "Invalid resume ID",
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
        message: "Resume not found",
      });
    }

    res.json({
      resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);

    res.status(500).json({
      message: "Something went wrong while fetching the resume",
    });
  }
});

/*
  POST /api/resumes

  Creates a resume record using an uploaded PDF/DOCX file.
*/
router.post("/", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF or DOCX resume.",
      });
    }

    const uploadedFilePath = req.file.path;

    const resumeText = await parseResumeFile(uploadedFilePath);

    if (!resumeText) {
      return res.status(400).json({
        message: "We could not extract any text from this resume.",
      });
    }

    const title =
      req.body.title?.trim() || path.parse(req.file.originalname).name;

    const resume = await prisma.resume.create({
      data: {
        title,
        fileName: req.file.originalname,
        fileUrl: null,
        resumeText,
        userId: req.userId,
      },
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    console.error("Upload resume error:", error);

    res.status(500).json({
      message:
        error.message || "Something went wrong while uploading the resume.",
    });
  }
});

/*
  POST /api/resumes/:id/analyze

  Sends the extracted resume text to OpenAI,
  saves the AI analysis in ResumeAnalysis,
  and updates the resume score.
*/
router.post("/:id/analyze", authMiddleware, async (req, res) => {
  try {
    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId)) {
      return res.status(400).json({
        message: "Invalid resume ID",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    if (!resume.resumeText?.trim()) {
      return res.status(400).json({
        message: "This resume does not contain extracted text.",
      });
    }

    console.log(`Starting AI analysis for resume ${resume.id}...`);

    const analysis = await analyzeResumeWithAI(resume.resumeText);

    const savedAnalysis = await prisma.resumeAnalysis.upsert({
      where: {
        resumeId: resume.id,
      },

      update: {
        summary: analysis.summary || null,
        skills: analysis.skills || [],
        experience: analysis.experience || [],
        education: analysis.education || [],
        projects: analysis.projects || [],
        certifications: analysis.certifications || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingSkills: analysis.missingSkills || [],
        atsScore: analysis.atsScore ?? null,
        keywordScore: analysis.keywordScore ?? null,
        impactScore: analysis.impactScore ?? null,
        overallScore: analysis.overallScore ?? null,
        analyzedAt: new Date(),
      },

      create: {
        resumeId: resume.id,
        summary: analysis.summary || null,
        skills: analysis.skills || [],
        experience: analysis.experience || [],
        education: analysis.education || [],
        projects: analysis.projects || [],
        certifications: analysis.certifications || [],
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        missingSkills: analysis.missingSkills || [],
        atsScore: analysis.atsScore ?? null,
        keywordScore: analysis.keywordScore ?? null,
        impactScore: analysis.impactScore ?? null,
        overallScore: analysis.overallScore ?? null,
        analyzedAt: new Date(),
      },
    });

    await prisma.resume.update({
      where: {
        id: resume.id,
      },

      data: {
        score: analysis.overallScore ?? null,
      },
    });

    console.log(`AI analysis completed for resume ${resume.id}.`);

    res.json({
      message: "Resume analyzed successfully",
      analysis: savedAnalysis,
    });
  } catch (error) {
    console.error("Analyze resume error:", error);

    res.status(500).json({
      message:
        error.message || "Something went wrong while analyzing the resume.",
    });
  }
});

/*
  DELETE /api/resumes/:id

  Deletes a resume belonging to the logged-in user.
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const resumeId = Number(req.params.id);

    if (!Number.isInteger(resumeId)) {
      return res.status(400).json({
        message: "Invalid resume ID",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    await prisma.resume.delete({
      where: {
        id: resumeId,
      },
    });

    res.json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);

    res.status(500).json({
      message: "Something went wrong while deleting the resume.",
    });
  }
});

export default router;
