-- CreateTable
CREATE TABLE "JobMatch" (
    "id" SERIAL NOT NULL,
    "overallScore" INTEGER,
    "skillScore" INTEGER,
    "experienceScore" INTEGER,
    "educationScore" INTEGER,
    "keywordScore" INTEGER,
    "summary" TEXT,
    "matchedSkills" JSONB,
    "missingSkills" JSONB,
    "strengths" JSONB,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "jobDescriptionId" INTEGER NOT NULL,

    CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobMatch_userId_idx" ON "JobMatch"("userId");

-- CreateIndex
CREATE INDEX "JobMatch_resumeId_idx" ON "JobMatch"("resumeId");

-- CreateIndex
CREATE INDEX "JobMatch_jobDescriptionId_idx" ON "JobMatch"("jobDescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobMatch_resumeId_jobDescriptionId_key" ON "JobMatch"("resumeId", "jobDescriptionId");

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
