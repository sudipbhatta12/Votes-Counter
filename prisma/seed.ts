/**
 * Nirwachan Live 2026 — FAST Batch Seed Script
 *
 * Uses raw SQL batch inserts to minimize network round trips to Neon.
 * Instead of 50,000 upserts, this does ~20 batch INSERT statements.
 *
 * Run: npm run db:seed
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const adapter = new PrismaNeon({
    connectionString: process.env.DIRECT_URL!,
});
const prisma = new PrismaClient({ adapter });

// ─── Data files ───
const DATA_DIR = path.resolve(__dirname, "../../");
const POLLING_DATA_PATH = path.join(DATA_DIR, "Polling_Booth_Data.json");
const CANDIDATES_PATH = path.join(DATA_DIR, "Candidates_By_Constituency.json");
const PARTY_MAP_PATH = path.join(DATA_DIR, "Party_Symbol_Map.json");

const PROVINCE_MAP: Record<string, { number: number; nameEn: string }> = {
    "कोशी प्रदेश": { number: 1, nameEn: "Koshi Province" },
    "मधेश प्रदेश": { number: 2, nameEn: "Madhesh Province" },
    "बागमती प्रदेश": { number: 3, nameEn: "Bagmati Province" },
    "गण्डकी प्रदेश": { number: 4, nameEn: "Gandaki Province" },
    "लुम्बिनी प्रदेश": { number: 5, nameEn: "Lumbini Province" },
    "कर्णाली प्रदेश": { number: 6, nameEn: "Karnali Province" },
    "सुदूरपश्चिम प्रदेश": { number: 7, nameEn: "Sudurpashchim Province" },
    "सुदुर पश्चिम प्रदेश": { number: 7, nameEn: "Sudurpashchim Province" }, // alt spelling in data
};

const MAJOR_PARTIES = [
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)",
    "नेपाली काँग्रेस",
    "राष्ट्रिय स्वतन्त्र पार्टी",
    "नेपाल कम्युनिस्ट पार्टी (माओवादी)",
    "राष्ट्रिय प्रजातन्त्र पार्टी",
];

// Escape single quotes for SQL
function esc(s: string | null | undefined): string {
    if (!s) return "";
    return s.replace(/'/g, "''");
}

async function main() {
    const now = new Date().toISOString();
    console.log("🇳🇵 Nirwachan Live 2026 — FAST Batch Seed");
    console.log("=".repeat(50));

    // ── Clean existing data ──
    console.log("\n🧹 Cleaning existing data...");
    const tables = [
        "candidate_vote_tallies", "party_vote_tallies",
        "fptp_vote_records", "pr_vote_records",
        "vote_batch_booths", "vote_batches",
        "candidates", "parties", "agents",
        "polling_booths", "polling_stations",
        "wards", "local_levels",
        "constituencies", "districts", "provinces",
    ];
    for (const t of tables) {
        await prisma.$executeRawUnsafe(`DELETE FROM "${t}"`);
    }
    console.log("  ✅ All tables cleared");

    // ── Step 1: Seed Parties ──
    console.log("\n📋 Step 1: Seeding parties...");
    const partyMap: Record<string, { URL: string; LocalFile: string; IsDefault: boolean }> =
        JSON.parse(fs.readFileSync(PARTY_MAP_PATH, "utf-8"));

    const partyIdMap = new Map<string, string>();
    const partyValues: string[] = [];

    for (const [name, info] of Object.entries(partyMap)) {
        const id = randomUUID();
        partyIdMap.set(name, id);
        partyValues.push(
            `('${id}', '${esc(name)}', '${esc(info.URL)}', '${esc(info.LocalFile)}', ${info.IsDefault}, '${now}', '${now}')`
        );
    }

    // Batch insert parties in chunks of 50
    for (let i = 0; i < partyValues.length; i += 50) {
        const chunk = partyValues.slice(i, i + 50);
        await prisma.$executeRawUnsafe(
            `INSERT INTO "parties" ("id", "name", "electionSymbolUrl", "symbolImageFile", "isDefault", "createdAt", "updatedAt")
       VALUES ${chunk.join(",\n")}
       ON CONFLICT ("name") DO NOTHING`
        );
    }
    console.log(`  ✅ ${partyValues.length} parties`);

    // ── Step 2: Seed Geography ──
    console.log("\n🗺️ Step 2: Seeding geography (batch mode)...");
    const pollingData = JSON.parse(fs.readFileSync(POLLING_DATA_PATH, "utf-8"));

    // Pre-generate all IDs and collect batch values
    const provinceValues: string[] = [];
    const districtValues: string[] = [];
    const constituencyValues: string[] = [];
    const localLevelValues: string[] = [];
    const wardValues: string[] = [];
    const stationValues: string[] = [];
    const boothValues: string[] = [];

    const provinceIdMap = new Map<string, string>();
    const districtIdMap = new Map<string, string>();
    const constituencyIdMap = new Map<string, string>();

    for (const constData of pollingData.Constituencies) {
        const provInfo = PROVINCE_MAP[constData.Province];
        if (!provInfo) continue;

        // Province
        let provinceId = provinceIdMap.get(constData.Province);
        if (!provinceId) {
            provinceId = randomUUID();
            provinceIdMap.set(constData.Province, provinceId);
            provinceValues.push(
                `('${provinceId}', '${esc(constData.Province)}', '${esc(provInfo.nameEn)}', ${provInfo.number}, '${now}', '${now}')`
            );
        }

        // District
        const distKey = `${constData.District}_${provinceId}`;
        let districtId = districtIdMap.get(distKey);
        if (!districtId) {
            districtId = randomUUID();
            districtIdMap.set(distKey, districtId);
            districtValues.push(
                `('${districtId}', '${esc(constData.District)}', '${provinceId}', '${now}', '${now}')`
            );
        }

        // Constituency
        const constNo = parseInt(constData.ConstituencyNo, 10);
        const constKey = `${constData.District}_${String(constNo).padStart(2, "0")}`;
        const constituencyId = randomUUID();
        constituencyIdMap.set(constKey, constituencyId);
        constituencyValues.push(
            `('${constituencyId}', ${constNo}, '${esc(constData.District)} - ${constNo}', '${districtId}', '${now}', '${now}')`
        );

        // LocalLevel + Ward + Station + Booth
        const localLevelIdMap = new Map<string, string>();
        const wardIdMap = new Map<string, string>();

        for (const center of constData.PollingCenters) {
            // LocalLevel
            const llKey = center.Municipality;
            let localLevelId = localLevelIdMap.get(llKey);
            if (!localLevelId) {
                localLevelId = randomUUID();
                localLevelIdMap.set(llKey, localLevelId);
                localLevelValues.push(
                    `('${localLevelId}', '${esc(center.Municipality)}', '${constituencyId}', '${now}', '${now}')`
                );
            }

            // Ward
            const wardNum = parseInt(center.Ward, 10) || 0;
            const wardKey = `${llKey}_${wardNum}`;
            let wardId = wardIdMap.get(wardKey);
            if (!wardId) {
                wardId = randomUUID();
                wardIdMap.set(wardKey, wardId);
                wardValues.push(
                    `('${wardId}', ${wardNum}, '${localLevelId}', '${now}', '${now}')`
                );
            }

            // Polling Station
            const stationId = randomUUID();
            stationValues.push(
                `('${stationId}', '${esc(center.PollingCenterName)}', '${wardId}', '${now}', '${now}')`
            );

            // Default booth
            const boothId = randomUUID();
            boothValues.push(
                `('${boothId}', 'क', 0, '${stationId}', '${now}', '${now}')`
            );
        }
    }

    // Batch insert all geography tables
    const batchInsert = async (table: string, cols: string, values: string[], label: string) => {
        const CHUNK_SIZE = 200;
        for (let i = 0; i < values.length; i += CHUNK_SIZE) {
            const chunk = values.slice(i, i + CHUNK_SIZE);
            await prisma.$executeRawUnsafe(
                `INSERT INTO "${table}" (${cols}) VALUES ${chunk.join(",\n")}`
            );
        }
        console.log(`  ✅ ${values.length} ${label}`);
    };

    await batchInsert("provinces", '"id","name","nameEn","number","createdAt","updatedAt"', provinceValues, "provinces");
    await batchInsert("districts", '"id","name","provinceId","createdAt","updatedAt"', districtValues, "districts");
    await batchInsert("constituencies", '"id","number","label","districtId","createdAt","updatedAt"', constituencyValues, "constituencies");
    await batchInsert("local_levels", '"id","name","constituencyId","createdAt","updatedAt"', localLevelValues, "local levels");
    await batchInsert("wards", '"id","wardNumber","localLevelId","createdAt","updatedAt"', wardValues, "wards");
    await batchInsert("polling_stations", '"id","name","wardId","createdAt","updatedAt"', stationValues, "polling stations");
    await batchInsert("polling_booths", '"id","boothNumber","totalRegisteredVoters","pollingStationId","createdAt","updatedAt"', boothValues, "polling booths");

    // ── Step 3: Seed Candidates ──
    console.log("\n👤 Step 3: Seeding candidates...");
    const candidateData = JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf-8"));
    const candidateValues: string[] = [];
    let skippedCount = 0;

    for (const constCands of candidateData.Constituencies) {
        const constKey = `${constCands.District}_${String(constCands.ConstituencyNumber).padStart(2, "0")}`;
        const constituencyId = constituencyIdMap.get(constKey);

        if (!constituencyId) {
            skippedCount += constCands.TotalCandidates;
            continue;
        }

        for (let i = 0; i < constCands.Candidates.length; i++) {
            const c = constCands.Candidates[i];
            const isMajor = MAJOR_PARTIES.includes(c.Party);
            const displayOrder = isMajor ? MAJOR_PARTIES.indexOf(c.Party) + 1 : 100 + i;
            const id = randomUUID();

            candidateValues.push(
                `('${id}', ${c.CandidateID}, '${esc(c.Name)}', ${c.Age || "NULL"}, ${c.Gender ? "'" + esc(c.Gender) + "'" : "NULL"}, '${esc(c.Party)}', ${c.Symbol ? "'" + esc(c.Symbol) + "'" : "NULL"}, '${esc(c.SymbolImageURL)}', '${esc(c.SymbolImageFile)}', ${c.Qualification ? "'" + esc(c.Qualification) + "'" : "NULL"}, ${c.Address ? "'" + esc(c.Address) + "'" : "NULL"}, '${constituencyId}', ${isMajor}, ${displayOrder}, '${now}', '${now}')`
            );
        }
    }

    await batchInsert(
        "candidates",
        '"id","externalId","name","age","gender","partyName","symbol","electionSymbolUrl","symbolImageFile","qualification","address","constituencyId","isPinned","displayOrder","createdAt","updatedAt"',
        candidateValues,
        "candidates"
    );
    if (skippedCount > 0) console.log(`  ⚠️ ${skippedCount} candidates skipped`);

    // ── Summary ──
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seed complete!");
    console.log(`  Provinces:      ${provinceValues.length}`);
    console.log(`  Districts:      ${districtValues.length}`);
    console.log(`  Constituencies: ${constituencyValues.length}`);
    console.log(`  Local Levels:   ${localLevelValues.length}`);
    console.log(`  Wards:          ${wardValues.length}`);
    console.log(`  Stations:       ${stationValues.length}`);
    console.log(`  Booths:         ${boothValues.length}`);
    console.log(`  Parties:        ${partyValues.length}`);
    console.log(`  Candidates:     ${candidateValues.length}`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
