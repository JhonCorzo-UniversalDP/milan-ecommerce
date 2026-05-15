# Plan: Catálogo MVP

> Source PRD: `docs/prds/001-catalog-mvp.md`
> Final data source for now: `data/product_template.json` (swappable to Odoo MCP later).
> Focus: funcionalidad + tests. UI/UX mínimo (semántica, sin pulido visual).

## Architectural decisions

Decisiones que valen para todas las fases:

- **Rutas**:
  - `/` — catálogo (lista + buscador vía `?q=`).
  - `/product/[id]` — detalle + sugeridos.
  - `/login` — formulario de email.
  - `/cart` — carrito local.
- **Fuente de datos**: única superficie en `/lib/catalog`. Implementación por defecto `jsonAdapter` (lee `data/product_template.json`, configurable por `CATALOG_JSON_PATH`). Selección por `CATALOG_SOURCE` (default `json`). El resto del código nunca importa el JSON directamente.
- **Tipo de dominio `Product`**: `{ id: string, name: string, priceCents: number, barcode: string | null, description: string | null }`. Precios del JSON (unidades) → `priceCents` (×100, redondeado). `id` JSON convertido a string. URLs usan `id`, no slug.
- **Carrito y sesión**: client-side en `localStorage`. No tocan Prisma. Modelo `CartItem` de Prisma queda inactivo en esta iteración.
- **Capas**: páginas server-side por defecto; client components sólo donde haga falta `localStorage` o estado de formulario. Hidratación del carrito vía server action `getProductsByIds`.
- **Validación**: email validado por módulo puro `/lib/validation/email`. Sin librerías externas.
- **Tests**: Vitest, colocados junto al código (`foo.ts` ↔ `foo.test.ts`). No se escriben tests de UI; se prueba la lógica de `/lib/*`.
- **Formato de precio**: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.

---

## Phase 1: Adaptador de catálogo + listado en `/`

**User stories**: 1, 2, 3, 17, 18, 19 (parcial)

### What to build

Construir el módulo `/lib/catalog` con su interfaz pública (`listProducts`, `getProductById`, `searchProducts`, `findSimilar`) y la implementación `jsonAdapter` que carga el JSON una sola vez en memoria y mapea cada registro al tipo `Product` del dominio. Reemplazar el placeholder de `/` por una lista server-side de los primeros 50 productos (nombre + precio formateado en COP); cada fila es un `<Link>` a `/product/[id]`. La página no debe conocer la fuente — sólo el módulo.

### Acceptance criteria

- [ ] `listProducts({ limit })` devuelve a lo sumo `limit` productos, en el orden del archivo.
- [ ] `getProductById(id)` devuelve el producto o `null`.
- [ ] Precios mapeados a `priceCents` (entero).
- [ ] El JSON se lee una sola vez por proceso (cacheado en memoria).
- [ ] `CATALOG_JSON_PATH` permite apuntar a otro archivo; ausencia ⇒ usa `data/product_template.json`.
- [ ] `/` renderiza 50 filas, cada una con nombre + precio + link a `/product/[id]`.
- [ ] Tests Vitest para `listProducts` (respeta `limit`), `getProductById` (hit y miss), y mapeo de `priceCents`.

---

## Phase 2: Vista de producto + sugeridos

**User stories**: 4, 7, 8

### What to build

Implementar `/product/[id]` server-side: muestra nombre, descripción, precio y código de barras. Implementar también `/lib/catalog/similarity` (función pura `similarityScore` con normalización de tokens, lowercase y sin tildes; Jaccard básico) y `findSimilar(productId, { limit: 5 })` en el adaptador, que excluye al propio producto y devuelve los 5 con mayor score (desempate por orden del archivo). La página renderiza la lista de sugeridos como links a `/product/[id]`. Si el producto no existe → 404 estándar de Next.

### Acceptance criteria

- [ ] `/product/[id]` muestra los 4 campos requeridos (descripción opcionalmente vacía manejada con fallback simple).
- [ ] ID inexistente devuelve 404.
- [ ] `findSimilar` nunca incluye al producto consultado.
- [ ] `findSimilar` devuelve a lo sumo `limit` resultados.
- [ ] Tests para `similarityScore`: coincidencia total, parcial, ninguna, normalización (acentos, mayúsculas).
- [ ] Tests para `findSimilar`: exclusión propia, respeta `limit`, prioriza scores altos.

---

## Phase 3: Buscador con filtro `LIKE`

**User stories**: 9, 10

### What to build

Agregar `searchProducts(query, { limit })` al adaptador: substring case-insensitive (normalización opcional de acentos) sobre `name`. En `/` agregar un input GET (`?q=`); cuando hay query, la página usa `searchProducts` en lugar de `listProducts`. Sin query, comportamiento de Fase 1 intacto.

### Acceptance criteria

- [ ] `searchProducts('cassette', ...)` y `searchProducts('CASSETTE', ...)` devuelven el mismo resultado.
- [ ] Substring (no requiere palabra completa).
- [ ] Query vacía o solo whitespace ⇒ comportamiento equivalente a `listProducts`.
- [ ] `/?q=...` muestra los resultados filtrados; sin `q`, los primeros 50.
- [ ] Tests para `searchProducts`: case-insensitive, substring, query vacía, respeta `limit`.

---

## Phase 4: Login + sesión en `localStorage` + nav del header

**User stories**: 11, 12, 13, 20, 21, 22

### What to build

Implementar `/lib/validation/email` (función pura) y `/lib/session` (cliente, sobre `localStorage`: `getSession`, `setSession`, `clearSession`). Reemplazar `/login` por un formulario client-side con un único campo email: valida, llama a `setSession(email)` y redirige a `/`. Email inválido → mensaje de error inline, no se persiste nada. Agregar al `app/layout.tsx` un Client Component pequeño con dos links visibles en todas las páginas: "Iniciar sesión" → `/login` (muestra el email cuando `getSession()` devuelve uno) y "Carrito" → `/cart`.

### Acceptance criteria

- [ ] Email válido se guarda y la página redirige a `/`.
- [ ] Email inválido bloquea el submit con feedback visible.
- [ ] Recargar el navegador conserva la sesión (lectura desde `localStorage`).
- [ ] `setSession` rechaza emails inválidos (defensa en módulo, no sólo en UI).
- [ ] Tests para validador: lista de válidos e inválidos (incluye casos borde: sin `@`, sin TLD, espacios).
- [ ] Tests para `/lib/session` con `localStorage` simulado: round-trip y rechazo de email inválido.
- [ ] El header muestra los botones "Iniciar sesión" y "Carrito" en `/`, `/product/[id]`, `/login` y `/cart`.
- [ ] Con sesión activa, el botón "Iniciar sesión" muestra el email guardado.

---

## Phase 5: Carrito (agregar desde producto + vista `/cart`)

**User stories**: 5, 6, 14, 15, 16

### What to build

Implementar `/lib/cart` client-side sobre `localStorage` con `getCart`, `addItem(productId)`, `clear`. `addItem` suma 1 a la cantidad si el producto ya existe; si no, lo agrega con cantidad 1. Agregar a `/product/[id]` un botón client-side "Agregar al carrito" que invoca `addItem`. Implementar `/cart` client-side: lee `getCart`, hidrata vía server action `getProductsByIds(ids[])` (en `app/cart/actions.ts`, llama al adaptador), y renderiza `nombre × cantidad`. Un único botón "Seguir comprando" navega a `/`. El carrito persiste entre recargas.

### Acceptance criteria

- [ ] Click en "Agregar al carrito" suma el producto; un segundo click sobre el mismo producto incrementa cantidad a 2.
- [ ] `/cart` lista cada producto del carrito con su cantidad.
- [ ] `getProductsByIds` devuelve los productos en el mismo orden de los ids solicitados; ids inexistentes se omiten.
- [ ] Botón "Seguir comprando" navega a `/`.
- [ ] Recargar `/cart` mantiene los items.
- [ ] Tests para `/lib/cart`: agregar nuevo, incrementar existente, `clear`. Mocks de `localStorage`.
- [ ] Tests para `getProductsByIds`: orden preservado, ids no existentes filtrados.

---

## Phase 6 (opcional): Limpieza y `.env.example`

**User stories**: 17 (cierre)

### What to build

Documentar variables en `.env.example` (`CATALOG_SOURCE`, `CATALOG_JSON_PATH`), revisar que ningún componente importe el JSON directamente, y dejar un stub `odooAdapter` con la misma interfaz lanzando `NotImplemented` para anclar el contrato.

### Acceptance criteria

- [ ] `.env.example` actualizado.
- [ ] `grep` confirma que sólo `/lib/catalog/*` referencia `product_template.json`.
- [ ] `odooAdapter` existe como esqueleto con la misma firma pública.
