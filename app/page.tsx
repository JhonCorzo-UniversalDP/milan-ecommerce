import Link from "next/link";
import { listProducts, formatPriceCents } from "@/lib/catalog";

export default async function HomePage() {
  const products = await listProducts({ limit: 50 });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo</h1>
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
