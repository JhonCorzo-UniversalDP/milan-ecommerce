import { readFileSync } from "node:fs";
import path from "node:path";
import type { CatalogAdapter, Product } from "./types";
import { similarityScore, normalizeForSearch } from "./similarity";

type RawProduct = {
  id: number | string;
  name: string;
  price: number;
  barcode: string | null;
  description: string | null;
};

let cache: Product[] | null = null;
let cachedPath: string | null = null;

function resolvePath(): string {
  const configured = process.env.CATALOG_JSON_PATH;
  if (configured && configured.length > 0) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "data", "product_template.json");
}

function load(): Product[] {
  const filePath = resolvePath();
  if (cache && cachedPath === filePath) return cache;
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as RawProduct[];
  cache = parsed.map((r) => ({
    id: String(r.id),
    name: r.name,
    priceCents: Math.round(r.price * 100),
    barcode: r.barcode ?? null,
    description: r.description ?? null,
  }));
  cachedPath = filePath;
  return cache;
}

export function __resetCacheForTests(): void {
  cache = null;
  cachedPath = null;
}

export const jsonAdapter: CatalogAdapter = {
  async listProducts({ limit, offset } = {}) {
    const all = load();
    const start = offset ?? 0;
    const end = limit === undefined ? all.length : start + limit;
    return all.slice(start, end);
  },

  async getProductById(id) {
    const all = load();
    return all.find((p) => p.id === id) ?? null;
  },

  async searchProducts(query, { limit } = {}) {
    const all = load();
    const q = normalizeForSearch(query.trim());
    if (q.length === 0) return limit === undefined ? all : all.slice(0, limit);
    const matches = all.filter((p) => normalizeForSearch(p.name).includes(q));
    return limit === undefined ? matches : matches.slice(0, limit);
  },

  async findSimilar(productId, { limit = 5 } = {}) {
    const all = load();
    const target = all.find((p) => p.id === productId);
    if (!target) return [];
    const scored = all
      .filter((p) => p.id !== productId)
      .map((p, idx) => ({ p, idx, score: similarityScore(target.name, p.name) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => (b.score - a.score) || (a.idx - b.idx));
    return scored.slice(0, limit).map((s) => s.p);
  },
};
