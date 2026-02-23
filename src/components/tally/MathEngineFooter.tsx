"use client";

import { useElectionStore } from "@/store/electionStore";

interface MathEngineFooterProps {
    totalCastVotes: number;
    invalidVotes: number;
    sumCandidateVotes: number;
    isBalanced: boolean;
    difference: number;
}

export default function MathEngineFooter({
    totalCastVotes,
    invalidVotes,
    sumCandidateVotes,
    isBalanced,
    difference,
}: MathEngineFooterProps) {
    const { nextStep } = useElectionStore();
    const validVotes = totalCastVotes - invalidVotes;
    const hasInput = totalCastVotes > 0;

    const handleProceed = () => {
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
        nextStep();
    };

    const footerClass = isBalanced
        ? "math-footer balanced"
        : hasInput && difference !== 0
            ? "math-footer error"
            : "math-footer";

    return (
        <div className={footerClass}>
            {/* Math Summary */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        वैध मत
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                        {validVotes >= 0 ? validVotes : "—"}
                    </p>
                    <p className="text-[10px] text-slate-400">Valid Votes</p>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        जोड
                    </p>
                    <p
                        className={`text-lg font-bold ${isBalanced
                            ? "text-emerald-700"
                            : difference !== 0 && hasInput
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                    >
                        {sumCandidateVotes}
                    </p>
                    <p className="text-[10px] text-slate-400">Sum of Tallies</p>
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                        फरक
                    </p>
                    <p
                        className={`text-lg font-bold ${isBalanced
                            ? "text-emerald-700"
                            : difference !== 0 && hasInput
                                ? "text-red-600"
                                : "text-slate-900"
                            }`}
                    >
                        {difference >= 0 ? `+${difference}` : difference}
                    </p>
                    <p className="text-[10px] text-slate-400">Difference</p>
                </div>
            </div>

            {/* Proceed Button */}
            {isBalanced ? (
                <button
                    onClick={handleProceed}
                    className="touch-btn touch-btn-success w-full text-lg"
                >
                    अगाडि बढ्नुहोस् (Proceed)
                </button>
            ) : (
                <button
                    disabled
                    className="touch-btn touch-btn-primary w-full text-lg opacity-40 cursor-not-allowed"
                >
                    {hasInput && difference !== 0
                        ? `मत मिलेन (${difference >= 0 ? "+" : ""}${difference})`
                        : "अगाडि बढ्नुहोस् (Proceed)"}
                </button>
            )}
        </div>
    );
}
