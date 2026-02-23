import Dexie, { type EntityTable } from "dexie";

// ============================================================================
// Nirwachan Live 2026 — IndexedDB Schema (Dexie.js)
// Offline-first data caching and sync queue
// ============================================================================

// ---- Cached Data Types ----
export interface CachedCandidate {
    id: string;
    externalId?: number;
    name: string;
    partyName: string;
    symbol?: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
    constituencyId: string;
    isPinned: boolean;
    displayOrder: number;
}

export interface CachedParty {
    id: string;
    name: string;
    nameShort?: string;
    electionSymbolUrl?: string;
    symbolImageFile?: string;
}

export interface CachedPollingStation {
    id: string;
    name: string;
    wardId: string;
    wardNumber: number;
    localLevelName: string;
}

export interface CachedPollingBooth {
    id: string;
    boothNumber: string;
    totalRegisteredVoters: number;
    pollingStationId: string;
    pollingStationName: string;
}

// ---- Offline Submission Queue ----
export interface PendingSubmission {
    localId?: number; // Auto-incremented local key
    payload: string; // JSON-serialized VoteSubmission
    imageBase64?: string;
    createdAt: string;
    retryCount: number;
    lastError?: string;
    synced: number; // 0 = not synced, 1 = synced (Dexie can't index booleans)
    syncedAt?: string;
}

// ---- Sync Log ----
export interface SyncLogEntry {
    id?: number;
    action: "submit" | "sync_success" | "sync_fail";
    details: string;
    timestamp: string;
}

// ============================================================================
// Database class
// ============================================================================

class NirwachanDB extends Dexie {
    candidates!: EntityTable<CachedCandidate, "id">;
    parties!: EntityTable<CachedParty, "id">;
    pollingStations!: EntityTable<CachedPollingStation, "id">;
    pollingBooths!: EntityTable<CachedPollingBooth, "id">;
    pendingSubmissions!: EntityTable<PendingSubmission, "localId">;
    syncLog!: EntityTable<SyncLogEntry, "id">;

    constructor() {
        super("NirwachanLive2026");

        this.version(1).stores({
            candidates: "id, constituencyId, partyName, isPinned, displayOrder",
            parties: "id, name",
            pollingStations: "id, wardId",
            pollingBooths: "id, pollingStationId",
            pendingSubmissions: "++localId, synced, createdAt",
            syncLog: "++id, action, timestamp",
        });
    }
}

// Singleton instance
export const db = new NirwachanDB();

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Pre-fetch and cache candidate and geography data for a constituency.
 * Called on successful login.
 */
export async function prefetchConstituencyData(constituencyId: string) {
    try {
        // Fetch candidates for this constituency
        const candidatesRes = await fetch(
            `/api/data/candidates?constituencyId=${constituencyId}`
        );
        if (candidatesRes.ok) {
            const candidates: CachedCandidate[] = await candidatesRes.json();
            await db.candidates.bulkPut(candidates);
        }

        // Fetch polling stations for this constituency
        const stationsRes = await fetch(
            `/api/data/stations?constituencyId=${constituencyId}`
        );
        if (stationsRes.ok) {
            const stations: CachedPollingStation[] = await stationsRes.json();
            await db.pollingStations.bulkPut(stations);
        }

        // Fetch polling booths for this constituency
        const boothsRes = await fetch(
            `/api/data/booths?constituencyId=${constituencyId}`
        );
        if (boothsRes.ok) {
            const booths: CachedPollingBooth[] = await boothsRes.json();
            await db.pollingBooths.bulkPut(booths);
        }

        // Fetch parties (global)
        const partiesRes = await fetch("/api/data/parties");
        if (partiesRes.ok) {
            const parties: CachedParty[] = await partiesRes.json();
            await db.parties.bulkPut(parties);
        }

        console.log("[Nirwachan] Pre-fetch complete for constituency:", constituencyId);
    } catch (error) {
        console.warn("[Nirwachan] Pre-fetch failed, will retry:", error);
    }
}

/**
 * Get candidates from local IndexedDB cache.
 */
export async function getCachedCandidates(constituencyId: string) {
    return db.candidates
        .where("constituencyId")
        .equals(constituencyId)
        .sortBy("displayOrder");
}

/**
 * Get polling stations for a specific ward from cache.
 */
export async function getCachedStations(wardId: string) {
    return db.pollingStations.where("wardId").equals(wardId).toArray();
}

/**
 * Get booths for a specific station from cache.
 */
export async function getCachedBooths(stationId: string) {
    return db.pollingBooths
        .where("pollingStationId")
        .equals(stationId)
        .toArray();
}

/**
 * Save a submission to the offline queue.
 */
export async function savePendingSubmission(
    payload: string,
    imageBase64?: string
) {
    const entry: PendingSubmission = {
        payload,
        imageBase64,
        createdAt: new Date().toISOString(),
        retryCount: 0,
        synced: 0,
    };
    await db.pendingSubmissions.add(entry);
    await db.syncLog.add({
        action: "submit",
        details: "Tally saved to offline queue",
        timestamp: new Date().toISOString(),
    });
    return entry;
}

/**
 * Get all unsynced submissions.
 */
export async function getUnsyncedSubmissions() {
    return db.pendingSubmissions.where("synced").equals(0).toArray();
}

/**
 * Mark a submission as synced.
 */
export async function markSynced(localId: number) {
    await db.pendingSubmissions.update(localId, {
        synced: 1,
        syncedAt: new Date().toISOString(),
    });
    await db.syncLog.add({
        action: "sync_success",
        details: `Submission ${localId} synced successfully`,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Record a sync failure.
 */
export async function markSyncFailed(localId: number, error: string) {
    const existing = await db.pendingSubmissions.get(localId);
    if (existing) {
        await db.pendingSubmissions.update(localId, {
            retryCount: (existing.retryCount || 0) + 1,
            lastError: error,
        });
    }
    await db.syncLog.add({
        action: "sync_fail",
        details: `Submission ${localId} failed: ${error}`,
        timestamp: new Date().toISOString(),
    });
}
