"use client";

import { useEffect, useState } from "react";
import { useElectionStore } from "@/store/electionStore";
import { submitVoteTally } from "@/lib/syncEngine";
import type { VoteSubmission } from "@/lib/types";

export default function ConfirmationStep() {
    const {
        electionType,
        constituencyId,
        selectedBoothIds,
        isMixedBox,
        totalCastVotes,
        invalidVotes,
        candidateVotes,
        partyVotes,
        muchulkaImageBase64,
        totalRegisteredVoters,
        resetWizard,
    } = useElectionStore();

    const [isOffline, setIsOffline] = useState(false);

    // Track online status client-side only (avoids hydration mismatch)
    useEffect(() => {
        setIsOffline(!navigator.onLine);
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);
        window.addEventListener("offline", goOffline);
        window.addEventListener("online", goOnline);
        return () => {
            window.removeEventListener("offline", goOffline);
            window.removeEventListener("online", goOnline);
        };
    }, []);

    // Auto-submit on mount
    useEffect(() => {
        const payload: VoteSubmission = {
            electionType: electionType || "fptp",
            constituencyId: constituencyId || "",
            voteBatch: {
                id: `batch-${Date.now()}`,
                isMixedBox,
                boothIds: selectedBoothIds,
            },
            totalCastVotes,
            invalidVotes,
            candidateVoteTallies: Object.entries(candidateVotes).map(
                ([candidateId, votes]) => ({ candidateId, votes })
            ),
            partyVoteTallies: Object.entries(partyVotes).map(
                ([partyId, votes]) => ({ partyId, votes })
            ),
            isOffline: !navigator.onLine,
            submittedAt: new Date().toISOString(),
        };

        submitVoteTally(JSON.stringify(payload), muchulkaImageBase64 || undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNewTally = () => {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        resetWizard();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-sm">
                {/* Success icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-emerald-700 mb-2">
                    सफलतापूर्वक पठाइयो!
                </h1>
                <p className="text-slate-500 mb-2">
                    Tally submitted successfully.
                </p>
                {isOffline && (
                    <p className="text-amber-600 text-sm font-medium">
                        अफलाइन — नेटवर्क मिल्दा स्वतः सिंक हुनेछ।
                    </p>
                )}

                {/* Summary */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-500">कुल दर्ता मतदाता</span>
                        <span className="font-bold text-slate-900">
                            {totalRegisteredVoters}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">खसेको मत</span>
                        <span className="font-bold text-slate-900">{totalCastVotes}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">बदर मत</span>
                        <span className="font-bold text-slate-900">{invalidVotes}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-slate-500">वैध मत</span>
                        <span className="font-bold text-emerald-700">
                            {totalCastVotes - invalidVotes}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleNewTally}
                    className="touch-btn touch-btn-primary w-full mt-6"
                >
                    नयाँ मत गणना (New Tally)
                </button>
            </div>
        </div>
    );
}
