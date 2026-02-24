"use client";

import { useState, useEffect, useCallback } from "react";

interface AgentData {
    id: string;
    name: string;
    phone: string;
    pin: string;
    role: string;
    isActive: boolean;
    constituencyId: string | null;
    constituencyLabel: string;
    districtName: string;
    provinceName: string;
    provinceNumber: number;
    lastLoginAt: string | null;
    createdAt: string;
}

interface FilterOption { id: string; name: string; number?: number; label?: string; }

export default function AgentsPage() {
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Cascading filters
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

    const fetchAgents = useCallback(async () => {
        try {
            const res = await fetch("/api/agents");
            const data = await res.json();
            if (Array.isArray(data)) setAgents(data);
        } catch {
            console.warn("Failed to fetch agents");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAgents(); }, [fetchAgents]);

    const handleGenerate = async () => {
        setGenerating(true);
        setMessage(null);
        try {
            const res = await fetch("/api/agents/generate", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: `✅ ${data.total} agents created! ${data.skipped} skipped.` });
                fetchAgents();
            } else {
                setMessage({ type: "error", text: `❌ ${data.message}` });
            }
        } catch {
            setMessage({ type: "error", text: "❌ Server error" });
        } finally {
            setGenerating(false);
        }
    };

    const handleAddAgent = async (constituencyId: string) => {
        try {
            const res = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ constituencyId }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: `✅ Agent added: ${data.agent.phone}` });
                fetchAgents();
            } else {
                setMessage({ type: "error", text: `❌ ${data.message}` });
            }
        } catch {
            setMessage({ type: "error", text: "❌ Failed to add agent" });
        }
    };

    const handleDeactivate = async (agentId: string) => {
        try {
            const res = await fetch("/api/agents", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentId }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: "Agent deactivated" });
                fetchAgents();
            }
        } catch {
            setMessage({ type: "error", text: "❌ Failed to deactivate" });
        }
    };

    const handleExportCSV = () => {
        const csvRows = [
            "Phone,PIN,Name,Constituency,District,Province,Status",
            ...filteredAgents.map((a) =>
                `${a.phone},${a.pin},"${a.name}","${a.constituencyLabel}","${a.districtName}","${a.provinceName}",${a.isActive ? "Active" : "Inactive"}`
            ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `agents_credentials_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Cascading filter logic
    const filteredAgents = agents.filter((a) => {
        if (selectedConstituency && a.constituencyId !== selectedConstituency) return false;
        if (selectedDistrict && a.districtName !== districts.find((d) => d.id === selectedDistrict)?.name) return false;
        if (selectedProvince && a.provinceNumber !== provinces.find((p) => p.id === selectedProvince)?.number) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                a.name.toLowerCase().includes(q) ||
                a.phone.includes(q) ||
                a.constituencyLabel.toLowerCase().includes(q) ||
                a.districtName.toLowerCase().includes(q)
            );
        }
        return true;
    });

    // Group by constituency
    const grouped = filteredAgents.reduce((acc, agent) => {
        const key = agent.constituencyId || "unassigned";
        if (!acc[key]) acc[key] = { label: agent.constituencyLabel, agents: [] };
        acc[key].agents.push(agent);
        return acc;
    }, {} as Record<string, { label: string; agents: AgentData[] }>);

    const activeCount = agents.filter((a) => a.isActive).length;
    const constituencyCount = new Set(agents.filter((a) => a.constituencyId).map((a) => a.constituencyId)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Agent Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Generate and manage field agent credentials
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={agents.length === 0}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                    >
                        📥 Export CSV
                    </button>
                    <a
                        href="/agents/print"
                        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        🖨️ Print Cards
                    </a>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
                    >
                        {generating ? "Generating..." : "⚡ Generate All 165 Agents"}
                    </button>
                </div>
            </div>

            {/* Message banner */}
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total Agents" value={agents.length} color="blue" />
                <StatCard label="Active" value={activeCount} color="emerald" />
                <StatCard label="Constituencies Covered" value={constituencyCount} sub="/165" color="purple" />
                <StatCard label="Max Capacity" value={`${agents.length}/825`} color="slate" />
            </div>

            {/* Cascading Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search by name, phone, constituency..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[160px]"
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
                    className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[160px] disabled:opacity-40"
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
                    className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[160px] disabled:opacity-40"
                >
                    <option value="">All Constituencies</option>
                    {constituencies.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Agent Table */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading agents...</div>
            ) : agents.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-400 text-lg mb-4">No agents yet</p>
                    <p className="text-slate-400 text-sm mb-6">
                        Click &quot;Generate All 165 Agents&quot; to create agents for all constituencies
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-left font-bold text-slate-600">#</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Constituency</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Agent Name</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Phone</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">PIN</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Status</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(grouped).map(([key, group], gi) => (
                                <>
                                    {group.agents.map((agent, ai) => (
                                        <tr
                                            key={agent.id}
                                            className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!agent.isActive ? "opacity-50" : ""
                                                }`}
                                        >
                                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                                                {gi + 1}.{ai + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {agent.constituencyLabel}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">{agent.name}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-blue-700">
                                                {agent.phone}
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-purple-700">
                                                {agent.pin}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${agent.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {agent.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {agent.isActive && (
                                                        <button
                                                            onClick={() => handleDeactivate(agent.id)}
                                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                            title="Deactivate"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Add Agent row */}
                                    {group.agents.filter((a) => a.isActive).length < 5 && (
                                        <tr key={`add-${key}`} className="border-b border-slate-200">
                                            <td colSpan={7} className="px-4 py-2">
                                                <button
                                                    onClick={() => handleAddAgent(key)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    + Add Agent to {group.label}
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-xs text-slate-400 text-center">
                Showing {filteredAgents.length} of {agents.length} agents
            </p>
        </div>
    );
}

function StatCard({ label, value, sub, color }: {
    label: string;
    value: string | number;
    sub?: string;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 border-blue-200 text-blue-700",
        emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
        purple: "bg-purple-50 border-purple-200 text-purple-700",
        slate: "bg-slate-50 border-slate-200 text-slate-700",
    };
    return (
        <div className={`p-4 rounded-xl border ${colorMap[color] || colorMap.slate}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
            <p className="text-2xl font-bold mt-1">
                {value}{sub && <span className="text-sm font-normal opacity-50">{sub}</span>}
            </p>
        </div>
    );
}
