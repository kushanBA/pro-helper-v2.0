import { prisma } from "../../database/client.ts";

export const categorySummarySelect = { id: true, name: true, slug: true } as const;

export function listActiveCategories() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    select: { ...categorySummarySelect, description: true },
    orderBy: { name: "asc" },
  });
}

export function countActiveCategoriesByIds(ids: string[]): Promise<number> {
  return prisma.serviceCategory.count({ where: { id: { in: ids }, isActive: true } });
}
