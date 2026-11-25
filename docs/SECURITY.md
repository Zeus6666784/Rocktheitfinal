# Security guide

## Implemented controls

- Helmet, CORS restrictions, compression, and a 100 kB JSON body limit.
- bcrypt password hashes and signed JWTs.
- Database-backed account, role, deleted-account, and disabled-account checks
  on protected requests.
- Auth and admin rate limits outside the test environment.
- Role-protected administrator APIs and self-lockout prevention.
- Enrolment checks for progress, certificates, and learner video streaming.
- Managed video filename validation, path containment, upload MIME/extension
  validation, a 500 MB limit, and no public managed-video route.

## Release checklist

- Store all secrets only in deployment configuration, never source control.
- Use long, unique production values for JWT signing and database credentials.
- Set explicit production CORS origins and `TRUST_PROXY=1` behind a trusted
  reverse proxy.
- Use persistent or object storage for uploads and restrict filesystem access.
- Review [TEST_REPORT.md](TEST_REPORT.md) and
  [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) before release.
