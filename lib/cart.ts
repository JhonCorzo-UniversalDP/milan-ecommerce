const STORAGE_KEY = "cart.items";

export type CartItem = { productId: string; quantity: number };
export type Cart = { items: CartItem[] };

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function read(): Cart {
  const s = storage();
  if (!s) return { items: [] };
  const raw = s.getItem(STORAGE_KEY);
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return {
      items: parsed.items.filter(
        (i) => typeof i?.productId === "string" && typeof i?.quantity === "number",
      ),
    };
  } catch {
    return { items: [] };
  }
}

function write(cart: Cart): void {
  const s = storage();
  if (!s) return;
  s.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function getCart(): Cart {
  return read();
}

export function addItem(productId: string): Cart {
  const cart = read();
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.items.push({ productId, quantity: 1 });
  }
  write(cart);
  return cart;
}

export function clear(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(STORAGE_KEY);
}
