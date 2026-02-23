import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/data/candidates?constituencyId=xxx
 * Returns all candidates for a constituency, sorted by displayOrder (pinned first).
 */
export async function GET(request: NextRequest) {
    const constituencyId = request.nextUrl.searchParams.get("constituencyId");

    if (!constituencyId) {
        return NextResponse.json(
            { error: "constituencyId is required" },
            { status: 400 }
        );
    }

    try {
        const candidates = await prisma.candidate.findMany({
            where: { constituencyId },
            orderBy: [{ isPinned: "desc" }, { displayOrder: "asc" }],
            select: {
                id: true,
                externalId: true,
                name: true,
                partyName: true,
                symbol: true,
                electionSymbolUrl: true,
                symbolImageFile: true,
                isPinned: true,
                displayOrder: true,
                constituencyId: true,
            },
        });

        return NextResponse.json(candidates);
    } catch (error) {
        console.error("Failed to fetch candidates:", error);
        return NextResponse.json(
            { error: "Failed to fetch candidates" },
            { status: 500 }
        );
    }
}
