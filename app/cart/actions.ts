"use server";

import { getProductsByIds } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

export async function fetchCartProducts(ids: string[]): Promise<Product[]> {
  return getProductsByIds(ids);
}
