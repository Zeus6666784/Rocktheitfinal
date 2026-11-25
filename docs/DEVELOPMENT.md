# Development guide

## Prerequisites

Node.js, npm, and a MongoDB instance are required. Configure the server in
`server/.env` using the variable names listed in
[CODEX_PROJECT_CONTEXT.md](CODEX_PROJECT_CONTEXT.md); do not commit that file.

## Commands

Run from the repository root:

```bash
npm test                 # server integration suite using an in-memory MongoDB
npm run build            # Vite production build
npm run dev              # server (:5000) and client (:5173)
npm run dev:server       # server only
npm run dev:client       # client only
npm run seed             # populate the configured development database
```

The Vite dev server proxies `/api` to `http://localhost:5000` unless
`VITE_API_PROXY` changes it. `VITE_USE_MOCK=true` enables the local mock API.

## Architecture conventions

- Controllers validate HTTP input and delegate business rules to services.
- API responses use `{ success, data }` or `{ success: false, error }`.
- React services own API calls; reusable components receive data and callbacks
  through props.
- Protected sessions are hydrated from `GET /api/auth/session`, not trusted
  from a cached JWT payload alone.
