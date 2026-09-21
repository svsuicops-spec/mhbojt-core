# The Academy — Hybrid LMS

A high-stakes professional learning platform combining TikTok-style micro-briefings, YouTube-style academic courses, and a Facebook-style community called The Citadel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lms run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite libs only
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (requires TTY; tables already exist from SQL migration)
- `pnpm --filter @workspace/scripts run referral-manager` — compute sponsor KPI snapshots (conversion rate, velocity, franchise progress) and fire swarm alerts at 5/10/20 verified-candidate milestones; pass `--watch --interval <ms>` to run continuously
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui + wouter (routing) + @clerk/react
- API: Express 5 + @clerk/express (cookie-based auth, no bearer tokens)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (contract-first from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema (source of truth): `lib/db/src/schema/` — users, micro-briefings, courses, citadel
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated React hooks: `lib/api-client-react/src/generated/api.ts`
- Generated Zod schemas: `lib/api-zod/src/generated/api.ts`
- API routes: `artifacts/api-server/src/routes/` — users, micro-briefings, courses, citadel, dashboard
- Frontend pages: `artifacts/lms/src/pages/` — home, feed, courses, course-detail, citadel, post-detail, dashboard, profile
- Clerk proxy middleware: `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`
- Auth middleware: `artifacts/api-server/src/middlewares/requireAuth.ts`

## Architecture decisions

- **Contract-first API**: OpenAPI spec is the single source of truth; Orval generates both React Query hooks and Zod validators. Never write raw fetch or manual TanStack Query hooks.
- **Cookie-based auth**: Clerk session cookies, not bearer tokens. `requireAuth` uses `getAuth(req)` from `@clerk/express`. No `Authorization: Bearer` headers anywhere.
- **Clerk proxy**: The API server proxies Clerk's frontend API via `clerkProxyMiddleware` so the publishable key is resolved per-host using `publishableKeyFromHost`.
- **DB tables already exist**: Schema was applied via raw SQL. `drizzle-kit push` will prompt about existing constraints — use it only for new tables/columns, not for the initial schema.
- **User sync**: After Clerk sign-in, the frontend calls `POST /api/users/sync` to provision the local user record in our DB using the Clerk user ID as the primary key.
- **Tier system**: 4 tiers — candidate (1), apprentice (2), associate (3), nation_builder (4) — stored in `user_profiles.current_tier`.

## Product

- **Feed** (`/feed`): TikTok-style full-screen vertical scroll of micro-briefings (short videos). Like/watch engagement tracked.
- **Courses** (`/courses`, `/courses/:id`): YouTube-style course library with module/lesson accordion and per-lesson completion tracking.
- **Citadel** (`/citadel`, `/citadel/:id`): Facebook-style community posts with comments.
- **Dashboard** (`/dashboard`): Personal stats — briefings watched, lessons completed, community activity, tier/role.
- **Profile** (`/profile`): Edit bio and view user details.

## Gotchas

- `pnpm --filter @workspace/db run push` requires an interactive TTY — won't work in bash tool. For new schema changes, either run it in the Shell tab or use raw SQL via `executeSql`.
- `timestamptz` is not a drizzle-orm/pg-core export — use `timestamp("col", { withTimezone: true })` instead.
- Clerk's `@clerk/react/internal` is a sub-path export of `@clerk/react`, NOT a separate npm package. Import as `import { publishableKeyFromHost } from '@clerk/react/internal'`.
- The LMS frontend uses `import.meta.env.BASE_URL` as the wouter router base — all internal links must be relative to that base.
- Do NOT add Vite proxy configs to reach the API — the shared reverse proxy already routes `/api` to the API server.
