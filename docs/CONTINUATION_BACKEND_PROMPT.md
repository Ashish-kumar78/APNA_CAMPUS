# Continuation prompt: Apna Campus backend with MongoDB Atlas

Copy everything between the markers into a new Codex task after opening the `APNA_CAMPUS` repository.

> For the current remaining-work brief and post-completion Atlas connection procedure, use [MASTER_PROMPT_REMAINING_BACKEND.md](MASTER_PROMPT_REMAINING_BACKEND.md) and [ATLAS_SETUP_AFTER_BACKEND.md](ATLAS_SETUP_AFTER_BACKEND.md).

--- PROMPT START ---

You are continuing backend development on the existing Apna Campus college ERP. Work directly in this repository as a senior NestJS, Prisma, MongoDB Atlas, and React integration engineer. The user has chosen **MongoDB Atlas** as the target database. Convert the existing database layer safely, then finish backend integration incrementally while preserving the frontend. Report only verified results.

## Repository context

- Repository root: `APNA_CAMPUS/`.
- Canonical backend: `backend/` (NestJS + TypeScript + Prisma). Its schema has been converted offline to Prisma’s MongoDB provider, retaining CUID strings mapped to MongoDB `_id`; this conversion still needs Prisma validation and runtime verification.
- Frontend: `frontend/` (React + Vite).
- ML service: `ai_service/` (FastAPI), separate from the database backend.
- `server/` is a legacy/demo Express app with mock authentication and in-memory Campus Connect data. Do not make it another production backend.
- Canonical current Prisma schema: `backend/prisma/schema.prisma`. Root `prisma/schema.prisma` is divergent and is not canonical. Do not use it for backend changes.
- `docs/BACKEND_GAP_AUDIT.md` records the initial audit; recheck findings against current code.
- Existing working changes include canteen JWT/role handling, DTOs, transactional server-priced orders, persisted canteen staff UI; fee route guards and ownership checks; restrictive CORS; sanitized unhandled errors; and a Render migration-failure fix. Inspect current git diff first and preserve valid work.

## Verify and finish the Atlas conversion first

This is not just a connection-string change. Audit every Prisma model, ID, relation, enum, JSON field, index, query assumption, SQL migration, deployment command, test, and transaction before changing the provider.

- Confirm the locked Prisma version supports MongoDB before changing dependencies. Avoid unrelated upgrades.
- Review the existing conversion in `backend/prisma/schema.prisma`: it uses string CUID IDs mapped to `_id`, Prisma MongoDB relation mode, removes PostgreSQL-only `@db.Text`, and adds indexes for relation fields. Verify every model/relation against the locked Prisma version; change the schema only to fix a demonstrated incompatibility. This strategy preserves API CUID identifiers.
- MongoDB uses `prisma db push` to apply Prisma schema/index changes; it does not use Prisma Migrate. Replace PostgreSQL-specific migration/setup scripts and SQL migration assumptions. Never run `db push` automatically at each server start or against an unconfirmed database. Review the changes and use only an explicitly confirmed empty/safe development or test database.
- Multi-document transactions require a replica set. Verify transaction support against the configured Atlas cluster before claiming transactional workflows work. Do not test with production data.
- If a PostgreSQL database contains real records, design an explicit export/transform/import path that preserves them. Do not drop or reset records. If no database credentials are available, document the migration blocker and still complete schema/code changes that can be verified offline.
- Update safe environment templates and setup docs for the Atlas `mongodb+srv://` connection string, database user, and network access requirements. Never ask for the secret URI in chat, print it, commit it, or overwrite an existing `.env` file.

## Environment and safety

- `backend/.env` and `frontend/.env` were created from example templates and contain placeholders, not verified credentials. The backend placeholder still reflects the former PostgreSQL setup and is not ready for Atlas. Never expose or overwrite local `.env` files; update `.env.example` and tell the user to set the secret Atlas URI locally.
- Dependencies were absent. `npm ci` in backend and frontend failed because DNS/network access to `registry.npmjs.org` was unavailable. Retry checks only if dependencies are now available; do not edit lockfiles to work around the network restriction.
- Do not run database sync, migrations, seed, reset, deletion, or other writes until the user configures and confirms a safe database target. Never use production Atlas for tests.

## Authentication constraint

The repository already has JWT login, activation/reset flows, a JWT strategy, and guards. Do not add a second authentication implementation or rewrite these interfaces as part of business-backend work. Reuse the verified identity supplied by the existing guard for role and ownership checks. Never trust client-supplied roles or IDs. Clearly report existing security weaknesses and do not claim production security while they remain.

## Remaining implementation work

1. **Re-audit and prioritize.** Inspect `docs/BACKEND_GAP_AUDIT.md`, `docs/API_CONTRACT.md`, both Prisma schema files, migrations, all controllers/services, frontend API clients/stores/components, deployment files, and AI service. Map each real screen action to its API, Mongo collection/model, DTO rules, and role/ownership policy. Keep a matrix with implemented, partial, missing, broken, or blocked status.
2. **Finish persisted business flows.** Work in priority order: students/profiles, academic entities/enrollments, faculty assignments, attendance, marks/HOD approvals, exams/results; then fees/payment proof, admissions, hostel, canteen, CMS/notices, library, placement, transport, reports, admin, principal, management, and other workflows actually in the UI. Reuse current modules/models where possible.
3. **Remove fake behavior.** Remove fabricated empty-database records and fake statistics from API responses, browser-only business-data fallbacks, and UI mutations that claim success before persistence. Preserve static design assets. For unavailable external services, surface a real unavailable/error state instead of fake success.
4. **Secure routes and invariants.** Verify JWT coverage, role policy, department and student ownership, DTO validation, field selection, status transitions, duplicate prevention, and multi-document transaction handling for every endpoint. Do not loosen authorization to make a UI appear to work.
5. **Integrate frontend APIs.** Preserve layout, routes, styles, and feature intent. Align requests and response types with actual NestJS routes. On successful writes, reflect server data; on failure, do not leave unsaved optimistic state. Add loading/empty/error states using existing UI patterns. Remove direct frontend `localhost` calls for deployed services.
6. **AI integration.** Keep the existing FastAPI service and artifacts. Use an environment-configured base URL, request timeouts, input validation, and graceful unavailable-service behavior. Do not invent predictions or retrain models without need.
7. **Database quality.** Enforce data integrity in services and Prisma schema/indexes because MongoDB has no relational foreign keys. Use server-calculated prices/totals, safe field selection, idempotent dev-only seeds, and safe additive schema changes. Do not describe SQL migration files as Atlas schema history.
8. **Verification and docs.** Add focused tests for services, controllers, DTOs, role/ownership, empty database, duplicate requests, transitions, and transaction failures. Run typecheck/build, Prisma generation, frontend tests/build, and safe Atlas tests only when dependencies and a confirmed test database are available. Record actual output. Update README, API docs, deployment guidance, and audit.

## Non-negotiable rules

- Do not create another backend, database, or Prisma source of truth.
- Do not overwrite `.env`, expose secrets, or run destructive database operations.
- Do not claim a feature works because files exist; verify route-to-UI behavior and persistence where possible.
- Do not make unnecessary dependency upgrades.
- Do not stop after producing a plan. Implement the largest safe slice available and continue until blocked by a concrete external requirement.
- End with exact changed files, verified features/endpoints, test/build results, unverified behavior, external requirements, and remaining authentication/security limitations.

**Start by checking `git status` and reviewing existing diffs. Validate the Atlas schema conversion offline first; then continue the highest-priority workflow in the audit.**

--- PROMPT END ---
