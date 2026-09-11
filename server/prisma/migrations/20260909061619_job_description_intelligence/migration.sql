-- CreateTable
CREATE TABLE "JobDescription" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "jobUrl" TEXT,
    "salary" TEXT,
    "requiredSkills" JSONB,
    "technologies" JSONB,
    "responsibilities" JSONB,
    "education" JSONB,
    "experience" JSONB,
    "keywords" JSONB,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobDescription_userId_idx" ON "JobDescription"("userId");

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
