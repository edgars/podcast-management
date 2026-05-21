-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PANELIST');

-- CreateEnum
CREATE TYPE "MonthlyPaymentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ExpensePaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PANELIST',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PanelistProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "currentTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "executiveBio" TEXT NOT NULL,
    "linkedInUrl" TEXT,
    "otherProfessionalUrl" TEXT,
    "interestTopics" TEXT[],
    "topicsToAvoid" TEXT[],
    "profileCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelistProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelistInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "targetEmail" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "consumedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanelistInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorshipQuota" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyAmount" DECIMAL(12,2) NOT NULL,
    "counterpartiesNotes" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorshipQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsorPayment" (
    "id" TEXT NOT NULL,
    "quotaId" TEXT NOT NULL,
    "sponsorCompanyName" TEXT NOT NULL,
    "status" "MonthlyPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "agreedMonthlyAmount" DECIMAL(12,2) NOT NULL,
    "billingMonth" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" "ExpensePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PanelistProfile_userId_key" ON "PanelistProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PanelistInvite_token_key" ON "PanelistInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PanelistInvite_consumedByUserId_key" ON "PanelistInvite"("consumedByUserId");

-- CreateIndex
CREATE INDEX "SponsorPayment_billingMonth_idx" ON "SponsorPayment"("billingMonth");

-- CreateIndex
CREATE INDEX "SponsorPayment_status_idx" ON "SponsorPayment"("status");

-- CreateIndex
CREATE INDEX "Expense_dueDate_idx" ON "Expense"("dueDate");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelistProfile" ADD CONSTRAINT "PanelistProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelistInvite" ADD CONSTRAINT "PanelistInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelistInvite" ADD CONSTRAINT "PanelistInvite_consumedByUserId_fkey" FOREIGN KEY ("consumedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsorPayment" ADD CONSTRAINT "SponsorPayment_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "SponsorshipQuota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
