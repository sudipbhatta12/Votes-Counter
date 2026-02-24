"use client";

// This page is no longer used in the wizard flow.
// FPTP and PR are now handled via tabs on the tally page.
// Kept as a placeholder in case direct URL access is needed.

import { useElectionStore } from "@/store/electionStore";

export default function SelectTypeStep() {
    const { setStep } = useElectionStore();

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <p className="text-slate-500 mb-4">
                निर्वाचन प्रकार छान्नु पर्दैन — FPTP र PR दुवै एकसाथ भर्नुहोस्।
            </p>
            <button
                onClick={() => setStep("select-location")}
                className="touch-btn touch-btn-primary"
            >
                अगाडि बढ्नुहोस् (Continue)
            </button>
        </div>
    );
}
