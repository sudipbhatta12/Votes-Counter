# Nirwachan Live 2026

Real-time vote counting and verification system for Nepal's Federal Parliamentary Elections 2082 (2026 AD). Built for mobile field agents and HQ administrators.

---

## Overview

Nirwachan Live is a full-stack election data pipeline:

1. **Mobile agents** at polling stations enter vote tallies booth-by-booth
2. **Data syncs** to a central PostgreSQL database (works offline via IndexedDB)
3. **HQ administrators** review, approve, dispute, or reject each submission through a split-screen dashboard

The system supports both **FPTP** (First Past The Post / direct candidate) and **PR** (Proportional Representation / party list) vote counting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL on Neon (Serverless) |
| ORM | Prisma v7 with Neon adapter |
| State Management | Zustand |
| Offline Storage | Dexie.js (IndexedDB) |
| Styling | Tailwind CSS + custom design tokens |
| Font | Noto Sans Devanagari |

---

## Features

### Mobile Agent Flow

- Phone + PIN authentication against the database
- Wizard-based data entry: Login > Election Type > Location > Tally > Photo Upload > Confirmation
- Ward > Polling Station > Booth cascading selection
- Mixed ballot box support (multiple booths counted together)
- Real-time math engine that validates vote totals before submission
- Unlimited photo attachments for Muchulka (physical tally sheet) documentation
- Offline-first with background sync when connectivity returns

### HQ Admin Dashboard

- Real-time KPI cards: Total, Pending, Approved, Disputed, Rejected
- Filterable submissions table with agent info, constituency, status
- Split-screen review page: typed data on left, Muchulka photos on right
- Approve / Reject / Dispute actions with mandatory notes for rejections
- Pending review queue and dispute map pages

### Data Pipeline

- 5 REST API endpoints for live data (candidates, stations, booths, wards, parties)
- Vote submission API with batch processing
- Background sync engine for offline submissions

---

## Database

The database contains 16 models with the following seeded data:

| Table | Records |
|---|---|
| Provinces | 7 |
| Districts | 77 |
| Constituencies | 165 |
| Local Levels | 872 |
| Wards | 6,743 |
| Polling Stations | 23,112 |
| Polling Booths | 23,112 |
| Parties | 69 |
| Candidates | 3,395 |

Data is sourced from the Election Commission of Nepal and covers all 165 federal constituencies across 7 provinces.

---

## Project Structure

```
nirwachan-app/
  prisma/
    schema.prisma          # 16-model database schema
    seed.ts                # Batch insert seed script (~2 min)
    seed-agent.ts          # Demo agent seeder
    migrations/            # Prisma migration files
  src/
    app/
      (mobile-agent)/      # Agent wizard flow (6 steps)
        login/
        select-type/
        select-location/
        tally/
        upload/
        confirmation/
      (desktop-admin)/     # HQ admin dashboard
        dashboard/
        review/[id]/
        pending/
        disputes/
        export/
      api/
        auth/              # Agent authentication
        data/               # 5 data endpoints
        votes/              # Vote submission
        sync/               # Background sync
    components/
      wizard/              # WizardShell with animated transitions
      tally/               # CandidateTallyRow, MathEngineFooter
      location/            # LocationSelector (cascading sheets)
      upload/              # MuchulkaCapture (multi-photo)
      ui/                  # OfflineBanner
    store/
      electionStore.ts     # Zustand state management
    lib/
      prisma.ts            # Lazy singleton with Neon adapter
      db.ts                # Dexie.js IndexedDB schema
      syncEngine.ts        # Background sync logic
      types.ts             # TypeScript type definitions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database (or any PostgreSQL instance)

### Installation

```bash
git clone https://github.com/sudipbhatta12/Votes-Counter.git
cd Votes-Counter
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/dbname?sslmode=require"
```

- `DATABASE_URL` -- Pooled connection string (for the application at runtime)
- `DIRECT_URL` -- Direct connection string (for Prisma CLI: migrations, introspection)

### Database Setup

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed the database (~2 minutes)
npx tsx prisma/seed.ts

# Create a demo agent
npx tsx prisma/seed-agent.ts
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Demo Credentials

- **Phone:** 9841000001
- **PIN:** 1234
- **Agent:** Ram Bahadur Thapa, assigned to Ilam-1

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth` | Agent login (phone + PIN) |
| GET | `/api/data/candidates?constituencyId=X` | Candidates for a constituency |
| GET | `/api/data/stations?wardId=X` | Polling stations for a ward |
| GET | `/api/data/booths?stationId=X` | Booths for a station |
| GET | `/api/data/wards?constituencyId=X` | Wards for a constituency |
| GET | `/api/data/parties` | All registered parties |
| POST | `/api/votes` | Submit vote tally |
| POST | `/api/sync` | Background sync for offline submissions |

---

## Architecture

```
Mobile Agent (Phone)              HQ Admin (Desktop)
    |                                  |
    v                                  v
[Wizard Flow] --> [IndexedDB] --> [Sync Engine] --> [Next.js API] --> [Neon PostgreSQL]
                                                                          |
                                                                          v
                                                              [Dashboard + Review UI]
```

Key design decisions:

- **Offline-first:** All data cached in IndexedDB via Dexie.js. Submissions queued locally and synced when connectivity returns.
- **Lazy Prisma client:** PrismaClient instantiated on first access, not at import time. Prevents build failures in Next.js edge environments.
- **Batch seeding:** Seed script uses raw SQL batch INSERTs (200 rows per batch) instead of individual upserts. Completes in ~2 minutes instead of 60+.
- **File-based photo storage:** Photos stored as File objects in component state, not as base64 strings in Zustand. Prevents memory-related crashes.
- **Mixed ballot box support:** Data model supports counting votes from multiple booths together when ballot boxes are combined at the ward level.

---

## License

Private -- for internal use by the election monitoring team.
