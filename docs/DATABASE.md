# Learnify - Database Design

Version: 1.0

Source: derived from SYSTEM.md. Single source of truth for MongoDB collections and Mongoose schemas.

---

# Engine

- MongoDB
- Mongoose ODM
- Database: `learnify`
- Hosted: MongoDB Atlas

---

# Collections

Current scope: 4 collections.

| Collection | Purpose                              |
| ---------- | ------------------------------------ |
| `users`    | Accounts, enrollments, completions   |
| `courses`  | Course catalogue                     |
| `lectures` | Lectures belonging to a course       |
| `progress` | Per-user, per-course watch progress  |

All IDs are MongoDB ObjectIds unless noted. Timestamps (`createdAt`, `updatedAt`) are added via `timestamps: true`.

---

# Users

Collection: `users`

| Field             | Type             | Required | Notes                                          |
| ----------------- | ---------------- | -------- | ---------------------------------------------- |
| `name`            | String           | yes      | Display name                                   |
| `email`           | String           | yes      | Unique, lowercased                             |
| `password`        | String           | yes      | bcrypt hash, never returned                    |
| `enrolledCourses` | [ObjectId]       | no       | Ref `Course`                                   |
| `completedCourses`| [ObjectId]       | no       | Ref `Course`                                   |
| `avatar`          | String           | no       | URL                                            |
| `role`            | String           | no       | `student` (default) \| `instructor` \| `admin` |

**Indexes**

- `email` unique
- `enrolledCourses`
- `completedCourses`

**Example**

```json
{
  "_id": "ObjectId",
  "name": "Lavkush",
  "email": "lav@example.com",
  "password": "$2b$10$...",
  "enrolledCourses": ["ObjectId"],
  "completedCourses": [],
  "avatar": "https://...",
  "role": "student",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

# Courses

Collection: `courses`

| Field         | Type        | Required | Notes                                |
| ------------- | ----------- | -------- | ------------------------------------ |
| `title`       | String      | yes      |                                      |
| `description` | String      | yes      |                                      |
| `thumbnail`   | String      | yes      | URL                                  |
| `category`    | String      | yes      | Used by `/api/courses?category=`     |
| `instructor`  | ObjectId    | yes      | Ref `User` (role: instructor)        |
| `duration`    | Number      | yes      | Total seconds                        |
| `rating`      | Number      | no       | 0..5, default 0                      |
| `lectures`    | [ObjectId]  | no       | Ref `Lecture`                        |
| `students`    | Number      | no       | Count of enrolled users, default 0   |
| `published`   | Boolean     | no       | Default `false`                      |

**Indexes**

- `category`
- `instructor`
- text index on `title`, `description`

**Example**

```json
{
  "_id": "ObjectId",
  "title": "React Masterclass",
  "description": "Learn React from scratch.",
  "thumbnail": "https://...",
  "category": "Web Development",
  "instructor": "ObjectId",
  "duration": 18000,
  "rating": 4.7,
  "lectures": ["ObjectId"],
  "students": 1240,
  "published": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

# Lectures

Collection: `lectures`

| Field        | Type        | Required | Notes                                  |
| ------------ | ----------- | -------- | -------------------------------------- |
| `courseId`   | ObjectId    | yes      | Ref `Course`                           |
| `title`      | String      | yes      |                                        |
| `videoUrl`   | String      | yes      | URL or static path under `/uploads`    |
| `duration`   | Number      | yes      | Seconds                                |
| `resources`  | [Object]    | no       | Subdocument array                      |
| `order`      | Number      | yes      | 1-based playback order                 |

**Resource subdocument**

| Field      | Type   | Required | Notes                                |
| ---------- | ------ | -------- | ------------------------------------ |
| `title`    | String | yes      |                                      |
| `fileUrl`  | String | yes      | Path under `/uploads/resources`      |
| `type`     | String | yes      | `pdf` \| `zip` \| `doc` \| `ppt`     |

**Indexes**

- `courseId`
- `{ courseId: 1, order: 1 }` compound

**Example**

```json
{
  "_id": "ObjectId",
  "courseId": "ObjectId",
  "title": "Introduction",
  "videoUrl": "/uploads/videos/intro.mp4",
  "duration": 600,
  "resources": [
    {
      "_id": "ObjectId",
      "title": "Slides",
      "fileUrl": "/uploads/resources/slides.pdf",
      "type": "pdf"
    }
  ],
  "order": 1,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

# Progress

Collection: `progress`

One document per `(user, course)` pair. Updated on every progress write.

| Field                 | Type        | Required | Notes                                              |
| --------------------- | ----------- | -------- | -------------------------------------------------- |
| `userId`              | ObjectId    | yes      | Ref `User`                                         |
| `courseId`            | ObjectId    | yes      | Ref `Course`                                       |
| `completedLectures`   | [ObjectId]  | no       | Ref `Lecture`                                      |
| `watchPercentage`     | Number      | no       | 0..100, overall course completion                  |
| `certificateGenerated`| Boolean     | no       | Default `false`                                    |
| `lastWatchedLecture`  | ObjectId    | no       | Ref `Lecture`                                      |
| `lastWatchedAt`       | Date        | no       | Updated on every progress write                    |

**Indexes**

- `{ userId: 1, courseId: 1 }` unique

**Example**

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "courseId": "ObjectId",
  "completedLectures": ["ObjectId"],
  "watchPercentage": 42,
  "certificateGenerated": false,
  "lastWatchedLecture": "ObjectId",
  "lastWatchedAt": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

# Relationships

```
User  ──enrolledCourses──>  Course
User  ──completedCourses─>  Course
Course ──instructor──>      User
Course ──lectures──>        Lecture
Lecture ──courseId──>       Course
Progress ──userId──>        User
Progress ──courseId──>      Course
```

---

# Storage Layout (filesystem fallback)

| Asset        | Location              |
| ------------ | --------------------- |
| Videos       | `server/uploads/videos/`     |
| Resources    | `server/uploads/resources/`  |
| Certificates | `server/certificates/` (generated PDFs) |

Future: cloud storage (S3 / Cloudinary). Out of current scope.

---

# Mongoose Conventions

- All schemas use `timestamps: true`.
- All `ref` fields use singular model name.
- Passwords are never returned by any query — handled at the service layer using `.select('-password')`.
- Validation lives in the schema; controllers do not duplicate it.
- `ObjectId` stored as mongoose `Schema.Types.ObjectId`.

---

# Rules

- Never change a schema without an explicit request and an update to this file.
- New fields are additive only; do not rename or repurpose existing ones.
- Indexes declared in code must match the indexes listed here.
