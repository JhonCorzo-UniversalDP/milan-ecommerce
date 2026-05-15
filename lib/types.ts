export type Product = {
  id: string;
  slug: string;
  name: string;
};

export type CartLine = {
  productId: string;
  name: string;
  quantity: number;
};
