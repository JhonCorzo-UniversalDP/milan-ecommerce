import { describe, it, expect } from "vitest";
import { odooAdapter } from "./odooAdapter";
import type { CatalogAdapter } from "./types";

describe("odooAdapter stub", () => {
  it("conforms to the CatalogAdapter shape", () => {
    const adapter: CatalogAdapter = odooAdapter;
    expect(typeof adapter.listProducts).toBe("function");
    expect(typeof adapter.getProductById).toBe("function");
    expect(typeof adapter.searchProducts).toBe("function");
    expect(typeof adapter.findSimilar).toBe("function");
    expect(typeof adapter.getProductsByIds).toBe("function");
  });

  it("rejects every call with NotImplemented", async () => {
    await expect(odooAdapter.listProducts()).rejects.toThrow(/not implemented/i);
    await expect(odooAdapter.getProductById("1")).rejects.toThrow(/not implemented/i);
    await expect(odooAdapter.searchProducts("x")).rejects.toThrow(/not implemented/i);
    await expect(odooAdapter.findSimilar("1")).rejects.toThrow(/not implemented/i);
    await expect(odooAdapter.getProductsByIds(["1"])).rejects.toThrow(/not implemented/i);
  });
});
