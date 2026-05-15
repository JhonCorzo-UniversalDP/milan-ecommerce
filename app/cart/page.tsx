import { listCartLines } from "@/lib/db/cart";

export default async function CartPage() {
  const lines = await listCartLines();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Carrito</h1>
      {lines.length === 0 ? (
        <p className="text-neutral-600">Carrito vacío</p>
      ) : (
        <ul className="space-y-2">
          {lines.map((line) => (
            <li key={line.productId}>
              {line.name} × {line.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
