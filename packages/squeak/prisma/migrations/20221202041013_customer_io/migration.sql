-- AlterTable
ALTER TABLE "squeak_config" ADD COLUMN     "customer_io_app_api_key" TEXT,
ADD COLUMN     "customer_io_broadcast_id" INTEGER,
ADD COLUMN     "customer_io_segment_id" TEXT,
ADD COLUMN     "customer_io_site_id" TEXT,
ADD COLUMN     "customer_io_tracking_api_key" TEXT;
