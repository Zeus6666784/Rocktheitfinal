# Learnify database

Learnify uses MongoDB through Mongoose. The application database is named
`learnify`; the Atlas connection string belongs only in `server/.env` as
`MONGODB_URI`.

## Collections

| Collection | Responsibility | Key indexes |
| --- | --- | --- |
| `users` | accounts, roles, disabled state, enrolments and completions | unique `email`; `enrolledCourses`; `completedCourses` |
| `courses` | published catalogue and course metadata | unique `slug`; `category`; `instructor`; text `title` + `description` |
| `lectures` | course lessons, ordering, media and resources | `courseId`; compound `courseId` + `order` |
| `progress` | a student's progress and certificate state for one course | unique compound `userId` + `courseId` |
| `categories` | administrator-managed category names | unique `name` |

All collections use Mongoose timestamps (`createdAt`, `updatedAt`). Object-id
references use `mongoose.Schema.Types.ObjectId`.

## Relationships

```text
User.enrolledCourses ──> Course
User.completedCourses ─> Course
Course.instructor ─────> User (instructor)
Lecture.courseId ──────> Course
Progress.userId ───────> User
Progress.courseId ─────> Course
```

`Course.lectures` is retained as a compatibility cache. `Lecture.courseId` is
authoritative: [`getCourse`](../server/src/services/courseService.js) loads
ordered lectures by that field, so a stale cache cannot hide valid lessons.
Admin lecture create and delete operations maintain both sides.

## Schema notes

- `User.role` is `student`, `instructor`, or `admin`; protected requests load
  the current user from MongoDB, including its `disabled` state.
- `Course.category` remains a string to preserve the public API. A `Category`
  document governs names available to administrators; a category in use cannot
  be deleted.
- `Progress` includes completed lecture IDs, a course percentage, certificate
  state, and an individual-lecture progress map.
- Video files are not stored in MongoDB. See [VIDEO_STORAGE.md](VIDEO_STORAGE.md).

## Current development data

The configured Atlas database has starter catalogue data: 7 instructor
accounts, 7 published courses, 29 lectures, and 6 categories. Those instructor
records use non-loginable seed placeholders, so create an admin or student via
the app's normal authentication flow before testing protected workflows.

## Local development

Copy the provided environment template to `server/.env`, set `MONGODB_URI` and
`JWT_SECRET`, then run:

```bash
npm run seed
npm run dev:server
```

The seed script at [`server/scripts/seed.js`](../server/scripts/seed.js)
initializes model indexes and creates the catalogue. Do not run it against a
production database unless replacing its data is intentional.

## Connection troubleshooting

The Atlas hostname can resolve while the machine still cannot reach Atlas on
TCP port `27017`. In that case the server will remain unavailable for
database-backed endpoints. Check the local firewall, VPN/proxy rules, and
network egress policy; then confirm the machine’s public IP is permitted in
Atlas Network Access. Do not print or commit credentials while diagnosing.
