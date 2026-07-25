# Learnify - API Design

Version: 1.0

Source: derived from SYSTEM.md. Single source of truth for HTTP contracts.

---

# Base URL

```
/api
```

All routes are prefixed with `/api`.

---

# Response Format

Every response uses a consistent JSON shape.

## Success

```json
{
  "success": true,
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message"
  }
}
```

---

# Error Codes

| HTTP | Meaning             |
| ---- | ------------------- |
| 400  | Bad Request         |
| 401  | Unauthorized        |
| 403  | Forbidden           |
| 404  | Not Found           |
| 500  | Internal Server Error |

Standard error codes returned in `error.code`:

| Code               | HTTP | When                                |
| ------------------ | ---- | ----------------------------------- |
| `BAD_REQUEST`      | 400  | Validation failed                   |
| `UNAUTHORIZED`     | 401  | Missing or invalid token            |
| `FORBIDDEN`        | 403  | Authenticated but not allowed       |
| `NOT_FOUND`        | 404  | Resource does not exist             |
| `CONFLICT`         | 409  | Duplicate / state conflict          |
| `SERVER_ERROR`     | 500  | Unhandled server error              |

---

# Authentication

- `Authorization: Bearer <jwt>`
- Issued on login/register
- Expiry: 7 days
- Sent on all protected routes

---

# Endpoints

Current scope: Landing → Browse → Course Detail → Learning Dashboard → Progress → Certificate.

Future AI endpoints (`/ai/chat`, `/ai/quiz`, `/ai/summary`, `/ai/recommend`) are documented in SYSTEM.md under "AI Integration" and are out of scope for this phase.

---

## Courses

### `GET /api/courses`

Browse courses with optional filters.

**Auth**: optional

**Query**

| Param      | Type   | Default | Notes                       |
| ---------- | ------ | ------- | --------------------------- |
| `q`        | string | -       | Search by title             |
| `category` | string | -       | Filter by category          |
| `page`     | number | 1       | Page number                 |
| `limit`    | number | 12      | Items per page (max 50)     |
| `sort`     | string | `new`   | `new`, `rating`, `popular`  |

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "thumbnail": "string",
        "category": "string",
        "instructor": "string",
        "duration": "number",
        "rating": "number",
        "students": "number",
        "lectures": "number"
      }
    ],
    "page": 1,
    "limit": 12,
    "total": 0
  }
}
```

**Errors**: `400`, `500`

---

### `GET /api/courses/:id`

Get one course with full detail (used by Course Detail page).

**Auth**: optional

**Params**

| Param | Type   | Notes        |
| ----- | ------ | ------------ |
| `id`  | string | Course `_id` |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "thumbnail": "string",
    "category": "string",
    "instructor": {
      "id": "string",
      "name": "string",
      "avatar": "string"
    },
    "duration": "number",
    "rating": "number",
    "students": "number",
    "lectures": [
      {
        "id": "string",
        "title": "string",
        "duration": "number",
        "order": "number",
        "locked": "boolean"
      }
    ],
    "enrolled": "boolean",
    "progress": "number"
  }
}
```

**Errors**: `404`, `500`

---

## Lectures

### `GET /api/lectures/:id`

Get one lecture for playback.

**Auth**: required (must be enrolled in the parent course)

**Params**

| Param | Type   | Notes         |
| ----- | ------ | ------------- |
| `id`  | string | Lecture `_id` |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseId": "string",
    "title": "string",
    "videoUrl": "string",
    "duration": "number",
    "resources": [
      {
        "id": "string",
        "title": "string",
        "fileUrl": "string",
        "type": "pdf | zip | doc | ppt"
      }
    ],
    "order": "number",
    "nextLectureId": "string | null"
  }
}
```

**Errors**: `401`, `403`, `404`, `500`

---

## Progress

### `POST /api/progress`

Update watch progress for a lecture.

**Auth**: required

**Request body**

```json
{
  "courseId": "string",
  "lectureId": "string",
  "watchPercentage": "number (0-100)",
  "completed": "boolean"
}
```

**Validation**

- `watchPercentage` integer 0..100
- `completed` true only when `watchPercentage >= 90`

**Response 200**

```json
{
  "success": true,
  "data": {
    "courseId": "string",
    "completedLectures": ["string"],
    "totalLectures": "number",
    "watchPercentage": "number",
    "certificateEligible": "boolean"
  }
}
```

**Side effects**

- Increments `watchPercentage` for the lecture (max of current and new)
- Adds `lectureId` to `completedLectures` when `completed = true`
- When all lectures completed, sets `certificateGenerated = false` and marks user eligible

**Errors**: `400`, `401`, `404`, `500`

---

### `GET /api/progress/:courseId`

Get current user's progress for a course.

**Auth**: required

**Params**

| Param      | Type   | Notes         |
| ---------- | ------ | ------------- |
| `courseId` | string | Course `_id`  |

**Response 200**

```json
{
  "success": true,
  "data": {
    "courseId": "string",
    "completedLectures": ["string"],
    "totalLectures": "number",
    "watchPercentage": "number",
    "certificateGenerated": "boolean"
  }
}
```

**Errors**: `401`, `404`, `500`

---

## Certificate

### `GET /api/certificate/:courseId`

Generate or fetch the user's certificate for a course.

**Auth**: required (must have completed the course)

**Params**

| Param      | Type   | Notes         |
| ---------- | ------ | ------------- |
| `courseId` | string | Course `_id`  |

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "courseName": "string",
    "userName": "string",
    "completedDate": "ISO-8601 string",
    "downloadUrl": "string",
    "certificateNumber": "string"
  }
}
```

**Errors**: `401`, `403` (course not completed), `404`, `500`

---

# Future Endpoints

Out of current scope. Listed only for reference.

| Method | Path             | Source          |
| ------ | ---------------- | --------------- |
| POST   | `/api/ai/chat`   | SYSTEM.md       |
| POST   | `/api/ai/quiz`   | SYSTEM.md       |
| POST   | `/api/ai/summary`| SYSTEM.md       |
| POST   | `/api/ai/recommend` | SYSTEM.md    |

---

# Rules

- Controllers never contain business logic; only request/response shape and validation. Logic lives in `services/`.
- All write operations validate input first.
- All authenticated routes use a single `auth` middleware.
- Errors are always returned in the standard error shape.
