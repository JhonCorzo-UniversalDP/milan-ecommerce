# PRD 001 — Catálogo MVP (Catalog, Product, Suggested, Browser, Login, Cart)

## Problem Statement

Como cliente de Milán Bicicletas, quiero un sitio mínimo en el que pueda navegar el catálogo, ver el detalle de un producto, buscar por nombre, identificarme con mi correo y mantener un carrito durante la sesión. Hoy las páginas (`/`, `/product/[slug]`, `/cart`, `/login`) están en placeholder y no permiten ninguna de estas acciones. Además, el catálogo real proviene de una base antigua que aún se está migrando, así que necesito una solución que funcione con los datos de prueba locales pero que pueda apuntarse a la fuente definitiva sin reescribir la aplicación.

## Solution

Construir un MVP del ecommerce con cinco capacidades:

1. **Catálogo (`/`)**: lista de 50 productos (nombre + precio); cada fila lleva a la vista de producto.
2. **Vista de producto (`/product/[id]`)**: muestra nombre, descripción, precio y código de barras; botón "Agregar al carrito"; debajo, 5 productos sugeridos por similitud de nombre.
3. **Buscador**: filtro básico tipo `LIKE` sobre el nombre del producto.
4. **Login (`/login`)**: formulario con un único campo de email (validación de formato), persistido en `localStorage` como sesión del navegador.
5. **Carrito (`/cart`)**: listado de productos agregados con cantidad, y un único botón "Seguir comprando" que regresa a `/`. Persistido en `localStorage`.

Toda la lectura de productos pasa por un **adaptador de catálogo** (`/lib/catalog/*`) con una interfaz estable. La implementación por defecto lee del JSON local `data/product_template.json`; cambiar a Odoo MCP (u otra fuente) se hace reemplazando esa implementación sin tocar la UI ni las server actions.

## User Stories

1. Como cliente, quiero ver una lista con los primeros 50 productos al entrar a `/`, para tener una visión rápida del catálogo.
2. Como cliente, quiero ver el nombre y el precio de cada producto en la lista, para poder reconocerlos sin abrir cada uno.
3. Como cliente, quiero hacer clic sobre una fila del catálogo, para ir al detalle de ese producto.
4. Como cliente, quiero ver en la vista de detalle el nombre, descripción, precio y código de barras del producto, para confirmar que es el que busco.
5. Como cliente, quiero un botón "Agregar al carrito" en la vista de producto, para sumarlo a mi compra.
6. Como cliente, al agregar un producto que ya estaba en el carrito, quiero que su cantidad aumente en 1, para no tener filas duplicadas.
7. Como cliente, quiero ver hasta 5 productos sugeridos en la vista de producto, para descubrir alternativas similares.
8. Como cliente, quiero que las sugerencias se basen en similitud de nombre con el producto actual, para que sean relevantes.
9. Como cliente, quiero un buscador que filtre por coincidencias parciales en el nombre, para encontrar rápido lo que necesito.
10. Como cliente, quiero que el buscador use coincidencia tipo `LIKE` (sin distinguir mayúsculas), para no tener que escribir el nombre exacto.
11. Como cliente, quiero iniciar sesión en `/login` ingresando solo mi correo, para identificarme sin contraseña.
12. Como cliente, quiero que el formulario de login rechace correos con formato inválido, para evitar enviar datos erróneos.
13. Como cliente, quiero que mi sesión (email) quede guardada en el navegador, para no tener que iniciar sesión en cada recarga.
14. Como cliente, quiero ver en `/cart` los productos que agregué con su cantidad, para revisar lo que llevo.
15. Como cliente, quiero un botón "Seguir comprando" en el carrito, que me devuelva al catálogo (`/`).
16. Como cliente, quiero que el carrito persista entre recargas mientras dure mi sesión en el navegador.
17. Como desarrollador, quiero un adaptador de catálogo único, para cambiar la fuente de datos (JSON local → Odoo MCP → otra) sin tocar la UI.
18. Como desarrollador, quiero que el JSON de prueba se cargue una sola vez en memoria, para que las consultas posteriores sean rápidas.
19. Como desarrollador, quiero tests de unidad sobre la búsqueda y las sugerencias, para garantizar el comportamiento al cambiar la fuente de datos.
20. Como cliente, quiero un botón de "Iniciar sesión" en el header de todas las páginas, para poder identificarme desde cualquier vista.
21. Como cliente, quiero un botón de "Carrito" en el header de todas las páginas, para llegar a `/cart` con un click desde cualquier vista.
22. Como cliente, cuando ya inicié sesión, quiero que el botón de "Iniciar sesión" muestre mi email (o un indicador equivalente), para confirmar mi sesión activa.

## Implementation Decisions

### Módulos

- **`/lib/catalog`** — Adaptador de catálogo (módulo profundo). Interfaz pública estable:
  - `listProducts({ limit, offset })` — lista paginada para el catálogo.
  - `getProductById(id)` — detalle.
  - `searchProducts(query, { limit })` — filtro `LIKE` por nombre, case-insensitive.
  - `findSimilar(productId, { limit })` — sugerencias por similitud de nombre.
  - Implementación por defecto: `jsonAdapter` que lee `data/product_template.json` y mantiene los productos en memoria. La ruta del archivo es configurable vía variable de entorno (`CATALOG_JSON_PATH`) con fallback al path actual. Una futura implementación `odooAdapter` cumple la misma interfaz; la selección se hace en un único punto del módulo (factory) en función de `CATALOG_SOURCE`.
- **`/lib/catalog/similarity`** — Función pura `similarityScore(nameA, nameB)`. Implementación inicial simple: tokenizar por palabras, normalizar (lowercase, sin tildes), contar tokens compartidos (Jaccard o conteo de coincidencias). Se mantiene como función pura para que sea testeable y reemplazable.
- **`/lib/cart`** — Lógica de carrito client-side sobre `localStorage`. Interfaz:
  - `getCart()`, `addItem(productId)`, `clear()`.
  - Estructura almacenada: `{ items: Array<{ productId, quantity }> }`.
  - Para esta iteración el carrito **no** persiste en Prisma; el modelo `CartItem` queda sin uso hasta una fase posterior.
- **`/lib/session`** — Sesión client-side sobre `localStorage`. Interfaz: `getSession()`, `setSession(email)`, `clearSession()`. Valida formato de email al setear.
- **`/lib/validation/email`** — Validador de email puro (regex razonable). Función única, testeable.

### Tipos de dominio

- `Product = { id: string, name: string, priceCents: number, barcode: string | null, description: string | null }`.
- Los precios del JSON están en unidades; el adaptador los convierte a `priceCents` (multiplica por 100 y redondea) para mantener consistencia con el resto del dominio.
- El `id` del producto es el `id` del JSON convertido a string. Las URLs son `/product/[id]` (no slug) porque los datos de origen no traen slug.

### UI / Rutas

- **Header global (`app/layout.tsx`)**: además del logo, expone dos botones/links visibles en todas las páginas:
  - "Iniciar sesión" → `/login`. Cuando hay sesión activa en `localStorage`, muestra el email del usuario (sigue siendo un link, ahora a `/login` para poder cerrar/cambiar sesión en el futuro).
  - "Carrito" → `/cart`.
  Ambos botones viven en un Client Component pequeño (porque consulta `localStorage`); el resto del layout sigue siendo server-side.
- **`/` (Server Component)**: llama a `listProducts({ limit: 50 })`. Renderiza filas con nombre y precio formateado en COP. Cada fila es un `<Link>` a `/product/[id]`. Incluye un input de búsqueda (formulario `GET` con `?q=`) que, cuando hay query, llama a `searchProducts` en lugar de `listProducts`.
- **`/product/[id]` (Server Component)**: llama a `getProductById` y `findSimilar`. Muestra los 4 campos requeridos y el botón "Agregar al carrito" (Client Component pequeño que invoca `/lib/cart`). Debajo, lista de hasta 5 sugeridos como links.
- **`/login` (Client Component)**: formulario controlado, valida email, llama a `setSession`, redirige a `/`.
- **`/cart` (Client Component)**: lee carrito de `localStorage`, resuelve los productos vía endpoint o vía una acción que llame al adaptador (se elige la opción más simple: una server action `getProductsByIds(ids[])` en `app/cart/actions.ts`). Muestra `nombre × cantidad` y el botón "Seguir comprando" que navega a `/`.

### Server actions

- `app/cart/actions.ts` → `getProductsByIds(ids: string[])` para hidratar el carrito desde el adaptador.
- No hay otras server actions en esta iteración (login y cart se manejan client-side).

### Tests (Vitest)

Se piden tests al menos en:
- `/lib/catalog/similarity` — función pura, varios casos (coincidencia total, parcial, ninguna, normalización).
- `/lib/catalog/jsonAdapter` — `searchProducts` (case-insensitive, substring), `findSimilar` (no incluye al propio producto, devuelve a lo sumo `limit`), `listProducts` (respeta `limit`).
- `/lib/validation/email` — válidos e inválidos.
- `/lib/cart` — `addItem` suma cantidad cuando el producto ya existe.

### Configuración

- Variables nuevas en `.env.example`:
  - `CATALOG_SOURCE=json` (futuro: `odoo`).
  - `CATALOG_JSON_PATH=data/product_template.json`.

## Out of Scope

- Persistencia del carrito en base de datos (`CartItem` de Prisma queda inactivo).
- Autenticación real, contraseñas, registro, recuperación de cuenta.
- Checkout, pagos, inventario, envíos.
- Imágenes de producto, categorías, filtros por rango de precio o por categoría.
- Paginación más allá del primer corte de 50 productos en el catálogo.
- Ordenamientos configurables.
- Integración real con Odoo MCP (sólo se deja la interfaz preparada).
- i18n: la UI queda en español (los textos del enunciado: "Seguir comprando", "Agregar al carrito") sin sistema de traducción.
- Accesibilidad avanzada más allá de semántica básica y `<Link>` sobre filas.
- SEO / metadatos por producto.

## Further Notes

- **Por qué `localStorage` y no cookies**: el enunciado pide "lo más fácil y rápido" para sesión y carrito; `localStorage` evita server actions adicionales y no requiere middleware. Las páginas que lo consumen se marcan `"use client"`.
- **Por qué id y no slug**: los datos de origen (`product_template.json`) no traen slug; generar uno estable agregaría complejidad sin beneficio para el MVP. El esquema de Prisma sí tiene `slug`, pero está dormido en esta iteración.
- **Por qué el adaptador**: el `AGENTS.md` ya establece que sólo `/lib/catalog/*` debe conocer la fuente del catálogo. Esta PRD respeta esa decisión y la convierte en la única superficie de cambio cuando se conecte Odoo.
- **Similaridad simple**: Jaccard sobre tokens normalizados es suficiente para "siguientes 5 con nombre parecido"; si más adelante se quiere fuzzy real, se reemplaza la función pura sin tocar la UI.
- **Formato de precio**: se renderiza como COP sin decimales (`Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`).
