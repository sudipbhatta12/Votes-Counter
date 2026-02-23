import { create } from "zustand";
import type { ElectionType, WizardStep, WIZARD_STEPS, Candidate, Party } from "@/lib/types";

interface ElectionStore {
    // ---- Wizard Navigation ----
    currentStep: WizardStep;
    direction: 1 | -1; // For Framer Motion animation direction
    setStep: (step: WizardStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // ---- Auth ----
    agentId: string | null;
    agentName: string | null;
    agentPhone: string | null;
    constituencyId: string | null;
    constituencyLabel: string | null;
    setAuth: (data: {
        agentId: string;
        agentName: string;
        agentPhone: string;
        constituencyId: string;
        constituencyLabel: string;
    }) => void;

    // ---- Election Type ----
    electionType: ElectionType | null;
    setElectionType: (type: ElectionType) => void;

    // ---- Location Selection ----
    selectedWardId: string | null;
    selectedWardLabel: string | null;
    selectedStationId: string | null;
    selectedStationLabel: string | null;
    selectedBoothIds: string[];
    selectedBoothLabels: string[];
    isMixedBox: boolean;
    totalRegisteredVoters: number;
    setWard: (id: string, label: string) => void;
    setStation: (id: string, label: string) => void;
    setBooths: (ids: string[], labels: string[], totalVoters: number) => void;
    toggleMixedBox: () => void;

    // ---- Tally Data ----
    totalCastVotes: number;
    invalidVotes: number;
    candidateVotes: Record<string, number>;
    partyVotes: Record<string, number>;
    setTotalCastVotes: (n: number) => void;
    setInvalidVotes: (n: number) => void;
    setCandidateVote: (candidateId: string, votes: number) => void;
    setPartyVote: (partyId: string, votes: number) => void;

    // ---- Upload ----
    muchulkaImageBase64: string | null;
    setMuchulkaImage: (base64: string | null) => void;

    // ---- Dispute ----
    isDisputed: boolean;
    disputeNote: string;
    setDispute: (note: string) => void;

    // ---- Cached Data ----
    candidates: Candidate[];
    parties: Party[];
    setCandidates: (c: Candidate[]) => void;
    setParties: (p: Party[]) => void;

    // ---- Reset ----
    resetWizard: () => void;
    resetAll: () => void;
}

const STEPS: WizardStep[] = [
    "login",
    "select-type",
    "select-location",
    "tally",
    "upload",
    "confirmation",
];

const initialWizardState = {
    currentStep: "login" as WizardStep,
    direction: 1 as 1 | -1,
    electionType: null as ElectionType | null,
    selectedWardId: null,
    selectedWardLabel: null,
    selectedStationId: null,
    selectedStationLabel: null,
    selectedBoothIds: [] as string[],
    selectedBoothLabels: [] as string[],
    isMixedBox: false,
    totalRegisteredVoters: 0,
    totalCastVotes: 0,
    invalidVotes: 0,
    candidateVotes: {} as Record<string, number>,
    partyVotes: {} as Record<string, number>,
    muchulkaImageBase64: null as string | null,
    isDisputed: false,
    disputeNote: "",
};

export const useElectionStore = create<ElectionStore>((set, get) => ({
    // ---- Initial State ----
    ...initialWizardState,
    agentId: null,
    agentName: null,
    agentPhone: null,
    constituencyId: null,
    constituencyLabel: null,
    candidates: [],
    parties: [],

    // ---- Wizard Navigation ----
    setStep: (step) => {
        const currentIdx = STEPS.indexOf(get().currentStep);
        const nextIdx = STEPS.indexOf(step);
        set({ currentStep: step, direction: nextIdx >= currentIdx ? 1 : -1 });
    },
    nextStep: () => {
        const idx = STEPS.indexOf(get().currentStep);
        if (idx < STEPS.length - 1) {
            set({ currentStep: STEPS[idx + 1], direction: 1 });
        }
    },
    prevStep: () => {
        const idx = STEPS.indexOf(get().currentStep);
        if (idx > 0) {
            set({ currentStep: STEPS[idx - 1], direction: -1 });
        }
    },

    // ---- Auth ----
    setAuth: (data) => set(data),

    // ---- Election Type ----
    setElectionType: (type) => set({ electionType: type }),

    // ---- Location Selection ----
    setWard: (id, label) =>
        set({
            selectedWardId: id,
            selectedWardLabel: label,
            selectedStationId: null,
            selectedStationLabel: null,
            selectedBoothIds: [],
            selectedBoothLabels: [],
        }),
    setStation: (id, label) =>
        set({
            selectedStationId: id,
            selectedStationLabel: label,
            selectedBoothIds: [],
            selectedBoothLabels: [],
        }),
    setBooths: (ids, labels, totalVoters) =>
        set({
            selectedBoothIds: ids,
            selectedBoothLabels: labels,
            totalRegisteredVoters: totalVoters,
        }),
    toggleMixedBox: () =>
        set((state) => {
            const goingToSingle = state.isMixedBox; // currently multi, going to single
            // If going from multi->single with multiple booths, keep only the first
            if (goingToSingle && state.selectedBoothIds.length > 1) {
                return {
                    isMixedBox: false,
                    selectedBoothIds: [state.selectedBoothIds[0]],
                    selectedBoothLabels: [state.selectedBoothLabels[0]],
                    // Voter count will be recalculated when booth list updates
                };
            }
            // Otherwise just toggle the flag, preserve everything
            return { isMixedBox: !state.isMixedBox };
        }),

    // ---- Tally Data ----
    setTotalCastVotes: (n) => set({ totalCastVotes: n }),
    setInvalidVotes: (n) => set({ invalidVotes: n }),
    setCandidateVote: (candidateId, votes) =>
        set((state) => ({
            candidateVotes: { ...state.candidateVotes, [candidateId]: votes },
        })),
    setPartyVote: (partyId, votes) =>
        set((state) => ({
            partyVotes: { ...state.partyVotes, [partyId]: votes },
        })),

    // ---- Upload ----
    setMuchulkaImage: (base64) => set({ muchulkaImageBase64: base64 }),

    // ---- Dispute ----
    setDispute: (note) => set({ isDisputed: !!note, disputeNote: note }),

    // ---- Cached Data ----
    setCandidates: (c) => set({ candidates: c }),
    setParties: (p) => set({ parties: p }),

    // ---- Reset ----
    resetWizard: () => set(initialWizardState),
    resetAll: () =>
        set({
            ...initialWizardState,
            agentId: null,
            agentName: null,
            agentPhone: null,
            constituencyId: null,
            constituencyLabel: null,
            candidates: [],
            parties: [],
        }),
}));
