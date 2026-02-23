import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/data/stations?constituencyId=xxx
 * Returns all polling stations for a constituency, grouped by ward/local level.
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
        const stations = await prisma.pollingStation.findMany({
            where: {
                ward: {
                    localLevel: {
                        constituencyId,
                    },
                },
            },
            include: {
                ward: {
                    include: {
                        localLevel: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        // Transform for the client
        const result = stations.map((s) => ({
            id: s.id,
            name: s.name,
            wardId: s.wardId,
            wardNumber: s.ward.wardNumber,
            localLevelName: s.ward.localLevel.name,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch stations:", error);
        return NextResponse.json(
            { error: "Failed to fetch stations" },
            { status: 500 }
        );
    }
}
