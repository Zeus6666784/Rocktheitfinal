# Production readiness

Date: 2026-11-25

The project builds successfully and its 32-test server integration suite
passes. Authentication, database-backed role checks, protected media,
enrolment-gated progress and certificates, course/lecture administration, and
category/enrolment management are implemented.

## Verified security controls

- Protected requests reload the account, rejecting deleted and disabled users.
- Expired, tampered, and demoted JWTs are rejected.
- Progress, certificates, and lecture video streams require enrolment.
- Managed videos are authenticated; only `demo.mp4` is public.
- Video filenames are validated against traversal and invalid-character input.
- Helmet, CORS, body-size limits, and rate limiters are enabled.

## Before release

1. Resolve database network access from the deployment environment.
2. Set production environment values securely; never commit them.
3. Test CORS, uploads, durable media storage, and the full browser workflow.
4. Add browser end-to-end tests and CI dependency auditing.
