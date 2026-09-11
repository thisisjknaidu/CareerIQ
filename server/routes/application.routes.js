import express from "express";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all applications for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        jobDescription: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      message: "Unable to load applications.",
    });
  }
});

// Get one application
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid application ID.",
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        jobDescription: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    res.json(application);
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      message: "Unable to load the application.",
    });
  }
});

// Create application
router.post("/", authMiddleware, async (req, res) => {
  try {
    const jobDescriptionId = Number(req.body.jobDescriptionId);

    const status =
      typeof req.body.status === "string" && req.body.status.trim()
        ? req.body.status.trim().toUpperCase()
        : "SAVED";

    const appliedAt = req.body.appliedAt ? new Date(req.body.appliedAt) : null;

    const notes =
      typeof req.body.notes === "string" ? req.body.notes.trim() || null : null;

    const source =
      typeof req.body.source === "string"
        ? req.body.source.trim() || null
        : null;

    const jobUrl =
      typeof req.body.jobUrl === "string"
        ? req.body.jobUrl.trim() || null
        : null;

    if (!Number.isInteger(jobDescriptionId)) {
      return res.status(400).json({
        message: "Invalid job description ID.",
      });
    }

    if (appliedAt && Number.isNaN(appliedAt.getTime())) {
      return res.status(400).json({
        message: "Invalid application date.",
      });
    }

    // Make sure the selected Job Description belongs to this user
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

    // Prevent duplicate applications
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobDescriptionId: {
          userId: req.userId,
          jobDescriptionId,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You are already tracking this job.",
      });
    }

    const application = await prisma.application.create({
      data: {
        userId: req.userId,
        jobDescriptionId,
        status,
        appliedAt,
        notes,
        source,
        jobUrl: jobUrl || jobDescription.jobUrl,
      },
      include: {
        jobDescription: true,
      },
    });

    res.status(201).json({
      message: "Application created successfully.",
      application,
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      message: "Unable to create the application.",
    });
  }
});

// Update application
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid application ID.",
      });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const data = {};

    if (typeof req.body.status === "string" && req.body.status.trim()) {
      data.status = req.body.status.trim().toUpperCase();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "appliedAt")) {
      if (!req.body.appliedAt) {
        data.appliedAt = null;
      } else {
        const appliedAt = new Date(req.body.appliedAt);

        if (Number.isNaN(appliedAt.getTime())) {
          return res.status(400).json({
            message: "Invalid application date.",
          });
        }

        data.appliedAt = appliedAt;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
      data.notes =
        typeof req.body.notes === "string"
          ? req.body.notes.trim() || null
          : null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "source")) {
      data.source =
        typeof req.body.source === "string"
          ? req.body.source.trim() || null
          : null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "jobUrl")) {
      data.jobUrl =
        typeof req.body.jobUrl === "string"
          ? req.body.jobUrl.trim() || null
          : null;
    }

    const application = await prisma.application.update({
      where: {
        id,
      },
      data,
      include: {
        jobDescription: true,
      },
    });

    res.json({
      message: "Application updated successfully.",
      application,
    });
  } catch (error) {
    console.error("Update application error:", error);

    res.status(500).json({
      message: "Unable to update the application.",
    });
  }
});

// Delete application
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid application ID.",
      });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!existingApplication) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    await prisma.application.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Application deleted successfully.",
    });
  } catch (error) {
    console.error("Delete application error:", error);

    res.status(500).json({
      message: "Unable to delete the application.",
    });
  }
});

export default router;
