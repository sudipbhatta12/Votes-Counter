// ============================================================================
// Nirwachan Live 2026 — Shared TypeScript Types
// ============================================================================

// ---- Election Type ----
export type ElectionType = "fptp" | "pr";

// ---- Geography ----
export interface Province {
    id: string;
    name: string;
    nameEn?: string;
    number: number;
}

export interface District {
    id: string;
    name: string;
    nameEn?: string;
    provinceId: string;
}

export interface Constituency {
    id: string;
    number: number;
    label: string;
    labelEn?: string;
    districtId: string;
    district?: District;
}

export interface LocalLevel {
    id: string;
    name: string;
    type?: string;
    constituencyId: string;
}

export interface Ward {
    id: string;
    wardNumber: number;
    localLevelId: string;
    localLevel?: LocalLevel;
}

export interface PollingStation {
    id: string;
    name: string;
    wardId: string;
    ward?: Ward;
}

export interface PollingBooth {
    id: string;
    boothNumber: string;
    totalRegisteredVoters: number;
    pollingStationId: string;
    pollingStation?: PollingStation;
}

// ---- Entities ----
export interface Candidate {
    id: string;
    externalId?: number;
    name: string;
    age?: number;
    gender?: string;
    partyName: string;
    symbol?: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
    constituencyId: string;
    isPinned: boolean;
    displayOrder: number;
}

export interface Party {
    id: string;
    name: string;
    nameShort?: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
}

// ---- Vote Tracking ----
export interface VoteBatch {
    id: string;
    isMixedBox: boolean;
    label?: string;
    boothIds: string[];
}

export interface CandidateVoteTally {
    candidateId: string;
    votes: number;
}

export interface PartyVoteTally {
    partyId: string;
    votes: number;
}

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISPUTED";

export interface VoteSubmission {
    id?: string;
    constituencyId: string;
    voteBatch: VoteBatch;
    // FPTP data (optional — can submit PR only)
    fptpTotalCastVotes?: number;
    fptpInvalidVotes?: number;
    candidateVoteTallies?: CandidateVoteTally[];
    fptpMuchulkaImageBase64?: string;
    // PR data (optional — can submit FPTP only)
    prTotalCastVotes?: number;
    prInvalidVotes?: number;
    partyVoteTallies?: PartyVoteTally[];
    prMuchulkaImageBase64?: string;
    // Common
    disputeNote?: string;
    isOffline: boolean;
    submittedAt: string; // ISO timestamp
}

// ---- Wizard State ----
export type WizardStep =
    | "login"
    | "select-location"
    | "tally"
    | "upload"
    | "confirmation";

export const WIZARD_STEPS: WizardStep[] = [
    "login",
    "select-location",
    "tally",
    "upload",
    "confirmation",
];

export interface WizardState {
    currentStep: WizardStep;
    // Location
    selectedWardId: string | null;
    selectedStationId: string | null;
    selectedBoothIds: string[];
    isMixedBox: boolean;
    // FPTP Tally
    fptpTotalCast: number;
    fptpInvalid: number;
    candidateVotes: Record<string, number>;
    // PR Tally
    prTotalCast: number;
    prInvalid: number;
    partyVotes: Record<string, number>;
    // Upload
    fptpMuchulkaBase64: string | null;
    prMuchulkaBase64: string | null;
    // Auth
    agentId: string | null;
    agentName: string | null;
    constituencyId: string | null;
}
