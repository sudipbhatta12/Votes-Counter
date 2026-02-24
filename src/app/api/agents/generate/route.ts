import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/agents/generate
 * Bulk-generate one agent per constituency (165 total).
 * Skips constituencies that already have agents.
 * Phone: 10001–10165, PIN: random 4-digit
 */
export async function POST() {
    try {
        // Get all constituencies ordered by district + number
        const constituencies = await prisma.constituency.findMany({
            orderBy: [{ districtId: "asc" }, { number: "asc" }],
            include: { district: true },
        });

        if (constituencies.length === 0) {
            return NextResponse.json(
                { success: false, message: "No constituencies found. Run db:seed first." },
                { status: 400 }
            );
        }

        // Get existing agents to avoid duplicates
        const existingAgents = await prisma.agent.findMany({
            select: { phone: true, constituencyId: true },
        });
        const existingPhones = new Set(existingAgents.map((a) => a.phone));
        const constituenciesWithAgents = new Set(
            existingAgents.filter((a) => a.constituencyId).map((a) => a.constituencyId!)
        );

        const created: Array<{
            name: string;
            phone: string;
            pin: string;
            constituency: string;
            constituencyId: string;
        }> = [];
        let skipped = 0;

        for (let i = 0; i < constituencies.length; i++) {
            const c = constituencies[i];

            // Skip if this constituency already has an agent
            if (constituenciesWithAgents.has(c.id)) {
                skipped++;
                continue;
            }

            // Generate phone number (10001, 10002, ...)
            let phone = String(10001 + i);
            // If phone already taken, find next available
            while (existingPhones.has(phone)) {
                phone = String(parseInt(phone) + 1000);
            }

            // Random 4-digit PIN
            const pin = String(Math.floor(1000 + Math.random() * 9000));

            const agent = await prisma.agent.create({
                data: {
                    name: `Agent ${c.label}`,
                    phone,
                    pinHash: pin, // Plain text for demo
                    role: "FIELD_AGENT",
                    constituencyId: c.id,
                    isActive: true,
                },
            });

            existingPhones.add(phone);
            created.push({
                name: agent.name,
                phone,
                pin,
                constituency: c.label,
                constituencyId: c.id,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Created ${created.length} agents, skipped ${skipped} (already had agents)`,
            total: created.length,
            skipped,
            agents: created,
        });
    } catch (error) {
        console.error("Agent generation error:", error);
        return NextResponse.json(
            { success: false, message: "Server error during agent generation" },
            { status: 500 }
        );
    }
}
