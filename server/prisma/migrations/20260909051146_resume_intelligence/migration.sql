-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" SERIAL NOT NULL,
    "summary" TEXT,
    "skills" JSONB,
    "experience" JSONB,
    "education" JSONB,
    "projects" JSONB,
    "certifications" JSONB,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "missingSkills" JSONB,
    "atsScore" INTEGER,
    "keywordScore" INTEGER,
    "impactScore" INTEGER,
    "overallScore" INTEGER,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resumeId" INTEGER NOT NULL,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeAnalysis_resumeId_key" ON "ResumeAnalysis"("resumeId");

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
