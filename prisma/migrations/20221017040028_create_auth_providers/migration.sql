/*
  Warnings:

  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,organization_id]` on the table `squeak_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GITHUB');

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_parent_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "refresh_tokens" CASCADE;

-- CreateTable
CREATE TABLE "squeak_auth_providers" (
    "id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "token" TEXT NOT NULL,
    "scopes" TEXT[],
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squeak_auth_providers_pkey" PRIMARY KEY ("id","provider")
);

-- CreateIndex
CREATE UNIQUE INDEX "squeak_profiles_user_id_organization_id_key" ON "squeak_profiles"("user_id", "organization_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "squeak_auth_providers" ADD CONSTRAINT "squeak_auth_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
