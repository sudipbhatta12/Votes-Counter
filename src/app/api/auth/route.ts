import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phone, pin } = body;

        if (!phone || !pin) {
            return NextResponse.json(
                { success: false, message: "फोन नम्बर र PIN आवश्यक छ" },
                { status: 400 }
            );
        }

        // Find agent by phone
        const agent = await prisma.agent.findUnique({
            where: { phone },
            include: {
                constituency: {
                    include: { district: true },
                },
            },
        });

        if (!agent) {
            return NextResponse.json(
                { success: false, message: "एजेन्ट फेला परेन" },
                { status: 401 }
            );
        }

        // Check PIN (plain-text for demo; use bcrypt in production)
        if (agent.pinHash !== pin) {
            return NextResponse.json(
                { success: false, message: "गलत PIN" },
                { status: 401 }
            );
        }

        if (!agent.isActive) {
            return NextResponse.json(
                { success: false, message: "खाता निष्क्रिय छ" },
                { status: 403 }
            );
        }

        // Update last login
        await prisma.agent.update({
            where: { id: agent.id },
            data: { lastLoginAt: new Date() },
        });

        return NextResponse.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                phone: agent.phone,
                role: agent.role,
                constituencyId: agent.constituencyId,
                constituencyLabel: agent.constituency?.label || "",
            },
        });
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json(
            { success: false, message: "सर्भर त्रुटि" },
            { status: 500 }
        );
    }
}
