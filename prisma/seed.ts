import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const products = [
  {
    slug: "apex-whey-protein",
    name: "Apex Whey Protein",
    tagline: "25g protein per scoop",
    category: "Protein",
    price: 54.99,
    salePrice: 44.99,
    saleEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    description:
      "A clean, fast-absorbing whey protein isolate built for lean muscle and recovery. Low in sugar, mixes instantly, and finishes smooth.",
    ingredients:
      "Whey Protein Isolate, Natural Cocoa, Sunflower Lecithin, Sea Salt, Stevia Leaf Extract.",
    servings: "30 servings",
    stock: 120,
    featured: true,
    imageKey: "protein",
  },
  {
    slug: "ignite-pre-workout",
    name: "Ignite Pre-Workout",
    tagline: "Clean energy, zero crash",
    category: "Pre-Workout",
    price: 42.0,
    description:
      "Sharp focus and sustained energy without the jitters. Formulated with caffeine, L-citrulline, and beta-alanine for serious training sessions.",
    ingredients:
      "L-Citrulline, Beta-Alanine, Caffeine Anhydrous, L-Theanine, Taurine, Electrolyte Blend.",
    servings: "25 servings",
    stock: 80,
    featured: true,
    imageKey: "preworkout",
  },
  {
    slug: "core-creatine-monohydrate",
    name: "Core Creatine Monohydrate",
    tagline: "5g micronized creatine",
    category: "Creatine",
    price: 29.99,
    description:
      "Pure micronized creatine monohydrate for strength, power, and lean mass. Unflavored and dissolves cleanly into any drink.",
    ingredients: "100% Micronized Creatine Monohydrate.",
    servings: "60 servings",
    stock: 200,
    featured: true,
    imageKey: "creatine",
  },
  {
    slug: "daily-multivitamin",
    name: "Daily Multivitamin",
    tagline: "Complete A–Z coverage",
    category: "Vitamins",
    price: 24.99,
    description:
      "A comprehensive daily multivitamin covering essential vitamins and minerals to fill nutritional gaps and support overall wellness.",
    ingredients:
      "Vitamins A, C, D3, E, K, B-Complex, Magnesium, Zinc, Selenium, Iodine.",
    servings: "90 capsules",
    stock: 150,
    featured: false,
    imageKey: "vitamins",
  },
  {
    slug: "restore-recovery-blend",
    name: "Restore Recovery Blend",
    tagline: "BCAA + electrolytes",
    category: "Recovery",
    price: 38.5,
    salePrice: 30.0,
    saleEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    description:
      "Refuel and rehydrate post-training with a balanced ratio of branched-chain amino acids and replenishing electrolytes.",
    ingredients:
      "L-Leucine, L-Isoleucine, L-Valine, Coconut Water Powder, Potassium, Sodium.",
    servings: "40 servings",
    stock: 60,
    featured: true,
    imageKey: "recovery",
  },
  {
    slug: "vital-greens",
    name: "Vital Greens",
    tagline: "Superfood greens blend",
    category: "Greens",
    price: 49.0,
    description:
      "A nutrient-dense blend of greens, adaptogens, and probiotics to support digestion, energy, and daily nutrition in one scoop.",
    ingredients:
      "Spirulina, Chlorella, Wheatgrass, Spinach, Ashwagandha, Probiotic Blend, Digestive Enzymes.",
    servings: "30 servings",
    stock: 45,
    featured: false,
    imageKey: "greens",
  },
  {
    slug: "casein-night-protein",
    name: "Casein Night Protein",
    tagline: "Slow-release overnight",
    category: "Protein",
    price: 52.0,
    description:
      "A slow-digesting micellar casein that feeds muscles through the night to support overnight recovery and reduce muscle breakdown.",
    ingredients:
      "Micellar Casein, Natural Vanilla, Sunflower Lecithin, Sea Salt, Stevia Leaf Extract.",
    servings: "28 servings",
    stock: 8,
    featured: false,
    imageKey: "protein",
  },
  {
    slug: "omega-3-fish-oil",
    name: "Omega-3 Fish Oil",
    tagline: "High-potency EPA/DHA",
    category: "Vitamins",
    price: 27.5,
    description:
      "Ultra-pure omega-3 fish oil delivering a potent dose of EPA and DHA to support heart, brain, and joint health.",
    ingredients: "Fish Oil Concentrate (EPA 800mg, DHA 600mg), Vitamin E.",
    servings: "120 softgels",
    stock: 0,
    featured: false,
    imageKey: "vitamins",
  },
];

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("password123", 10);

  await db.user.upsert({
    where: { email: "admin@axevia.com" },
    update: {},
    create: {
      email: "admin@axevia.com",
      name: "Axevia Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customer = await db.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "Jordan Rivera",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  await db.address.deleteMany({ where: { userId: customer.id } });
  await db.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      recipient: "Jordan Rivera",
      line1: "123 Granite Ave",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "United States",
      isDefault: true,
    },
  });

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", percentOff: 10, active: true },
  });

  await db.coupon.upsert({
    where: { code: "AXEVIA20" },
    update: {},
    create: { code: "AXEVIA20", percentOff: 20, active: true },
  });

  console.log("Seed complete.");
  console.log("  Admin:    admin@axevia.com / admin123");
  console.log("  Customer: customer@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
