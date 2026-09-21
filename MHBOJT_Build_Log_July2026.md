# MHBOJT Curriculum Module — Build Log (July 2026)

This document records the schema, API, and frontend component code added to support the
7-stage MHBOJT (Master Home Builder Over Job Training) curriculum track on The Academy dashboard.

## 1. Database Schema

File: `lib/db/src/schema/mhbojt.ts`

```ts
import { pgTable, uuid, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const mhbojtCurriculumTable = pgTable("mhbojt_curriculum", {
  id: uuid("id").primaryKey().defaultRandom(),
  stageNumber: integer("stage_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MhbojtCurriculumStage = typeof mhbojtCurriculumTable.$inferSelect;
```

Table created via raw SQL (drizzle-kit push requires an interactive TTY, unavailable in this session):

```sql
CREATE TABLE IF NOT EXISTS mhbojt_curriculum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_number integer NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  sort_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

Seed data (7 stages):

```sql
INSERT INTO mhbojt_curriculum (stage_number, title, description, sort_order) VALUES
(1, 'Planning & Modeling', 'Feasibility, micro-briefings, scaling', 1),
(2, 'Designing & Interlocking', 'Modular flatpack, Blind-Mate mechanics', 2),
(3, 'Land Research & Procurement', 'Zoning, GIS, flood elevations', 3),
(4, 'Acquisition & Closing', 'Creative funding, title clearing', 4),
(5, 'Building & Assembly', 'Site logistics, rapid structural execution', 5),
(6, 'Inspections & Delivery', 'Municipal compliance, emergency validation', 6),
(7, 'The Exit & Perpetuity', 'Affordable housing placement, franchise hand-off', 7);
```

## 2. OpenAPI Contract

File: `lib/api-spec/openapi.yaml`

```yaml
  /mhbojt-curriculum:
    get:
      operationId: getMhbojtCurriculum
      tags: [mhbojt]
      summary: Get the 7-stage MHBOJT curriculum, ordered by sort order
      responses:
        "200":
          description: Ordered list of MHBOJT curriculum stages
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/MhbojtCurriculumStage"
        "401":
          description: Unauthorized

components:
  schemas:
    MhbojtCurriculumStage:
      type: object
      properties:
        id:
          type: string
        stageNumber:
          type: integer
        title:
          type: string
        description:
          type: ["string", "null"]
        sortOrder:
          type: integer
        createdAt:
          type: string
      required: [id, stageNumber, title, sortOrder, createdAt]
```

Regenerated via `pnpm --filter @workspace/api-spec run codegen`, producing:
- `useGetMhbojtCurriculum` / `getGetMhbojtCurriculumQueryKey` in `@workspace/api-client-react`
- `MhbojtCurriculumStage` Zod schema in `@workspace/api-zod`

## 3. Backend API Route

File: `artifacts/api-server/src/routes/mhbojt.ts`

```ts
import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, mhbojtCurriculumTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// MHBOJT curriculum — 7-stage physical execution track, ordered by sortOrder
router.get("/mhbojt-curriculum", requireAuth, async (_req, res): Promise<void> => {
  const stages = await db
    .select()
    .from(mhbojtCurriculumTable)
    .orderBy(asc(mhbojtCurriculumTable.sortOrder));

  res.json(stages);
});

export default router;
```

Registered in `artifacts/api-server/src/routes/index.ts` alongside the other routers.
Protected by the existing Clerk cookie-based `requireAuth` middleware — no bearer tokens, no new
auth pathway introduced.

## 4. Frontend Component

File: `artifacts/lms/src/pages/dashboard.tsx`

> Note: the app already had an unrelated card literally named "MHBOJT Action Tracks" (slider-based
> stats for sweat equity hours / mentors / sponsors / referrals). To avoid confusion between the two
> MHBOJT-branded sections, this new component was named `MhbojtCurriculumTrack` and titled
> "MHBOJT Curriculum Track" in the UI. Both cards are rendered on the dashboard, one after the other.

```tsx
function MhbojtCurriculumTrack() {
  const { data: stages, isLoading } = useGetMhbojtCurriculum({
    query: { queryKey: getGetMhbojtCurriculumQueryKey() },
  });

  return (
    <Card className="bg-slate-900 border-amber-700/40 mb-6" data-testid="card-mhbojt-curriculum">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono uppercase tracking-widest text-amber-400 flex items-center gap-2">
          <Hammer className="w-4 h-4 text-amber-500" />
          MHBOJT Curriculum Track
        </CardTitle>
        <p className="text-xs text-slate-500 font-mono pl-0.5">
          Master Home Builder Over Job Training — physical execution curriculum
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : (
          <ol className="relative border-l border-amber-700/30 ml-3 space-y-6">
            {stages?.map((stage) => (
              <li key={stage.id} className="ml-6" data-testid={`row-mhbojt-stage-${stage.stageNumber}`}>
                <span className="absolute -left-[13px] flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-amber-600">
                  <span className="text-[10px] font-mono font-bold text-amber-400">{stage.stageNumber}</span>
                </span>
                <div className="flex items-start gap-2">
                  <Circle className="w-3.5 h-3.5 mt-0.5 text-amber-500/60 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground uppercase tracking-wide">{stage.title}</div>
                    {stage.description && (
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{stage.description}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
```

Mounted in the main `Dashboard` component, directly below the existing `MhbojtActionTracks` card:

```tsx
{/* ── MHBOJT Action Tracks ── */}
<MhbojtActionTracks />

{/* ── MHBOJT Curriculum Track ── */}
<MhbojtCurriculumTrack />
```

## Verification

- `pnpm run typecheck` — passes across all packages (libs + `api-server` + `lms` + `mockup-sandbox` + `scripts`).
- End-to-end Playwright test (Clerk-authenticated session): confirmed the "MHBOJT Curriculum Track"
  card renders exactly 7 ordered stage rows (stage 1 "Planning & Modeling" through stage 7
  "The Exit & Perpetuity"), and the pre-existing "MHBOJT Action Tracks" slider card remains unaffected.
