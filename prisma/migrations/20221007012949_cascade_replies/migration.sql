-- DropForeignKey
ALTER TABLE "squeak_replies" DROP CONSTRAINT "replies_message_id_fkey";

-- AddForeignKey
ALTER TABLE "squeak_replies" ADD CONSTRAINT "replies_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "squeak_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
