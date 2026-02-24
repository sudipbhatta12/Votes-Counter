import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_AGENTS_PER_CONSTITUENCY = 5;

/**
 * GET /api/agents — List all agents with constituency info
 * Query params: ?constituencyId=xxx or ?search=xxx
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const constituencyId = searchParams.get("constituencyId");
        const search = searchParams.get("search");

        const where: Record<string, unknown> = {};
        if (constituencyId) where.constituencyId = constituencyId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { constituency: { label: { contains: search, mode: "insensitive" } } },
            ];
        }

        const agents = await prisma.agent.findMany({
            where,
            include: {
                constituency: {
                    include: {
                        district: { include: { province: true } },
                    },
                },
            },
            orderBy: [{ constituency: { label: "asc" } }, { phone: "asc" }],
        });

        // Return agents with their plain PIN (stored in pinHash for demo)
        const result = agents.map((a) => ({
            id: a.id,
            name: a.name,
            phone: a.phone,
            pin: a.pinHash, // In production this would NOT be exposed
            role: a.role,
            isActive: a.isActive,
            constituencyId: a.constituencyId,
            constituencyLabel: a.constituency?.label || "",
            districtName: a.constituency?.district?.name || "",
            provinceName: a.constituency?.district?.province?.name || "",
            provinceNumber: a.constituency?.district?.province?.number || 0,
            lastLoginAt: a.lastLoginAt,
            createdAt: a.createdAt,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Agent list error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/agents — Add a single agent to a constituency
 * Body: { constituencyId, name? }
 * Enforces max 5 agents per constituency
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { constituencyId, name } = body;

        if (!constituencyId) {
            return NextResponse.json(
                { success: false, message: "Constituency ID required" },
                { status: 400 }
            );
        }

        // Check current agent count for this constituency
        const count = await prisma.agent.count({
            where: { constituencyId, isActive: true },
        });

        if (count >= MAX_AGENTS_PER_CONSTITUENCY) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Maximum ${MAX_AGENTS_PER_CONSTITUENCY} agents per constituency reached`,
                },
                { status: 400 }
            );
        }

        // Get constituency info for naming
        const constituency = await prisma.constituency.findUnique({
            where: { id: constituencyId },
        });

        if (!constituency) {
            return NextResponse.json(
                { success: false, message: "Constituency not found" },
                { status: 404 }
            );
        }

        // Find next available phone number
        const allPhones = await prisma.agent.findMany({
            select: { phone: true },
        });
        const phoneSet = new Set(allPhones.map((a) => a.phone));
        let phone = "10001";
        while (phoneSet.has(phone)) {
            phone = String(parseInt(phone) + 1);
        }

        const pin = String(Math.floor(1000 + Math.random() * 9000));
        const suffix = count > 0 ? `-${String.fromCharCode(66 + count - 1)}` : ""; // B, C, D, E

        const agent = await prisma.agent.create({
            data: {
                name: name || `Agent ${constituency.label}${suffix}`,
                phone,
                pinHash: pin,
                role: "FIELD_AGENT",
                constituencyId,
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                phone,
                pin,
                constituency: constituency.label,
            },
        });
    } catch (error) {
        console.error("Agent create error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/agents — Deactivate an agent
 * Body: { agentId }
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId } = body;

        if (!agentId) {
            return NextResponse.json(
                { success: false, message: "Agent ID required" },
                { status: 400 }
            );
        }

        await prisma.agent.update({
            where: { id: agentId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Agent deactivate error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
