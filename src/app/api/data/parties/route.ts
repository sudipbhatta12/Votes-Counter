import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/data/parties
 * Returns all parties with their symbol info.
 */
export async function GET() {
    try {
        const parties = await prisma.party.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                nameShort: true,
                electionSymbolUrl: true,
                symbolImageFile: true,
            },
        });

        return NextResponse.json(parties);
    } catch (error) {
        console.error("Failed to fetch parties:", error);
        return NextResponse.json(
            { error: "Failed to fetch parties" },
            { status: 500 }
        );
    }
}
