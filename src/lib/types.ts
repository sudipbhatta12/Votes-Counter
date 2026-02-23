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
    electionType: ElectionType;
    constituencyId: string;
    voteBatch: VoteBatch;
    totalCastVotes: number;
    invalidVotes: number;
    candidateVoteTallies?: CandidateVoteTally[];
    partyVoteTallies?: PartyVoteTally[];
    muchulkaImageBase64?: string;
    disputeNote?: string;
    isOffline: boolean;
    submittedAt: string; // ISO timestamp
}

// ---- Wizard State ----
export type WizardStep =
    | "login"
    | "select-type"
    | "select-location"
    | "tally"
    | "upload"
    | "confirmation";

export const WIZARD_STEPS: WizardStep[] = [
    "login",
    "select-type",
    "select-location",
    "tally",
    "upload",
    "confirmation",
];

export interface WizardState {
    currentStep: WizardStep;
    electionType: ElectionType | null;
    // Location
    selectedWardId: string | null;
    selectedStationId: string | null;
    selectedBoothIds: string[];
    isMixedBox: boolean;
    // Tally
    totalCastVotes: number;
    invalidVotes: number;
    candidateVotes: Record<string, number>;
    partyVotes: Record<string, number>;
    // Upload
    muchulkaImageBase64: string | null;
    // Auth
    agentId: string | null;
    agentName: string | null;
    constituencyId: string | null;
}
