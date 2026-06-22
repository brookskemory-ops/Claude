import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Example/template products to demonstrate the structure. Replace or remove these
// from /admin and add your real catalog. All entries are Research Use Only.
const products = [
  {
    slug: "example-bpc-157",
    name: "BPC-157",
    tagline: "[EXAMPLE] Body Protection Compound — research peptide",
    category: "Regenerative",
    description:
      "Example catalog entry. Lyophilized research peptide for in-vitro and laboratory research use only. Not for human or veterinary use. Replace this product with your own from the admin panel.",
    purity: "≥99%",
    form: "Lyophilized powder",
    casNumber: "137525-51-0",
    molecularFormula: "C62H98N16O22",
    molecularWeight: "1419.6 g/mol",
    sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    storage: "Store lyophilized at -20°C, protected from light.",
    coaUrl: "",
    featured: true,
    imageKey: "vial",
    variants: [
      { label: "5mg", sku: "BPC157-5", price: 39.99, stock: 60, sortOrder: 0 },
      { label: "10mg", sku: "BPC157-10", price: 64.99, salePrice: 54.99, stock: 40, sortOrder: 1 },
    ],
  },
  {
    slug: "example-tb-500",
    name: "TB-500 (Thymosin β4 Fragment)",
    tagline: "[EXAMPLE] research peptide",
    category: "Regenerative",
    description:
      "Example catalog entry. Lyophilized research peptide for laboratory research use only. Not for human or veterinary use. Replace with your own products via the admin panel.",
    purity: "≥98%",
    form: "Lyophilized powder",
    casNumber: "77591-33-4",
    molecularFormula: "C212H350N56O78S",
    molecularWeight: "4963.4 g/mol",
    sequence: "",
    storage: "Store lyophilized at -20°C, protected from light.",
    coaUrl: "",
    featured: true,
    imageKey: "vial",
    variants: [
      { label: "5mg", sku: "TB500-5", price: 44.99, stock: 35, sortOrder: 0 },
      { label: "10mg", sku: "TB500-10", price: 74.99, stock: 8, sortOrder: 1 },
    ],
  },
  {
    slug: "example-ghk-cu",
    name: "GHK-Cu",
    tagline: "[EXAMPLE] Copper Peptide — research grade",
    category: "Cosmetic",
    description:
      "Example catalog entry. Lyophilized copper tripeptide for laboratory research use only. Not for human or veterinary use. Replace with your own products via the admin panel.",
    purity: "≥99%",
    form: "Lyophilized powder",
    casNumber: "49557-75-7",
    molecularFormula: "C14H24N6O4·Cu",
    molecularWeight: "403.9 g/mol",
    sequence: "Gly-His-Lys (Cu²⁺)",
    storage: "Store lyophilized at -20°C, protected from light.",
    coaUrl: "",
    featured: true,
    imageKey: "vial",
    variants: [
      { label: "50mg", sku: "GHKCU-50", price: 34.99, stock: 50, sortOrder: 0 },
      { label: "100mg", sku: "GHKCU-100", price: 54.99, stock: 0, sortOrder: 1 },
    ],
  },
  {
    slug: "example-bacteriostatic-water",
    name: "Bacteriostatic Water",
    tagline: "[EXAMPLE] Lab reconstitution solvent",
    category: "Lab Supplies",
    description:
      "Example catalog entry. Laboratory-grade solvent for research reconstitution use only. Not for human or veterinary use.",
    purity: "USP grade",
    form: "Sterile solution",
    casNumber: "7732-18-5",
    molecularFormula: "H2O (0.9% benzyl alcohol)",
    molecularWeight: "",
    sequence: "",
    storage: "Store at room temperature.",
    coaUrl: "",
    featured: false,
    imageKey: "solvent",
    variants: [
      { label: "10mL", sku: "BACWATER-10", price: 12.99, stock: 200, sortOrder: 0 },
      { label: "30mL", sku: "BACWATER-30", price: 24.99, stock: 120, sortOrder: 1 },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  const now = new Date();
  await db.user.upsert({
    where: { email: "admin@axevia.com" },
    update: {},
    create: {
      email: "admin@axevia.com",
      name: "Axevia Admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      emailVerified: now,
    },
  });

  const customer = await db.user.upsert({
    where: { email: "researcher@example.com" },
    update: {},
    create: {
      email: "researcher@example.com",
      name: "Dr. Jordan Rivera",
      passwordHash: await bcrypt.hash("password123", 10),
      role: "CUSTOMER",
      emailVerified: now,
    },
  });

  await db.address.deleteMany({ where: { userId: customer.id } });
  await db.address.create({
    data: {
      userId: customer.id,
      label: "Lab",
      recipient: "Rivera Research Lab",
      line1: "500 Science Park Dr",
      city: "Austin",
      state: "TX",
      zip: "78701",
      country: "United States",
      isDefault: true,
    },
  });

  for (const p of products) {
    const { variants, ...data } = p;
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
    await db.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of variants) {
      await db.productVariant.create({ data: { ...v, productId: product.id } });
    }
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
  console.log("  Customer: researcher@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
