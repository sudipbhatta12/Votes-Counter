"use client";

import Image from "next/image";
import { useCallback } from "react";

interface CandidateTallyRowProps {
    candidateId: string;
    name: string;
    partyName: string;
    electionSymbolUrl: string;
    isPinned: boolean;
    votes: number;
    onVotesChange: (candidateId: string, votes: number) => void;
}

export default function CandidateTallyRow({
    candidateId,
    name,
    partyName,
    electionSymbolUrl,
    isPinned,
    votes,
    onVotesChange,
}: CandidateTallyRowProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const numericValue = value === "" ? 0 : parseInt(value, 10) || 0;
            onVotesChange(candidateId, numericValue);

            // Haptic feedback on input
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        },
        [candidateId, onVotesChange]
    );

    return (
        <div
            className={`tally-row ${isPinned ? "bg-white" : "bg-slate-50/50"}`}
            role="row"
            aria-label={`${name} - ${partyName}`}
        >
            {/* Election Symbol — 40×40px circular */}
            <div className="tally-symbol" aria-hidden="true">
                <Image
                    src={electionSymbolUrl}
                    alt={`${partyName} चुनाव चिन्ह`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                />
            </div>

            {/* Candidate Info */}
            <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 truncate leading-tight">
                    {name}
                </p>
                <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                    {partyName}
                </p>
            </div>

            {/* Vote Count Input — h-14 (56px), numeric pad */}
            <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={0}
                placeholder="0"
                value={votes || ""}
                onChange={handleChange}
                className="tally-input"
                aria-label={`${name} को मत संख्या`}
                id={`votes-${candidateId}`}
            />
        </div>
    );
}
