# Learnify API contract

Base path: `/api`. Successful responses are `{ "success": true, "data": … }`;
errors are `{ "success": false, "error": { "code", "message" } }`.

## Public and authenticated learning routes

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | public |
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| GET | `/auth/session` | authenticated |
| GET | `/courses` | optional auth |
| GET | `/courses/:id` | optional auth |
| POST | `/courses/:id/enroll` | authenticated |
| GET | `/lectures/:id` | enrolled learner or admin |
| GET | `/lectures/:id/video` | enrolled learner or admin; range requests supported |
| POST | `/progress` | enrolled learner |
| GET | `/progress/:courseId` | enrolled learner |
| GET | `/certificate/:courseId` | enrolled learner who has completed the course |

Bearer JWTs use `Authorization: Bearer <token>`. `/auth/session` is the
authoritative client-session hydration endpoint and returns the active user.

## Administrator routes

All routes below require an authenticated database role of `admin`.

| Area | Routes |
| --- | --- |
| Stats | `GET /admin/stats` |
| Courses | `GET/POST /admin/courses`, `PATCH/DELETE /admin/courses/:id` |
| Lectures | `GET/POST /admin/lectures`, `PUT/DELETE /admin/lectures/:id` |
| Users | `GET /admin/users`, `PATCH/DELETE /admin/users/:id` |
| Categories | `GET/POST /admin/categories`, `DELETE /admin/categories/:name` |
| Enrolments | `GET /admin/enrollments`, `DELETE /admin/enrollments/:userId/:courseId` |
| Instructors | `GET /admin/instructors` |
| Video library | `POST/GET /admin/videos`, `GET /videos/:filename` |
| Analytics/settings | `GET /admin/analytics`, `GET /admin/settings` |

`POST /admin/videos` is multipart with a `file` field. Managed video references
use `/api/videos/:filename`; `demo.mp4` is the sole public walkthrough asset
at `/api/videos-public/demo.mp4`.
