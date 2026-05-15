"use server";

import { redirect } from "next/navigation";
import { addProductToCart } from "@/lib/db/cart";

export async function addToCartAction(formData: FormData) {
  const slug = formData.get("slug");
  if (typeof slug !== "string" || slug.length === 0) {
    throw new Error("Missing slug");
  }
  await addProductToCart(slug);
  redirect("/cart");
}
