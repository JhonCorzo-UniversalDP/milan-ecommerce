import type { CatalogAdapter } from "./types";

function notImplemented(): never {
  throw new Error("odooAdapter: not implemented");
}

export const odooAdapter: CatalogAdapter = {
  async listProducts() { return notImplemented(); },
  async getProductById() { return notImplemented(); },
  async searchProducts() { return notImplemented(); },
  async findSimilar() { return notImplemented(); },
  async getProductsByIds() { return notImplemented(); },
};
