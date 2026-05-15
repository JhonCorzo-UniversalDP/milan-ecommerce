import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/db/catalog";
import { addToCartAction } from "./actions";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <form action={addToCartAction}>
        <input type="hidden" name="slug" value={product.slug} />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Agregar al carrito
        </button>
      </form>
    </div>
  );
}
