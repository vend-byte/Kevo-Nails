import { PrismaClient } from "@prisma/client";

// Prevents creating a new Prisma Client on every hot-reload in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

/**
 * Neon's free-tier compute auto-suspends after a few minutes of inactivity.
 * The first query after any idle gap can hit a closed/cold connection and
 * fail with "Can't reach database server". This extension transparently
 * retries once after a short delay, which is enough time for Neon to wake
 * its compute back up — so normal usage never sees this as a user-facing
 * error, and only genuine outages surface after the retry also fails.
 */
function isTransientConnectionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code;

  // Prisma error codes for connection-level problems:
  // P1001 can't reach server, P1002/P1008 timed out, P1017 server closed
  // the connection, P2024 timed out fetching a connection from the pool.
  const TRANSIENT_CODES = ["P1001", "P1002", "P1008", "P1017", "P2024"];
  if (code && TRANSIENT_CODES.includes(code)) return true;

  return (
    message.includes("Can't reach database server") ||
    message.includes("Error in PostgreSQL connection") ||
    message.includes("Connection closed") ||
    message.includes("Server has closed the connection") ||
    message.includes("Connection terminated") ||
    message.includes("connection") && message.toLowerCase().includes("closed") ||
    message.includes("kind: Closed")
  );
}

export const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ args, query }) {
      const delaysMs = [2000, 4000, 8000];
      let lastError: unknown;

      for (let attempt = 0; attempt <= delaysMs.length; attempt++) {
        try {
          return await query(args);
        } catch (error) {
          lastError = error;
          if (!isTransientConnectionError(error) || attempt === delaysMs.length) {
            throw error;
          }
          // Force a fresh connection rather than retrying on the same
          // (dead) one — Prisma's engine can otherwise keep reusing a
          // closed connection across retries within the same process.
          await basePrisma.$disconnect();
          await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
        }
      }

      throw lastError;
    },
  },
});
