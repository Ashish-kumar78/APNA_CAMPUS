# CollegeFlow NestJS Backend

NestJS API that mirrors the existing frontend contract.

## Commands

```bash
npm install
npm run start:dev
```

The API runs on `http://localhost:4000` by default.

## Routes

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/dashboard`
- `POST /api/auth/logout`

There are no production or shared demo credentials. Create the first development Super Admin with `npm run admin:bootstrap`, then create institutional accounts from the authenticated Super Admin Portal.

### Remove development academic QA fixtures

If the old development-only academic QA seed was used, `npm run cleanup:academic-qa` removes only records marked with its `QA-` identifiers and `QA TEST —` catalogue names. It requires an exact development/test database-name confirmation. It preserves non-QA records and audit logs. This command does not seed or create institutional data.
