"use client";

import { useEffect, useState } from "react";
import { useElectionStore } from "@/store/electionStore";
import { submitVoteTally } from "@/lib/syncEngine";
import type { VoteSubmission } from "@/lib/types";

export default function ConfirmationStep() {
    const {
        constituencyId,
        selectedBoothIds,
        selectedBoothLabels,
        isMixedBox,
        fptpTotalCast,
        fptpInvalid,
        candidateVotes,
        fptpSubmitted,
        prTotalCast,
        prInvalid,
        partyVotes,
        prSubmitted,
        fptpMuchulkaBase64,
        prMuchulkaBase64,
        totalRegisteredVoters,
        resetWizard,
    } = useElectionStore();

    const [isOffline, setIsOffline] = useState(false);

    // Track online status client-side only
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
            constituencyId: constituencyId || "",
            voteBatch: {
                id: `batch-${Date.now()}`,
                isMixedBox,
                boothIds: selectedBoothIds,
            },
            // FPTP (only if submitted)
            ...(fptpSubmitted && {
                fptpTotalCastVotes: fptpTotalCast,
                fptpInvalidVotes: fptpInvalid,
                candidateVoteTallies: Object.entries(candidateVotes).map(
                    ([candidateId, votes]) => ({ candidateId, votes })
                ),
                fptpMuchulkaImageBase64: fptpMuchulkaBase64 || undefined,
            }),
            // PR (only if submitted)
            ...(prSubmitted && {
                prTotalCastVotes: prTotalCast,
                prInvalidVotes: prInvalid,
                partyVoteTallies: Object.entries(partyVotes).map(
                    ([partyId, votes]) => ({ partyId, votes })
                ),
                prMuchulkaImageBase64: prMuchulkaBase64 || undefined,
            }),
            isOffline: !navigator.onLine,
            submittedAt: new Date().toISOString(),
        };

        submitVoteTally(JSON.stringify(payload), undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNewTally = () => {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        resetWizard();
    };

    const fptpValid = fptpTotalCast - fptpInvalid;
    const prValid = prTotalCast - prInvalid;

    return (
        <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto">
            <div className="text-center max-w-sm w-full">
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

                {/* Booth Info */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">मतपेटिका</span>
                        <span className="font-bold text-slate-900">
                            {selectedBoothLabels.length > 2
                                ? `${selectedBoothLabels.length} booths`
                                : selectedBoothLabels.join(", ")}
                        </span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-slate-500">कुल दर्ता मतदाता</span>
                        <span className="font-bold text-slate-900">
                            {totalRegisteredVoters}
                        </span>
                    </div>
                </div>

                {/* FPTP Summary */}
                {fptpSubmitted && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left text-sm space-y-2">
                        <h3 className="text-sm font-bold text-blue-800 mb-2">
                            FPTP प्रत्यक्ष
                        </h3>
                        <div className="flex justify-between">
                            <span className="text-slate-500">खसेको मत</span>
                            <span className="font-bold text-slate-900">{fptpTotalCast}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">बदर मत</span>
                            <span className="font-bold text-slate-900">{fptpInvalid}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-slate-500">वैध मत</span>
                            <span className="font-bold text-emerald-700">{fptpValid}</span>
                        </div>
                    </div>
                )}

                {/* PR Summary */}
                {prSubmitted && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl text-left text-sm space-y-2">
                        <h3 className="text-sm font-bold text-purple-800 mb-2">
                            PR समानुपातिक
                        </h3>
                        <div className="flex justify-between">
                            <span className="text-slate-500">खसेको मत</span>
                            <span className="font-bold text-slate-900">{prTotalCast}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">बदर मत</span>
                            <span className="font-bold text-slate-900">{prInvalid}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-slate-500">वैध मत</span>
                            <span className="font-bold text-emerald-700">{prValid}</span>
                        </div>
                    </div>
                )}

                {/* Partial submission notice */}
                {(fptpSubmitted !== prSubmitted) && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        <p className="font-semibold">
                            {fptpSubmitted ? "PR" : "FPTP"} अझै पेश गरिएको छैन
                        </p>
                        <p className="text-xs mt-0.5">
                            पछि यही बाटो/मतपेटिका खोलेर थप्न सकिन्छ।
                        </p>
                    </div>
                )}

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
