"use client";

import { useState, use } from "react";

// Mock candidate tallies for demo
const MOCK_TALLIES = [
    { name: "काजी मान कागते", party: "नेकपा (एमाले)", symbol: "सुर्य", votes: 156 },
    { name: "निश्कल राई", party: "नेपाली काँग्रेस", symbol: "रूख", votes: 132 },
    { name: "विमल गदाल", party: "राष्ट्रिय स्वतन्त्र पार्टी", symbol: "टेलिफोन", votes: 89 },
    { name: "नारदमणी साङपाङ्ग", party: "नेकपा (माओवादी)", symbol: "हँसिया हथौडा", votes: 45 },
    { name: "ज्वाला नेपाल", party: "राष्ट्रिय प्रजातन्त्र पार्टी", symbol: "गाई", votes: 12 },
    { name: "रन बहादुर राई", party: "नेपाली कम्युनिष्ट पार्टी", symbol: "झण्डा", votes: 3 },
    { name: "तुल्सी केशरी प्रजापति", party: "नेपाल मजदुर किसान पार्टी", symbol: "बाँसुरी", votes: 1 },
];

export default function ReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [action, setAction] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState("");

    const totalCast = 450;
    const invalidVotes = 12;
    const validVotes = totalCast - invalidVotes;
    const sumTallies = MOCK_TALLIES.reduce((s, t) => s + t.votes, 0);
    const isBalanced = sumTallies === validVotes;

    const handleApprove = () => {
        setAction("approved");
    };

    const handleReject = () => {
        setAction("rejected");
    };

    const handleDispute = () => {
        setAction("disputed");
    };

    if (action) {
        const iconColor = action === "approved" ? "#059669" : action === "rejected" ? "#DC2626" : "#D97706";
        const iconPath = action === "approved"
            ? "M20 6L9 17l-5-5"
            : action === "rejected"
                ? "M18 6L6 18M6 6l12 12"
                : "M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z";

        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: `${iconColor}15` }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={iconPath} />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {action === "approved"
                            ? "Approved!"
                            : action === "rejected"
                                ? "Rejected"
                                : "Marked as Disputed"}
                    </h2>
                    <a href="/dashboard" className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
                        Back to Dashboard
                    </a>
                    <h1 className="text-xl font-bold text-slate-900 mt-1">
                        Review Submission #{id}
                    </h1>
                </div>
                <span className="status-badge status-pending">Pending Review</span>
            </div>

            {/* Split Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
                {/* LEFT: Typed Numbers */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800">Typed Data</h2>
                    </div>

                    {/* Summary Row */}
                    <div className="p-5 space-y-3 border-b border-slate-100">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Cast Votes</p>
                                <p className="text-2xl font-bold text-slate-900">{totalCast}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Invalid</p>
                                <p className="text-2xl font-bold text-red-600">{invalidVotes}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Valid</p>
                                <p className="text-2xl font-bold text-emerald-600">{validVotes}</p>
                            </div>
                        </div>

                        {/* Math check */}
                        <div
                            className={`text-center p-2 rounded-lg text-sm font-semibold ${isBalanced
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                                }`}
                        >
                            {isBalanced
                                ? `Math balanced: ${sumTallies} = ${validVotes}`
                                : `MISMATCH: Sum ${sumTallies} =/= Valid ${validVotes}`}
                        </div>
                    </div>

                    {/* Candidate Tallies */}
                    <div className="divide-y divide-slate-100">
                        {MOCK_TALLIES.map((t, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                                    <p className="text-xs text-slate-400">{t.party}</p>
                                </div>
                                <span className="text-lg font-bold text-slate-900 tabular-nums">
                                    {t.votes}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Muchulka Image */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800">Muchulka Photos</h2>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-6 bg-slate-100 min-h-[300px]">
                        <div className="text-center text-slate-400">
                            <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="text-sm">
                                Muchulka images will display here
                            </p>
                            <p className="text-xs mt-1">
                                Pinch to zoom / Double-tap to fit
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-slate-800 mb-3">Verification Action</h3>

                <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-1">
                        Note (required for Reject/Dispute)
                    </label>
                    <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="कारण लेख्नुहोस्... (Write reason)"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleApprove}
                        className="flex-1 min-w-[140px] px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl
                       hover:bg-emerald-700 transition-colors text-sm"
                    >
                        Approve
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={!rejectNote.trim()}
                        className="flex-1 min-w-[140px] px-6 py-3 bg-red-600 text-white font-bold rounded-xl
                       hover:bg-red-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Reject
                    </button>
                    <button
                        onClick={handleDispute}
                        disabled={!rejectNote.trim()}
                        className="flex-1 min-w-[140px] px-6 py-3 bg-amber-600 text-white font-bold rounded-xl
                       hover:bg-amber-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Dispute
                    </button>
                </div>
            </div>
        </div>
    );
}
