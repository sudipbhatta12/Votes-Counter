-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('FPTP', 'PR');

-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('FIELD_AGENT', 'ADMIN', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constituencies" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "labelEn" TEXT,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constituencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "constituencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "wardNumber" INTEGER NOT NULL,
    "localLevelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polling_stations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polling_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polling_booths" (
    "id" TEXT NOT NULL,
    "boothNumber" TEXT NOT NULL,
    "totalRegisteredVoters" INTEGER NOT NULL,
    "pollingStationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polling_booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "partyName" TEXT NOT NULL,
    "symbol" TEXT,
    "electionSymbolUrl" TEXT,
    "symbolImageFile" TEXT,
    "qualification" TEXT,
    "address" TEXT,
    "constituencyId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 999,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameShort" TEXT,
    "electionSymbolUrl" TEXT,
    "symbolImageFile" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "role" "AgentRole" NOT NULL DEFAULT 'FIELD_AGENT',
    "constituencyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_batches" (
    "id" TEXT NOT NULL,
    "isMixedBox" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vote_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_batch_booths" (
    "id" TEXT NOT NULL,
    "voteBatchId" TEXT NOT NULL,
    "pollingBoothId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_batch_booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fptp_vote_records" (
    "id" TEXT NOT NULL,
    "voteBatchId" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "totalCastVotes" INTEGER NOT NULL,
    "invalidVotes" INTEGER NOT NULL,
    "muchulkaImageUrl" TEXT,
    "muchulkaImageKey" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "disputeNote" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "submittedById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOfflineSubmission" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fptp_vote_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr_vote_records" (
    "id" TEXT NOT NULL,
    "voteBatchId" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "totalCastVotes" INTEGER NOT NULL,
    "invalidVotes" INTEGER NOT NULL,
    "muchulkaImageUrl" TEXT,
    "muchulkaImageKey" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "disputeNote" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "submittedById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOfflineSubmission" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pr_vote_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_vote_tallies" (
    "id" TEXT NOT NULL,
    "fptpVoteRecordId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "candidate_vote_tallies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_vote_tallies" (
    "id" TEXT NOT NULL,
    "prVoteRecordId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "party_vote_tallies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_number_key" ON "provinces"("number");

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_provinceId_key" ON "districts"("name", "provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "constituencies_number_districtId_key" ON "constituencies"("number", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "local_levels_name_constituencyId_key" ON "local_levels"("name", "constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "wards_wardNumber_localLevelId_key" ON "wards"("wardNumber", "localLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "polling_booths_boothNumber_pollingStationId_key" ON "polling_booths"("boothNumber", "pollingStationId");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_externalId_key" ON "candidates"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "parties_name_key" ON "parties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agents_phone_key" ON "agents"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "vote_batch_booths_voteBatchId_pollingBoothId_key" ON "vote_batch_booths"("voteBatchId", "pollingBoothId");

-- CreateIndex
CREATE UNIQUE INDEX "fptp_vote_records_voteBatchId_key" ON "fptp_vote_records"("voteBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "pr_vote_records_voteBatchId_key" ON "pr_vote_records"("voteBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_vote_tallies_fptpVoteRecordId_candidateId_key" ON "candidate_vote_tallies"("fptpVoteRecordId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "party_vote_tallies_prVoteRecordId_partyId_key" ON "party_vote_tallies"("prVoteRecordId", "partyId");

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituencies" ADD CONSTRAINT "constituencies_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_levels" ADD CONSTRAINT "local_levels_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_localLevelId_fkey" FOREIGN KEY ("localLevelId") REFERENCES "local_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_stations" ADD CONSTRAINT "polling_stations_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_booths" ADD CONSTRAINT "polling_booths_pollingStationId_fkey" FOREIGN KEY ("pollingStationId") REFERENCES "polling_stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_batch_booths" ADD CONSTRAINT "vote_batch_booths_voteBatchId_fkey" FOREIGN KEY ("voteBatchId") REFERENCES "vote_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_batch_booths" ADD CONSTRAINT "vote_batch_booths_pollingBoothId_fkey" FOREIGN KEY ("pollingBoothId") REFERENCES "polling_booths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fptp_vote_records" ADD CONSTRAINT "fptp_vote_records_voteBatchId_fkey" FOREIGN KEY ("voteBatchId") REFERENCES "vote_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fptp_vote_records" ADD CONSTRAINT "fptp_vote_records_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fptp_vote_records" ADD CONSTRAINT "fptp_vote_records_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fptp_vote_records" ADD CONSTRAINT "fptp_vote_records_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pr_vote_records" ADD CONSTRAINT "pr_vote_records_voteBatchId_fkey" FOREIGN KEY ("voteBatchId") REFERENCES "vote_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pr_vote_records" ADD CONSTRAINT "pr_vote_records_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pr_vote_records" ADD CONSTRAINT "pr_vote_records_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pr_vote_records" ADD CONSTRAINT "pr_vote_records_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_vote_tallies" ADD CONSTRAINT "candidate_vote_tallies_fptpVoteRecordId_fkey" FOREIGN KEY ("fptpVoteRecordId") REFERENCES "fptp_vote_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_vote_tallies" ADD CONSTRAINT "candidate_vote_tallies_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_vote_tallies" ADD CONSTRAINT "party_vote_tallies_prVoteRecordId_fkey" FOREIGN KEY ("prVoteRecordId") REFERENCES "pr_vote_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_vote_tallies" ADD CONSTRAINT "party_vote_tallies_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
