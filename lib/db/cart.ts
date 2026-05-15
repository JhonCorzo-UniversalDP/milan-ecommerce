import { cookies } from "next/headers";
import { prisma } from "../prisma";
import type { CartLine } from "../types";

const COOKIE_NAME = "cartUserId";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function getOrCreateAnonymousUserId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) {
    const found = await prisma.user.findUnique({ where: { id: existing }, select: { id: true } });
    if (found) return found.id;
  }
  const user = await prisma.user.create({
    data: { email: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@local` },
    select: { id: true },
  });
  jar.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return user.id;
}

async function getAnonymousUserIdIfExists(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  if (!value) return null;
  const found = await prisma.user.findUnique({ where: { id: value }, select: { id: true } });
  return found?.id ?? null;
}

export async function addProductToCart(slug: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) throw new Error(`Product not found: ${slug}`);
  const userId = await getOrCreateAnonymousUserId();
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    create: { userId, productId: product.id, quantity: 1 },
    update: { quantity: { increment: 1 } },
  });
}

export async function listCartLines(): Promise<CartLine[]> {
  const userId = await getAnonymousUserIdIfExists();
  if (!userId) return [];
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { productId: true, quantity: true, product: { select: { name: true } } },
  });
  return items.map((i) => ({ productId: i.productId, name: i.product.name, quantity: i.quantity }));
}
