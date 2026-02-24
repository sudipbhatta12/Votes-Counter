import { create } from "zustand";
import type { WizardStep, Candidate, Party } from "@/lib/types";

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

    // ---- FPTP Tally Data ----
    fptpTotalCast: number;
    fptpInvalid: number;
    candidateVotes: Record<string, number>;
    setFptpTotalCast: (n: number) => void;
    setFptpInvalid: (n: number) => void;
    setCandidateVote: (candidateId: string, votes: number) => void;
    fptpSubmitted: boolean;
    setFptpSubmitted: (v: boolean) => void;

    // ---- PR Tally Data ----
    prTotalCast: number;
    prInvalid: number;
    partyVotes: Record<string, number>;
    setPrTotalCast: (n: number) => void;
    setPrInvalid: (n: number) => void;
    setPartyVote: (partyId: string, votes: number) => void;
    prSubmitted: boolean;
    setPrSubmitted: (v: boolean) => void;

    // ---- Upload (two photos) ----
    fptpMuchulkaBase64: string | null;
    prMuchulkaBase64: string | null;
    setFptpMuchulka: (base64: string | null) => void;
    setPrMuchulka: (base64: string | null) => void;

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
    "select-location",
    "tally",
    "upload",
    "confirmation",
];

const initialWizardState = {
    currentStep: "login" as WizardStep,
    direction: 1 as 1 | -1,
    selectedWardId: null,
    selectedWardLabel: null,
    selectedStationId: null,
    selectedStationLabel: null,
    selectedBoothIds: [] as string[],
    selectedBoothLabels: [] as string[],
    isMixedBox: false,
    totalRegisteredVoters: 0,
    // FPTP
    fptpTotalCast: 0,
    fptpInvalid: 0,
    candidateVotes: {} as Record<string, number>,
    fptpSubmitted: false,
    // PR
    prTotalCast: 0,
    prInvalid: 0,
    partyVotes: {} as Record<string, number>,
    prSubmitted: false,
    // Upload
    fptpMuchulkaBase64: null as string | null,
    prMuchulkaBase64: null as string | null,
    // Dispute
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
            const goingToSingle = state.isMixedBox;
            if (goingToSingle && state.selectedBoothIds.length > 1) {
                return {
                    isMixedBox: false,
                    selectedBoothIds: [state.selectedBoothIds[0]],
                    selectedBoothLabels: [state.selectedBoothLabels[0]],
                };
            }
            return { isMixedBox: !state.isMixedBox };
        }),

    // ---- FPTP Tally ----
    setFptpTotalCast: (n) => set({ fptpTotalCast: n }),
    setFptpInvalid: (n) => set({ fptpInvalid: n }),
    setCandidateVote: (candidateId, votes) =>
        set((state) => ({
            candidateVotes: { ...state.candidateVotes, [candidateId]: votes },
        })),
    setFptpSubmitted: (v) => set({ fptpSubmitted: v }),

    // ---- PR Tally ----
    setPrTotalCast: (n) => set({ prTotalCast: n }),
    setPrInvalid: (n) => set({ prInvalid: n }),
    setPartyVote: (partyId, votes) =>
        set((state) => ({
            partyVotes: { ...state.partyVotes, [partyId]: votes },
        })),
    setPrSubmitted: (v) => set({ prSubmitted: v }),

    // ---- Upload ----
    setFptpMuchulka: (base64) => set({ fptpMuchulkaBase64: base64 }),
    setPrMuchulka: (base64) => set({ prMuchulkaBase64: base64 }),

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
