"use client";

import { useMemo, useEffect, useState } from "react";
import CandidateTallyRow from "@/components/tally/CandidateTallyRow";
import MathEngineFooter from "@/components/tally/MathEngineFooter";
import { useElectionStore } from "@/store/electionStore";

interface CandidateItem {
    id: string;
    name: string;
    partyName: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
    isPinned: boolean;
    displayOrder: number;
}

export default function TallyStep() {
    const {
        totalCastVotes,
        invalidVotes,
        candidateVotes,
        totalRegisteredVoters,
        electionType,
        constituencyId,
        setTotalCastVotes,
        setInvalidVotes,
        setCandidateVote,
        prevStep,
    } = useElectionStore();

    const [candidates, setCandidates] = useState<CandidateItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch real candidates from API on mount
    useEffect(() => {
        if (!constituencyId) {
            setLoading(false);
            return;
        }
        fetch(`/api/data/candidates?constituencyId=${constituencyId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setCandidates(data);
                }
            })
            .catch((err) => console.warn("Candidate fetch failed:", err))
            .finally(() => setLoading(false));
    }, [constituencyId]);

    // Sort: pinned first, then by display order
    const sortedCandidates = useMemo(() => {
        return [...candidates].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return a.displayOrder - b.displayOrder;
        });
    }, [candidates]);

    // Math engine calculations
    const sumCandidateVotes = useMemo(() => {
        return Object.values(candidateVotes).reduce((sum, v) => sum + (v || 0), 0);
    }, [candidateVotes]);

    const validVotes = totalCastVotes - invalidVotes;
    const isBalanced =
        totalCastVotes > 0 && validVotes >= 0 && sumCandidateVotes === validVotes;
    const difference = sumCandidateVotes - validVotes;

    const registeredVoters = totalRegisteredVoters || 12500; // Fallback for demo

    return (
        <div className="flex-1 flex flex-col pb-[140px]">
            {/* Fixed Header: Registered Voters */}
            <div className="sticky top-0 z-30 bg-blue-50 border-b-2 border-blue-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-semibold text-blue-800">
                            कुल दर्ता मतदाता
                        </span>
                        <span className="text-xs text-blue-600 ml-2">
                            ({electionType === "fptp" ? "FPTP" : "PR"})
                        </span>
                    </div>
                    <span className="text-xl font-bold text-blue-900">
                        {registeredVoters.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Back button */}
            <button
                onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(15);
                    prevStep();
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm text-blue-600 font-medium"
            >
                ← पछाडि (Back)
            </button>

            {/* Cast Votes & Invalid Votes inputs */}
            <div className="p-4 space-y-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm font-semibold text-slate-700">
                        खसेको मत (Total Cast)
                    </label>
                    <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        max={registeredVoters}
                        placeholder="0"
                        value={totalCastVotes || ""}
                        onChange={(e) => {
                            const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                            setTotalCastVotes(v);
                        }}
                        className="tally-input"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex-1 text-sm font-semibold text-slate-700">
                        बदर मत (Invalid Votes)
                    </label>
                    <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={0}
                        placeholder="0"
                        value={invalidVotes || ""}
                        onChange={(e) => {
                            const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                            setInvalidVotes(v);
                        }}
                        className="tally-input"
                    />
                </div>
            </div>

            {/* Candidate Tally List */}
            <div className="flex-1">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                        {electionType === "fptp"
                            ? "उम्मेदवार मत गणना (Candidate Tallies)"
                            : "पार्टी मत गणना (Party Tallies)"}
                    </h2>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-slate-400 text-sm">Loading candidates...</p>
                    </div>
                ) : sortedCandidates.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-slate-400 text-sm">No candidates found for this constituency</p>
                    </div>
                ) : (
                    sortedCandidates.map((candidate) => (
                        <CandidateTallyRow
                            key={candidate.id}
                            candidateId={candidate.id}
                            name={candidate.name}
                            partyName={candidate.partyName}
                            electionSymbolUrl={candidate.electionSymbolUrl || `/election-symbols/${candidate.partyName.replace(/ /g, '_')}.png`}
                            isPinned={candidate.isPinned}
                            votes={candidateVotes[candidate.id] || 0}
                            onVotesChange={setCandidateVote}
                        />
                    ))
                )}
            </div>

            {/* Math Engine Footer */}
            <MathEngineFooter
                totalCastVotes={totalCastVotes}
                invalidVotes={invalidVotes}
                sumCandidateVotes={sumCandidateVotes}
                isBalanced={isBalanced}
                difference={difference}
            />
        </div>
    );
}
