# Deployment guide

Build with `npm run build` and start the Express server with `npm start`.
Production requires the server environment variables documented in
[CODEX_PROJECT_CONTEXT.md](CODEX_PROJECT_CONTEXT.md), particularly
`MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGINS`.

Before release:

1. Run `npm test`, `npm run build`, and offline production audits in `client/`
   and `server/`.
2. Set `NODE_ENV=production` and restrict `CORS_ORIGINS` to deployed origins.
3. Confirm MongoDB network access and credentials without printing them.
4. Provision persistent storage or external object storage for uploaded videos.
5. Verify `/api/health`, sign-in, enrolment, authorized playback, and an
   administrator workflow in the deployed environment.
