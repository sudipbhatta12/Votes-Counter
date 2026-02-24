"use client";

import { useMemo, useEffect, useState } from "react";
import CandidateTallyRow from "@/components/tally/CandidateTallyRow";
import PartyTallyRow from "@/components/tally/PartyTallyRow";
import MathEngineFooter from "@/components/tally/MathEngineFooter";
import { useElectionStore } from "@/store/electionStore";

type ActiveTab = "fptp" | "pr";

interface CandidateItem {
    id: string;
    name: string;
    partyName: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
    isPinned: boolean;
    displayOrder: number;
}

interface PartyItem {
    id: string;
    name: string;
    nameShort?: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
}

export default function TallyStep() {
    const {
        // FPTP state
        fptpTotalCast,
        fptpInvalid,
        candidateVotes,
        fptpSubmitted,
        setFptpTotalCast,
        setFptpInvalid,
        setCandidateVote,
        setFptpSubmitted,
        // PR state
        prTotalCast,
        prInvalid,
        partyVotes,
        prSubmitted,
        setPrTotalCast,
        setPrInvalid,
        setPartyVote,
        setPrSubmitted,
        // Common
        totalRegisteredVoters,
        constituencyId,
        nextStep,
        prevStep,
    } = useElectionStore();

    const [activeTab, setActiveTab] = useState<ActiveTab>("fptp");
    const [candidates, setCandidates] = useState<CandidateItem[]>([]);
    const [parties, setParties] = useState<PartyItem[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [loadingParties, setLoadingParties] = useState(true);

    // Fetch candidates
    useEffect(() => {
        if (!constituencyId) { setLoadingCandidates(false); return; }
        fetch(`/api/data/candidates?constituencyId=${constituencyId}`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data)) setCandidates(data); })
            .catch((err) => console.warn("Candidate fetch failed:", err))
            .finally(() => setLoadingCandidates(false));
    }, [constituencyId]);

    // Fetch parties
    useEffect(() => {
        if (!constituencyId) { setLoadingParties(false); return; }
        fetch(`/api/data/parties`)
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data)) setParties(data); })
            .catch((err) => console.warn("Party fetch failed:", err))
            .finally(() => setLoadingParties(false));
    }, [constituencyId]);

    // Sort candidates: pinned first, then by display order
    const sortedCandidates = useMemo(() => {
        return [...candidates].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return a.displayOrder - b.displayOrder;
        });
    }, [candidates]);

    // FPTP math engine
    const fptpSumVotes = useMemo(() =>
        Object.values(candidateVotes).reduce((sum, v) => sum + (v || 0), 0),
        [candidateVotes]
    );
    const fptpValid = fptpTotalCast - fptpInvalid;
    const fptpBalanced = fptpTotalCast > 0 && fptpValid >= 0 && fptpSumVotes === fptpValid;
    const fptpDiff = fptpSumVotes - fptpValid;

    // PR math engine
    const prSumVotes = useMemo(() =>
        Object.values(partyVotes).reduce((sum, v) => sum + (v || 0), 0),
        [partyVotes]
    );
    const prValid = prTotalCast - prInvalid;
    const prBalanced = prTotalCast > 0 && prValid >= 0 && prSumVotes === prValid;
    const prDiff = prSumVotes - prValid;

    // Cross-tab discrepancy warning (>2% or >5 votes)
    const bothHaveData = fptpTotalCast > 0 && prTotalCast > 0;
    const castDifference = Math.abs(fptpTotalCast - prTotalCast);
    const threshold = Math.max(5, Math.round(totalRegisteredVoters * 0.02));
    const showDiscrepancyWarning = bothHaveData && castDifference > threshold;

    // Registered voters (with fallback)
    const registeredVoters = totalRegisteredVoters || 12500;

    // Can proceed to next step: at least one tab balanced (partial submission)
    const canProceed = fptpBalanced || prBalanced;

    const handleProceed = () => {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        if (fptpBalanced) setFptpSubmitted(true);
        if (prBalanced) setPrSubmitted(true);
        nextStep();
    };

    return (
        <div className="flex-1 flex flex-col pb-[160px]">
            {/* Registered Voters Header */}
            <div className="sticky top-0 z-30 bg-blue-50 border-b-2 border-blue-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-800">
                        कुल दर्ता मतदाता
                    </span>
                    <span className="text-xl font-bold text-blue-900">
                        {registeredVoters.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="sticky top-[52px] z-30 bg-white border-b-2 border-slate-200 flex">
                <button
                    onClick={() => setActiveTab("fptp")}
                    className={`flex-1 py-3 px-2 text-center font-bold text-sm transition-colors relative ${activeTab === "fptp"
                            ? "text-blue-700 bg-blue-50"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <span>FPTP प्रत्यक्ष</span>
                    {fptpSubmitted && (
                        <span className="absolute top-1 right-2 text-emerald-600 text-xs">✅</span>
                    )}
                    {!fptpSubmitted && fptpBalanced && (
                        <span className="absolute top-1 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                    {activeTab === "fptp" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("pr")}
                    className={`flex-1 py-3 px-2 text-center font-bold text-sm transition-colors relative ${activeTab === "pr"
                            ? "text-purple-700 bg-purple-50"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <span>PR समानुपातिक</span>
                    {prSubmitted && (
                        <span className="absolute top-1 right-2 text-emerald-600 text-xs">✅</span>
                    )}
                    {!prSubmitted && prBalanced && (
                        <span className="absolute top-1 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                    {activeTab === "pr" && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-600 rounded-t" />
                    )}
                </button>
            </div>

            {/* Cross-tab Discrepancy Warning */}
            {showDiscrepancyWarning && (
                <div className="mx-4 mt-3 bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-amber-800">
                        ⚠️ भिन्नता पत्ता लागेको (Discrepancy Detected)
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                        FPTP मत: {fptpTotalCast} | PR मत: {prTotalCast} — फरक: {castDifference}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                        कागजी मुचुल्कासँग मिलान गर्नुहोस् (Verify against paper tally sheet)
                    </p>
                </div>
            )}

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

            {/* ============== FPTP TAB ============== */}
            {activeTab === "fptp" && (
                <div className="flex-1">
                    {/* Cast / Invalid inputs */}
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
                                value={fptpTotalCast || ""}
                                onChange={(e) => {
                                    const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                                    setFptpTotalCast(v);
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
                                value={fptpInvalid || ""}
                                onChange={(e) => {
                                    const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                                    setFptpInvalid(v);
                                }}
                                className="tally-input"
                            />
                        </div>
                    </div>

                    {/* Candidate List */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                            उम्मेदवार मत गणना (Candidate Tallies)
                        </h2>
                    </div>
                    {loadingCandidates ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-slate-400 text-sm">Loading candidates...</p>
                        </div>
                    ) : sortedCandidates.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-slate-400 text-sm">No candidates found</p>
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
            )}

            {/* ============== PR TAB ============== */}
            {activeTab === "pr" && (
                <div className="flex-1">
                    {/* Cast / Invalid inputs */}
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
                                value={prTotalCast || ""}
                                onChange={(e) => {
                                    const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                                    setPrTotalCast(v);
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
                                value={prInvalid || ""}
                                onChange={(e) => {
                                    const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0;
                                    setPrInvalid(v);
                                }}
                                className="tally-input"
                            />
                        </div>
                    </div>

                    {/* Party List */}
                    <div className="px-4 py-2 bg-purple-50 border-b border-purple-200">
                        <h2 className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                            पार्टी मत गणना (Party Tallies)
                        </h2>
                    </div>
                    {loadingParties ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-slate-400 text-sm">Loading parties...</p>
                        </div>
                    ) : parties.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-slate-400 text-sm">No parties found</p>
                        </div>
                    ) : (
                        parties.map((party) => (
                            <PartyTallyRow
                                key={party.id}
                                partyId={party.id}
                                name={party.name}
                                electionSymbolUrl={party.electionSymbolUrl || `/election-symbols/${party.name.replace(/ /g, '_')}.png`}
                                votes={partyVotes[party.id] || 0}
                                onVotesChange={setPartyVote}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Math Engine Footer — shows for active tab */}
            <MathEngineFooter
                totalCastVotes={activeTab === "fptp" ? fptpTotalCast : prTotalCast}
                invalidVotes={activeTab === "fptp" ? fptpInvalid : prInvalid}
                sumCandidateVotes={activeTab === "fptp" ? fptpSumVotes : prSumVotes}
                isBalanced={activeTab === "fptp" ? fptpBalanced : prBalanced}
                difference={activeTab === "fptp" ? fptpDiff : prDiff}
                canProceed={canProceed}
                onProceed={handleProceed}
                activeTab={activeTab}
                otherTabLabel={activeTab === "fptp" ? "PR समानुपातिक" : "FPTP प्रत्यक्ष"}
                otherTabBalanced={activeTab === "fptp" ? prBalanced : fptpBalanced}
                onSwitchTab={() => setActiveTab(activeTab === "fptp" ? "pr" : "fptp")}
            />
        </div>
    );
}
