"use client";

import {
    getUnsyncedSubmissions,
    markSynced,
    markSyncFailed,
    savePendingSubmission,
} from "@/lib/db";

// ============================================================================
// Nirwachan Live 2026 — Background Sync Engine
// ============================================================================

let syncInProgress = false;

/**
 * Submit a vote tally — saves locally first, then tries server sync.
 */
export async function submitVoteTally(
    payloadJson: string,
    imageBase64?: string
): Promise<{ success: boolean; isOffline: boolean; message: string }> {
    // Always save locally first (offline-first)
    await savePendingSubmission(payloadJson, imageBase64);

    if (!navigator.onLine) {
        return {
            success: true,
            isOffline: true,
            message: "Tally saved offline. Will auto-sync when network returns.",
        };
    }

    // Try to sync immediately
    const synced = await attemptSync();
    return {
        success: true,
        isOffline: !synced,
        message: synced
            ? "Tally submitted and synced successfully!"
            : "Tally saved locally. Sync pending.",
    };
}

/**
 * Attempt to sync all unsynced submissions.
 */
async function attemptSync(): Promise<boolean> {
    if (syncInProgress) return false;
    syncInProgress = true;

    let allSynced = true;

    try {
        const pending = await getUnsyncedSubmissions();
        if (pending.length === 0) {
            syncInProgress = false;
            return true;
        }

        for (const submission of pending) {
            try {
                const res = await fetch("/api/votes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        payload: submission.payload,
                        imageBase64: submission.imageBase64,
                    }),
                });

                if (res.ok && submission.localId !== undefined) {
                    await markSynced(submission.localId);
                } else if (submission.localId !== undefined) {
                    await markSyncFailed(
                        submission.localId,
                        `HTTP ${res.status}: ${res.statusText}`
                    );
                    allSynced = false;
                }
            } catch (error) {
                if (submission.localId !== undefined) {
                    await markSyncFailed(
                        submission.localId,
                        error instanceof Error ? error.message : "Network error"
                    );
                }
                allSynced = false;
            }
        }
    } finally {
        syncInProgress = false;
    }

    return allSynced;
}

/**
 * Initialize the background sync listener.
 * Call this once on app mount.
 */
export function initBackgroundSync() {
    if (typeof window === "undefined") return;

    // Sync when coming back online
    window.addEventListener("online", () => {
        console.log("[Nirwachan] Network restored — starting sync...");
        attemptSync();
    });

    // Periodic retry every 30 seconds while online
    setInterval(() => {
        if (navigator.onLine) {
            attemptSync();
        }
    }, 30_000);

    // Initial sync attempt
    if (navigator.onLine) {
        attemptSync();
    }
}
