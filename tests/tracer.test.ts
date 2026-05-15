import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

type CookieEntry = { name: string; value: string };
const cookieJar = new Map<string, CookieEntry>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieJar.get(name),
    set: (name: string, value: string) => {
      cookieJar.set(name, { name, value });
    },
  }),
}));

import { prisma } from "@/lib/prisma";
import { listProducts, getProductBySlug } from "@/lib/db/catalog";
import { addProductToCart, listCartLines } from "@/lib/db/cart";

const SEED_SLUG = "milan-urbana-01";
const SEED_NAME = "Milán Urbana 01";

describe("tracer: catalog → product → add to cart → cart", () => {
  beforeAll(() => {
    cookieJar.clear();
  });

  afterAll(async () => {
    const entry = cookieJar.get("cartUserId");
    if (entry) await prisma.user.delete({ where: { id: entry.value } }).catch(() => {});
    await prisma.$disconnect();
  });

  it("walks the full flow end to end", async () => {
    const products = await listProducts();
    expect(products.some((p) => p.slug === SEED_SLUG)).toBe(true);

    const product = await getProductBySlug(SEED_SLUG);
    expect(product).not.toBeNull();
    expect(product?.name).toBe(SEED_NAME);

    await addProductToCart(SEED_SLUG);

    const lines = await listCartLines();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ name: SEED_NAME, quantity: 1 });
  });
});
