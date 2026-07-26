# Security

The full, authoritative security policy lives in **`security.md`** at the repo root. This file is just the pointer + a deployment-specific checklist.

## Required reading
- [`security.md`](./security.md) — read in full before touching auth, uploads, or secrets.

## Deploy-specific hardening (already applied)
- `.env` is gitignored at both repo root and `server/.env`. Never commit secrets.
- `server/.env.example` carries blank placeholders + commands to generate values.
- All admin endpoints (`/api/admin/*`) require an `X-Admin-Key` header. The key is checked with `crypto.timingSafeEqual` against `process.env.ADMIN_TOKEN`.
- `ADMIN_TOKEN` is required in production. Missing it boots with a fatal error (fail closed) — no admin requests go through.
- `/api/videos/:filename` streams videos that live outside any publicly-served directory (`server/data/videos/`). Same `X-Admin-Key` check.
- `express-rate-limit` caps auth at 10 req / 15 min per IP and admin at 30 req / min per IP.
- Helmet sets CSP, HSTS (1y + includeSubDomains), X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- `TRUST_PROXY=1` in production so `req.ip` is the real client IP behind Railway's load balancer (required for accurate rate-limiting).
- `JSON` body limit tightened from 1 MB to 100 KB. Multer caps uploads at 500 MB. Uploaded MIME + extension both checked (defence-in-depth against renamed executables).
- `error.js` returns generic `SERVER_ERROR / Internal server error` to clients. Stack traces only go to the server log.
- Multipart uploads are stored under a temp filename by multer, then renamed to a server-side slug. Original filenames are never trusted.

## Secrets that MUST be rotated before a real production deploy
1. **MongoDB password** — `x3r4Q21GxWxMGGkD` was used in the seed `.env.example`. Rotate at Atlas, re-seed in production, and never check the new password into git.
2. **JWT_SECRET** — change to a long random string (see generator command in `.env.example`).
3. **ADMIN_TOKEN** — set via Railway's Variables UI. Keep offline.
4. **CORS_ORIGINS** — replace `http://localhost:5173` with the Railway app URL. Setting `'*'` allows any origin to read `Authorization` headers if you ship them; avoid it.

## Secrets already leaked via git history (incident response)
`server/.env.example` contains the seed Atlas password (`kenkaneki5414_db_user`/`x3r4Q21GxWxMGGkD`) in **older commits**. That's now redacted in HEAD, but git history still has it. Treat that user + cluster as compromised if the repo was ever public: rotate the password at Atlas, scrub git history (`git filter-repo` or BFG), force-push if the user is OK with it, and update `.env` on every local clone.

## Demo posture (current state)
This codebase runs anonymously for a demo, with admin upload + listing deliberately exposed so the user can show off the upload-to-render flow without wiring OAuth. The constraints above turn the demo's most dangerous exposures into well-gated, rate-limited, audited capabilities.
