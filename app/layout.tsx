import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { HeaderNav } from "./HeaderNav";

export const metadata: Metadata = {
  title: "Milán Bicicletas",
  description: "Ecommerce de bicicletas Milán",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-neutral-900" suppressHydrationWarning>
        <header className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Milán Bicicletas</Link>
          <HeaderNav />
        </header>
        <main className="px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
