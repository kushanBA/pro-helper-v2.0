import { prisma } from "../src/database/client.ts";

// Single source of truth for service categories. isActive=false soft-hides a
// category from the app without deleting it (so existing data is preserved).
// Re-running this seed is safe: it upserts by slug.
type CategorySeed = { name: string; slug: string; description?: string; isActive: boolean };

const categories: CategorySeed[] = [
  { name: "Plumbing", slug: "plumbing", isActive: true },
  { name: "Electrical", slug: "electrical", isActive: true },
  { name: "Automotive", slug: "automotive", description: "Vehicle repair and servicing", isActive: true },
  { name: "Appliance Repair", slug: "appliance-repair", isActive: true },
  { name: "Carpentry", slug: "carpentry", isActive: true },
  { name: "Painting", slug: "painting", isActive: true },
  { name: "Cleaning", slug: "cleaning", isActive: true },
  // Soft-hidden for now (kept in DB, not shown in the app):
  { name: "Air Conditioning", slug: "air-conditioning", isActive: false },
  { name: "Masonry", slug: "masonry", isActive: false },
];

async function main() {
  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, isActive: category.isActive },
      create: {
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        ...(category.description ? { description: category.description } : {}),
      },
    });
  }

  const all = await prisma.serviceCategory.findMany({
    select: { name: true, slug: true, isActive: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  console.log("Service categories:");
  for (const c of all) console.log(`  - ${c.name} (${c.slug}) ${c.isActive ? "[active]" : "[hidden]"}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
