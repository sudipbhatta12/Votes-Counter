"use client";

import { useElectionStore } from "@/store/electionStore";
import { useState, useEffect, useCallback } from "react";
import type { CachedPollingStation, CachedPollingBooth } from "@/lib/db";

// ============================================================================
// Location Selector — Cascading bottom-sheet modals
// Normal:  Ward → Station → Booth (single)
// Mixed:   Ward → All Booths across all stations (multi-select)
// ============================================================================

interface WardItem {
    id: string;
    wardNumber: number;
    localLevelName: string;
}

interface BoothWithStation extends CachedPollingBooth {
    stationName: string;
}

export default function LocationSelector() {
    const {
        constituencyId,
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
        "ward" | "station" | "booth" | "mixed-booth" | null
    >(null);
    const [wards, setWards] = useState<WardItem[]>([]);
    const [stations, setStations] = useState<CachedPollingStation[]>([]);
    const [booths, setBooths2] = useState<CachedPollingBooth[]>([]);
    const [allWardBooths, setAllWardBooths] = useState<BoothWithStation[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingBooths, setLoadingBooths] = useState(false);

    // Fetch wards for the agent's constituency on mount
    useEffect(() => {
        if (!constituencyId) return;
        setLoading(true);
        fetch(`/api/data/wards?constituencyId=${constituencyId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setWards(data);
            })
            .catch((err) => console.warn("Ward fetch failed:", err))
            .finally(() => setLoading(false));
    }, [constituencyId]);

    // Fetch stations when ward changes
    const loadStations = useCallback(async (wardId: string) => {
        try {
            const res = await fetch(`/api/data/stations?wardId=${wardId}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setStations(data);
                    return data as CachedPollingStation[];
                }
            }
        } catch {
            // fall through
        }
        // Fallback: filter from constituency stations
        if (constituencyId) {
            try {
                const res = await fetch(`/api/data/stations?constituencyId=${constituencyId}`);
                if (res.ok) {
                    const all: CachedPollingStation[] = await res.json();
                    const filtered = all.filter((s) => s.wardId === wardId);
                    setStations(filtered);
                    return filtered;
                }
            } catch (err) {
                console.warn("Station fetch failed:", err);
            }
        }
        return [];
    }, [constituencyId]);

    useEffect(() => {
        if (selectedWardId) {
            loadStations(selectedWardId);
        }
    }, [selectedWardId, loadStations]);

    // Fetch booths when station changes (normal mode)
    useEffect(() => {
        if (!selectedStationId || isMixedBox) return;
        fetch(`/api/data/booths?stationId=${selectedStationId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setBooths2(data);
            })
            .catch((err) => console.warn("Booth fetch failed:", err));
    }, [selectedStationId, isMixedBox]);

    // Load ALL booths for ALL stations in the ward (mixed mode)
    const loadAllWardBooths = useCallback(async (wardId: string) => {
        setLoadingBooths(true);
        try {
            const wardStations = await loadStations(wardId);
            const allBooths: BoothWithStation[] = [];
            for (const station of wardStations) {
                try {
                    const res = await fetch(`/api/data/booths?stationId=${station.id}`);
                    if (res.ok) {
                        const stationBooths: CachedPollingBooth[] = await res.json();
                        allBooths.push(
                            ...stationBooths.map((b) => ({
                                ...b,
                                stationName: station.name,
                            }))
                        );
                    }
                } catch {
                    // skip failed station
                }
            }
            setAllWardBooths(allBooths);
        } catch (err) {
            console.warn("Ward booth fetch failed:", err);
        } finally {
            setLoadingBooths(false);
        }
    }, [loadStations]);

    const handleBoothToggle = (booth: CachedPollingBooth | BoothWithStation) => {
        if (navigator.vibrate) navigator.vibrate(15);

        if (isMixedBox) {
            // Multi-select mode across all stations
            const isSelected = selectedBoothIds.includes(booth.id);
            let newIds: string[];
            let newLabels: string[];
            const label = "stationName" in booth
                ? `${booth.boothNumber} (${(booth as BoothWithStation).stationName.substring(0, 20)})`
                : booth.boothNumber;

            if (isSelected) {
                newIds = selectedBoothIds.filter((id) => id !== booth.id);
                newLabels = selectedBoothLabels.filter((_, i) => selectedBoothIds[i] !== booth.id);
            } else {
                newIds = [...selectedBoothIds, booth.id];
                newLabels = [...selectedBoothLabels, label];
            }
            // Sum voters from all selected booths
            const allBoothSource = isMixedBox ? allWardBooths : booths;
            const totalVoters = allBoothSource
                .filter((b) => newIds.includes(b.id))
                .reduce((sum, b) => sum + b.totalRegisteredVoters, 0);
            setBooths(newIds, newLabels, totalVoters);
        } else {
            // Single-select mode
            setBooths([booth.id], [booth.boothNumber], booth.totalRegisteredVoters);
            setActiveSheet(null);
        }
    };

    // In mixed mode: need ward + at least 1 booth. In normal: need ward + station + booth
    const canProceed = isMixedBox
        ? selectedWardId && selectedBoothIds.length > 0
        : selectedWardId && selectedStationId && selectedBoothIds.length > 0;

    return (
        <div className="flex-1 flex flex-col p-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
                मतदान स्थल छान्नुहोस्
            </h1>
            <p className="text-sm text-slate-500 mb-6">
                Select your polling location
            </p>

            {/* Mixed Box Toggle — entire row is clickable */}
            <div
                onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(20);
                    toggleMixedBox();
                }}
                className="flex items-center justify-between p-4 bg-amber-50 border-2 border-amber-200 rounded-xl mb-4 cursor-pointer active:scale-[0.98] transition-transform"
                role="switch"
                aria-checked={isMixedBox}
            >
                <div>
                    <p className="font-semibold text-slate-900 text-sm">
                        मतपेटिका मिसाएको?
                    </p>
                    <p className="text-xs text-slate-500">Mix Ballot Boxes?</p>
                </div>
                <div
                    className={`relative w-14 h-8 rounded-full transition-colors duration-200 flex-shrink-0 ${isMixedBox ? "bg-blue-600" : "bg-slate-300"
                        }`}
                >
                    <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${isMixedBox ? "translate-x-6" : "translate-x-0"
                            }`}
                    />
                </div>
            </div>

            {/* Selection Cards */}
            <div className="space-y-3">
                {/* Ward Selector — always shown */}
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

                {/* Station Selector — only in normal (non-mixed) mode */}
                {!isMixedBox && (
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
                )}

                {/* Booth Selector */}
                <button
                    onClick={() => {
                        if (isMixedBox && selectedWardId) {
                            // In mixed mode, load all booths across all stations
                            loadAllWardBooths(selectedWardId);
                            setActiveSheet("mixed-booth");
                        } else if (selectedStationId) {
                            setActiveSheet("booth");
                        }
                    }}
                    disabled={isMixedBox ? !selectedWardId : !selectedStationId}
                    className={`w-full touch-btn border-2 text-left px-4 justify-between ${(isMixedBox ? selectedWardId : selectedStationId)
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
                                ? selectedBoothLabels.length > 2
                                    ? `${selectedBoothLabels.length} booths selected`
                                    : selectedBoothLabels.join(", ")
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
                                    "मतपेटिका छान्नुहोस् (Select Booth)"}
                                {activeSheet === "mixed-booth" &&
                                    "मतपेटिका छान्नुहोस् (Select Booths — All Stations)"}
                            </h3>
                            <button
                                onClick={() => setActiveSheet(null)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 text-2xl"
                            >
                                x
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-2">
                            {/* Ward List */}
                            {activeSheet === "ward" && (
                                loading ? (
                                    <p className="text-center text-slate-400 py-8">Loading wards...</p>
                                ) : wards.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">No wards found for this constituency</p>
                                ) : (
                                    wards.map((ward) => (
                                        <button
                                            key={ward.id}
                                            onClick={() => {
                                                if (navigator.vibrate) navigator.vibrate(15);
                                                setWard(
                                                    ward.id,
                                                    `${ward.localLevelName} - वडा ${ward.wardNumber}`
                                                );
                                                if (isMixedBox) {
                                                    // Mixed mode: go straight to all-booths
                                                    loadAllWardBooths(ward.id);
                                                    setActiveSheet("mixed-booth");
                                                } else {
                                                    setActiveSheet("station");
                                                }
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
                                    ))
                                )
                            )}

                            {/* Station List (normal mode only) */}
                            {activeSheet === "station" && (
                                stations.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">Loading stations...</p>
                                ) : (
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
                                    ))
                                )
                            )}

                            {/* Booth List — single station (normal mode) */}
                            {activeSheet === "booth" && (
                                booths.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">Loading booths...</p>
                                ) : (
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
                                            </button>
                                        );
                                    })
                                )
                            )}

                            {/* ALL Booths from ALL stations (mixed mode) */}
                            {activeSheet === "mixed-booth" && (
                                loadingBooths ? (
                                    <p className="text-center text-slate-400 py-8">Loading all booths...</p>
                                ) : allWardBooths.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8">No booths found in this ward</p>
                                ) : (
                                    <>
                                        <p className="px-3 py-2 text-xs text-slate-500">
                                            {allWardBooths.length} booths across {new Set(allWardBooths.map(b => b.pollingStationId)).size} stations — tap to select
                                        </p>
                                        {/* Group by station */}
                                        {Array.from(
                                            allWardBooths.reduce((map, booth) => {
                                                const key = booth.pollingStationId;
                                                if (!map.has(key)) map.set(key, []);
                                                map.get(key)!.push(booth);
                                                return map;
                                            }, new Map<string, BoothWithStation[]>())
                                        ).map(([stationId, stationBooths]) => (
                                            <div key={stationId} className="mb-3">
                                                <p className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-50 rounded-lg mb-1">
                                                    {stationBooths[0].stationName}
                                                </p>
                                                {stationBooths.map((booth) => {
                                                    const isSelected = selectedBoothIds.includes(booth.id);
                                                    return (
                                                        <button
                                                            key={booth.id}
                                                            onClick={() => handleBoothToggle(booth)}
                                                            className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-colors flex items-center justify-between ${isSelected
                                                                ? "bg-blue-50 border-2 border-blue-300"
                                                                : "hover:bg-slate-50 border-2 border-transparent"
                                                                }`}
                                                        >
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">
                                                                    मतपेटिका {booth.boothNumber}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    दर्ता मतदाता: {booth.totalRegisteredVoters}
                                                                </p>
                                                            </div>
                                                            <div
                                                                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                                                    ? "bg-blue-600 border-blue-600"
                                                                    : "border-slate-300"
                                                                    }`}
                                                            >
                                                                {isSelected && (
                                                                    <span className="text-white text-sm">✓</span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </>
                                )
                            )}

                            {/* Done button for mixed-box multi-select */}
                            {activeSheet === "mixed-booth" &&
                                selectedBoothIds.length > 0 && (
                                    <div className="p-4 sticky bottom-0 bg-white border-t border-slate-200">
                                        <button
                                            onClick={() => setActiveSheet(null)}
                                            className="touch-btn touch-btn-primary w-full"
                                        >
                                            पुष्टि ({selectedBoothIds.length} booths selected)
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
