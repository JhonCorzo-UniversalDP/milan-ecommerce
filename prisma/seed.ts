import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { slug: "milan-urbana-01", name: "Milán Urbana 01", description: "Bicicleta urbana ideal para ciclorrutas de Bogotá. Cuadro de aluminio, 7 cambios.", priceCents: 1290000, category: "urbana" },
  { slug: "milan-urbana-02", name: "Milán Urbana 02", description: "Versión mejorada con frenos de disco hidráulicos.", priceCents: 1590000, category: "urbana" },
  { slug: "milan-mtb-trail", name: "Milán MTB Trail", description: "Mountain bike para senderos. Suspensión delantera 120mm.", priceCents: 2490000, category: "mtb" },
  { slug: "milan-mtb-xc", name: "Milán MTB XC", description: "Cross country competitiva, cuadro de carbono, 11 velocidades.", priceCents: 4990000, category: "mtb" },
  { slug: "milan-ruta-elite", name: "Milán Ruta Elite", description: "Bicicleta de ruta premium, grupo Shimano 105.", priceCents: 5790000, category: "ruta" },
  { slug: "milan-ruta-sport", name: "Milán Ruta Sport", description: "Bicicleta de ruta para iniciación, cuadro de aluminio.", priceCents: 2290000, category: "ruta" },
  { slug: "milan-kids-16", name: "Milán Kids 16", description: "Bicicleta infantil rin 16, con rueditas de entrenamiento.", priceCents: 590000, category: "infantil" },
  { slug: "milan-kids-20", name: "Milán Kids 20", description: "Bicicleta infantil rin 20, 6 cambios.", priceCents: 790000, category: "infantil" },
  { slug: "milan-electrica-e1", name: "Milán Eléctrica E1", description: "E-bike urbana con autonomía de 60km.", priceCents: 6990000, category: "electrica" },
  { slug: "milan-electrica-e2", name: "Milán Eléctrica E2", description: "E-bike de carga, motor central Bafang.", priceCents: 8490000, category: "electrica" },
  { slug: "milan-bmx-pro", name: "Milán BMX Pro", description: "BMX freestyle para parques y street.", priceCents: 1490000, category: "bmx" },
  { slug: "milan-bmx-race", name: "Milán BMX Race", description: "BMX de competencia, ligera y rígida.", priceCents: 1890000, category: "bmx" },
  { slug: "milan-plegable-city", name: "Milán Plegable City", description: "Bicicleta plegable rin 20, perfecta para combinar con transporte público.", priceCents: 1690000, category: "plegable" },
  { slug: "milan-gravel-aventura", name: "Milán Gravel Aventura", description: "Gravel para aventuras largas, cuadro de acero cromoly.", priceCents: 3490000, category: "gravel" },
  { slug: "milan-gravel-race", name: "Milán Gravel Race", description: "Gravel de competencia, cuadro de carbono.", priceCents: 5990000, category: "gravel" },
  { slug: "milan-urbana-mujer", name: "Milán Urbana Mujer", description: "Urbana con cuadro step-through para mayor comodidad.", priceCents: 1390000, category: "urbana" },
  { slug: "milan-tandem", name: "Milán Tándem", description: "Bicicleta tándem para dos personas.", priceCents: 2990000, category: "especial" },
  { slug: "milan-fixie-classic", name: "Milán Fixie Classic", description: "Fixed gear urbana, cuadro cromoly, diseño minimalista.", priceCents: 1190000, category: "fixie" },
  { slug: "milan-triciclo-carga", name: "Milán Triciclo Carga", description: "Triciclo de carga para reparto, canasta frontal de 50kg.", priceCents: 2790000, category: "carga" },
  { slug: "milan-mtb-enduro", name: "Milán MTB Enduro", description: "Mountain bike de doble suspensión, 160mm de recorrido.", priceCents: 7990000, category: "mtb" },
];

async function main() {
  console.log("Seeding bicicletas Milán...");
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`Seeded ${products.length} productos.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
