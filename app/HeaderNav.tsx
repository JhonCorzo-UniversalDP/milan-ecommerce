"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";

export function HeaderNav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getSession());
    const onStorage = () => setEmail(getSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <nav className="flex gap-4 text-sm">
      <Link href="/login" className="hover:underline">
        {email ?? "Iniciar sesión"}
      </Link>
      <Link href="/cart" className="hover:underline">
        Carrito
      </Link>
    </nav>
  );
}
