# Connect Apna Campus to MongoDB Atlas after backend work is complete

This guide is for the point when the remaining backend work has been implemented and verified offline. It assumes the canonical Prisma schema is `backend/prisma/schema.prisma` and the backend uses the locked Prisma 5.22 packages.

## Before you start

- Use a new, empty development/test database first. Do not use production data to test the app.
- If PostgreSQL might contain records you need, stop before schema sync. `prisma db push` does not migrate PostgreSQL records into MongoDB; that needs a separate reviewed export/transform/import process.
- Atlas database users are different from Atlas website users. Make a database user for the app with access scoped to the application database. Atlas requires the connecting IP/network to be in the project's IP access list. Atlas clusters provide a replica-set deployment, needed when workflows use multi-document transactions.
- Keep the URI private. Do not paste it into chat, source code, screenshots, tickets, or a frontend `VITE_*` variable.

## 1. Create the Atlas project and cluster

1. Sign in to MongoDB Atlas and create/select an Atlas organization and project for Apna Campus.
2. Create a cluster in a region close to the backend deployment and users. Choose the cluster tier that fits your workload and budget; the Atlas UI shows currently available tiers.
3. Wait until the cluster reports ready. Do not create a production cluster just to test initial setup.

## 2. Configure database network access

1. In the Atlas project, open **Security → Network Access** (sometimes shown as **Database & Network Access**).
2. For local development, add your current public IP. It can change when your ISP/network changes, so update the allow-list when local connections stop working.
3. For deployment, allow the backend host's documented outbound IP addresses or configure private networking. Do not leave `0.0.0.0/0` enabled as a permanent shortcut.

## 3. Create an application database user

1. Open **Security → Database Access** / **Database Users**.
2. Add a database user using password authentication.
3. Grant only the required database role for the app database (normally read/write access to that one database for this application). Do not use an Atlas organization/project owner account as the app's database credentials.
4. Generate a strong unique password and store it in a password manager. If it contains URI-reserved characters, URL-encode those characters when building the URI.

## 4. Copy the driver connection string

1. On the cluster page, select **Connect → Drivers** and choose the Node.js driver option if Atlas asks.
2. Copy the provided `mongodb+srv://` connection string. Replace the username/password placeholders privately.
3. Ensure the URI selects a database named `apna_campus`, for example:

```text
mongodb+srv://<db_user>:<encoded_password>@<cluster-host>/apna_campus?retryWrites=true&w=majority
```

Use the actual host/query options supplied by Atlas. Do not post the completed URI anywhere public.

## 5. Set `DATABASE_URL` locally without overwriting `.env`

From the repository root in macOS/Linux zsh, create the file only if it does not already exist:

```zsh
test -f backend/.env || cp backend/.env.example backend/.env
```

Open `backend/.env` in your editor and set its `DATABASE_URL` value to the private URI. In VS Code:

```zsh
code backend/.env
```

If `code` is not installed, open the file using your editor. Do not print the file in a terminal transcript. Do not put `DATABASE_URL` in `frontend/.env`; a browser must never receive database credentials.

PowerShell users can create the file without replacing an existing one:

```powershell
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
```

Then edit `backend\.env` privately. The repository's `.gitignore` excludes `.env` files; verify the path is ignored without displaying its contents:

```zsh
git check-ignore backend/.env
```

## 6. Install dependencies and validate offline first

From the repository root:

```zsh
npm ci
npm ci --prefix backend
npm ci --prefix frontend
```

Then validate and generate from the canonical backend directory:

```zsh
cd backend
npx prisma validate
npx prisma generate
npm run lint
cd ..
npm run build --prefix frontend
npm run test:frontend
```

Run any backend tests added during the remaining work. If dependency installation fails, resolve the network/package access problem first. Do not edit lockfiles to bypass it.

## 7. Review before creating collections/indexes

1. Verify the configured target is the empty development/test database you intended. Do not show the URI when checking it.
2. Review `backend/prisma/schema.prisma` and the schema diff. The root `prisma/schema.prisma` and SQL migration files are legacy and must not be used as the Atlas source of truth.
3. Read the full output/help for the locked Prisma CLI if needed. Do not use `--force-reset` or `--accept-data-loss`.
4. If the schema tool warns that existing data would be dropped or changed, stop. Do not proceed until a safe data-preserving plan exists.
5. When the safe dev/test target is confirmed and the schema is reviewed, run this explicit command from the repository root:

```zsh
npm run prisma:db-push
```

This applies the canonical Prisma schema/indexes. MongoDB uses `db push` here; do not run `prisma migrate` against Atlas. The app must not run schema sync on startup.

## 8. Verify the connected app safely

1. Start the development stack with `npm run dev:full` (includes the AI service), or start only the API and frontend if the feature you are checking does not need AI.
2. Check backend health and the authenticated admin diagnostics route. Confirm MongoDB ping succeeds.
3. Exercise one low-risk read and one create/read/update/delete flow using throwaway test records in the dev/test database. Confirm failed requests do not leave browser-only success state.
4. If an operation spans multiple documents, test both successful commit and induced failure/rollback against this test cluster. Atlas supports replica sets, but the exact Prisma 5.22 code path still must pass the project's tests.
5. Inspect expected collections and indexes in Atlas Data Explorer. Do not use actual student/financial records for tests.
6. Demo seeding has been removed. Only import verified institutional records when they are ready.

## Create the first development Super Admin

Use this only when the development Atlas database has the current schema and no Super Admin account. The bootstrap command requires a database name containing `dev`, `development`, `test`, or `testing`; it displays that database name for confirmation, refuses if any Super Admin already exists, and records a unique one-time bootstrap lock. It prompts for the password without echoing it and stores only a bcrypt hash. It does not run the demo seed.

From the backend directory, run:

```zsh
npm run admin:bootstrap
```

Type the displayed development database name exactly, then enter the person's name, email, login identifier, and private password. After it succeeds, start the backend and frontend, sign in with that identifier and password, and use the Super Admin Portal's User Directory to provision other accounts. Do not run this command against production. If a Super Admin already exists, use that account instead; this bootstrap is not a password-reset or recovery mechanism.

## 9. Configure deployment after local verification

1. In the backend host's secret/environment settings, set `DATABASE_URL` to the production Atlas URI. Add `AI_SERVICE_URL`, `CLIENT_URL`, and a strong unique `JWT_SECRET` as appropriate for that environment.
2. Do not place the database URI in frontend build variables or commit it.
3. Add only the backend host's documented egress IPs or private network path to Atlas Network Access.
4. Configure and verify Atlas backup/restore for the selected cluster tier before storing real institutional data.
5. Apply production schema changes only through a reviewed release procedure after backup and a specific production change review. Never make the app start command run `db push`.

## Atlas-specific notes

- Atlas database users and Atlas website users are separate identities.
- Prisma MongoDB relations are emulated in Prisma Client; MongoDB does not enforce relational foreign keys. Service code and indexes must preserve data integrity.
- MongoDB distinguishes explicit `null` from a missing field; review filters/optional fields for legacy data.
- Multi-document transactions need a replica set. Atlas supplies this, but application transaction behavior still needs verification.
- MongoDB's Prisma workflow uses `db push`; the PostgreSQL SQL migration directory is not Atlas schema history.
