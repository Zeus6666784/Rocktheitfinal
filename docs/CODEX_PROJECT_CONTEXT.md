# Learnify project context

Learnify is a MERN learning-management application for students, instructors,
and administrators. Students browse courses, authenticate, enrol, learn through
protected lectures, track progress, and receive certificate metadata.
Administrators manage users, courses, lectures, categories, enrolments, videos,
and reporting.

## Stack and layout

| Area | Implementation |
| --- | --- |
| Client | React, Vite, React Router, Tailwind CSS, Axios |
| Server | Node ESM, Express, Mongoose, MongoDB, JWT, bcryptjs, Helmet, CORS |
| Tests | Node test runner, Supertest, mongodb-memory-server |
| Media | local `server/data/videos` and authenticated Express streaming |

`client/src` contains pages, shared components, contexts, hooks, and API
services. `server/src` contains models, services, controllers, middleware, and
routes. The route inventory is maintained in [API.md](API.md); database details
are in [DATABASE.md](DATABASE.md).

## Important conventions

- Controllers validate HTTP input and delegate rules to services.
- API responses use the standard success/error envelope.
- JWT identity is validated against MongoDB for protected operations.
- `Lecture.courseId` is the authoritative course-to-lecture relationship.
- Do not put secrets in source control or documentation.

## Commands

```bash
npm test
npm run build
npm run dev
npm run dev:server
npm run dev:client
npm run seed
```

Server environment names: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CORS_ORIGINS`, `ADMIN_TOKEN`, `ADMIN_NAME`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, and `TRUST_PROXY`. Client names: `VITE_API_URL`,
`VITE_API_PROXY`, and `VITE_USE_MOCK`.

## Verification status

`npm test` passes 32 tests and `npm run build` passes. The configured Atlas
cluster contains starter catalogue data, but this machine currently cannot
reach the Atlas nodes on TCP port 27017; see [DATABASE.md](DATABASE.md) for
safe troubleshooting guidance.
