-- AlterTable
ALTER TABLE "ForumTopic" ADD COLUMN     "postCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT;
