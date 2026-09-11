/*
  Warnings:

  - You are about to drop the column `jobId` on the `Application` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,jobDescriptionId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobDescriptionId` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropIndex
DROP INDEX "Application_jobId_idx";

-- DropIndex
DROP INDEX "Application_userId_jobId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "jobId",
ADD COLUMN     "jobDescriptionId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Application_jobDescriptionId_idx" ON "Application"("jobDescriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobDescriptionId_key" ON "Application"("userId", "jobDescriptionId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
