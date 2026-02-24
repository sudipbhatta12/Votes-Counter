"use client";

import { useState, useEffect } from "react";

interface FilterOption { id: string; name: string; number?: number; label?: string; }

interface VoteRecord {
    id: string;
    type: "FPTP" | "PR";
    constituency: string;
    district: string;
    province: string;
    agentName: string;
    agentPhone: string;
    boothLabel: string;
    totalCast: number;
    invalidVotes: number;
    validVotes: number;
    status: string;
    submittedAt: string;
    isMixed: boolean;
}

// Mock data until real submissions come in
function generateMockData(): VoteRecord[] {
    const data: VoteRecord[] = [
        { id: "1", type: "FPTP", constituency: "इलाम - 1", district: "इलाम", province: "कोशी प्रदेश", agentName: "राम बहादुर थापा", agentPhone: "9841000001", boothLabel: "Booth क", totalCast: 450, invalidVotes: 12, validVotes: 438, status: "PENDING", submittedAt: "2026-02-24T08:30:00Z", isMixed: false },
        { id: "2", type: "PR", constituency: "इलाम - 1", district: "इलाम", province: "कोशी प्रदेश", agentName: "राम बहादुर थापा", agentPhone: "9841000001", boothLabel: "Booth क", totalCast: 445, invalidVotes: 8, validVotes: 437, status: "PENDING", submittedAt: "2026-02-24T08:35:00Z", isMixed: false },
        { id: "3", type: "FPTP", constituency: "इलाम - 2", district: "इलाम", province: "कोशी प्रदेश", agentName: "Agent इलाम-2", agentPhone: "10120", boothLabel: "Booth क+ख (Mixed)", totalCast: 820, invalidVotes: 15, validVotes: 805, status: "APPROVED", submittedAt: "2026-02-24T09:00:00Z", isMixed: true },
        { id: "4", type: "FPTP", constituency: "काठमाडौं - 1", district: "काठमाडौं", province: "बागमती प्रदेश", agentName: "Agent काठमाडौं-1", agentPhone: "10050", boothLabel: "Booth क", totalCast: 520, invalidVotes: 18, validVotes: 502, status: "PENDING", submittedAt: "2026-02-24T09:10:00Z", isMixed: false },
        { id: "5", type: "PR", constituency: "काठमाडौं - 1", district: "काठमाडौं", province: "बागमती प्रदेश", agentName: "Agent काठमाडौं-1", agentPhone: "10050", boothLabel: "Booth क", totalCast: 515, invalidVotes: 10, validVotes: 505, status: "PENDING", submittedAt: "2026-02-24T09:15:00Z", isMixed: false },
        { id: "6", type: "FPTP", constituency: "पोखरा - 1", district: "कास्की", province: "गण्डकी प्रदेश", agentName: "Agent पोखरा-1", agentPhone: "10075", boothLabel: "Booth ख", totalCast: 380, invalidVotes: 5, validVotes: 375, status: "APPROVED", submittedAt: "2026-02-24T09:20:00Z", isMixed: false },
    ];
    return data;
}

export default function ExportPage() {
    const [records] = useState<VoteRecord[]>(generateMockData);
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");

    // Cascading geography filters
    const [provinces, setProvinces] = useState<FilterOption[]>([]);
    const [districts, setDistricts] = useState<FilterOption[]>([]);
    const [constituencies, setConstituencies] = useState<FilterOption[]>([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedConstituency, setSelectedConstituency] = useState("");

    // Load provinces on mount
    useEffect(() => {
        fetch("/api/data/filters")
            .then((r) => r.json())
            .then((d) => setProvinces(d.provinces || []))
            .catch(() => { });
    }, []);

    // Load districts when province changes
    useEffect(() => {
        setSelectedDistrict("");
        setSelectedConstituency("");
        setDistricts([]);
        setConstituencies([]);
        if (!selectedProvince) return;
        fetch(`/api/data/filters?provinceId=${selectedProvince}`)
            .then((r) => r.json())
            .then((d) => setDistricts(d.districts || []))
            .catch(() => { });
    }, [selectedProvince]);

    // Load constituencies when district changes
    useEffect(() => {
        setSelectedConstituency("");
        setConstituencies([]);
        if (!selectedDistrict) return;
        fetch(`/api/data/filters?districtId=${selectedDistrict}`)
            .then((r) => r.json())
            .then((d) => setConstituencies(d.constituencies || []))
            .catch(() => { });
    }, [selectedDistrict]);

    // Filter records
    const filtered = records.filter((r) => {
        if (typeFilter && r.type !== typeFilter) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        if (selectedProvince) {
            const pName = provinces.find((p) => p.id === selectedProvince)?.name;
            if (pName && r.province !== pName) return false;
        }
        if (selectedDistrict) {
            const dName = districts.find((d) => d.id === selectedDistrict)?.name;
            if (dName && r.district !== dName) return false;
        }
        if (selectedConstituency) {
            const cLabel = constituencies.find((c) => c.id === selectedConstituency)?.label;
            if (cLabel && r.constituency !== cLabel) return false;
        }
        if (search) {
            const q = search.toLowerCase();
            return (
                r.constituency.toLowerCase().includes(q) ||
                r.agentName.toLowerCase().includes(q) ||
                r.agentPhone.includes(q) ||
                r.district.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // Stats
    const totalCast = filtered.reduce((s, r) => s + r.totalCast, 0);
    const totalInvalid = filtered.reduce((s, r) => s + r.invalidVotes, 0);
    const fptpCount = filtered.filter((r) => r.type === "FPTP").length;
    const prCount = filtered.filter((r) => r.type === "PR").length;

    const handleExportCSV = () => {
        const csvRows = [
            "Type,Constituency,District,Province,Agent,Phone,Booth,Total Cast,Invalid,Valid,Status,Submitted At",
            ...filtered.map((r) =>
                `${r.type},"${r.constituency}","${r.district}","${r.province}","${r.agentName}",${r.agentPhone},"${r.boothLabel}",${r.totalCast},${r.invalidVotes},${r.validVotes},${r.status},${r.submittedAt}`
            ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vote_data_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vote Data & Export</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        View all submitted vote tallies and export to CSV
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={filtered.length === 0}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
                >
                    📥 Export {filtered.length} Records to CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
                <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase">Total Records</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{filtered.length}</p>
                </div>
                <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200">
                    <p className="text-xs font-semibold text-indigo-600 uppercase">FPTP</p>
                    <p className="text-2xl font-bold text-indigo-800 mt-1">{fptpCount}</p>
                </div>
                <div className="p-4 rounded-xl border bg-purple-50 border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase">PR</p>
                    <p className="text-2xl font-bold text-purple-800 mt-1">{prCount}</p>
                </div>
                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-600 uppercase">Total Cast</p>
                    <p className="text-2xl font-bold text-emerald-800 mt-1">{totalCast.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border bg-red-50 border-red-200">
                    <p className="text-xs font-semibold text-red-600 uppercase">Invalid</p>
                    <p className="text-2xl font-bold text-red-800 mt-1">{totalInvalid.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search constituency, agent, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="FPTP">FPTP</option>
                        <option value="PR">PR</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none min-w-[160px]"
                    >
                        <option value="">All Provinces</option>
                        {provinces.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        disabled={!selectedProvince}
                        className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none min-w-[160px] disabled:opacity-40"
                    >
                        <option value="">All Districts</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedConstituency}
                        onChange={(e) => setSelectedConstituency(e.target.value)}
                        disabled={!selectedDistrict}
                        className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm outline-none min-w-[160px] disabled:opacity-40"
                    >
                        <option value="">All Constituencies</option>
                        {constituencies.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                    {(selectedProvince || selectedDistrict || selectedConstituency || typeFilter || statusFilter || search) && (
                        <button
                            onClick={() => {
                                setSelectedProvince("");
                                setSelectedDistrict("");
                                setSelectedConstituency("");
                                setTypeFilter("");
                                setStatusFilter("");
                                setSearch("");
                            }}
                            className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-800"
                        >
                            ✕ Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Type</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Constituency</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">District</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Agent</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Booth</th>
                                <th className="px-4 py-3 text-right font-bold text-slate-600">Total Cast</th>
                                <th className="px-4 py-3 text-right font-bold text-slate-600">Invalid</th>
                                <th className="px-4 py-3 text-right font-bold text-slate-600">Valid</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Status</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-16 text-center text-slate-400">
                                        No vote records found matching your filters.
                                        {records.length === 0 && (
                                            <span className="block mt-2 text-sm">
                                                Vote data will appear here once agents start submitting tallies.
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((r) => (
                                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${r.type === "FPTP"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-purple-100 text-purple-700"
                                                }`}>
                                                {r.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{r.constituency}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.district}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-700">{r.agentName}</div>
                                            <div className="text-xs text-slate-400 font-mono">{r.agentPhone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">
                                            {r.boothLabel}
                                            {r.isMixed && (
                                                <span className="ml-1 text-amber-600 font-bold">混</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                                            {r.totalCast.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                                            {r.invalidVotes}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-700">
                                            {r.validVotes.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${r.status === "APPROVED"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : r.status === "REJECTED"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-amber-100 text-amber-700"
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {new Date(r.submittedAt).toLocaleString("en-NP", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
                Showing {filtered.length} of {records.length} records
            </p>
        </div>
    );
}
