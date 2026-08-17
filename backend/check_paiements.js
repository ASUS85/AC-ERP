import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const paiements = await prisma.paiement.findMany();
  console.log("Total paiements in DB:", paiements.length);
  if (paiements.length > 0) {
    console.log("First paiement:", paiements[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
