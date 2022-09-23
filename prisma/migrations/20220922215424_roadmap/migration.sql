/*
  Warnings:

  - You are about to drop the column `projected_completion_quarter` on the `Roadmap` table. All the data in the column will be lost.
  - You are about to drop the column `quarter_completed` on the `Roadmap` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Roadmap" DROP COLUMN "projected_completion_quarter",
DROP COLUMN "quarter_completed";
