import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, findSimilar, formatPriceCents } from "@/lib/catalog";
import { AddToCartButton } from "./AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  const similar = await findSimilar(product.id, { limit: 5 });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl mb-2">{formatPriceCents(product.priceCents)}</p>
        <p className="text-sm text-neutral-600 mb-2">
          Código de barras: {product.barcode ?? "—"}
        </p>
        <p className="mb-4">{product.description ?? "Sin descripción."}</p>
        <AddToCartButton productId={product.id} />
      </section>

      {similar.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Productos sugeridos</h2>
          <ul className="space-y-1">
            {similar.map((p) => (
              <li key={p.id}>
                <Link href={`/product/${p.id}`} className="text-blue-600 hover:underline">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
