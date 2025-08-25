-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "automationType" TEXT NOT NULL,
    "automationName" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "triggerType" TEXT NOT NULL,
    "triggerData" JSONB NOT NULL DEFAULT '{}',
    "inputData" JSONB NOT NULL DEFAULT '{}',
    "outputData" JSONB NOT NULL DEFAULT '{}',
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[],
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_archives" (
    "id" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "archiveType" TEXT NOT NULL,
    "sourceTable" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "archivedData" JSONB NOT NULL,
    "archiveDate" TIMESTAMP(3) NOT NULL,
    "retentionPolicy" TEXT NOT NULL,
    "compressionRatio" DOUBLE PRECISION,
    "storageLocation" TEXT,
    "isRestorable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metrics_businessEntityId_idx" ON "metrics"("businessEntityId");
CREATE INDEX "metrics_metricType_idx" ON "metrics"("metricType");
CREATE INDEX "metrics_metricName_idx" ON "metrics"("metricName");
CREATE INDEX "metrics_source_idx" ON "metrics"("source");
CREATE INDEX "metrics_date_idx" ON "metrics"("date");
CREATE INDEX "metrics_isArchived_idx" ON "metrics"("isArchived");
CREATE INDEX "metrics_businessEntityId_metricType_date_idx" ON "metrics"("businessEntityId", "metricType", "date");
CREATE INDEX "metrics_businessEntityId_source_date_idx" ON "metrics"("businessEntityId", "source", "date");

-- CreateIndex
CREATE INDEX "automation_executions_businessEntityId_idx" ON "automation_executions"("businessEntityId");
CREATE INDEX "automation_executions_automationType_idx" ON "automation_executions"("automationType");
CREATE INDEX "automation_executions_status_idx" ON "automation_executions"("status");
CREATE INDEX "automation_executions_startTime_idx" ON "automation_executions"("startTime");
CREATE INDEX "automation_executions_executionId_idx" ON "automation_executions"("executionId");
CREATE INDEX "automation_executions_isArchived_idx" ON "automation_executions"("isArchived");
CREATE INDEX "automation_executions_businessEntityId_automationType_status_idx" ON "automation_executions"("businessEntityId", "automationType", "status");
CREATE INDEX "automation_executions_businessEntityId_status_startTime_idx" ON "automation_executions"("businessEntityId", "status", "startTime");
CREATE INDEX "automation_executions_businessEntityId_triggerType_startTime_idx" ON "automation_executions"("businessEntityId", "triggerType", "startTime");

-- CreateIndex
CREATE INDEX "data_archives_businessEntityId_idx" ON "data_archives"("businessEntityId");
CREATE INDEX "data_archives_archiveType_idx" ON "data_archives"("archiveType");
CREATE INDEX "data_archives_archiveDate_idx" ON "data_archives"("archiveDate");
CREATE INDEX "data_archives_sourceTable_idx" ON "data_archives"("sourceTable");
CREATE INDEX "data_archives_businessEntityId_archiveType_archiveDate_idx" ON "data_archives"("businessEntityId", "archiveType", "archiveDate");

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_archives" ADD CONSTRAINT "data_archives_businessEntityId_fkey" FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
