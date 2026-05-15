import { describe, it, expect, beforeEach } from "vitest";
import { getCart, addItem, clear } from "./cart";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
  });
});

describe("cart", () => {
  it("starts empty", () => {
    expect(getCart()).toEqual({ items: [] });
  });

  it("adds a new product with quantity 1", () => {
    addItem("42");
    expect(getCart().items).toEqual([{ productId: "42", quantity: 1 }]);
  });

  it("increments quantity when adding an existing product", () => {
    addItem("42");
    addItem("42");
    expect(getCart().items).toEqual([{ productId: "42", quantity: 2 }]);
  });

  it("keeps separate entries for different products", () => {
    addItem("1");
    addItem("2");
    addItem("1");
    const items = getCart().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.productId === "1")?.quantity).toBe(2);
    expect(items.find((i) => i.productId === "2")?.quantity).toBe(1);
  });

  it("persists across reads (localStorage round-trip)", () => {
    addItem("7");
    expect(getCart().items[0].productId).toBe("7");
  });

  it("clears the cart", () => {
    addItem("9");
    clear();
    expect(getCart()).toEqual({ items: [] });
  });
});
