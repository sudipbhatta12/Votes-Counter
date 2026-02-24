import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/data/filters
 * Returns provinces → districts → constituencies for cascading dropdowns
 * Query params: ?provinceId=xxx&districtId=xxx
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const provinceId = searchParams.get("provinceId");
        const districtId = searchParams.get("districtId");

        // Always return provinces
        const provinces = await prisma.province.findMany({
            orderBy: { number: "asc" },
            select: { id: true, name: true, number: true },
        });

        // If province selected, return its districts
        let districts: { id: string; name: string }[] = [];
        if (provinceId) {
            districts = await prisma.district.findMany({
                where: { provinceId },
                orderBy: { name: "asc" },
                select: { id: true, name: true },
            });
        }

        // If district selected, return its constituencies
        let constituencies: { id: string; label: string; number: number }[] = [];
        if (districtId) {
            constituencies = await prisma.constituency.findMany({
                where: { districtId },
                orderBy: { number: "asc" },
                select: { id: true, label: true, number: true },
            });
        }

        return NextResponse.json({ provinces, districts, constituencies });
    } catch (error) {
        console.error("Filter data error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
