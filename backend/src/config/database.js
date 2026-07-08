import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    await prisma.$executeRawUnsafe("SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci");
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch (error) {
    await prisma.$disconnect().catch(() => {});
    throw error;
  }
}

export default prisma;
