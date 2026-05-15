# AGENTS.md — Milán Ecommerce

> This file guides Claude Code on how to work in this repository.
> Keep each section **short and operational** — AGENTS.md is context Claude reads every time, not general documentation.

## Project stack

- Next.js 15 (App Router) + TypeScript
- Prisma + local SQLite for `User` and `CartItem`
- In Phase B, the product catalog is queried from the **Odoo MCP** (Exercise 1)
- Tests with Vitest, pre-commit with Husky

## Design principles

- **Deep modules**: each `/lib/` module exposes a small, simple interface that hides substantial implementation. Prefer one well-named function with sensible defaults over many shallow helpers. If a module's public surface is wider than its internals, redesign it.
- **Thin UI, fat `/lib/`**: components render; all data access, validation, and business rules live in `/lib/` modules with explicit, typed public APIs.
- **Prisma stays in the data layer**: only `/lib/db/*` imports `@prisma/client`. Components and server actions receive plain domain types, never `Prisma.*` types.
- **Odoo MCP is isolated behind an adapter**: only `/lib/catalog/*` talks to the Odoo MCP. The rest of the app consumes a `Product` domain type — swapping the source must not ripple outward.
- **Domain types cross boundaries, infrastructure types do not**: `User`, `CartItem`, `Product` are shared; ORM rows, MCP payloads, and Zod schemas stay inside their owning module.
- **Fail loudly at boundaries, trust internals**: validate user input and external responses (MCP, forms) once at the edge; downstream code assumes well-formed data.

## Code conventions

- **Server Components by default.** Add `"use client"` only when a component needs state, effects, or browser APIs.
- **Server actions live in `app/<route>/actions.ts`** and are the only way the client mutates data. They call into `/lib/`; they do not contain business logic themselves.
- **Tests sit next to the code**: `foo.ts` → `foo.test.ts`. Integration tests for routes go under `__tests__/` at the app root.
- **Split when a file passes ~200 lines or a component takes more than ~5 props.** Extract sub-components or helpers into the same folder.
- **No `any`**. Use `unknown` + narrowing at boundaries; everywhere else types must be explicit.

## How to run the project

```bash
pnpm install
pnpm db:setup
pnpm dev
```

## How to run the tests

```bash
pnpm test
pnpm test:watch
```

## Expected workflow

1. **Understand first**: read the relevant `/lib/` module and any existing tests before editing.
2. **Red → Green → Refactor for every feature**:
   - **Red**: write a failing Vitest case that captures the new behavior.
   - **Green**: write the minimum code to pass — no extra abstractions.
   - **Refactor**: clean up with the tests green. This is where deep-module design is enforced — collapse shallow helpers, widen the implementation behind a narrow interface.
3. **Build inside-out**: implement and test the `/lib/` module first, then wire the server action, then the component. Don't connect layers until each one stands on its own.
4. **One concern per commit**, present-tense imperative messages: `add cart item validation`, `fix odoo adapter price parsing`. No scope prefixes. Prefer separate commits for the red/green step and the refactor step.
5. **Run `pnpm test` and `pnpm lint` before committing.** Husky will block the commit otherwise.

## Available MCPs

- **postgres-local**: the only MCP used in this project. Read-only access to the local Postgres database for development.
  - Use for: inspecting schema, sanity-checking data, and debugging queries while developing.
  - Restrictions: development only. Runtime data access goes through Prisma in `/lib/db/*` — never call the MCP from application code.

