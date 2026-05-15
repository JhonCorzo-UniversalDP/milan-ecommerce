import { prisma } from "../prisma";
import type { Product } from "../types";

export async function listProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
  return rows;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });
}
