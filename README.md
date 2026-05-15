# Milán Ecommerce — Repo Semilla

Repositorio base para el **Ejercicio 2** de la evaluación de Claude Code.

Lee el enunciado completo del ejercicio antes de empezar.

## Requisitos

- Node.js 20+
- **pnpm 9+** (no usar npm — ver sección de seguridad abajo)

Instalar pnpm si no lo tienes:
```bash
npm install -g pnpm@9.15.0
# o con corepack (recomendado, viene con Node)
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

## Setup inicial (haz esto antes de empezar el cronómetro)

```bash
pnpm install
cp .env.example .env
pnpm db:setup
```

Esto:
1. Instala dependencias (con cuarentena de 7 días sobre paquetes recién publicados).
2. Crea `.env` con la URL de SQLite local.
3. Genera el cliente de Prisma.
4. Corre la migración inicial.
5. Ejecuta el seed con 20 bicicletas de ejemplo.

## Verificación de que el setup quedó OK

```bash
pnpm dev          # debe arrancar en http://localhost:3000
pnpm test         # debe pasar el test smoke
```

Si las dos cosas funcionan, el repo está listo y puedes empezar el cronómetro de 2 horas.

## Por qué pnpm y no npm

Este repo usa **pnpm** en lugar de npm por razones de seguridad. En los últimos meses hubo varios ataques de cadena de suministro (Axios, Shai-Hulud, Mini Shai-Hulud) donde paquetes legítimos fueron comprometidos y publicaron versiones maliciosas que robaban credenciales al ejecutar `npm install`.

Las mitigaciones que este repo aplica son:

| Mitigación | Dónde está | Qué hace |
|---|---|---|
| Cuarentena de 7 días | `.npmrc` (`minimum-release-age=10080`) | No instala paquetes publicados hace menos de 1 semana — la mayoría de paquetes maliciosos se detectan y remueven en horas |
| Versiones pinneadas | `package.json` (sin `^` ni `~`) | Todos los ingenieros instalan las mismas versiones exactas validadas |
| Lista blanca de scripts | `package.json` → `pnpm.onlyBuiltDependencies` | Solo Prisma y esbuild pueden ejecutar scripts en `install`. Cualquier otro paquete con scripts queda inerte |
| `packageManager` field | `package.json` | Corepack rechaza ejecutar con un gestor distinto |

**No uses `npm install` en este repo aunque te tiente.** Te perderás las mitigaciones y, peor, generarás un `package-lock.json` que entra en conflicto con el `pnpm-lock.yaml` y rompe el setup del siguiente ingeniero.

## Estructura del repo

```
.
├── AGENTS.md                  # Plantilla a completar (steering para Claude Code)
├── .claude/skills/            # Aquí van tus skills custom
├── .npmrc                     # Configuración de pnpm (no editar sin razón)
├── docs/
│   ├── prds/                  # PRDs que escribas durante el ejercicio
│   └── reflexion.md           # Reflexión final (Fase C)
├── app/                       # Páginas Next.js (App Router)
├── lib/                       # Módulos del dominio (cart, search, recommendations, …)
├── prisma/                    # Schema y seed
├── tests/                     # Tests con Vitest
└── .husky/pre-commit          # Hook configurado pero comentado
```

## Comandos útiles

| Comando | Para qué |
|---|---|
| `pnpm dev` | Levanta Next.js en modo desarrollo |
| `pnpm test` | Corre los tests una vez |
| `pnpm test:watch` | Tests en watch |
| `pnpm lint` | Lint del proyecto |
| `pnpm seed` | Re-ejecuta el seed |
| `pnpm dlx prisma studio` | Abre la UI de Prisma para inspeccionar la DB |
