-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('PLATFORM', 'AGGREGATOR', 'OPERATOR', 'WHITE_LABEL');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('GAME_LAUNCH', 'WALLET', 'CALLBACK', 'PAYMENT');

-- CreateEnum
CREATE TYPE "RoutePriority" AS ENUM ('PRIMARY', 'FALLBACK', 'BACKUP', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "MediaAssetType" AS ENUM ('PROVIDER_LOGO', 'GAME_IMAGE', 'BANNER', 'BRAND_ASSET', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'SELF_EXCLUDED', 'COOLING_OFF', 'DORMANT', 'CLOSED', 'LOCKED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'REQUIRES_REVIEW');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "type" "TenantType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "diff" JSONB,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "commercial" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderPricing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "buyBps" INTEGER NOT NULL,
    "minFee" DECIMAL(18,6),
    "maxFee" DECIMAL(18,6),
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderHealth" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "errorRate" DECIMAL(8,4),
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "details" JSONB,

    CONSTRAINT "ProviderHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "commercial" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorPricing" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "sellBps" INTEGER NOT NULL,
    "minFee" DECIMAL(18,6),
    "maxFee" DECIMAL(18,6),
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentOperator" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentOperator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "rtpBps" INTEGER,
    "volatility" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorGame" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutePolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routeGroupId" TEXT,
    "operatorId" TEXT,
    "providerId" TEXT NOT NULL,
    "routeType" "RouteType" NOT NULL,
    "priority" "RoutePriority" NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "conditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteDecisionLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "routePolicyId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT,
    "gameId" TEXT,
    "decision" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteDecisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "MediaAssetType" NOT NULL,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "cloudflareImageId" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseHash" TEXT,
    "responseBody" JSONB,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'PROCESSING',
    "lockedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "lastError" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "externalId" TEXT,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TEXT,
    "nationality" TEXT,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" "PlayerStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "mobileNumber" TEXT,
    "deviceFingerprints" TEXT[],
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerDocument" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerNote" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "cashBalance" DECIMAL(28,8) NOT NULL DEFAULT 0,
    "bonusBalance" DECIMAL(28,8) NOT NULL DEFAULT 0,
    "lockedBalance" DECIMAL(28,8) NOT NULL DEFAULT 0,
    "pendingWithdrawalBalance" DECIMAL(28,8) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletLedgerEntry" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "balanceType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" DECIMAL(28,8) NOT NULL,
    "currency" TEXT NOT NULL,
    "runningBalance" DECIMAL(28,8) NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "metadata" JSONB,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(28,8) NOT NULL,
    "balanceType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "reversesTransactionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletHold" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(28,8) NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(28,8) NOT NULL,
    "fee" DECIMAL(28,8) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(28,8) NOT NULL,
    "status" TEXT NOT NULL,
    "pspCode" TEXT NOT NULL,
    "pspReference" TEXT,
    "redirectUrl" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "riskScore" INTEGER,
    "ipAddress" TEXT,
    "country" TEXT,
    "metadata" JSONB,
    "completedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalApproval" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(28,8) NOT NULL,
    "status" TEXT NOT NULL,
    "riskCheckPassed" BOOLEAN,
    "kycCheckPassed" BOOLEAN,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL,
    "minDeposit" TEXT,
    "maxBonusAmount" TEXT,
    "matchPercent" INTEGER,
    "freeSpinCount" INTEGER,
    "freeSpinValue" TEXT,
    "wageringMultiplier" INTEGER NOT NULL DEFAULT 35,
    "expiryDays" INTEGER NOT NULL DEFAULT 30,
    "wageringContributions" JSONB NOT NULL,
    "eligibilityRules" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusInstance" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "bonusAmount" DECIMAL(28,8) NOT NULL,
    "remainingAmount" DECIMAL(28,8) NOT NULL,
    "wageringRequired" DECIMAL(28,8) NOT NULL,
    "wageringCompleted" DECIMAL(28,8) NOT NULL DEFAULT 0,
    "freeSpinCount" INTEGER,
    "freeSpinsUsed" INTEGER,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusLedger" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(28,8) NOT NULL,
    "wageringContribution" DECIMAL(28,8),
    "gameId" TEXT,
    "betId" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteLabel" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "primaryDomain" TEXT,
    "themeConfig" JSONB,
    "seoConfig" JSONB,
    "providerPackIds" TEXT[],
    "paymentPackIds" TEXT[],
    "languagePacks" TEXT[],
    "mobileConfig" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "billingPeriodId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "subtotal" DECIMAL(18,4) NOT NULL,
    "taxAmount" DECIMAL(18,4) NOT NULL,
    "total" DECIMAL(18,4) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "lines" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT,
    "companyName" TEXT NOT NULL,
    "legalName" TEXT,
    "website" TEXT,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedTo" TEXT,
    "contractValue" TEXT,
    "currency" TEXT,
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmContact" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "title" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "outcome" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmOpportunity" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "value" TEXT,
    "currency" TEXT,
    "probability" INTEGER,
    "expectedCloseAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycCase" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "assignedTo" TEXT,
    "notes" TEXT,
    "riskScore" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "vendorReference" TEXT,
    "vendorResult" JSONB,
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponsibleGamingLimit" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "period" TEXT,
    "amount" TEXT,
    "currency" TEXT,
    "durationMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "pendingAmount" TEXT,
    "pendingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponsibleGamingLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelfExclusion" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT,
    "scope" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "durationDays" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelfExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmlAlert" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" TEXT,
    "currency" TEXT,
    "status" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "assignedTo" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmlAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL,
    "commissionModel" TEXT NOT NULL,
    "revenueSharePercent" INTEGER,
    "cpaAmount" TEXT,
    "currency" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateCampaign" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "landingUrl" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "registrations" INTEGER NOT NULL DEFAULT 0,
    "ftdCount" INTEGER NOT NULL DEFAULT 0,
    "totalDeposits" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateTrackingLink" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "registrations" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateTrackingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementCycle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "partyType" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "grossRevenue" DECIMAL(18,4) NOT NULL,
    "deductions" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(18,4) NOT NULL,
    "settlementModel" TEXT NOT NULL,
    "revenueSharePercent" INTEGER,
    "lines" JSONB NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "bankReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettlementCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementAdjustment" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "direction" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VipTier" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "minPoints" INTEGER NOT NULL,
    "maxPoints" INTEGER,
    "color" TEXT NOT NULL,
    "benefits" JSONB NOT NULL,
    "withdrawalLimit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerVipStatus" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "currentPoints" INTEGER NOT NULL DEFAULT 0,
    "lifetimePoints" INTEGER NOT NULL DEFAULT 0,
    "hostId" TEXT,
    "notes" TEXT,
    "promotedAt" TIMESTAMP(3),
    "reviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerVipStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "User_tenantId_roleId_idx" ON "User"("tenantId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_roleId_resource_action_scope_key" ON "Permission"("roleId", "resource", "action", "scope");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entityType_entityId_idx" ON "AuditLog"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

-- CreateIndex
CREATE INDEX "Provider_tenantId_status_idx" ON "Provider"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_tenantId_code_key" ON "Provider"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ProviderContract_tenantId_providerId_status_idx" ON "ProviderContract"("tenantId", "providerId", "status");

-- CreateIndex
CREATE INDEX "ProviderPricing_tenantId_providerId_currency_idx" ON "ProviderPricing"("tenantId", "providerId", "currency");

-- CreateIndex
CREATE INDEX "ProviderHealth_tenantId_providerId_checkedAt_idx" ON "ProviderHealth"("tenantId", "providerId", "checkedAt");

-- CreateIndex
CREATE INDEX "Vendor_tenantId_status_idx" ON "Vendor"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_tenantId_code_key" ON "Vendor"("tenantId", "code");

-- CreateIndex
CREATE INDEX "VendorContract_tenantId_vendorId_status_idx" ON "VendorContract"("tenantId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "VendorPricing_tenantId_vendorId_currency_idx" ON "VendorPricing"("tenantId", "vendorId", "currency");

-- CreateIndex
CREATE INDEX "Operator_tenantId_status_idx" ON "Operator"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_tenantId_code_key" ON "Operator"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Agent_tenantId_status_idx" ON "Agent"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_tenantId_code_key" ON "Agent"("tenantId", "code");

-- CreateIndex
CREATE INDEX "AgentOperator_tenantId_agentId_status_idx" ON "AgentOperator"("tenantId", "agentId", "status");

-- CreateIndex
CREATE INDEX "AgentOperator_tenantId_operatorId_status_idx" ON "AgentOperator"("tenantId", "operatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AgentOperator_tenantId_agentId_operatorId_key" ON "AgentOperator"("tenantId", "agentId", "operatorId");

-- CreateIndex
CREATE INDEX "Game_tenantId_category_status_idx" ON "Game"("tenantId", "category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Game_tenantId_providerId_externalId_key" ON "Game"("tenantId", "providerId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorGame_tenantId_operatorId_gameId_key" ON "OperatorGame"("tenantId", "operatorId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteGroup_tenantId_code_key" ON "RouteGroup"("tenantId", "code");

-- CreateIndex
CREATE INDEX "RoutePolicy_tenantId_routeType_status_idx" ON "RoutePolicy"("tenantId", "routeType", "status");

-- CreateIndex
CREATE INDEX "RoutePolicy_tenantId_operatorId_idx" ON "RoutePolicy"("tenantId", "operatorId");

-- CreateIndex
CREATE INDEX "RouteDecisionLog_tenantId_operatorId_createdAt_idx" ON "RouteDecisionLog"("tenantId", "operatorId", "createdAt");

-- CreateIndex
CREATE INDEX "RouteDecisionLog_routePolicyId_idx" ON "RouteDecisionLog"("routePolicyId");

-- CreateIndex
CREATE INDEX "MediaAsset_tenantId_type_status_idx" ON "MediaAsset"("tenantId", "type", "status");

-- CreateIndex
CREATE INDEX "MediaAsset_r2Key_idx" ON "MediaAsset"("r2Key");

-- CreateIndex
CREATE INDEX "IdempotencyKey_tenantId_status_lockedUntil_idx" ON "IdempotencyKey"("tenantId", "status", "lockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_tenantId_key_key" ON "IdempotencyKey"("tenantId", "key");

-- CreateIndex
CREATE INDEX "OutboxEvent_tenantId_status_nextAttemptAt_idx" ON "OutboxEvent"("tenantId", "status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregateType_aggregateId_idx" ON "OutboxEvent"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "Player_tenantId_operatorId_status_idx" ON "Player"("tenantId", "operatorId", "status");

-- CreateIndex
CREATE INDEX "Player_tenantId_kycStatus_idx" ON "Player"("tenantId", "kycStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Player_tenantId_email_key" ON "Player"("tenantId", "email");

-- CreateIndex
CREATE INDEX "PlayerDocument_tenantId_playerId_status_idx" ON "PlayerDocument"("tenantId", "playerId", "status");

-- CreateIndex
CREATE INDEX "PlayerNote_tenantId_playerId_idx" ON "PlayerNote"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "Wallet_tenantId_operatorId_playerId_idx" ON "Wallet"("tenantId", "operatorId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_playerId_currency_key" ON "Wallet"("playerId", "currency");

-- CreateIndex
CREATE INDEX "WalletLedgerEntry_tenantId_walletId_postedAt_idx" ON "WalletLedgerEntry"("tenantId", "walletId", "postedAt");

-- CreateIndex
CREATE INDEX "WalletLedgerEntry_idempotencyKey_idx" ON "WalletLedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_idempotencyKey_key" ON "WalletTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WalletTransaction_tenantId_walletId_type_idx" ON "WalletTransaction"("tenantId", "walletId", "type");

-- CreateIndex
CREATE INDEX "WalletTransaction_tenantId_playerId_idx" ON "WalletTransaction"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "WalletHold_tenantId_walletId_status_idx" ON "WalletHold"("tenantId", "walletId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_tenantId_operatorId_direction_status_idx" ON "Payment"("tenantId", "operatorId", "direction", "status");

-- CreateIndex
CREATE INDEX "Payment_tenantId_playerId_idx" ON "Payment"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "Payment_pspReference_idx" ON "Payment"("pspReference");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalApproval_paymentId_key" ON "WithdrawalApproval"("paymentId");

-- CreateIndex
CREATE INDEX "WithdrawalApproval_tenantId_status_idx" ON "WithdrawalApproval"("tenantId", "status");

-- CreateIndex
CREATE INDEX "BonusTemplate_tenantId_operatorId_isActive_idx" ON "BonusTemplate"("tenantId", "operatorId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BonusTemplate_tenantId_code_key" ON "BonusTemplate"("tenantId", "code");

-- CreateIndex
CREATE INDEX "BonusInstance_tenantId_playerId_status_idx" ON "BonusInstance"("tenantId", "playerId", "status");

-- CreateIndex
CREATE INDEX "BonusInstance_expiresAt_idx" ON "BonusInstance"("expiresAt");

-- CreateIndex
CREATE INDEX "BonusLedger_tenantId_instanceId_idx" ON "BonusLedger"("tenantId", "instanceId");

-- CreateIndex
CREATE INDEX "WhiteLabel_tenantId_operatorId_status_idx" ON "WhiteLabel"("tenantId", "operatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteLabel_tenantId_code_key" ON "WhiteLabel"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_operatorId_status_idx" ON "Invoice"("tenantId", "operatorId", "status");

-- CreateIndex
CREATE INDEX "Invoice_dueAt_idx" ON "Invoice"("dueAt");

-- CreateIndex
CREATE INDEX "CrmAccount_tenantId_status_idx" ON "CrmAccount"("tenantId", "status");

-- CreateIndex
CREATE INDEX "CrmAccount_tenantId_assignedTo_idx" ON "CrmAccount"("tenantId", "assignedTo");

-- CreateIndex
CREATE INDEX "CrmContact_tenantId_accountId_idx" ON "CrmContact"("tenantId", "accountId");

-- CreateIndex
CREATE INDEX "CrmActivity_tenantId_accountId_idx" ON "CrmActivity"("tenantId", "accountId");

-- CreateIndex
CREATE INDEX "CrmActivity_dueAt_idx" ON "CrmActivity"("dueAt");

-- CreateIndex
CREATE INDEX "CrmOpportunity_tenantId_stage_idx" ON "CrmOpportunity"("tenantId", "stage");

-- CreateIndex
CREATE INDEX "KycCase_tenantId_status_idx" ON "KycCase"("tenantId", "status");

-- CreateIndex
CREATE INDEX "KycCase_playerId_idx" ON "KycCase"("playerId");

-- CreateIndex
CREATE INDEX "KycDocument_tenantId_caseId_idx" ON "KycDocument"("tenantId", "caseId");

-- CreateIndex
CREATE INDEX "ResponsibleGamingLimit_tenantId_playerId_type_isActive_idx" ON "ResponsibleGamingLimit"("tenantId", "playerId", "type", "isActive");

-- CreateIndex
CREATE INDEX "SelfExclusion_tenantId_playerId_isActive_idx" ON "SelfExclusion"("tenantId", "playerId", "isActive");

-- CreateIndex
CREATE INDEX "AmlAlert_tenantId_status_idx" ON "AmlAlert"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AmlAlert_tenantId_playerId_idx" ON "AmlAlert"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "Affiliate_tenantId_operatorId_status_idx" ON "Affiliate"("tenantId", "operatorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_tenantId_code_key" ON "Affiliate"("tenantId", "code");

-- CreateIndex
CREATE INDEX "AffiliateCampaign_tenantId_affiliateId_status_idx" ON "AffiliateCampaign"("tenantId", "affiliateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateTrackingLink_token_key" ON "AffiliateTrackingLink"("token");

-- CreateIndex
CREATE INDEX "AffiliateTrackingLink_tenantId_campaignId_idx" ON "AffiliateTrackingLink"("tenantId", "campaignId");

-- CreateIndex
CREATE INDEX "SettlementCycle_tenantId_partyType_partyId_status_idx" ON "SettlementCycle"("tenantId", "partyType", "partyId", "status");

-- CreateIndex
CREATE INDEX "SettlementCycle_periodEnd_idx" ON "SettlementCycle"("periodEnd");

-- CreateIndex
CREATE INDEX "SettlementAdjustment_tenantId_settlementId_idx" ON "SettlementAdjustment"("tenantId", "settlementId");

-- CreateIndex
CREATE INDEX "VipTier_tenantId_operatorId_level_idx" ON "VipTier"("tenantId", "operatorId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerVipStatus_playerId_key" ON "PlayerVipStatus"("playerId");

-- CreateIndex
CREATE INDEX "PlayerVipStatus_tenantId_operatorId_idx" ON "PlayerVipStatus"("tenantId", "operatorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderContract" ADD CONSTRAINT "ProviderContract_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderPricing" ADD CONSTRAINT "ProviderPricing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderHealth" ADD CONSTRAINT "ProviderHealth_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorContract" ADD CONSTRAINT "VendorContract_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorPricing" ADD CONSTRAINT "VendorPricing_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentOperator" ADD CONSTRAINT "AgentOperator_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentOperator" ADD CONSTRAINT "AgentOperator_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorGame" ADD CONSTRAINT "OperatorGame_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorGame" ADD CONSTRAINT "OperatorGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePolicy" ADD CONSTRAINT "RoutePolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePolicy" ADD CONSTRAINT "RoutePolicy_routeGroupId_fkey" FOREIGN KEY ("routeGroupId") REFERENCES "RouteGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePolicy" ADD CONSTRAINT "RoutePolicy_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePolicy" ADD CONSTRAINT "RoutePolicy_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteDecisionLog" ADD CONSTRAINT "RouteDecisionLog_routePolicyId_fkey" FOREIGN KEY ("routePolicyId") REFERENCES "RoutePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboxEvent" ADD CONSTRAINT "OutboxEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerDocument" ADD CONSTRAINT "PlayerDocument_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedgerEntry" ADD CONSTRAINT "WalletLedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletHold" ADD CONSTRAINT "WalletHold_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalApproval" ADD CONSTRAINT "WithdrawalApproval_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusInstance" ADD CONSTRAINT "BonusInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BonusTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusLedger" ADD CONSTRAINT "BonusLedger_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "BonusInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmContact" ADD CONSTRAINT "CrmContact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmOpportunity" ADD CONSTRAINT "CrmOpportunity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CrmAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "KycCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCampaign" ADD CONSTRAINT "AffiliateCampaign_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateTrackingLink" ADD CONSTRAINT "AffiliateTrackingLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AffiliateCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAdjustment" ADD CONSTRAINT "SettlementAdjustment_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SettlementCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVipStatus" ADD CONSTRAINT "PlayerVipStatus_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "VipTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
