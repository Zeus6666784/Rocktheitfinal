# RockTheIT — MERN LMS Platform

A Udemy-style e-learning platform (MERN stack) with a **strict, server-enforced LMS**:
students must watch each lecture in full before the next one unlocks, and a
certificate can only be claimed once every lecture in a course is completed.

> Note: this is an original build with equivalent functionality — it does not
> copy Udemy's trademarked branding, logo, or proprietary design assets.

## Stack
- **Frontend:** React, React Router, Axios (plain CSS)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **Certificates:** Generated as real PDF files with PDFKit

## How the LMS gating works (backend-enforced, not just UI)
1. Each course's lectures are flattened into one global sequence (`Course.getFlattenedLectures`).
2. `Enrollment.completedLectureIds` tracks what a student has actually finished.
3. Lecture *N* is unlocked only if lecture *N-1* is in `completedLectureIds` (lecture 0 is always unlocked).
   See `buildProgressView()` in `enrollmentController.js`.
4. While playing, the frontend reports watch time every ~4s (`POST /enrollments/:courseId/watch-time`).
   The server rejects any jump further than a 5-second tolerance past the last recorded position —
   this blocks scrubbing/seeking ahead to fake completion.
5. A lecture can only be marked complete (`POST /enrollments/:courseId/complete-lecture`) once at least
   95% of its duration has been watched, verified server-side against the watch-time watermark.
6. A certificate (`POST /certificates/:courseId/claim`) can only be issued once `Enrollment.completed`
   is true — i.e., every lecture in the course has been completed.

This means a technical user editing frontend JS/localStorage cannot bypass the gating — all checks
re-run against the database on the server for every action.

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and a real JWT_SECRET
npm install
npm run dev                # or: npm start
```
Runs on http://localhost:5000

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```
Runs on http://localhost:3000

### 3. MongoDB
Use a local MongoDB instance or a free MongoDB Atlas cluster — just put the connection string in
`backend/.env` as `MONGO_URI`.

### 4. Video hosting
`videoUrl` for each lecture is just a hosted file link (Cloudinary, S3, Bunny, YouTube unlisted, etc.).
This build doesn't include a video upload/transcoding pipeline — plug in `multer` + your storage
provider of choice in `courseController.js` if you want direct uploads instead of pasted URLs.

## Roles
- **student** — browses, enrolls, learns, claims certificates
- **instructor** — creates/edits their own courses and curriculum
- **admin** — can edit any course (promote a user to admin directly in MongoDB for now)

## API summary
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/courses | List published courses |
| GET | /api/courses/:slug | Course detail |
| POST | /api/courses | Create course (instructor) |
| PUT | /api/courses/:id | Update/publish course (instructor) |
| POST | /api/enrollments/:courseId/enroll | Enroll in a course |
| GET | /api/enrollments/:courseId/progress | Get lecture-by-lecture unlock state |
| POST | /api/enrollments/:courseId/watch-time | Report playback position |
| POST | /api/enrollments/:courseId/complete-lecture | Mark current lecture complete |
| POST | /api/certificates/:courseId/claim | Claim certificate (only if 100% complete) |
| GET | /api/certificates/verify/:certificateId | Public certificate verification |

## What's not included (intentionally, to keep this a clean starting point)
- Payments/checkout flow
- Video upload + transcoding (currently expects a hosted URL)
- Reviews/ratings, wishlists, coupons, admin analytics dashboards
- Email verification / password reset

These are all straightforward to layer on top of this structure.
