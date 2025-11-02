import { prisma } from "../src/config/prisma.ts";

async function deleteGoldenSets() {
  try {
    console.log("Deleting all golden set entries...");
    const deleted = await prisma.goldenSet.deleteMany({});
    console.log(`Deleted ${deleted.count} golden set entries.`);
  } catch (error) {
    console.error("Error deleting golden set entries:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteGoldenSets();
