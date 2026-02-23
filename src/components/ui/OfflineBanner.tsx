"use client";

import { useEffect, useState } from "react";

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const updateStatus = () => {
            setIsOffline(!navigator.onLine);
        };

        updateStatus();
        window.addEventListener("online", updateStatus);
        window.addEventListener("offline", updateStatus);

        return () => {
            window.removeEventListener("online", updateStatus);
            window.removeEventListener("offline", updateStatus);
        };
    }, []);

    // Check pending submissions count periodically
    useEffect(() => {
        const checkPending = async () => {
            try {
                const { db } = await import("@/lib/db");
                const count = await db.pendingSubmissions
                    .where("synced")
                    .equals(0)
                    .count();
                setPendingCount(count);
            } catch {
                // DB not initialized yet
            }
        };

        checkPending();
        const interval = setInterval(checkPending, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!isOffline && pendingCount === 0) return null;

    return (
        <div
            className={`offline-banner ${isOffline ? "bg-amber-500" : "bg-blue-500"
                }`}
        >
            {isOffline ? (
                <>
                    अफलाइन: तथ्यांक स्थानीय रुपमा सुरक्षित छ। नेटवर्क मिल्दा
                    स्वतः सिंक हुनेछ।
                    {pendingCount > 0 && (
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {pendingCount} pending
                        </span>
                    )}
                </>
            ) : (
                pendingCount > 0 && (
                    <>
                        {pendingCount} tally{pendingCount > 1 ? "s" : ""} syncing...
                    </>
                )
            )}
        </div>
    );
}
