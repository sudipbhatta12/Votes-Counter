import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/data/wards?constituencyId=xxx
 * Returns all wards for a constituency, grouped by local level.
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
        const wards = await prisma.ward.findMany({
            where: {
                localLevel: {
                    constituencyId,
                },
            },
            include: {
                localLevel: {
                    select: { name: true, type: true },
                },
            },
            orderBy: [
                { localLevel: { name: "asc" } },
                { wardNumber: "asc" },
            ],
        });

        const result = wards.map((w) => ({
            id: w.id,
            wardNumber: w.wardNumber,
            localLevelId: w.localLevelId,
            localLevelName: w.localLevel.name,
            localLevelType: w.localLevel.type,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch wards:", error);
        return NextResponse.json(
            { error: "Failed to fetch wards" },
            { status: 500 }
        );
    }
}
