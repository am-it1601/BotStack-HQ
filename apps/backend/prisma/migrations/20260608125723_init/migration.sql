-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "billing";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "client";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "conversation";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "document";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "filing";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "knowledge";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "notification";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workflow";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workspace";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "workspace"."WorkspaceRole" AS ENUM ('CA_OWNER', 'JUNIOR_CA', 'SUPPORT_STAFF');

-- CreateEnum
CREATE TYPE "workspace"."EscalationThreshold" AS ENUM ('IMMEDIATE', 'ONCE', 'TWICE');

-- CreateEnum
CREATE TYPE "workspace"."PlanType" AS ENUM ('STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'HINDI', 'GUJARATI', 'MARATHI', 'TAMIL', 'TELUGU', 'KANNADA', 'BENGALI', 'PUNJABI');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('INDIVIDUAL', 'HUF', 'PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PVT_LTD', 'TRUST');

-- CreateEnum
CREATE TYPE "client"."ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "client"."GSTCategory" AS ENUM ('CATEGORY_I', 'CATEGORY_II');

-- CreateEnum
CREATE TYPE "client"."GSTFilingFrequency" AS ENUM ('MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "client"."GSTRegistrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SURRENDERED');

-- CreateEnum
CREATE TYPE "FilingCategory" AS ENUM ('GST', 'DIRECT_TAX');

-- CreateEnum
CREATE TYPE "FilingFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "filing"."FilingStatus" AS ENUM ('UPCOMING', 'INPUT_TRIGGERED', 'INPUT_ACKNOWLEDGED', 'INPUTS_RECEIVED', 'INPUTS_COMPLETE', 'INPUTS_OVERDUE', 'PENDING_APPROVAL', 'FILED', 'CONFIRMED', 'AT_RISK');

-- CreateEnum
CREATE TYPE "workflow"."WorkflowType" AS ENUM ('INPUT_COLLECTION', 'REMINDER', 'CONFIRMATION');

-- CreateEnum
CREATE TYPE "workflow"."WorkflowStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'ESCALATED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "workflow"."ReminderType" AS ENUM ('T7', 'T3', 'T1', 'POST_DEADLINE');

-- CreateEnum
CREATE TYPE "workflow"."ReminderStatus" AS ENUM ('SCHEDULED', 'SENT', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "document"."DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'EXTRACTED', 'INCOMPLETE', 'UNREADABLE', 'VALIDATED');

-- CreateEnum
CREATE TYPE "document"."UploadChannel" AS ENUM ('WHATSAPP', 'DASHBOARD');

-- CreateEnum
CREATE TYPE "conversation"."ConversationStatus" AS ENUM ('ACTIVE', 'ESCALATED', 'IN_HUMAN_HANDLING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "conversation"."MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "conversation"."MessageSenderType" AS ENUM ('CLIENT', 'AGENT', 'HUMAN');

-- CreateEnum
CREATE TYPE "conversation"."MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "notification"."NotificationType" AS ENUM ('ONBOARDING', 'INPUT_COLLECTION', 'REMINDER', 'CONFIRMATION', 'ESCALATION', 'QUERY_RESPONSE');

-- CreateEnum
CREATE TYPE "notification"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "audit"."AuditActorType" AS ENUM ('SYSTEM', 'CA_OWNER', 'JUNIOR_CA', 'SUPPORT_STAFF', 'CLIENT');

-- CreateEnum
CREATE TYPE "billing"."UsageEventType" AS ENUM ('CONVERSATION_STARTED', 'MESSAGE_SENT', 'DOCUMENT_PROCESSED', 'WORKFLOW_EXECUTED', 'LLM_TOKENS_USED');

-- CreateEnum
CREATE TYPE "knowledge"."KnowledgeSourceType" AS ENUM ('PDF', 'FAQ', 'WEBSITE', 'MANUAL');

-- CreateEnum
CREATE TYPE "knowledge"."KnowledgeStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "workspace"."Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authkit_org_id" TEXT NOT NULL,
    "whatsapp_phone_id" TEXT,
    "whatsapp_verified" BOOLEAN NOT NULL DEFAULT false,
    "agent_name" TEXT NOT NULL DEFAULT 'Arya',
    "agent_greeting" TEXT,
    "escalation_threshold" "workspace"."EscalationThreshold" NOT NULL DEFAULT 'ONCE',
    "default_language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "plan" "workspace"."PlanType" NOT NULL DEFAULT 'STARTER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace"."User" (
    "id" TEXT NOT NULL,
    "authkit_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace"."WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "workspace"."WorkspaceRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client"."Client" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "display_name" TEXT,
    "entity_type" "EntityType" NOT NULL,
    "pan" TEXT,
    "tan" TEXT,
    "whatsapp_number" TEXT NOT NULL,
    "email" TEXT,
    "preferred_language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "is_gst_registered" BOOLEAN NOT NULL DEFAULT false,
    "is_priority" BOOLEAN NOT NULL DEFAULT false,
    "primary_ca_id" TEXT NOT NULL,
    "status" "client"."ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "onboarding_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client"."GSTRegistration" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "state_code" TEXT NOT NULL,
    "state_name" TEXT NOT NULL,
    "gst_category" "client"."GSTCategory" NOT NULL,
    "filing_frequency" "client"."GSTFilingFrequency" NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "status" "client"."GSTRegistrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_composition" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "GSTRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client"."ClientAssignment" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "workspace_member_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilingType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FilingCategory" NOT NULL,
    "frequency" "FilingFrequency" NOT NULL,
    "applicable_entities" "EntityType"[],
    "depends_on" TEXT,
    "default_lead_days" INTEGER NOT NULL,
    "due_day" INTEGER,
    "due_month" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing"."ClientFilingConfig" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "filing_type_id" TEXT NOT NULL,
    "gst_registration_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "lead_days_override" INTEGER,
    "custom_due_day" INTEGER,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_until" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientFilingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing"."FilingRecord" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "filing_type_id" TEXT NOT NULL,
    "filing_config_id" TEXT NOT NULL,
    "gst_registration_id" TEXT,
    "period_label" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "effective_due_date" TIMESTAMP(3) NOT NULL,
    "input_collection_date" TIMESTAMP(3) NOT NULL,
    "status" "filing"."FilingStatus" NOT NULL DEFAULT 'UPCOMING',
    "arn" TEXT,
    "filed_at" TIMESTAMP(3),
    "filed_by_id" TEXT,
    "filed_on_portal" TEXT,
    "submitted_for_approval_at" TIMESTAMP(3),
    "submitted_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "approval_notes" TEXT,
    "rejection_notes" TEXT,
    "confirmation_sent_at" TIMESTAMP(3),
    "confirmation_delivery_status" "notification"."NotificationStatus",
    "eventbridge_schedule_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FilingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filing"."FilingDeadlineOverride" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "filing_record_id" TEXT NOT NULL,
    "original_due_date" TIMESTAMP(3) NOT NULL,
    "overridden_due_date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "overridden_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilingDeadlineOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."WorkflowInstance" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "filing_record_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "workflow_type" "workflow"."WorkflowType" NOT NULL,
    "status" "workflow"."WorkflowStatus" NOT NULL DEFAULT 'PENDING',
    "triggered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "escalated_at" TIMESTAMP(3),
    "escalation_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."ReminderSchedule" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "workflow_instance_id" TEXT NOT NULL,
    "reminder_type" "workflow"."ReminderType" NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "status" "workflow"."ReminderStatus" NOT NULL DEFAULT 'SCHEDULED',
    "eventbridge_schedule_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReminderSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document"."Document" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "filing_record_id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "s3_bucket" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "document_type" TEXT,
    "status" "document"."DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "uploaded_via" "document"."UploadChannel" NOT NULL DEFAULT 'WHATSAPP',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document"."DocumentExtraction" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "extracted_fields" JSONB NOT NULL,
    "validation_result" JSONB NOT NULL,
    "confidence_score" DOUBLE PRECISION,
    "extraction_model" TEXT,
    "raw_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation"."Conversation" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "workflow_instance_id" TEXT,
    "whatsapp_thread_id" TEXT,
    "status" "conversation"."ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "escalation_reason" TEXT,
    "escalated_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "human_takeover_at" TIMESTAMP(3),
    "human_takeover_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation"."Message" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "direction" "conversation"."MessageDirection" NOT NULL,
    "sender_type" "conversation"."MessageSenderType" NOT NULL,
    "sender_id" TEXT,
    "content" TEXT NOT NULL,
    "media_url" TEXT,
    "media_type" TEXT,
    "whatsapp_message_id" TEXT,
    "template_name" TEXT,
    "language" "Language",
    "status" "conversation"."MessageStatus" NOT NULL DEFAULT 'SENT',
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification"."NotificationLog" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "message_id" TEXT,
    "notification_type" "notification"."NotificationType" NOT NULL,
    "template_name" TEXT,
    "language" "Language" NOT NULL,
    "whatsapp_message_id" TEXT,
    "delivery_status" "notification"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."AuditLog" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."AuditEvent" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT,
    "filing_record_id" TEXT,
    "actor_type" "audit"."AuditActorType" NOT NULL,
    "actor_id" TEXT,
    "actor_name" TEXT NOT NULL,
    "event_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing"."WorkspaceUsage" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "period_year" INTEGER NOT NULL,
    "period_month" INTEGER NOT NULL,
    "active_clients_count" INTEGER NOT NULL DEFAULT 0,
    "active_gstins_count" INTEGER NOT NULL DEFAULT 0,
    "agent_conversations_count" INTEGER NOT NULL DEFAULT 0,
    "whatsapp_messages_sent_count" INTEGER NOT NULL DEFAULT 0,
    "documents_processed_count" INTEGER NOT NULL DEFAULT 0,
    "workflow_executions_count" INTEGER NOT NULL DEFAULT 0,
    "llm_tokens_used_count" BIGINT NOT NULL DEFAULT 0,
    "billing_calculated" BOOLEAN NOT NULL DEFAULT false,
    "billing_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing"."UsageEvent" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "event_type" "billing"."UsageEventType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge"."KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source_type" "knowledge"."KnowledgeSourceType" NOT NULL,
    "s3_key" TEXT,
    "source_url" TEXT,
    "status" "knowledge"."KnowledgeStatus" NOT NULL DEFAULT 'PROCESSING',
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge"."KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "token_count" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "workspace"."Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_authkit_org_id_key" ON "workspace"."Workspace"("authkit_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_authkit_user_id_key" ON "workspace"."User"("authkit_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "workspace"."User"("email");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspace_id_idx" ON "workspace"."WorkspaceMember"("workspace_id");

-- CreateIndex
CREATE INDEX "WorkspaceMember_user_id_idx" ON "workspace"."WorkspaceMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspace_id_user_id_key" ON "workspace"."WorkspaceMember"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "Client_workspace_id_idx" ON "client"."Client"("workspace_id");

-- CreateIndex
CREATE INDEX "Client_workspace_id_status_idx" ON "client"."Client"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Client_whatsapp_number_workspace_id_idx" ON "client"."Client"("whatsapp_number", "workspace_id");

-- CreateIndex
CREATE INDEX "Client_workspace_id_is_priority_idx" ON "client"."Client"("workspace_id", "is_priority");

-- CreateIndex
CREATE INDEX "GSTRegistration_workspace_id_client_id_idx" ON "client"."GSTRegistration"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "GSTRegistration_workspace_id_status_idx" ON "client"."GSTRegistration"("workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GSTRegistration_gstin_workspace_id_key" ON "client"."GSTRegistration"("gstin", "workspace_id");

-- CreateIndex
CREATE INDEX "ClientAssignment_workspace_id_client_id_idx" ON "client"."ClientAssignment"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "ClientAssignment_workspace_id_workspace_member_id_idx" ON "client"."ClientAssignment"("workspace_id", "workspace_member_id");

-- CreateIndex
CREATE INDEX "ClientAssignment_workspace_id_client_id_revoked_at_idx" ON "client"."ClientAssignment"("workspace_id", "client_id", "revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "FilingType_code_key" ON "FilingType"("code");

-- CreateIndex
CREATE INDEX "ClientFilingConfig_workspace_id_client_id_idx" ON "filing"."ClientFilingConfig"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "ClientFilingConfig_workspace_id_is_active_idx" ON "filing"."ClientFilingConfig"("workspace_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ClientFilingConfig_client_id_filing_type_id_gst_registratio_key" ON "filing"."ClientFilingConfig"("client_id", "filing_type_id", "gst_registration_id");

-- CreateIndex
CREATE INDEX "FilingRecord_workspace_id_status_idx" ON "filing"."FilingRecord"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "FilingRecord_workspace_id_client_id_idx" ON "filing"."FilingRecord"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "FilingRecord_workspace_id_effective_due_date_idx" ON "filing"."FilingRecord"("workspace_id", "effective_due_date");

-- CreateIndex
CREATE INDEX "FilingRecord_workspace_id_input_collection_date_idx" ON "filing"."FilingRecord"("workspace_id", "input_collection_date");

-- CreateIndex
CREATE UNIQUE INDEX "FilingRecord_client_id_filing_type_id_gst_registration_id_p_key" ON "filing"."FilingRecord"("client_id", "filing_type_id", "gst_registration_id", "period_start");

-- CreateIndex
CREATE INDEX "FilingDeadlineOverride_workspace_id_filing_record_id_idx" ON "filing"."FilingDeadlineOverride"("workspace_id", "filing_record_id");

-- CreateIndex
CREATE INDEX "WorkflowInstance_workspace_id_filing_record_id_idx" ON "workflow"."WorkflowInstance"("workspace_id", "filing_record_id");

-- CreateIndex
CREATE INDEX "WorkflowInstance_workspace_id_status_idx" ON "workflow"."WorkflowInstance"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "WorkflowInstance_workspace_id_client_id_idx" ON "workflow"."WorkflowInstance"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "ReminderSchedule_workspace_id_workflow_instance_id_idx" ON "workflow"."ReminderSchedule"("workspace_id", "workflow_instance_id");

-- CreateIndex
CREATE INDEX "ReminderSchedule_workspace_id_scheduled_at_status_idx" ON "workflow"."ReminderSchedule"("workspace_id", "scheduled_at", "status");

-- CreateIndex
CREATE INDEX "Document_workspace_id_filing_record_id_idx" ON "document"."Document"("workspace_id", "filing_record_id");

-- CreateIndex
CREATE INDEX "Document_workspace_id_client_id_idx" ON "document"."Document"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "Document_workspace_id_status_idx" ON "document"."Document"("workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentExtraction_document_id_key" ON "document"."DocumentExtraction"("document_id");

-- CreateIndex
CREATE INDEX "DocumentExtraction_workspace_id_document_id_idx" ON "document"."DocumentExtraction"("workspace_id", "document_id");

-- CreateIndex
CREATE INDEX "Conversation_workspace_id_client_id_idx" ON "conversation"."Conversation"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "Conversation_workspace_id_status_idx" ON "conversation"."Conversation"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Message_workspace_id_conversation_id_idx" ON "conversation"."Message"("workspace_id", "conversation_id");

-- CreateIndex
CREATE INDEX "Message_workspace_id_conversation_id_sent_at_idx" ON "conversation"."Message"("workspace_id", "conversation_id", "sent_at");

-- CreateIndex
CREATE INDEX "NotificationLog_workspace_id_client_id_idx" ON "notification"."NotificationLog"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "NotificationLog_workspace_id_notification_type_idx" ON "notification"."NotificationLog"("workspace_id", "notification_type");

-- CreateIndex
CREATE INDEX "NotificationLog_workspace_id_delivery_status_idx" ON "notification"."NotificationLog"("workspace_id", "delivery_status");

-- CreateIndex
CREATE INDEX "AuditLog_workspace_id_entity_type_entity_id_idx" ON "audit"."AuditLog"("workspace_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "AuditLog_workspace_id_created_at_idx" ON "audit"."AuditLog"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "AuditLog_workspace_id_user_id_idx" ON "audit"."AuditLog"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "AuditEvent_workspace_id_client_id_idx" ON "audit"."AuditEvent"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "AuditEvent_workspace_id_filing_record_id_idx" ON "audit"."AuditEvent"("workspace_id", "filing_record_id");

-- CreateIndex
CREATE INDEX "AuditEvent_workspace_id_created_at_idx" ON "audit"."AuditEvent"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "WorkspaceUsage_workspace_id_idx" ON "billing"."WorkspaceUsage"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUsage_workspace_id_period_year_period_month_key" ON "billing"."WorkspaceUsage"("workspace_id", "period_year", "period_month");

-- CreateIndex
CREATE INDEX "UsageEvent_workspace_id_event_type_idx" ON "billing"."UsageEvent"("workspace_id", "event_type");

-- CreateIndex
CREATE INDEX "UsageEvent_workspace_id_created_at_idx" ON "billing"."UsageEvent"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_workspace_id_status_idx" ON "knowledge"."KnowledgeDocument"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_workspace_id_document_id_idx" ON "knowledge"."KnowledgeChunk"("workspace_id", "document_id");

-- AddForeignKey
ALTER TABLE "workspace"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace"."WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "workspace"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client"."Client" ADD CONSTRAINT "Client_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client"."GSTRegistration" ADD CONSTRAINT "GSTRegistration_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client"."GSTRegistration" ADD CONSTRAINT "GSTRegistration_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client"."ClientAssignment" ADD CONSTRAINT "ClientAssignment_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client"."ClientAssignment" ADD CONSTRAINT "ClientAssignment_workspace_member_id_fkey" FOREIGN KEY ("workspace_member_id") REFERENCES "workspace"."WorkspaceMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."ClientFilingConfig" ADD CONSTRAINT "ClientFilingConfig_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."ClientFilingConfig" ADD CONSTRAINT "ClientFilingConfig_filing_type_id_fkey" FOREIGN KEY ("filing_type_id") REFERENCES "FilingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."ClientFilingConfig" ADD CONSTRAINT "ClientFilingConfig_gst_registration_id_fkey" FOREIGN KEY ("gst_registration_id") REFERENCES "client"."GSTRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."FilingRecord" ADD CONSTRAINT "FilingRecord_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."FilingRecord" ADD CONSTRAINT "FilingRecord_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."FilingRecord" ADD CONSTRAINT "FilingRecord_filing_type_id_fkey" FOREIGN KEY ("filing_type_id") REFERENCES "FilingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."FilingRecord" ADD CONSTRAINT "FilingRecord_filing_config_id_fkey" FOREIGN KEY ("filing_config_id") REFERENCES "filing"."ClientFilingConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."FilingRecord" ADD CONSTRAINT "FilingRecord_gst_registration_id_fkey" FOREIGN KEY ("gst_registration_id") REFERENCES "client"."GSTRegistration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filing"."FilingDeadlineOverride" ADD CONSTRAINT "FilingDeadlineOverride_filing_record_id_fkey" FOREIGN KEY ("filing_record_id") REFERENCES "filing"."FilingRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow"."WorkflowInstance" ADD CONSTRAINT "WorkflowInstance_filing_record_id_fkey" FOREIGN KEY ("filing_record_id") REFERENCES "filing"."FilingRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow"."ReminderSchedule" ADD CONSTRAINT "ReminderSchedule_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow"."WorkflowInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document"."Document" ADD CONSTRAINT "Document_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document"."Document" ADD CONSTRAINT "Document_filing_record_id_fkey" FOREIGN KEY ("filing_record_id") REFERENCES "filing"."FilingRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document"."DocumentExtraction" ADD CONSTRAINT "DocumentExtraction_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"."Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation"."Conversation" ADD CONSTRAINT "Conversation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation"."Conversation" ADD CONSTRAINT "Conversation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation"."Conversation" ADD CONSTRAINT "Conversation_workflow_instance_id_fkey" FOREIGN KEY ("workflow_instance_id") REFERENCES "workflow"."WorkflowInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation"."Message" ADD CONSTRAINT "Message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversation"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."AuditLog" ADD CONSTRAINT "AuditLog_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "workspace"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."AuditEvent" ADD CONSTRAINT "AuditEvent_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."AuditEvent" ADD CONSTRAINT "AuditEvent_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."AuditEvent" ADD CONSTRAINT "AuditEvent_filing_record_id_fkey" FOREIGN KEY ("filing_record_id") REFERENCES "filing"."FilingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing"."WorkspaceUsage" ADD CONSTRAINT "WorkspaceUsage_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge"."KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge"."KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "knowledge"."KnowledgeDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- MANUAL SQL (not generated by Prisma) — Data Model Phase 1 §12 + §13.
-- Prisma cannot express an ivfflat vector index or RLS policies, so they are
-- hand-authored here. Keep in sync with docs/BotStackHQ_Data_Model_Phase_1.md.
-- ============================================================================

-- pgvector ANN index on KnowledgeChunk.embedding (Data Model §12).
-- vector_cosine_ops matches OpenAI text-embedding-3-small cosine similarity.
CREATE INDEX "knowledge_chunk_embedding_idx"
  ON "knowledge"."KnowledgeChunk"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

-- ----------------------------------------------------------------------------
-- Row-Level Security (Data Model §13). Workspace isolation enforced at the DB
-- layer as a safety net on top of application-level filtering.
--
-- The application sets `SET LOCAL app.workspace_id = '<workspace_id from JWT>'`
-- at the start of every request (wired in a later task). The policy is
-- fail-closed: when the GUC is unset, current_setting(..., true) is NULL, the
-- comparison yields NULL, and no rows are visible / insertable.
--
-- ENABLE + FORCE: FORCE makes the policy apply even to the table owner, so
-- isolation is testable locally where we connect as a superuser/owner. In
-- production the app should connect as a dedicated non-superuser role (Backlog).
--
-- Applied to all 20 tenant tables (those carrying workspace_id). public."FilingType"
-- (global master) and workspace."User" (global identity) have no workspace_id
-- and are intentionally excluded.
-- ----------------------------------------------------------------------------

-- workspace
ALTER TABLE "workspace"."WorkspaceMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace"."WorkspaceMember" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "workspace"."WorkspaceMember"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- client
ALTER TABLE "client"."Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client"."Client" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "client"."Client"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "client"."GSTRegistration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client"."GSTRegistration" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "client"."GSTRegistration"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "client"."ClientAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client"."ClientAssignment" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "client"."ClientAssignment"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- filing
ALTER TABLE "filing"."ClientFilingConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "filing"."ClientFilingConfig" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "filing"."ClientFilingConfig"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "filing"."FilingRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "filing"."FilingRecord" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "filing"."FilingRecord"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "filing"."FilingDeadlineOverride" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "filing"."FilingDeadlineOverride" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "filing"."FilingDeadlineOverride"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- workflow
ALTER TABLE "workflow"."WorkflowInstance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow"."WorkflowInstance" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "workflow"."WorkflowInstance"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "workflow"."ReminderSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow"."ReminderSchedule" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "workflow"."ReminderSchedule"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- document
ALTER TABLE "document"."Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document"."Document" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "document"."Document"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "document"."DocumentExtraction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document"."DocumentExtraction" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "document"."DocumentExtraction"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- conversation
ALTER TABLE "conversation"."Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation"."Conversation" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "conversation"."Conversation"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "conversation"."Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation"."Message" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "conversation"."Message"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- notification
ALTER TABLE "notification"."NotificationLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification"."NotificationLog" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "notification"."NotificationLog"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- audit
ALTER TABLE "audit"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit"."AuditLog" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "audit"."AuditLog"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "audit"."AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit"."AuditEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "audit"."AuditEvent"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- billing
ALTER TABLE "billing"."WorkspaceUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "billing"."WorkspaceUsage" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "billing"."WorkspaceUsage"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "billing"."UsageEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "billing"."UsageEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "billing"."UsageEvent"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

-- knowledge
ALTER TABLE "knowledge"."KnowledgeDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge"."KnowledgeDocument" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "knowledge"."KnowledgeDocument"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));

ALTER TABLE "knowledge"."KnowledgeChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "knowledge"."KnowledgeChunk" FORCE ROW LEVEL SECURITY;
CREATE POLICY "workspace_isolation" ON "knowledge"."KnowledgeChunk"
  USING ("workspace_id" = current_setting('app.workspace_id', true))
  WITH CHECK ("workspace_id" = current_setting('app.workspace_id', true));
