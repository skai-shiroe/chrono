-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'RUNNING', 'PAUSED', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "totalPlanned" INTEGER,
    "totalActual" INTEGER,
    "totalDiff" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "role" TEXT,
    "order" INTEGER NOT NULL,
    "plannedTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgrammeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "programmeId" TEXT,
    "intervenantId" TEXT,
    "order" INTEGER NOT NULL,
    "plannedTime" INTEGER NOT NULL,
    "actualTime" INTEGER NOT NULL DEFAULT 0,
    "diffTime" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Passage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "role" TEXT,
    "order" INTEGER NOT NULL,
    "plannedTime" INTEGER NOT NULL,

    CONSTRAINT "TemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntervenantStats" (
    "id" TEXT NOT NULL,
    "intervenantId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalPlanned" INTEGER NOT NULL DEFAULT 0,
    "totalActual" INTEGER NOT NULL DEFAULT 0,
    "totalDiff" INTEGER NOT NULL DEFAULT 0,
    "punctuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntervenantStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_date_idx" ON "Session"("date");

-- CreateIndex
CREATE INDEX "Intervenant_name_idx" ON "Intervenant"("name");

-- CreateIndex
CREATE INDEX "ProgrammeItem_sessionId_idx" ON "ProgrammeItem"("sessionId");

-- CreateIndex
CREATE INDEX "ProgrammeItem_order_idx" ON "ProgrammeItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Passage_programmeId_key" ON "Passage"("programmeId");

-- CreateIndex
CREATE INDEX "Passage_sessionId_idx" ON "Passage"("sessionId");

-- CreateIndex
CREATE INDEX "Passage_order_idx" ON "Passage"("order");

-- CreateIndex
CREATE INDEX "Passage_intervenantId_idx" ON "Passage"("intervenantId");

-- CreateIndex
CREATE INDEX "TemplateItem_templateId_idx" ON "TemplateItem"("templateId");

-- CreateIndex
CREATE INDEX "TemplateItem_order_idx" ON "TemplateItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "IntervenantStats_intervenantId_key" ON "IntervenantStats"("intervenantId");

-- AddForeignKey
ALTER TABLE "ProgrammeItem" ADD CONSTRAINT "ProgrammeItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passage" ADD CONSTRAINT "Passage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passage" ADD CONSTRAINT "Passage_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "ProgrammeItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passage" ADD CONSTRAINT "Passage_intervenantId_fkey" FOREIGN KEY ("intervenantId") REFERENCES "Intervenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateItem" ADD CONSTRAINT "TemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntervenantStats" ADD CONSTRAINT "IntervenantStats_intervenantId_fkey" FOREIGN KEY ("intervenantId") REFERENCES "Intervenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
