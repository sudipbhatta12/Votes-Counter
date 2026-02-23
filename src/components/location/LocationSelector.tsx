"use client";

import { useElectionStore } from "@/store/electionStore";
import { useState, useEffect } from "react";
import { getCachedStations, getCachedBooths } from "@/lib/db";
import type { CachedPollingStation, CachedPollingBooth } from "@/lib/db";

// ============================================================================
// Location Selector — Cascading bottom-sheet modals
// Ward → Polling Station → Polling Booth(s)
// ============================================================================

// Mock ward data for demo (in production, comes from IndexedDB)
const MOCK_WARDS = [
    { id: "w1", wardNumber: 1, localLevelName: "सूर्योदय नगरपालिका" },
    { id: "w2", wardNumber: 2, localLevelName: "सूर्योदय नगरपालिका" },
    { id: "w3", wardNumber: 3, localLevelName: "सूर्योदय नगरपालिका" },
    { id: "w4", wardNumber: 4, localLevelName: "फाकफोकथुम गाउँपालिका" },
    { id: "w5", wardNumber: 5, localLevelName: "फाकफोकथुम गाउँपालिका" },
];

const MOCK_STATIONS: Record<string, CachedPollingStation[]> = {
    w1: [
        {
            id: "s1",
            name: "श्री जनता मा.वि. छाती तिजथला",
            wardId: "w1",
            wardNumber: 1,
            localLevelName: "सूर्योदय नगरपालिका",
        },
    ],
    w2: [
        {
            id: "s2",
            name: "श्री कालिका मा.वि. बालाचौर भर्ता",
            wardId: "w2",
            wardNumber: 2,
            localLevelName: "सूर्योदय नगरपालिका",
        },
    ],
    w3: [
        {
            id: "s3",
            name: "श्री जनज्योती मा.वि भर्ता",
            wardId: "w3",
            wardNumber: 3,
            localLevelName: "सूर्योदय नगरपालिका",
        },
    ],
};

const MOCK_BOOTHS: Record<string, CachedPollingBooth[]> = {
    s1: [
        {
            id: "b1",
            boothNumber: "क",
            totalRegisteredVoters: 450,
            pollingStationId: "s1",
            pollingStationName: "श्री जनता मा.वि.",
        },
        {
            id: "b2",
            boothNumber: "ख",
            totalRegisteredVoters: 380,
            pollingStationId: "s1",
            pollingStationName: "श्री जनता मा.वि.",
        },
    ],
    s2: [
        {
            id: "b3",
            boothNumber: "क",
            totalRegisteredVoters: 520,
            pollingStationId: "s2",
            pollingStationName: "श्री कालिका मा.वि.",
        },
        {
            id: "b4",
            boothNumber: "ख",
            totalRegisteredVoters: 410,
            pollingStationId: "s2",
            pollingStationName: "श्री कालिका मा.वि.",
        },
    ],
    s3: [
        {
            id: "b5",
            boothNumber: "क",
            totalRegisteredVoters: 600,
            pollingStationId: "s3",
            pollingStationName: "श्री जनज्योती मा.वि.",
        },
    ],
};

export default function LocationSelector() {
    const {
        selectedWardId,
        selectedWardLabel,
        selectedStationId,
        selectedStationLabel,
        selectedBoothIds,
        selectedBoothLabels,
        isMixedBox,
        totalRegisteredVoters,
        setWard,
        setStation,
        setBooths,
        toggleMixedBox,
        nextStep,
    } = useElectionStore();

    const [activeSheet, setActiveSheet] = useState<
        "ward" | "station" | "booth" | null
    >(null);
    const [stations, setStations] = useState<CachedPollingStation[]>([]);
    const [booths, setBooths2] = useState<CachedPollingBooth[]>([]);

    // Load stations when ward changes
    useEffect(() => {
        if (selectedWardId) {
            // Try IndexedDB first, fall back to mock
            getCachedStations(selectedWardId).then((cached) => {
                if (cached.length > 0) {
                    setStations(cached);
                } else {
                    setStations(MOCK_STATIONS[selectedWardId] || []);
                }
            });
        }
    }, [selectedWardId]);

    // Load booths when station changes
    useEffect(() => {
        if (selectedStationId) {
            getCachedBooths(selectedStationId).then((cached) => {
                if (cached.length > 0) {
                    setBooths2(cached);
                } else {
                    setBooths2(MOCK_BOOTHS[selectedStationId] || []);
                }
            });
        }
    }, [selectedStationId]);

    const handleBoothToggle = (booth: CachedPollingBooth) => {
        if (navigator.vibrate) navigator.vibrate(15);

        if (isMixedBox) {
            // Multi-select mode
            const isSelected = selectedBoothIds.includes(booth.id);
            let newIds: string[];
            let newLabels: string[];
            if (isSelected) {
                newIds = selectedBoothIds.filter((id) => id !== booth.id);
                newLabels = selectedBoothLabels.filter((_, i) => selectedBoothIds[i] !== booth.id);
            } else {
                newIds = [...selectedBoothIds, booth.id];
                newLabels = [...selectedBoothLabels, booth.boothNumber];
            }
            const totalVoters = booths
                .filter((b) => newIds.includes(b.id))
                .reduce((sum, b) => sum + b.totalRegisteredVoters, 0);
            setBooths(newIds, newLabels, totalVoters);
        } else {
            // Single-select mode
            setBooths([booth.id], [booth.boothNumber], booth.totalRegisteredVoters);
            setActiveSheet(null);
        }
    };

    const canProceed =
        selectedWardId && selectedStationId && selectedBoothIds.length > 0;

    return (
        <div className="flex-1 flex flex-col p-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
                मतदान स्थल छान्नुहोस्
            </h1>
            <p className="text-sm text-slate-500 mb-6">
                Select your polling location
            </p>

            {/* Mixed Box Toggle */}
            <div className="flex items-center justify-between p-4 bg-amber-50 border-2 border-amber-200 rounded-xl mb-4">
                <div>
                    <p className="font-semibold text-slate-900 text-sm">
                        मतपेटिका मिसाएको?
                    </p>
                    <p className="text-xs text-slate-500">Mix Ballot Boxes?</p>
                </div>
                <button
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(20);
                        toggleMixedBox();
                    }}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${isMixedBox ? "bg-blue-600" : "bg-slate-300"
                        }`}
                    role="switch"
                    aria-checked={isMixedBox}
                >
                    <span
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${isMixedBox ? "translate-x-7" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            {/* Selection Cards */}
            <div className="space-y-3">
                {/* Ward Selector */}
                <button
                    onClick={() => setActiveSheet("ward")}
                    className="w-full touch-btn border-2 border-slate-200 text-left px-4 justify-between"
                >
                    <div>
                        <p className="text-xs text-slate-500 font-medium">वडा (Ward)</p>
                        <p className="text-base font-bold text-slate-900">
                            {selectedWardLabel || "छान्नुहोस्..."}
                        </p>
                    </div>
                    <span className="text-slate-400 text-xl">›</span>
                </button>

                {/* Station Selector */}
                <button
                    onClick={() => selectedWardId && setActiveSheet("station")}
                    disabled={!selectedWardId}
                    className={`w-full touch-btn border-2 text-left px-4 justify-between ${selectedWardId
                            ? "border-slate-200"
                            : "border-slate-100 opacity-50"
                        }`}
                >
                    <div>
                        <p className="text-xs text-slate-500 font-medium">
                            मतदान केन्द्र (Polling Station)
                        </p>
                        <p className="text-base font-bold text-slate-900 truncate max-w-[250px]">
                            {selectedStationLabel || "छान्नुहोस्..."}
                        </p>
                    </div>
                    <span className="text-slate-400 text-xl">›</span>
                </button>

                {/* Booth Selector */}
                <button
                    onClick={() => selectedStationId && setActiveSheet("booth")}
                    disabled={!selectedStationId}
                    className={`w-full touch-btn border-2 text-left px-4 justify-between ${selectedStationId
                            ? "border-slate-200"
                            : "border-slate-100 opacity-50"
                        }`}
                >
                    <div>
                        <p className="text-xs text-slate-500 font-medium">
                            {isMixedBox
                                ? "मतपेटिका (Booths - Multi)"
                                : "मतपेटिका (Booth)"}
                        </p>
                        <p className="text-base font-bold text-slate-900">
                            {selectedBoothLabels.length > 0
                                ? selectedBoothLabels.join(", ")
                                : "छान्नुहोस्..."}
                        </p>
                    </div>
                    <span className="text-slate-400 text-xl">›</span>
                </button>
            </div>

            {/* Registered Voters Summary */}
            {totalRegisteredVoters > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-800">
                            कुल दर्ता मतदाता
                        </span>
                        <span className="text-2xl font-bold text-blue-900">
                            {totalRegisteredVoters.toLocaleString()}
                        </span>
                    </div>
                    {isMixedBox && selectedBoothIds.length > 1 && (
                        <p className="text-xs text-blue-600 mt-1">
                            {selectedBoothIds.length} booths combined
                        </p>
                    )}
                </div>
            )}

            {/* Proceed Button */}
            <div className="mt-auto pt-6">
                <button
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(30);
                        nextStep();
                    }}
                    disabled={!canProceed}
                    className={`touch-btn w-full ${canProceed ? "touch-btn-primary" : "touch-btn-primary opacity-40 cursor-not-allowed"
                        }`}
                >
                    अगाडि बढ्नुहोस् (Continue)
                </button>
            </div>

            {/* Bottom Sheet Overlays */}
            {activeSheet && (
                <div className="fixed inset-0 z-50 flex items-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setActiveSheet(null)}
                    />

                    {/* Sheet */}
                    <div className="relative w-full max-h-[70vh] bg-white rounded-t-2xl overflow-hidden">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">
                                {activeSheet === "ward" && "वडा छान्नुहोस् (Select Ward)"}
                                {activeSheet === "station" &&
                                    "मतदान केन्द्र छान्नुहोस् (Select Station)"}
                                {activeSheet === "booth" &&
                                    `मतपेटिका छान्नुहोस् (Select Booth${isMixedBox ? "s" : ""})`}
                            </h3>
                            <button
                                onClick={() => setActiveSheet(null)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-2">
                            {/* Ward List */}
                            {activeSheet === "ward" &&
                                MOCK_WARDS.map((ward) => (
                                    <button
                                        key={ward.id}
                                        onClick={() => {
                                            if (navigator.vibrate) navigator.vibrate(15);
                                            setWard(
                                                ward.id,
                                                `${ward.localLevelName} - वडा ${ward.wardNumber}`
                                            );
                                            setActiveSheet("station");
                                        }}
                                        className={`w-full text-left px-4 py-4 rounded-xl mb-1 transition-colors ${selectedWardId === ward.id
                                                ? "bg-blue-50 border-2 border-blue-300"
                                                : "hover:bg-slate-50 border-2 border-transparent"
                                            }`}
                                    >
                                        <p className="font-bold text-slate-900">
                                            वडा नं. {ward.wardNumber}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {ward.localLevelName}
                                        </p>
                                    </button>
                                ))}

                            {/* Station List */}
                            {activeSheet === "station" &&
                                stations.map((station) => (
                                    <button
                                        key={station.id}
                                        onClick={() => {
                                            if (navigator.vibrate) navigator.vibrate(15);
                                            setStation(station.id, station.name);
                                            setActiveSheet("booth");
                                        }}
                                        className={`w-full text-left px-4 py-4 rounded-xl mb-1 transition-colors ${selectedStationId === station.id
                                                ? "bg-blue-50 border-2 border-blue-300"
                                                : "hover:bg-slate-50 border-2 border-transparent"
                                            }`}
                                    >
                                        <p className="font-bold text-slate-900">{station.name}</p>
                                        <p className="text-sm text-slate-500">
                                            वडा {station.wardNumber}
                                        </p>
                                    </button>
                                ))}

                            {/* Booth List */}
                            {activeSheet === "booth" &&
                                booths.map((booth) => {
                                    const isSelected = selectedBoothIds.includes(booth.id);
                                    return (
                                        <button
                                            key={booth.id}
                                            onClick={() => handleBoothToggle(booth)}
                                            className={`w-full text-left px-4 py-4 rounded-xl mb-1 transition-colors flex items-center justify-between ${isSelected
                                                    ? "bg-blue-50 border-2 border-blue-300"
                                                    : "hover:bg-slate-50 border-2 border-transparent"
                                                }`}
                                        >
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    मतपेटिका {booth.boothNumber}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    दर्ता मतदाता: {booth.totalRegisteredVoters}
                                                </p>
                                            </div>
                                            {isMixedBox && (
                                                <div
                                                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected
                                                            ? "bg-blue-600 border-blue-600"
                                                            : "border-slate-300"
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <span className="text-white text-sm">✓</span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                            {/* Done button for mixed-box multi-select */}
                            {activeSheet === "booth" &&
                                isMixedBox &&
                                selectedBoothIds.length > 0 && (
                                    <div className="p-4">
                                        <button
                                            onClick={() => setActiveSheet(null)}
                                            className="touch-btn touch-btn-primary w-full"
                                        >
                                            पुष्टि ({selectedBoothIds.length} selected)
                                        </button>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
