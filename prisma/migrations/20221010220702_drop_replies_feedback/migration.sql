/*
  Warnings:

  - You are about to drop the `squeak_replies_feedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE IF EXISTS "squeak_replies_feedback" DROP CONSTRAINT "replies_feedback_organization_id_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "squeak_replies_feedback" DROP CONSTRAINT "replies_feedback_profile_id_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "squeak_replies_feedback" DROP CONSTRAINT "replies_feedback_reply_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "squeak_replies_feedback" CASCADE;
