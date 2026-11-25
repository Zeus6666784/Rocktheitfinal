# Learnify API contract

Base path: `/api`. Successful responses are `{ "success": true, "data": … }`;
errors are `{ "success": false, "error": { "code", "message" } }`.

## Learning routes

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | public |
| POST | `/auth/register` | public, rate-limited |
| POST | `/auth/login` | public, rate-limited |
| GET | `/auth/session` | authenticated |
| GET | `/courses` | optional authentication |
| GET | `/courses/:id` | optional authentication |
| POST | `/courses/:id/enroll` | authenticated |
| GET | `/lectures/:id` | enrolled learner or administrator |
| GET | `/lectures/:id/video` | enrolled learner or administrator; supports byte ranges |
| POST | `/progress` | enrolled learner |
| GET | `/progress/:courseId` | enrolled learner |
| GET | `/certificate/:courseId` | enrolled learner who completed the course |

Send bearer tokens as `Authorization: Bearer <token>`. The client must use
`GET /auth/session` to hydrate a stored session because the server verifies the
current database account on every protected request.

## Administrator routes

Every endpoint below requires an authenticated database role of `admin` and is
rate-limited.

| Area | Routes |
| --- | --- |
| Video library | `POST/GET /admin/videos`, `GET /videos/:filename` |
| Course management | `GET/POST /admin/courses`, `PATCH/DELETE /admin/courses/:id` |
| Lecture management | `GET/POST /admin/lectures`, `PUT/DELETE /admin/lectures/:id`, `PATCH /admin/lectures/:id` |
| User management | `GET /admin/users`, `PATCH/DELETE /admin/users/:id` |
| Categories | `GET/POST /admin/categories`, `DELETE /admin/categories/:name` |
| Enrolments | `GET /admin/enrollments`, `DELETE /admin/enrollments/:userId/:courseId` |
| Reporting | `GET /admin/stats`, `/admin/instructors`, `/admin/analytics`, `/admin/settings` |

`POST /admin/videos` is multipart using the `file` field. Managed media uses
`/api/videos/:filename`; `/api/videos-public/demo.mp4` is the single public
walkthrough asset.
