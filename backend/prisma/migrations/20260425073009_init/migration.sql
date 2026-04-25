-- CreateEnum
CREATE TYPE "DisabilityType" AS ENUM ('AUTISM', 'ADHD', 'DOWN_SYNDROME', 'SENSORY_PROCESSING_DISORDER', 'OTHER');

-- CreateEnum
CREATE TYPE "OverloadStatus" AS ENUM ('STABLE', 'WARNING', 'OVERLOAD');

-- CreateEnum
CREATE TYPE "InstructionType" AS ENUM ('VERBAL', 'VISUAL_CARD', 'CALMING_MUSIC', 'BREAK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "disabilityType" "DisabilityType" NOT NULL,
    "parentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "averageEngagement" DOUBLE PRECISION,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehavioralLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engagementScore" DOUBLE PRECISION NOT NULL,
    "gazeDirection" TEXT NOT NULL,
    "microExpression" TEXT,
    "poseData" JSONB,
    "overloadStatus" "OverloadStatus" NOT NULL DEFAULT 'STABLE',

    CONSTRAINT "BehavioralLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentPrompt" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiMessage" TEXT NOT NULL,
    "instructionType" "InstructionType" NOT NULL,
    "parentAcknowledged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ParentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAGReference" (
    "id" TEXT NOT NULL,
    "disabilityType" "DisabilityType" NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "RAGReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralLog" ADD CONSTRAINT "BehavioralLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentPrompt" ADD CONSTRAINT "ParentPrompt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
