"use client";

import { useState } from "react";
import { useElectionStore } from "@/store/electionStore";

export default function LoginStep() {
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setAuth, nextStep } = useElectionStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (navigator.vibrate) navigator.vibrate(50);
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, pin }),
            });

            const data = await res.json();

            if (data.success) {
                setAuth({
                    agentId: data.agent.id,
                    agentName: data.agent.name,
                    agentPhone: data.agent.phone,
                    constituencyId: data.agent.constituencyId,
                    constituencyLabel: data.agent.constituencyLabel,
                });
                nextStep();
            } else {
                setError(data.message || "लगइन असफल भयो");
            }
        } catch {
            setError("सर्भरसँग सम्पर्क हुन सकेन");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        एजेन्ट लगइन
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        आफ्नो फोन नम्बर र PIN प्रविष्ट गर्नुहोस्
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Phone Number */}
                    <div>
                        <label
                            htmlFor="phone"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            फोन नम्बर
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            placeholder="98XXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="touch-input w-full text-center text-xl tracking-widest"
                            required
                            autoComplete="tel"
                        />
                    </div>

                    {/* PIN */}
                    <div>
                        <label
                            htmlFor="pin"
                            className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                            ४-अंकको PIN
                        </label>
                        <input
                            id="pin"
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]{4}"
                            maxLength={4}
                            placeholder="----"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="touch-input w-full text-center text-2xl tracking-[0.5em]"
                            required
                            autoComplete="one-time-code"
                        />
                    </div>

                    <button
                        type="submit"
                        className="touch-btn touch-btn-primary w-full mt-2"
                        disabled={phone.length < 10 || pin.length < 4 || loading}
                    >
                        {loading ? "प्रमाणित गर्दै..." : "लगइन गर्नुहोस्"}
                    </button>
                </div>

                {/* Demo credentials hint */}
                <p className="text-center text-xs text-slate-400 mt-8">
                    Demo: 9841000001 / 1234
                </p>
            </form>
        </div>
    );
}
