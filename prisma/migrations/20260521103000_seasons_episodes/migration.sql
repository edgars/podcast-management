-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('PLANNED', 'RECORDED', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "number" INTEGER,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER,
    "title" TEXT NOT NULL,
    "synopsis" TEXT,
    "scheduledAt" DATE,
    "status" "EpisodeStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodePanelist" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "panelistProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpisodePanelist_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "seasonId" TEXT;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "episodeId" TEXT;

-- AlterTable
ALTER TABLE "SponsorPayment" ADD COLUMN "seasonId" TEXT;

-- CreateIndex
CREATE INDEX "Episode_seasonId_idx" ON "Episode"("seasonId");

-- CreateIndex
CREATE INDEX "EpisodePanelist_panelistProfileId_idx" ON "EpisodePanelist"("panelistProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodePanelist_episodeId_panelistProfileId_key" ON "EpisodePanelist"("episodeId", "panelistProfileId");

-- CreateIndex
CREATE INDEX "Expense_seasonId_idx" ON "Expense"("seasonId");

-- CreateIndex
CREATE INDEX "Expense_episodeId_idx" ON "Expense"("episodeId");

-- CreateIndex
CREATE INDEX "SponsorPayment_seasonId_idx" ON "SponsorPayment"("seasonId");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodePanelist" ADD CONSTRAINT "EpisodePanelist_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodePanelist" ADD CONSTRAINT "EpisodePanelist_panelistProfileId_fkey" FOREIGN KEY ("panelistProfileId") REFERENCES "PanelistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorPayment" ADD CONSTRAINT "SponsorPayment_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
