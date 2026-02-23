"use client";

import { useElectionStore } from "@/store/electionStore";

export default function SelectTypeStep() {
    const { setElectionType, nextStep } = useElectionStore();

    const handleSelect = (type: "fptp" | "pr") => {
        if (navigator.vibrate) navigator.vibrate(30);
        setElectionType(type);
        nextStep();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900">
                    निर्वाचन प्रकार छान्नुहोस्
                </h1>
                <p className="text-slate-500 text-sm mt-1">Select Election Type</p>
            </div>

            <div className="w-full max-w-sm space-y-4 mt-2">
                {/* FPTP Card */}
                <button
                    onClick={() => handleSelect("fptp")}
                    className="card card-interactive block w-full p-6 text-left cursor-pointer border-2 border-transparent hover:border-red-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                प्रत्यक्ष (FPTP)
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Federal Direct Election
                            </p>
                        </div>
                    </div>
                </button>

                {/* PR Card */}
                <button
                    onClick={() => handleSelect("pr")}
                    className="card card-interactive block w-full p-6 text-left cursor-pointer border-2 border-transparent hover:border-red-500"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                समानुपातिक (PR)
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Federal Proportional Representation
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
