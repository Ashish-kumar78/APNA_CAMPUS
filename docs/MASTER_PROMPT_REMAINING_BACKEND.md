# Master prompt: finish Apna Campus backend and connect MongoDB Atlas

Copy the prompt between the markers into a new Codex task after opening the `APNA_CAMPUS` repository. Read the current `git status` first. This prompt assumes the Atlas schema conversion and first safety fixes are already present as local, uncommitted work.

--- PROMPT START ---

You are continuing implementation of the existing Apna Campus ERP as a senior NestJS, Prisma, MongoDB Atlas, React, and application-security engineer. Finish the remaining backend integration in small, reviewable slices. Preserve the current UI and valid local changes. Report only behavior that has actually been verified.

## Repository and current state

- `backend/` is the canonical production API: NestJS + TypeScript + Prisma.
- `backend/prisma/schema.prisma` is the canonical schema. It has been converted offline to MongoDB and retains the existing CUID string IDs mapped to MongoDB `_id`. It uses Prisma-emulated relations and has relation indexes added. This schema has **not** yet passed Prisma CLI validation or been pushed to a database.
- `frontend/` is React + Vite. `ai_service/` is a separate FastAPI service. `server/` is a legacy Express demo with mock auth and in-memory Campus Connect state; do not turn it into a production backend.
- Root `prisma/schema.prisma` and `backend/prisma/migrations/` contain PostgreSQL-era artifacts. They are not the canonical Atlas schema or Atlas migration history.
- The repository already has local edits for Atlas templates/scripts/deployment/docs, safer canteen and fee handling, no-demo report student results, no GET-time hostel seeding, residence ownership checks, cleaned exam cycle listing, corrected admin diagnostics/backup placeholders, and complaint-console API behavior. Inspect the actual diff and preserve valid changes; do not assume every changed file is yours to replace.
- `docs/BACKEND_GAP_AUDIT.md` is the live initial audit. Recheck it against code as you work and keep it accurate.
- The prior `npm ci` attempts failed because DNS/network access to `registry.npmjs.org` was unavailable. Dependencies may still be absent. Retry only when installation is plausibly available; do not alter lockfiles to bypass installation problems.
- Local ignored `.env` files exist. The backend file has an old placeholder. **Never read their contents into output, overwrite them, commit them, or ask the user to paste secrets.** Change only safe templates unless the user explicitly directs otherwise.
- The user selected MongoDB Atlas. No safe Atlas target or URI has been confirmed. No `db push`, seed, destructive command, or database write is authorized by this prompt.

## Required working method

1. Start with `git status --short`, `git diff --stat`, and review relevant diffs. Preserve unrelated/user edits. Do not commit, push, deploy, or contact external services.
2. Re-audit the actual route → controller → service → Prisma model → frontend action chain before changing a feature. A file existing is not proof of persistence or authorization.
3. Keep `backend/prisma/schema.prisma` as the only Prisma source of truth. Confirm the locked Prisma version in package manifests/lockfiles. Avoid dependency upgrades unless a demonstrated incompatibility requires one and document it first.
4. Prioritize in this order:
   - installability, offline Prisma validation/client generation, lint/typecheck, and builds;
   - identity linkage, student profiles, departments/programmes/courses/enrollments and faculty assignment scope;
   - attendance, marks, HOD approvals, exams/results and timetables;
   - fees/payment proofs, admissions and hostel allocation;
   - canteen, CMS/notices, library, placement, transport and other modules shown in the UI;
   - admin/principal/management reports, settings, audit, and Campus Connect if still in scope;
   - remaining local browser stores and external-service integration.
5. In each slice: document the endpoint contract; validate input with DTOs; use the authenticated JWT identity for role/ownership; enforce department/student scope and state/duplicate invariants; select only necessary fields; write server-calculated values; connect the React action to the real API; reflect server results only after success; show loading/empty/error states. Do not loosen authorization to make a screen appear functional.
6. Remove synthetic API records, silent fallbacks, fake integration health, fabricated metrics, and optimistic success that survives a failed write. Static design assets and explicitly labelled sample-only materials may remain. For an unconfigured service, return/show a truthful unavailable state.
7. Review every multi-document invariant for MongoDB. MongoDB requires a replica set for multi-document transactions; Atlas supplies a replica-set deployment. Use only transaction APIs supported by the locked Prisma 5.22 client and test them against a dedicated safe test database. Single-document atomic updates and unique indexes may be preferable where they fully enforce the invariant. Do not claim transaction behavior works until it has been verified.
8. MongoDB does not use the repository's SQL Prisma Migrate history. Use Prisma `db push` only for schema/index changes. Never run schema sync at server startup. Do not use `--force-reset` or `--accept-data-loss` to silence warnings. If Prisma reports a destructive/data-loss change, stop and design a safe migration plan.
9. Do not seed synthetic institutional data. The demo seed has been removed; import only verified records into an explicitly selected database.
10. If an existing PostgreSQL database may hold real records, do not point the app at it or discard it. First establish whether data exists; if it does, design and review a separate export/transform/import process that preserves IDs and records. Do not assume `db push` migrates PostgreSQL data.
11. Add/run focused tests for DTO validation, identity/role/ownership, empty collections, duplicate actions, transitions, transaction errors, and persistence. Run lint/typecheck/build and frontend tests when dependencies are installed. Use a dedicated confirmed test database for database tests only. Record command and result; do not claim checks that could not run.
12. Update `docs/BACKEND_GAP_AUDIT.md`, `docs/API_CONTRACT.md`, README/deployment docs, and relevant tests as each slice is completed. Label remaining legacy/demo behavior accurately.

## Mandatory MongoDB Atlas activation gate

Do all offline implementation and checks first. Do not connect or write to Atlas until the user has configured a **dedicated empty/safe development or test database** and explicitly confirms that target is safe for schema creation. Never request the URI in chat. If that precondition is absent, finish all independent work and leave a clear blocker.

Once the target is confirmed, the allowed database sequence is:

1. Privately set `DATABASE_URL` in the ignored `backend/.env` (or the deployment secret manager); do not output it.
2. Verify environment keys without printing values, verify `.env` remains git-ignored, and confirm the database name/cluster are the intended dev/test target.
3. Validate/generate Prisma Client with the canonical backend schema.
4. Review the schema/index changes and ensure the target has no valuable records. If output warns about data loss, stop; do not accept it automatically.
5. Only then, run the explicit backend `prisma db push` against that safe target. Never run seed unless its code was reviewed and the user separately confirms a disposable dev/test target.
6. Verify connectivity, expected collections/indexes, one safe read/write/delete test record in the dedicated test environment, transaction behavior if the workflow requires it, and application route-to-UI behavior. Clean up only the test record created by that test.
7. For deployment, configure the Atlas URI as a backend-only secret, set the deployed app's `AI_SERVICE_URL`, `CLIENT_URL`, and strong JWT secret, allow only the deployment's network egress/private connection in Atlas, and apply schema changes through a reviewed release procedure—not app startup.

## Remaining known gaps to reassess

The audit currently calls out fabricated exam dashboard statistics, several browser-local data stores, admin in-memory approvals, incomplete persistence across portals, broad route/ownership verification, hostel allocation/transfer consistency, legacy Express Campus Connect, and security review of reset-token delivery. Other gaps may be discovered. Do not simply delete a UI feature; preserve its intent and replace mock behavior with the real API or an honest unavailable state.

## Completion report

Do not stop after a plan. Implement the largest safe independent slice and continue until the next action truly requires unavailable dependencies, a user-confirmed database target, or missing product policy. End with:

- exact files changed;
- endpoints and user flows verified, and how they were verified;
- commands/tests/builds actually run and their output/result;
- unverified behavior and concrete blockers;
- Atlas work still requiring the user, with no secret values;
- remaining auth/data-integrity risks;
- confirmation that no database writes, commits, pushes, or deployments occurred unless separately authorized.

--- PROMPT END ---
