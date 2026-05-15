"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { fetchCartProducts } from "./actions";
import type { Product } from "@/lib/catalog";

type Line = { product: Product; quantity: number };

export default function CartPage() {
  const [lines, setLines] = useState<Line[] | null>(null);

  useEffect(() => {
    const cart = getCart();
    if (cart.items.length === 0) {
      setLines([]);
      return;
    }
    const ids = cart.items.map((i) => i.productId);
    fetchCartProducts(ids).then((products) => {
      const qtyById = new Map(cart.items.map((i) => [i.productId, i.quantity]));
      setLines(
        products.map((p) => ({ product: p, quantity: qtyById.get(p.id) ?? 0 })),
      );
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Carrito</h1>
      {lines === null ? (
        <p className="text-neutral-600">Cargando…</p>
      ) : lines.length === 0 ? (
        <p className="text-neutral-600">Carrito vacío</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {lines.map((l) => (
            <li key={l.product.id} className="border-b py-2">
              {l.product.name} × {l.quantity}
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
