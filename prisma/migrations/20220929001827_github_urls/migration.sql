/*
  Warnings:

  - You are about to drop the column `github_issues` on the `Roadmap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Roadmap" DROP COLUMN "github_issues",
ADD COLUMN     "github_urls" TEXT[];
