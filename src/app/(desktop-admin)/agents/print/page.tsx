"use client";

import { useState, useEffect } from "react";

interface AgentData {
    id: string;
    name: string;
    phone: string;
    pin: string;
    constituencyLabel: string;
    districtName: string;
    provinceName: string;
    isActive: boolean;
}

export default function PrintCardsPage() {
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/agents")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setAgents(data.filter((a: AgentData) => a.isActive));
                }
            })
            .catch(() => console.warn("Failed to fetch"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-slate-400">Loading agents...</p>
            </div>
        );
    }

    if (agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-slate-400 text-lg">No agents to print</p>
                <a href="/agents" className="text-blue-600 hover:underline text-sm">
                    ← Back to Agent Management
                </a>
            </div>
        );
    }

    return (
        <>
            {/* Print controls — hidden when printing */}
            <div className="no-print mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Print Agent Credential Cards</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {agents.length} cards ready — 6 per A4 page
                    </p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/agents"
                        className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        ← Back
                    </a>
                    <button
                        onClick={() => window.print()}
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow hover:from-blue-700 hover:to-blue-800"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="print-cards-grid">
                {agents.map((agent, idx) => (
                    <div key={agent.id} className="credential-card">
                        {/* Header */}
                        <div className="card-header">
                            <div className="card-logo">NP</div>
                            <div>
                                <div className="card-title">निर्वाचन Live 2026</div>
                                <div className="card-subtitle">Field Agent Credential</div>
                            </div>
                            <div className="card-number">#{idx + 1}</div>
                        </div>

                        {/* Divider */}
                        <div className="card-divider" />

                        {/* Details */}
                        <div className="card-body">
                            <div className="card-row">
                                <span className="card-label">Agent</span>
                                <span className="card-value">{agent.name}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">Constituency</span>
                                <span className="card-value card-value-bold">{agent.constituencyLabel}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">District</span>
                                <span className="card-value">{agent.districtName}</span>
                            </div>
                            <div className="card-divider-thin" />
                            <div className="card-credentials">
                                <div className="card-cred-box">
                                    <span className="card-cred-label">Login ID</span>
                                    <span className="card-cred-value">{agent.phone}</span>
                                </div>
                                <div className="card-cred-box">
                                    <span className="card-cred-label">PIN</span>
                                    <span className="card-cred-value">{agent.pin}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="card-footer">
                            <span>🔒 PIN गोप्य राख्नुहोस् — Keep PIN confidential</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Inline Print Styles */}
            <style jsx global>{`
                .no-print { display: flex; }

                .print-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .credential-card {
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    background: white;
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .card-logo {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 900;
                    flex-shrink: 0;
                }

                .card-title {
                    font-size: 13px;
                    font-weight: 800;
                    color: #1e293b;
                    line-height: 1.2;
                }

                .card-subtitle {
                    font-size: 9px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .card-number {
                    margin-left: auto;
                    font-size: 11px;
                    font-weight: 700;
                    color: #94a3b8;
                    font-family: monospace;
                }

                .card-divider {
                    height: 2px;
                    background: #e2e8f0;
                    margin: 10px 0;
                    border-radius: 1px;
                }

                .card-divider-thin {
                    height: 1px;
                    background: #f1f5f9;
                    margin: 8px 0;
                }

                .card-body {
                    font-size: 12px;
                }

                .card-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 3px 0;
                }

                .card-label {
                    color: #64748b;
                    font-size: 11px;
                }

                .card-value {
                    color: #1e293b;
                    font-weight: 600;
                    font-size: 12px;
                    text-align: right;
                    max-width: 60%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .card-value-bold {
                    font-weight: 800;
                    color: #1e40af;
                }

                .card-credentials {
                    display: flex;
                    gap: 12px;
                    margin-top: 4px;
                }

                .card-cred-box {
                    flex: 1;
                    background: #f8fafc;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 8px;
                    text-align: center;
                }

                .card-cred-label {
                    display: block;
                    font-size: 9px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }

                .card-cred-value {
                    display: block;
                    font-size: 20px;
                    font-weight: 900;
                    font-family: monospace;
                    color: #1e293b;
                    letter-spacing: 2px;
                }

                .card-footer {
                    margin-top: 10px;
                    text-align: center;
                    font-size: 9px;
                    color: #94a3b8;
                }

                /* Print-specific styles */
                @media print {
                    .no-print { display: none !important; }

                    body { margin: 0; padding: 0; }

                    .print-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                        padding: 8px;
                    }

                    .credential-card {
                        border: 1.5px solid #000;
                        border-radius: 8px;
                        padding: 12px;
                        font-size: 11px;
                    }

                    .card-logo {
                        background: #333 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .card-cred-box {
                        background: #f5f5f5 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* 6 cards per page (3 rows × 2 cols) */
                    .credential-card:nth-child(6n + 1) {
                        break-before: page;
                    }
                    .credential-card:nth-child(-n + 6) {
                        break-before: auto;
                    }
                }
            `}</style>
        </>
    );
}
