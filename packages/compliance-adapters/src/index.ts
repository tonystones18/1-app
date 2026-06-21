// Compliance Adapter SDK — VisioneSoft Platform
// KYC/AML vendor integration contracts

// ─── Core Types ────────────────────────────────────────────────────────────

export type KycCheckType =
  | "identity_verification"
  | "document_verification"
  | "address_verification"
  | "sanctions_check"
  | "pep_check"
  | "adverse_media"
  | "sof_verification";

export type KycCheckStatus =
  | "pending"
  | "in_progress"
  | "passed"
  | "failed"
  | "requires_review"
  | "expired";

export type RiskLevel = "low" | "medium" | "high" | "very_high";

// ─── Identity Check ────────────────────────────────────────────────────────

export interface IdentityCheckInput {
  externalReference: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality?: string;
  documentType?: "passport" | "national_id" | "drivers_license";
  documentNumber?: string;
  documentIssuingCountry?: string;
  address?: {
    line1: string;
    city: string;
    country: string;
    postalCode?: string;
  };
}

export interface IdentityCheckResult {
  vendorReference: string;
  status: KycCheckStatus;
  riskLevel?: RiskLevel;
  matchScore?: number;
  rejectionReasons?: string[];
  warnings?: string[];
  completedAt?: string;
  raw?: unknown;
}

// ─── Document Verification ─────────────────────────────────────────────────

export interface DocumentVerificationInput {
  externalReference: string;
  documentType: "passport" | "national_id" | "drivers_license" | "utility_bill";
  frontImageBase64: string;
  backImageBase64?: string;
  selfieImageBase64?: string;
}

export interface DocumentVerificationResult {
  vendorReference: string;
  status: KycCheckStatus;
  documentType?: string;
  documentNumber?: string;
  expiryDate?: string;
  issuingCountry?: string;
  nameOnDocument?: string;
  dateOfBirth?: string;
  facialMatchScore?: number;
  tamperedDetected?: boolean;
  completedAt?: string;
  raw?: unknown;
}

// ─── Sanctions / PEP Check ─────────────────────────────────────────────────

export interface SanctionsCheckInput {
  externalReference: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  country?: string;
}

export interface SanctionsCheckResult {
  vendorReference: string;
  isSanctioned: boolean;
  isPep: boolean;
  hasAdverseMedia: boolean;
  riskLevel: RiskLevel;
  matchedEntities?: Array<{
    name: string;
    matchScore: number;
    listName: string;
    category: string;
  }>;
  completedAt: string;
  raw?: unknown;
}

// ─── Adapter Interface ────────────────────────────────────────────────────

export interface ComplianceAdapter {
  readonly vendorCode: string;
  checkIdentity(input: IdentityCheckInput): Promise<IdentityCheckResult>;
  verifyDocument(input: DocumentVerificationInput): Promise<DocumentVerificationResult>;
  checkSanctions(input: SanctionsCheckInput): Promise<SanctionsCheckResult>;
  getCheckStatus(vendorReference: string, checkType: KycCheckType): Promise<KycCheckStatus>;
}

// ─── Mock Compliance Adapter ─────────────────────────────────────────────

export class MockComplianceAdapter implements ComplianceAdapter {
  readonly vendorCode: string;

  constructor(code: string) {
    this.vendorCode = code;
  }

  async checkIdentity(input: IdentityCheckInput): Promise<IdentityCheckResult> {
    return {
      vendorReference: crypto.randomUUID(),
      status: "passed",
      riskLevel: "low",
      matchScore: 98,
      completedAt: new Date().toISOString()
    };
  }

  async verifyDocument(input: DocumentVerificationInput): Promise<DocumentVerificationResult> {
    return {
      vendorReference: crypto.randomUUID(),
      status: "passed",
      documentType: input.documentType,
      facialMatchScore: 97,
      tamperedDetected: false,
      completedAt: new Date().toISOString()
    };
  }

  async checkSanctions(input: SanctionsCheckInput): Promise<SanctionsCheckResult> {
    return {
      vendorReference: crypto.randomUUID(),
      isSanctioned: false,
      isPep: false,
      hasAdverseMedia: false,
      riskLevel: "low",
      matchedEntities: [],
      completedAt: new Date().toISOString()
    };
  }

  async getCheckStatus(_vendorReference: string, _checkType: KycCheckType): Promise<KycCheckStatus> {
    return "passed";
  }
}
