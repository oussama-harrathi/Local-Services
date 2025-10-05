-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "readAt" DATETIME;

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
