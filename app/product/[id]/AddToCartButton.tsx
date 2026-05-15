"use client";

import { useState } from "react";
import { addItem } from "@/lib/cart";

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        addItem(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      {added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
