-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "original_message_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_original_message_id_fkey" FOREIGN KEY ("original_message_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
