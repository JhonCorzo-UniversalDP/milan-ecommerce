import { jsonAdapter } from "./jsonAdapter";
import type { CatalogAdapter } from "./types";

export type { Product, CatalogAdapter } from "./types";

function pickAdapter(): CatalogAdapter {
  const source = process.env.CATALOG_SOURCE ?? "json";
  if (source === "json") return jsonAdapter;
  if (source === "odoo") {
    throw new Error("odooAdapter not implemented");
  }
  throw new Error(`Unknown CATALOG_SOURCE: ${source}`);
}

const adapter = pickAdapter();

export const listProducts = adapter.listProducts.bind(adapter);
export const getProductById = adapter.getProductById.bind(adapter);
export const searchProducts = adapter.searchProducts.bind(adapter);
export const findSimilar = adapter.findSimilar.bind(adapter);

export function formatPriceCents(priceCents: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
