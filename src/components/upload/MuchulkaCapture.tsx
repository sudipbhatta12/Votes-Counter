"use client";

import { useRef, useState, useCallback } from "react";
import { useElectionStore } from "@/store/electionStore";

// ============================================================================
// Muchulka Photo Upload — Unlimited photos, File-based, no crash
// ============================================================================

const MAX_THUMB_WIDTH = 200;
const MAX_THUMB_HEIGHT = 200;

interface PhotoEntry {
    id: string;
    file: File;
    thumbnailUrl: string; // Small object URL for preview only
    originalSizeKB: number;
}

function createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                // Scale down to tiny thumbnail
                if (width > MAX_THUMB_WIDTH) {
                    height = (height * MAX_THUMB_WIDTH) / width;
                    width = MAX_THUMB_WIDTH;
                }
                if (height > MAX_THUMB_HEIGHT) {
                    width = (width * MAX_THUMB_HEIGHT) / height;
                    height = MAX_THUMB_HEIGHT;
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) { reject(new Error("No canvas context")); return; }
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.5));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function MuchulkaCapture() {
    const { nextStep } = useElectionStore();
    const [photos, setPhotos] = useState<PhotoEntry[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (navigator.vibrate) navigator.vibrate(30);
        setIsProcessing(true);

        try {
            const newPhotos: PhotoEntry[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith("image/")) continue;
                const thumbnailUrl = await createThumbnail(file);
                newPhotos.push({
                    id: `photo-${Date.now()}-${i}`,
                    file,
                    thumbnailUrl,
                    originalSizeKB: Math.round(file.size / 1024),
                });
            }
            setPhotos((prev) => [...prev, ...newPhotos]);
        } catch (error) {
            console.error("Photo processing failed:", error);
        } finally {
            setIsProcessing(false);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, []);

    const handleRemove = (id: string) => {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
    };

    const handleProceed = () => {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        // Store a small marker in the store (not the full images)
        // The actual files would be uploaded via FormData in production
        const store = useElectionStore.getState();
        if (photos.length > 0) {
            store.setMuchulkaImage(`${photos.length} photo(s) attached`);
        }
        nextStep();
    };

    return (
        <div className="flex-1 flex flex-col p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
                मुचुल्का फोटो
            </h1>
            <p className="text-sm text-slate-500 mb-2">
                कृपया आफ्नो भौतिक मत गणना पत्र (Muchulka) को फोटो खिच्नुहोस्
            </p>

            {/* Recommendation banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-5">
                <p className="text-xs text-blue-700">
                    <span className="font-semibold">सिफारिस:</span> मुचुल्काको सबै पानाको फोटो अपलोड गर्नुहोस्। यो ऐच्छिक हो तर प्रमाणीकरणमा सहयोग पुग्छ।
                </p>
            </div>

            {/* Hidden file input — accepts multiple */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id="muchulka-input"
            />

            {/* Photo grid */}
            {photos.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                        {photos.length} फोटो संलग्न
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={photo.thumbnailUrl}
                                    alt="Muchulka"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => handleRemove(photo.id)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs"
                                    aria-label="Remove photo"
                                >
                                    x
                                </button>
                                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                                    {photo.originalSizeKB} KB
                                </span>
                            </div>
                        ))}

                        {/* Add more button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className="rounded-lg border-2 border-dashed border-slate-300 aspect-square flex flex-col items-center justify-center gap-1 hover:border-blue-400 active:scale-95 transition-all"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span className="text-[10px] text-slate-400">थप्नुहोस्</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Initial capture button (when no photos yet) */}
            {photos.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-48 h-48 rounded-2xl border-4 border-dashed border-slate-300
                       flex flex-col items-center justify-center gap-3
                       hover:border-blue-400 active:scale-95 transition-all"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="w-10 h-10 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                                </svg>
                                <span className="text-sm text-slate-500">Processing...</span>
                            </>
                        ) : (
                            <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <span className="text-sm font-semibold text-slate-600">
                                    फोटो खिच्नुहोस्
                                </span>
                                <span className="text-xs text-slate-400">Tap to capture</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto pt-4 space-y-3">
                <button
                    onClick={handleProceed}
                    className={`touch-btn w-full ${photos.length > 0 ? "touch-btn-success" : "touch-btn-primary"}`}
                >
                    {photos.length > 0
                        ? `पुष्टि गर्नुहोस् (${photos.length} photos)`
                        : "फोटो बिना जारी (Skip)"}
                </button>

                {photos.length === 0 && (
                    <p className="text-center text-xs text-slate-400">
                        फोटो अपलोड ऐच्छिक हो तर सिफारिस गरिन्छ
                    </p>
                )}
            </div>
        </div>
    );
}
