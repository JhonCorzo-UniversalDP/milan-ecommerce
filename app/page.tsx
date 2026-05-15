import Link from "next/link";
import { listProducts } from "@/lib/db/catalog";

export default async function HomePage() {
  const products = await listProducts();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo</h1>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/product/${p.slug}`} className="text-blue-600 hover:underline">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
