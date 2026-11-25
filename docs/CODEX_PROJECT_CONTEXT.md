# Learnify: Codex Project Context

Generated from a read-only source review on 2026-11-25, followed by the
repository's existing automated checks. This document describes the code that
is present, rather than relying on historic handoffs or earlier audit reports.

## Purpose

Learnify is a learning-management application. It has a public catalogue,
account registration/sign-in, enrolment, course playback, progress tracking,
certificate metadata, and an administrator dashboard for course, lecture,
user, video, and reporting operations.

## Stack and top-level layout

| Area | Actual implementation |
| --- | --- |
| Client | React 18, Vite 5, React Router 6, Tailwind CSS, Axios, Framer Motion, React Player, jsPDF |
| Server | Node ESM, Express 4, Mongoose 8, MongoDB, JWT, bcryptjs, Helmet, CORS, compression, multer, express-rate-limit |
| Tests | `node:test`, Supertest, mongodb-memory-server |
| Storage | MongoDB for application data; `server/data/videos` for uploaded video files |

```text
client/                 React application
  src/components/       Presentational and learning/course/navigation UI
  src/context/          Theme, user, and local progress state
  src/pages/            Home, catalogue, course detail, learning, sign-in,
                        registration, and administration UI
  src/services/         Axios-backed API client modules
server/                 Express application
  src/config/           environment parsing and MongoDB connection
  src/models/           User, Course, Lecture, Progress Mongoose models
  src/services/         domain operations
  src/controllers/      HTTP request/response adapters
  src/middleware/       auth, validation, error handling, rate limits
  src/routes/index.js   API route registration
  test/                 integration tests
docs/                   specifications, historic handoffs, and engineering docs
```

## Client architecture

`client/src/main.jsx` composes `BrowserRouter`, `ThemeProvider`,
`UserProvider`, and `ProgressProvider`. `client/src/App.jsx` defines the
current routes: `/`, `/courses`, `/courses/:id`, `/learn/:courseId`,
`/signin`, `/register`, and `/admin/dashboard`. `Navbar` is rendered for all
routes.

`client/src/services/api.js` owns an Axios instance with a bearer-token
interceptor. The token is stored at `learnify.token`; `auth.js` calls the
register/login endpoints and stores it. `UserContext.jsx` currently decodes
the JWT payload in the browser to restore an id and role. Course, lecture,
progress, and certificate services call the corresponding `/api` routes.

The course and learning pages (`CourseDetail.jsx` and `Learning.jsx`) fetch
course detail from the server. `Learning.jsx` also maintains local playback
state in localStorage and attempts server progress synchronization whenever a
token exists. `AdminDashboard.jsx` reads from the admin management API but,
at the time of this audit, provides delete/toggle/list actions rather than
complete creation/editing forms.

## Server architecture

`server/src/index.js` exports `createApp()`. Creating the app configures
Helmet, CORS, compression, JSON parsing, `/api/health`, the API router, and
the production SPA fallback. The server process itself connects through
`config/db.js` and runs `services/adminBootstrap.js` only when `index.js` is
executed directly.

`routes/index.js` is the routing boundary. Controllers validate request
shapes, delegate to services, and return the envelope from
`utils/response.js`: `{ success: true, data }` or
`{ success: false, error: { code, message } }`.

## Data models and relationships

| Model | Key fields and relationships |
| --- | --- |
| `User` | name, email, hidden password hash, role (`student`, `instructor`, `admin`), disabled, enrolled/completed course ids |
| `Course` | title, required unique slug, description, images, category, instructor id, duration, rating, students, price, level, published, lecture ids |
| `Lecture` | course id, title, video URL, duration, order, resources, locked flag |
| `Progress` | user id + course id (unique pair), completed lecture ids, aggregate watch percentage, certificate state, per-lecture progress map |
| `Category` | administrator-managed unique category name; courses retain their compatible string category field |

The model files contain fields beyond `docs/DATABASE.md` (for example
`Course.slug`, `User.disabled`, and `Progress.lectures`); source is the
accurate representation of the currently running schema.

## Authentication and authorization

`authService.js` hashes passwords with bcrypt and signs JWTs with a user id
and role. `middleware/auth.js` verifies the JWT and re-reads the user from
MongoDB on each protected request, rejecting deleted and disabled users. The
`requireRole` helper is used as `requireAdminJWT` for administrator routes,
so a role demotion takes effect on the next protected request.

The browser currently restores client session state from the JWT payload. It
does not call a session-verification endpoint at startup; server-side route
checks remain the authorization authority.

## API inventory

| Area | Routes |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session` |
| Course learning | `GET /api/courses`, `GET /api/courses/:id`, `POST /api/courses/:id/enroll`, `GET /api/lectures/:id`, `POST /api/progress`, `GET /api/progress/:courseId`, `GET /api/certificate/:courseId` |
| Video | `GET /api/videos/:filename`, `GET /api/videos-public/:filename` |
| Admin video | `POST/GET /api/admin/videos`, `PATCH /api/admin/lectures/:id` |
| Admin management | stats; courses CRUD; lectures list/create/update/delete; users list/update/delete; categories list/create; instructors, enrollments, analytics, and settings list/read endpoints under `/api/admin/*` |

Every `/api/admin/*` route registered in `routes/index.js` is protected by
`requireAuth` plus `requireAdminJWT` and an admin rate limiter.

## Development commands

```text
npm --prefix server test       # integration suite with an in-memory MongoDB
npm --prefix client run build  # Vite production build
npm --prefix server run dev    # server watch mode
npm --prefix client run dev    # client dev server and /api proxy
npm --prefix server run seed   # seed script
```

The root package also exposes `dev`, `dev:server`, `dev:client`, `build`,
`start`, `seed`, and `test` wrappers. No environment values are recorded
here.

## Environment variable names

Server: `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`CORS_ORIGINS`, `ADMIN_TOKEN`, `ADMIN_NAME`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `TRUST_PROXY`.

Client: `VITE_API_URL`, `VITE_API_PROXY`, `VITE_USE_MOCK`.

## Verification completed during this audit

- `npm test` in `server/`: 32 passing, 0 failing tests at the time of the
  first report; the suite continues to grow as uncovered workflow defects are
  fixed.
- `npm run build` in `client/`: successful Vite production build. Vite warns
  that the main generated JavaScript chunk exceeds 500 kB after minification.

## Audit classification

| Feature | Classification | Evidence |
| --- | --- | --- |
| Registration and password login | IMPLEMENTED AND VERIFIED | auth routes/services and 5 passing auth cases |
| Role-based admin API access | IMPLEMENTED AND VERIFIED | DB-backed middleware and 8 passing authorization cases |
| Course listing/detail/enrolment | IMPLEMENTED BUT NOT VERIFIED end-to-end | source plus limited student tests; no browser journey test |
| Lecture progression and certificates | PARTIALLY IMPLEMENTED | APIs exist; client has a local anonymous/demo path and only limited API tests |
| Admin API management | IMPLEMENTED BUT NOT VERIFIED end-to-end | routes/controllers and 4 integration tests; UI does not cover all write operations |
| Admin dashboard UI | PARTIALLY IMPLEMENTED | course and lecture create/edit/delete UI exists; other admin areas are list/toggle-oriented |
| Video access control | PARTIALLY IMPLEMENTED | managed files require admin authorization; a dedicated public `demo.mp4` remains for the walkthrough |
| Client session hydration | PARTIALLY IMPLEMENTED | browser payload decoding only; no verified server session hydration |
| Client dashboard route | BROKEN | sign-in, registration, and Navbar link to `/dashboard`, but `App.jsx` has no such route |
| Browser-level E2E coverage | MISSING | no browser/E2E test runner or tests in package files |

## Known technical limitations and priority roadmap

1. Protect the learning, progress, and certificate journey with authoritative
   enrolment checks; remove the production dependence on public video URLs.
2. Fix broken client navigation and add protected-route/session handling.
3. Complete actual admin management forms and make category/instructor/
   enrolment management semantics match the UI labels.
4. Add tests for the uncovered authorization and student-journey behaviours,
   then add browser-level smoke coverage.
5. Reconcile remaining stale design/API documentation with the real source.

### Final verification note

Offline production dependency audits pass with zero reported vulnerabilities
for the existing `client/package-lock.json` and `server/package-lock.json`.
