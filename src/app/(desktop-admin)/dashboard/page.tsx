"use client";

import { useState } from "react";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISPUTED";

interface MockSubmission {
    id: string;
    agentName: string;
    agentPhone: string;
    constituency: string;
    stationName: string;
    boothNumber: string;
    totalCastVotes: number;
    invalidVotes: number;
    validVotes: number;
    candidateCount: number;
    electionType: "FPTP" | "PR";
    status: SubmissionStatus;
    submittedAt: string;
    hasMuchulka: boolean;
    disputeNote?: string;
    verifiedAt?: string;
}

// Mock submission data for demo
const MOCK_SUBMISSIONS: MockSubmission[] = [
    {
        id: "sub-1",
        agentName: "राम बहादुर",
        agentPhone: "9841234567",
        constituency: "इलाम - 1",
        stationName: "श्री जनता मा.वि. छाती तिजथला",
        boothNumber: "क",
        totalCastVotes: 450,
        invalidVotes: 12,
        validVotes: 438,
        candidateCount: 7,
        electionType: "FPTP" as const,
        status: "PENDING" as const,
        submittedAt: "2026-02-23T14:30:00",
        hasMuchulka: true,
    },
    {
        id: "sub-2",
        agentName: "सीता देवी",
        agentPhone: "9851234567",
        constituency: "इलाम - 1",
        stationName: "श्री कालिका मा.वि. बालाचौर",
        boothNumber: "ख",
        totalCastVotes: 380,
        invalidVotes: 8,
        validVotes: 372,
        candidateCount: 7,
        electionType: "FPTP" as const,
        status: "PENDING" as const,
        submittedAt: "2026-02-23T14:45:00",
        hasMuchulka: true,
    },
    {
        id: "sub-3",
        agentName: "हरि प्रसाद",
        agentPhone: "9861234567",
        constituency: "काठमाडौं - 1",
        stationName: "श्री पशुपतिनाथ मा.वि.",
        boothNumber: "क, ख",
        totalCastVotes: 920,
        invalidVotes: 25,
        validVotes: 895,
        candidateCount: 13,
        electionType: "FPTP" as const,
        status: "DISPUTED" as const,
        submittedAt: "2026-02-23T13:20:00",
        hasMuchulka: true,
        disputeNote: "मुचुल्कामा संख्या मिलेन — पुनः जाँच आवश्यक",
    },
    {
        id: "sub-4",
        agentName: "कमला श्रेष्ठ",
        agentPhone: "9871234567",
        constituency: "ललितपुर - 2",
        stationName: "श्री बुद्ध विद्यालय",
        boothNumber: "क",
        totalCastVotes: 520,
        invalidVotes: 15,
        validVotes: 505,
        candidateCount: 9,
        electionType: "PR" as const,
        status: "APPROVED" as const,
        submittedAt: "2026-02-23T12:10:00",
        hasMuchulka: true,
        verifiedAt: "2026-02-23T12:45:00",
    },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
    PENDING: "status-badge status-pending",
    APPROVED: "status-badge status-approved",
    REJECTED: "status-badge status-rejected",
    DISPUTED: "status-badge status-disputed",
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    DISPUTED: "Disputed",
};

export default function DashboardPage() {
    const [filter, setFilter] = useState<SubmissionStatus | "ALL">("ALL");

    const filtered =
        filter === "ALL"
            ? MOCK_SUBMISSIONS
            : MOCK_SUBMISSIONS.filter((s) => s.status === filter);

    const counts = {
        total: MOCK_SUBMISSIONS.length,
        pending: MOCK_SUBMISSIONS.filter((s) => s.status === "PENDING").length,
        approved: MOCK_SUBMISSIONS.filter((s) => s.status === "APPROVED").length,
        disputed: MOCK_SUBMISSIONS.filter((s) => s.status === "DISPUTED").length,
        rejected: MOCK_SUBMISSIONS.filter((s) => s.status === "REJECTED").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">
                    Real-Time Dashboard
                </h1>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-600 font-medium">Live</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                    onClick={() => setFilter("ALL")}
                    className={`bg-white rounded-xl border-2 p-5 text-left transition-all ${filter === "ALL" ? "border-blue-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                        }`}
                >
                    <p className="text-sm text-slate-500 font-medium">Total Received</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{counts.total}</p>
                </button>
                <button
                    onClick={() => setFilter("PENDING")}
                    className={`bg-white rounded-xl border-2 p-5 text-left transition-all ${filter === "PENDING" ? "border-amber-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                        }`}
                >
                    <p className="text-sm text-slate-500 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">{counts.pending}</p>
                </button>
                <button
                    onClick={() => setFilter("APPROVED")}
                    className={`bg-white rounded-xl border-2 p-5 text-left transition-all ${filter === "APPROVED" ? "border-emerald-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                        }`}
                >
                    <p className="text-sm text-slate-500 font-medium">Approved</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{counts.approved}</p>
                </button>
                <button
                    onClick={() => setFilter("DISPUTED")}
                    className={`bg-white rounded-xl border-2 p-5 text-left transition-all ${filter === "DISPUTED" ? "border-red-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                        }`}
                >
                    <p className="text-sm text-slate-500 font-medium">Disputed</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{counts.disputed}</p>
                </button>
                <button
                    onClick={() => setFilter("REJECTED")}
                    className={`bg-white rounded-xl border-2 p-5 text-left transition-all ${filter === "REJECTED" ? "border-red-500 shadow-md" : "border-slate-200 hover:border-slate-300"
                        }`}
                >
                    <p className="text-sm text-slate-500 font-medium">Rejected</p>
                    <p className="text-3xl font-bold text-red-400 mt-1">{counts.rejected}</p>
                </button>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">
                        Submissions {filter !== "ALL" && `— ${STATUS_LABELS[filter]}`}
                    </h2>
                    <span className="text-sm text-slate-500">{filtered.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                <th className="px-6 py-3">Agent</th>
                                <th className="px-6 py-3">Constituency</th>
                                <th className="px-6 py-3">Station / Booth</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-right">Cast</th>
                                <th className="px-6 py-3 text-right">Invalid</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-900 text-sm">{sub.agentName}</p>
                                        <p className="text-xs text-slate-400">{sub.agentPhone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{sub.constituency}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-700 truncate max-w-[200px]">{sub.stationName}</p>
                                        <p className="text-xs text-slate-400">Booth: {sub.boothNumber}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${sub.electionType === "FPTP" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                            }`}>
                                            {sub.electionType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">{sub.totalCastVotes}</td>
                                    <td className="px-6 py-4 text-right text-red-600 font-medium">{sub.invalidVotes}</td>
                                    <td className="px-6 py-4">
                                        <span className={STATUS_STYLES[sub.status]}>{STATUS_LABELS[sub.status]}</span>
                                        {sub.disputeNote && (
                                            <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate">{sub.disputeNote}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(sub.submittedAt).toLocaleTimeString("ne-NP", { hour: "2-digit", minute: "2-digit" })}
                                    </td>
                                    <td className="px-6 py-4">
                                        {sub.status === "PENDING" || sub.status === "DISPUTED" ? (
                                            <a
                                                href={`/review/${sub.id}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Review →
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
