"use client";

import Image from "next/image";
import { useCallback } from "react";

interface PartyTallyRowProps {
    partyId: string;
    name: string;
    electionSymbolUrl: string;
    votes: number;
    onVotesChange: (partyId: string, votes: number) => void;
}

export default function PartyTallyRow({
    partyId,
    name,
    electionSymbolUrl,
    votes,
    onVotesChange,
}: PartyTallyRowProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const numericValue = value === "" ? 0 : parseInt(value, 10) || 0;
            onVotesChange(partyId, numericValue);

            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        },
        [partyId, onVotesChange]
    );

    return (
        <div
            className="tally-row bg-white"
            role="row"
            aria-label={name}
        >
            {/* Election Symbol — 40×40px circular */}
            <div className="tally-symbol" aria-hidden="true">
                <Image
                    src={electionSymbolUrl}
                    alt={`${name} चुनाव चिन्ह`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                />
            </div>

            {/* Party Name */}
            <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-900 truncate leading-tight">
                    {name}
                </p>
            </div>

            {/* Vote Count Input */}
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
                id={`votes-party-${partyId}`}
            />
        </div>
    );
}
