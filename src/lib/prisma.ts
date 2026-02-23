import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Lazy Prisma Client singleton with Neon adapter for Next.js
// PrismaClient is only instantiated when first accessed (at request time),
// NOT at module import time (which happens during build).

const globalForPrisma = globalThis as unknown as {
    _prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
    if (!globalForPrisma._prisma) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL environment variable is not set");
        }

        const adapter = new PrismaNeon({ connectionString });
        globalForPrisma._prisma = new PrismaClient({ adapter });
    }
    return globalForPrisma._prisma;
}

// Export a proxy that lazily creates the PrismaClient on first property access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop: string | symbol) {
        const client = getPrismaClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (client as any)[prop];
        if (typeof value === "function") {
            return value.bind(client);
        }
        return value;
    },
});
