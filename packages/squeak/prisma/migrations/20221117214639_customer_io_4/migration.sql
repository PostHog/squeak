/*
  Warnings:

  - You are about to drop the column `customer_io_api_key` on the `squeak_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "squeak_config" DROP COLUMN "customer_io_api_key",
ADD COLUMN     "customer_io_app_api_key" TEXT,
ADD COLUMN     "customer_io_tracking_api_key" TEXT;
