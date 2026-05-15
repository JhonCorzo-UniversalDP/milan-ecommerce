import Link from "next/link";
import { listProducts, searchProducts, formatPriceCents } from "@/lib/catalog";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const products = query
    ? await searchProducts(query, { limit: 50 })
    : await listProducts({ limit: 50 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo</h1>
      <form method="get" className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Buscar productos…"
          className="border rounded px-3 py-2 w-full max-w-md"
        />
      </form>
      {query && (
        <p className="text-sm text-neutral-600 mb-2">
          Resultados para “{query}”: {products.length}
        </p>
      )}
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between border-b py-2">
            <Link href={`/product/${p.id}`} className="text-blue-600 hover:underline">
              {p.name}
            </Link>
            <span className="ml-4 tabular-nums">{formatPriceCents(p.priceCents)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
