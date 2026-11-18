import { PrismaPg } from "@prisma/adapter-pg";
import { PAYMENT_PLANS } from "@immerse/shared";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

async function seedPlans() {
  try {
    for (const { slug, name, priceIdr, dailyCredits } of PAYMENT_PLANS) {
      await prisma.plan.upsert({
        where: { slug },
        update: {
          name,
          priceIdr,
          dailyCredits,
          isActive: true,
        },
        create: {
          slug,
          name,
          priceIdr,
          dailyCredits,
          features: [],
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedPlans().catch((error: unknown) => {
  console.error("Failed to seed plans:", error);
  process.exitCode = 1;
});
