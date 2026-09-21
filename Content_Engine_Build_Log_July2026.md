# Dynamic Content Engine & Vetting Gates — Build Log (July 2026)

This document records the schema, API, and frontend component code added to support the
AI-driven doctrine ingestion, quiz, essay, and scoring pipeline on the Briefings (Feed) tab.

## 1. Database Schema

File: `lib/db/src/schema/content-engine.ts`

```ts
import { pgTable, uuid, varchar, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const briefingsContentTable = pgTable("briefings_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoUrl: varchar("video_url", { length: 512 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  coreDoctrineSummary: jsonb("core_doctrine_summary").notNull(),
  quizJson: jsonb("quiz_json").notNull(),
  essayPrompt: text("essay_prompt").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const candidateScoresTable = pgTable("candidate_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: varchar("candidate_id", { length: 255 }).references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  briefingId: uuid("briefing_id").references(() => briefingsContentTable.id, { onDelete: "cascade" }).notNull(),
  quizScore: integer("quiz_score").notNull(),
  essayResponse: text("essay_response"),
  personalNotes: text("personal_notes"),
  totalEarnedEquityPoints: integer("total_earned_equity_points").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

Tables created via raw SQL (drizzle-kit push requires an interactive TTY, unavailable in this session):

```sql
CREATE TABLE IF NOT EXISTS briefings_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url varchar(512) NOT NULL,
  title varchar(255) NOT NULL,
  core_doctrine_summary jsonb NOT NULL,
  quiz_json jsonb NOT NULL,
  essay_prompt text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidate_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id varchar(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  briefing_id uuid NOT NULL REFERENCES briefings_content(id) ON DELETE CASCADE,
  quiz_score integer NOT NULL,
  essay_response text,
  personal_notes text,
  total_earned_equity_points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

## 2. OpenAPI Contract

File: `lib/api-spec/openapi.yaml`

```yaml
  /generate-briefing:
    post:
      operationId: generateBriefing
      tags: [mhbojt]
      summary: Ingest a YouTube URL and generate a doctrine summary, quiz, and essay prompt
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/GenerateBriefingInput"
      responses:
        "200":
          description: Generated briefing content
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BriefingContent"

  /candidate-scores:
    post:
      operationId: submitCandidateScore
      tags: [mhbojt]
      summary: Submit a candidate's quiz score, essay response, and notes for a briefing
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CandidateScoreInput"
      responses:
        "200":
          description: Saved candidate score
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CandidateScore"

components:
  schemas:
    GenerateBriefingInput:
      type: object
      properties:
        videoUrl: { type: string }
      required: [videoUrl]

    QuizQuestion:
      type: object
      properties:
        question: { type: string }
        options: { type: array, items: { type: string } }
        correctIndex: { type: integer }
      required: [question, options, correctIndex]

    BriefingContent:
      type: object
      properties:
        id: { type: string }
        videoUrl: { type: string }
        title: { type: string }
        coreDoctrineSummary: { type: array, items: { type: string } }
        quizJson: { type: array, items: { $ref: "#/components/schemas/QuizQuestion" } }
        essayPrompt: { type: string }
        createdAt: { type: string }
      required: [id, videoUrl, title, coreDoctrineSummary, quizJson, essayPrompt, createdAt]

    CandidateScoreInput:
      type: object
      properties:
        briefingId: { type: string }
        quizScore: { type: integer }
        essayResponse: { type: ["string", "null"] }
        personalNotes: { type: ["string", "null"] }
      required: [briefingId, quizScore]

    CandidateScore:
      type: object
      properties:
        id: { type: string }
        candidateId: { type: string }
        briefingId: { type: string }
        quizScore: { type: integer }
        essayResponse: { type: ["string", "null"] }
        personalNotes: { type: ["string", "null"] }
        totalEarnedEquityPoints: { type: integer }
        createdAt: { type: string }
      required: [id, candidateId, briefingId, quizScore, totalEarnedEquityPoints, createdAt]
```

Regenerated via `pnpm --filter @workspace/api-spec run codegen`, producing:
- `useGenerateBriefing`, `useSubmitCandidateScore` hooks in `@workspace/api-client-react`
- `BriefingContent`, `CandidateScore`, `QuizQuestion` Zod schemas in `@workspace/api-zod`

## 3. Backend API Route

File: `artifacts/api-server/src/routes/content-engine.ts`

```ts
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, briefingsContentTable, candidateScoresTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * Simulated AI ingestion pipeline. Given a YouTube URL, produces a structured
 * doctrine digest: a 3-bullet summary, a 3-question multiple-choice quiz, and
 * an essay prompt. This is a deterministic placeholder — swap in a real
 * transcript-fetch + LLM call here when ready to wire up actual AI ingestion.
 */
function simulateIngestion(videoUrl: string, youtubeId: string | null) {
  const title = youtubeId ? `Doctrine Briefing — ${youtubeId}` : "Doctrine Briefing";
  const coreDoctrineSummary = [
    "Core principle: disciplined execution beats improvisation under pressure.",
    "Resource stewardship — every dollar and hour is accountable to the mission.",
    "Community compounding — individual gains must feed the collective build.",
  ];
  const quizJson = [
    { question: "What is the primary doctrine emphasized in this briefing?", options: ["Disciplined execution", "Improvisation", "Individual glory", "Avoiding accountability"], correctIndex: 0 },
    { question: "How should resources be treated according to the doctrine?", options: ["As disposable", "As accountable to the mission", "As irrelevant", "As purely personal"], correctIndex: 1 },
    { question: "What compounds when candidates apply this doctrine?", options: ["Isolation", "Community gains", "Confusion", "Delay"], correctIndex: 1 },
  ];
  const essayPrompt = "Challenge this doctrine: identify one scenario in your own build where disciplined execution " +
    "could conflict with resource stewardship, and explain how you would resolve the tension.";
  return { title, coreDoctrineSummary, quizJson, essayPrompt };
}

router.post("/generate-briefing", requireAuth, async (req, res): Promise<void> => {
  const { videoUrl } = req.body as { videoUrl?: string };
  if (!videoUrl || typeof videoUrl !== "string") {
    res.status(400).json({ error: "videoUrl is required" });
    return;
  }
  const youtubeId = extractYouTubeId(videoUrl);
  const generated = simulateIngestion(videoUrl, youtubeId);
  const [saved] = await db.insert(briefingsContentTable).values({
    videoUrl, title: generated.title, coreDoctrineSummary: generated.coreDoctrineSummary,
    quizJson: generated.quizJson, essayPrompt: generated.essayPrompt,
  }).returning();
  res.json(saved);
});

router.post("/candidate-scores", requireAuth, async (req, res): Promise<void> => {
  const candidateId = (req as AuthenticatedRequest).clerkUserId;
  const { briefingId, quizScore, essayResponse, personalNotes } = req.body as {
    briefingId?: string; quizScore?: number; essayResponse?: string | null; personalNotes?: string | null;
  };
  if (!briefingId || typeof quizScore !== "number") {
    res.status(400).json({ error: "briefingId and quizScore are required" });
    return;
  }
  const [briefing] = await db.select().from(briefingsContentTable).where(eq(briefingsContentTable.id, briefingId));
  if (!briefing) {
    res.status(404).json({ error: "Briefing not found" });
    return;
  }
  // Equity points: 10 per correct quiz answer, +15 bonus for a submitted essay
  const totalEarnedEquityPoints = quizScore * 10 + (essayResponse?.trim() ? 15 : 0);
  const [saved] = await db.insert(candidateScoresTable).values({
    candidateId, briefingId, quizScore, essayResponse: essayResponse ?? null,
    personalNotes: personalNotes ?? null, totalEarnedEquityPoints,
  }).returning();
  res.json(saved);
});

export default router;
```

Registered in `artifacts/api-server/src/routes/index.ts`. Both endpoints are protected by the
existing Clerk cookie-based `requireAuth` middleware — no bearer tokens, no new auth pathway.

Note on Phase 2 scope: the ingestion pipeline is currently a deterministic simulation (fixed
3-bullet digest / 3-question quiz / essay prompt), as requested ("build the framework to simulate
AI ingestion"). Swapping in a real transcript-fetch + LLM call later only requires replacing the
body of `simulateIngestion` — the API contract, DB schema, and frontend are already wired for it.

## 4. Frontend Component

File: `artifacts/lms/src/pages/feed.tsx`

Added a `ContentEngine` component mounted below the existing video-player feed (within the same
snap-scroll container, as its own final section):

```tsx
function ContentEngine() {
  const [url, setUrl] = useState("");
  const [briefing, setBriefing] = useState<BriefingContent | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [essayResponse, setEssayResponse] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [submitted, setSubmitted] = useState<{ totalEarnedEquityPoints: number } | null>(null);

  const generate = useGenerateBriefing();
  const submitScore = useSubmitCandidateScore();

  // handleIngest() -> generate.mutate({ data: { videoUrl } }, { onSuccess: setBriefing })
  // handleSubmit() -> computes quizScore from answers vs correctIndex, then
  //   submitScore.mutate({ data: { briefingId, quizScore, essayResponse, personalNotes } })

  return (
    <div data-testid="section-content-engine">
      {/* Ingest Doctrine URL input + button (data-testid="input-ingest-doctrine-url", "button-ingest-doctrine") */}
      {/* Digest section (data-testid="section-digest") — title + 3-bullet coreDoctrineSummary */}
      {/* Execution Quiz section (data-testid="section-execution-quiz") — radio buttons per question */}
      {/* Project Essay section (data-testid="section-project-essay") — Textarea bound to essayResponse */}
      {/* Command Notes section (data-testid="section-command-notes") — private Textarea bound to personalNotes */}
      {/* Submit & Calculate Score button (data-testid="button-submit-calculate-score") */}
      {/* Score result (data-testid="text-score-result") once submitted */}
    </div>
  );
}
```

Mounted in `Feed()`:

```tsx
<div className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory pb-16 md:pb-0 hide-scrollbar">
  {/* Video player feed — BriefingCard list */}
  <div className="[&>div]:snap-start">
    {briefings?.map((briefing) => <BriefingCard key={briefing.id} briefing={briefing} ... />)}
  </div>

  {/* ── Dynamic Content Engine — below the video player ── */}
  <div className="snap-start">
    <ContentEngine />
  </div>
</div>
```

## Verification

- `pnpm run typecheck` — passes across all packages (libs + `api-server` + `lms` + `mockup-sandbox` + `scripts`).
- Workflows restarted cleanly (API server + LMS frontend), no runtime errors in logs.
- End-to-end Playwright test (Clerk-authenticated session): signed in, navigated to `/feed`,
  scrolled to the Content Engine, submitted a YouTube URL, verified the Digest / Execution Quiz /
  Project Essay / Command Notes sections all rendered, answered all 3 quiz questions, filled the
  essay and notes fields, clicked "Submit & Calculate Score", and confirmed the score result
  ("+15 equity points earned" for the test run) displayed correctly.
