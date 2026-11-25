# Learnify Test Report

Date: 2026-11-25

## Automated verification

| Command | Result |
| --- | --- |
| `npm test` | PASS — 31 tests, 0 failures |
| `npm run build` | PASS — Vite production build completed |
| `node --check` on changed server modules | PASS |
| `npm audit --omit=dev --offline` in `client/` and `server/` | PASS — 0 vulnerabilities |

The integration suite uses Supertest with mongodb-memory-server. It does not
connect to the configured production database.

## Covered behaviour

- Registration, duplicate email, invalid password, login, disabled accounts,
  and database-backed session hydration.
- Student/instructor/admin authorization, expired/tampered JWTs, deleted or
  disabled accounts, and immediate removal of access following role demotion.
- Admin course, lecture, user, category, instructor, enrollment, analytics,
  and settings operations.
- Course discovery/enrolment, progress authorization, managed-video range
  streaming, completion, and certificate metadata generation.
- Public demo-video restriction, private-video authorization, and invalid/path
  traversal filename rejection.

## Limitations

- No browser E2E runner is configured, so responsive UX and complete browser
  navigation remain manual-test concerns.
