# Learnify database design

MongoDB is accessed through Mongoose. Schemas use timestamps.

| Collection | Key fields |
| --- | --- |
| `users` | name, unique email, hidden password hash, avatar, role, disabled, enrolled/completed course ids |
| `courses` | title, unique slug, description, images, category, instructor id, duration, rating, student count, price, level, published, lecture ids |
| `lectures` | course id, title, video URL, duration, order, resources, locked flag |
| `progress` | user/course ids, completed lecture ids, overall percentage, certificate state, per-lecture progress map |
| `categories` | unique trimmed category name |

## Relationships

```text
User.enrolledCourses ──> Course
User.completedCourses ─> Course
Course.instructor ─────> User (instructor)
Course.lectures ───────> Lecture
Lecture.courseId ──────> Course
Progress.userId ───────> User
Progress.courseId ─────> Course
```

The `Progress` compound index on `(userId, courseId)` is unique. A course
retains its category string for compatibility; `Category` supplies the
administrator-managed catalogue. A category assigned to a course cannot be
deleted.

Video binaries are outside MongoDB, under `server/data/videos/`; see
[VIDEO_STORAGE.md](VIDEO_STORAGE.md).
