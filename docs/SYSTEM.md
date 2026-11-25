# Learnify system design

Learnify is a MERN learning-management system.

```text
React/Vite client → Axios bearer token → Express API → Mongoose → MongoDB
                                      ↘ managed video filesystem storage
```

## Client

`client/src/main.jsx` provides router, theme, user, and progress contexts.
`App.jsx` lazy-loads page routes for home, catalogue, course detail, protected
learning, sign-in/registration, and the admin dashboard. Services under
`client/src/services/` are the API boundary.

On startup, `UserContext` calls `GET /api/auth/session` to validate any stored
token against the current database account. Learning pages require an active
session; managed video is fetched as an authorized blob.

## Server

`server/src/index.js` creates the Express app with Helmet, CORS, compression,
JSON parsing, `/api/health`, API routes, error handling, and a production SPA
fallback. Database connection and optional admin bootstrap happen only when
the server process starts, not when tests import `createApp()`.

Controllers validate transport input; services implement domain rules; models
own MongoDB persistence. Every response uses the standard success/error
envelope.

## Core flows

Student: browse → sign in/register → enrol → learn → record progress →
complete → obtain certificate metadata.

Administrator: sign in → session verification → role-protected dashboard →
manage courses, lectures, users, categories, enrolments, and videos.

See [API.md](API.md), [DATABASE.md](DATABASE.md), and
[CODEX_PROJECT_CONTEXT.md](CODEX_PROJECT_CONTEXT.md) for details.
