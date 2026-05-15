import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { jsonAdapter, __resetCacheForTests } from "./jsonAdapter";

let tmpDir: string;
let dataPath: string;

const fixture = [
  { id: 1, name: "CASSETTE 11-32T BICICLETA OPTIMUS", price: 39900.0, barcode: "B1", description: null },
  { id: 2, name: "CADENA KMC X10", price: 49900.5, barcode: "B2", description: "desc" },
  { id: 3, name: "DISCO/ROTOR DE FRENO LTWOO 160mm", price: 49900, barcode: null, description: null },
  { id: 4, name: "MARCO PROFIT 16er NICE", price: 120000, barcode: "B4", description: null },
  { id: 5, name: "BICICLETA PROFIT 29er JASPER", price: 15, barcode: "B5", description: null },
];

beforeEach(() => {
  tmpDir = mkdtempSync(path.join(tmpdir(), "catalog-test-"));
  dataPath = path.join(tmpDir, "products.json");
  writeFileSync(dataPath, JSON.stringify(fixture));
  process.env.CATALOG_JSON_PATH = dataPath;
  __resetCacheForTests();
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.CATALOG_JSON_PATH;
  __resetCacheForTests();
});

describe("jsonAdapter.listProducts", () => {
  it("respects limit and preserves file order", async () => {
    const result = await jsonAdapter.listProducts({ limit: 3 });
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id)).toEqual(["1", "2", "3"]);
  });

  it("returns all when no limit", async () => {
    const result = await jsonAdapter.listProducts();
    expect(result).toHaveLength(5);
  });

  it("maps price to priceCents (integer)", async () => {
    const result = await jsonAdapter.listProducts({ limit: 2 });
    expect(result[0].priceCents).toBe(3990000);
    expect(result[1].priceCents).toBe(4990050);
    expect(Number.isInteger(result[0].priceCents)).toBe(true);
  });

  it("converts id to string and preserves barcode/description nulls", async () => {
    const all = await jsonAdapter.listProducts();
    expect(all[0].id).toBe("1");
    expect(all[2].barcode).toBeNull();
    expect(all[0].description).toBeNull();
    expect(all[1].description).toBe("desc");
  });
});

describe("jsonAdapter.getProductById", () => {
  it("returns the product when found", async () => {
    const p = await jsonAdapter.getProductById("2");
    expect(p?.name).toBe("CADENA KMC X10");
  });

  it("returns null when missing", async () => {
    expect(await jsonAdapter.getProductById("999")).toBeNull();
  });
});

describe("jsonAdapter caching", () => {
  it("reads the file once per path", async () => {
    await jsonAdapter.listProducts();
    rmSync(dataPath);
    const again = await jsonAdapter.listProducts();
    expect(again).toHaveLength(5);
  });
});

describe("jsonAdapter.searchProducts", () => {
  it("is case-insensitive substring", async () => {
    const lower = await jsonAdapter.searchProducts("cassette");
    const upper = await jsonAdapter.searchProducts("CASSETTE");
    expect(lower.map((p) => p.id)).toEqual(["1"]);
    expect(upper.map((p) => p.id)).toEqual(["1"]);
  });

  it("matches substrings (not whole words)", async () => {
    const r = await jsonAdapter.searchProducts("prof");
    expect(r.map((p) => p.id).sort()).toEqual(["4", "5"]);
  });

  it("empty query returns same as listProducts", async () => {
    const empty = await jsonAdapter.searchProducts("   ");
    expect(empty).toHaveLength(5);
  });

  it("respects limit", async () => {
    const r = await jsonAdapter.searchProducts("bicicleta", { limit: 1 });
    expect(r).toHaveLength(1);
  });
});

describe("jsonAdapter.findSimilar", () => {
  it("excludes the queried product", async () => {
    const r = await jsonAdapter.findSimilar("1");
    expect(r.find((p) => p.id === "1")).toBeUndefined();
  });

  it("respects limit", async () => {
    const r = await jsonAdapter.findSimilar("1", { limit: 2 });
    expect(r.length).toBeLessThanOrEqual(2);
  });

  it("returns related products sorted by score (PROFIT wins over single token)", async () => {
    const r = await jsonAdapter.findSimilar("5", { limit: 5 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.map((p) => p.id)).toContain("4");
    expect(r.map((p) => p.id)).toContain("1");
  });

  it("returns empty when productId missing", async () => {
    expect(await jsonAdapter.findSimilar("999")).toEqual([]);
  });
});
