-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "regenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "regeneratedAt" TIMESTAMP(3);
