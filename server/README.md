# Learnify server

Express + Mongoose + JWT backend for the Learnify LMS. Boots on port 5000
by default and proxies everything under `/api`. The client (Vite dev
server on `:5173`) is wired to forward `/api/**` to this server.

## One-time Atlas setup

1. Atlas → Network Access → add your current IP address (or `0.0.0.0/0`
   for dev only).
2. Confirm the `learnify_app` (or `kenkaneki5414_db_user`) DB user has
   `readWrite` on the `learnify` database.
3. The connection string in `.env.example` already points at the cluster
   and pins collections to the `learnify` DB via the `/learnify` path
   segment.

## Local config

```bash
cp .env.example .env
# edit .env: replace JWT_SECRET with a real 32+ byte random string
```

`MONGODB_URI` is normalized to `mongodb+srv://…/learnify?…` so collections
land in the `learnify` DB rather than the default `admin` DB.

## Scripts

```bash
npm install          # express, mongoose, bcryptjs, jsonwebtoken, helmet, cors, dotenv
npm run seed         # idempotent: upserts instructors + courses + lectures from client/src/mocks/catalog.js
npm run dev          # node --watch src/index.js  (boots on :5000)
npm start            # node src/index.js
```

## API envelope

Every response follows `docs/API.md`:

```jsonc
// success
{ "success": true, "data": { … } }

// error
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "…" } }
```

## Endpoints

| Method | Path                          | Auth     |
|--------|-------------------------------|----------|
| POST   | /api/auth/register            | none     |
| POST   | /api/auth/login               | none     |
| GET    | /api/courses                  | optional |
| GET    | /api/courses/:id              | optional |
| POST   | /api/courses/:id/enroll       | required |
| GET    | /api/lectures/:id             | required |
| POST   | /api/progress                 | required |
| GET    | /api/progress/:courseId       | required |
| GET    | /api/certificate/:courseId    | required |

Server is authoritative on lecture locking: `GET /api/lectures/:id`
returns 403 unless the previous lecture in `order` is completed.

## Failure modes

- `MONGODB_URI` missing → boot crashes fast with a clear error.
- IP not allowlisted → `npm run seed` errors with Mongoose ServerSelectionTimeout.
  Fix in Atlas → Network Access.
- Wrong DB user / password → `MongoServerError: bad auth`. Rotate the
  password in Atlas → Database Access and update `.env`.
