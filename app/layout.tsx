import type { Metadata } from "next";
import "./globals.css";

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
        <header className="border-b border-neutral-200 px-6 py-4">
          <a href="/" className="text-xl font-bold">Milán Bicicletas</a>
        </header>
        <main className="px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
