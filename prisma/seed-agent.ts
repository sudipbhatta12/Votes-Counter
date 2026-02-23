import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
    connectionString: process.env.DIRECT_URL!,
});
const prisma = new PrismaClient({ adapter });

async function seedAgent() {
    // Find the first constituency (Ilam-1)
    const constituency = await prisma.constituency.findFirst({
        where: { label: { contains: "इलाम" } },
    });

    if (!constituency) {
        console.log("No constituency found! Run db:seed first.");
        process.exit(1);
    }

    console.log("Found constituency:", constituency.label);

    // Create demo agent
    const agent = await prisma.agent.upsert({
        where: { phone: "9841000001" },
        update: {
            constituencyId: constituency.id, // Update to new UUID after re-seed
        },
        create: {
            name: "राम बहादुर थापा",
            phone: "9841000001",
            pinHash: "1234", // Plain text for demo — hash in production
            role: "FIELD_AGENT",
            constituencyId: constituency.id,
        },
    });

    console.log("\nDemo agent created:");
    console.log("  Phone: 9841000001");
    console.log("  PIN:   1234");
    console.log("  Name:", agent.name);
    console.log("  Constituency:", constituency.label);
    console.log("  ID:", agent.id);
}

seedAgent()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
