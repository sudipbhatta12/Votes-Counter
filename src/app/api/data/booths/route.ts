import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/data/booths?stationId=xxx
 * Returns all polling booths for a given station.
 */
export async function GET(request: NextRequest) {
    const stationId = request.nextUrl.searchParams.get("stationId");

    if (!stationId) {
        return NextResponse.json(
            { error: "stationId is required" },
            { status: 400 }
        );
    }

    try {
        const booths = await prisma.pollingBooth.findMany({
            where: { pollingStationId: stationId },
            include: {
                pollingStation: {
                    select: { name: true },
                },
            },
            orderBy: { boothNumber: "asc" },
        });

        const result = booths.map((b) => ({
            id: b.id,
            boothNumber: b.boothNumber,
            totalRegisteredVoters: b.totalRegisteredVoters,
            pollingStationId: b.pollingStationId,
            pollingStationName: b.pollingStation.name,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch booths:", error);
        return NextResponse.json(
            { error: "Failed to fetch booths" },
            { status: 500 }
        );
    }
}
