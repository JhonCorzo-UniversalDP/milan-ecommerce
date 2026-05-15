export type Product = {
  id: string;
  name: string;
  priceCents: number;
  barcode: string | null;
  description: string | null;
};

export type CatalogAdapter = {
  listProducts(options?: { limit?: number; offset?: number }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  searchProducts(query: string, options?: { limit?: number }): Promise<Product[]>;
  findSimilar(productId: string, options?: { limit?: number }): Promise<Product[]>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
};
