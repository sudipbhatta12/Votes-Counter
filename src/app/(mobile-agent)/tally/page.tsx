"use client";

import { useMemo } from "react";
import CandidateTallyRow from "@/components/tally/CandidateTallyRow";
import MathEngineFooter from "@/components/tally/MathEngineFooter";
import { useElectionStore } from "@/store/electionStore";

// Mock candidates — in production, loaded from IndexedDB on mount
const MOCK_CANDIDATES = [
    {
        id: "1",
        name: "काजी मान कागते",
        partyName: "नेकपा (एमाले)",
        electionSymbolUrl: "/election-symbols/नेकपा(एमाले).png",
        isPinned: true,
        displayOrder: 1,
    },
    {
        id: "2",
        name: "निश्कल राई",
        partyName: "नेपाली काँग्रेस",
        electionSymbolUrl: "/election-symbols/नेपाली_काँग्रेस.png",
        isPinned: true,
        displayOrder: 2,
    },
    {
        id: "3",
        name: "विमल गदाल",
        partyName: "राष्ट्रिय स्वतन्त्र पार्टी",
        electionSymbolUrl: "/election-symbols/राष्ट्रिय_स्वतन्त्र_पार्टी.png",
        isPinned: true,
        displayOrder: 3,
    },
    {
        id: "4",
        name: "नारदमणी साङपाङ्ग",
        partyName: "नेकपा (माओवादी)",
        electionSymbolUrl: "/election-symbols/नेपाल_कम्युनिस्ट_पार्टी_(माओवादी).png",
        isPinned: true,
        displayOrder: 4,
    },
    {
        id: "5",
        name: "ज्वाला नेपाल",
        partyName: "राष्ट्रिय प्रजातन्त्र पार्टी",
        electionSymbolUrl: "/election-symbols/राष्ट्रिय_प्रजातन्त्र_पार्टी.png",
        isPinned: true,
        displayOrder: 5,
    },
    {
        id: "6",
        name: "रन बहादुर राई",
        partyName: "नेपाली कम्युनिष्ट पार्टी",
        electionSymbolUrl: "/election-symbols/नेपाली_कम्युनिष्ट_पार्टी.png",
        isPinned: false,
        displayOrder: 6,
    },
    {
        id: "7",
        name: "तुल्सी केशरी प्रजापति",
        partyName: "नेपाल मजदुर किसान पार्टी",
        electionSymbolUrl: "/election-symbols/नेपाल_मजदुर_किसान_पार्टी.png",
        isPinned: false,
        displayOrder: 7,
    },
];

export default function TallyStep() {
    const {
        totalCastVotes,
        invalidVotes,
        candidateVotes,
        totalRegisteredVoters,
        electionType,
        setTotalCastVotes,
        setInvalidVotes,
        setCandidateVote,
        prevStep,
    } = useElectionStore();

    // Sort: pinned first, then by display order
    const sortedCandidates = useMemo(() => {
        return [...MOCK_CANDIDATES].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return a.displayOrder - b.displayOrder;
        });
    }, []);

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
                {sortedCandidates.map((candidate) => (
                    <CandidateTallyRow
                        key={candidate.id}
                        candidateId={candidate.id}
                        name={candidate.name}
                        partyName={candidate.partyName}
                        electionSymbolUrl={candidate.electionSymbolUrl}
                        isPinned={candidate.isPinned}
                        votes={candidateVotes[candidate.id] || 0}
                        onVotesChange={setCandidateVote}
                    />
                ))}
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
