# RockTheIT Website — Project Overview & Structure

## 0. Project Overview

**RockTheIT** is a full-stack MERN-based Learning Management System (LMS) demo designed to demonstrate a realistic online learning platform.

The project combines a modern React/Vite frontend with an Express/Node.js backend and MongoDB Atlas persistence. It is intended to demonstrate the complete learning journey rather than being only a static landing page.

### Main user journey

```text
Landing Page
     ↓
Course Catalog
     ↓
Search / Filter Courses
     ↓
Course Details
     ↓
Register / Login
     ↓
Enroll / Start Learning
     ↓
Course Lessons
     ↓
Video Player
     ↓
Resources / Documents
     ↓
Track Progress
     ↓
Complete Course
     ↓
Certificate
```

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Styling | CSS / project UI system |
| Routing | React Router |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Deployment | Railway |
| API Architecture | REST-style `/api/*` routes |

### Deployment Architecture

The project is deployed as a combined application on Railway:

```text
                    RAILWAY
┌──────────────────────────────────────────────┐
│                                              │
│             React / Vite Frontend            │
│                      │                       │
│                      │ /api/*                │
│                      ▼                       │
│             Node.js / Express                │
│                      │                       │
│                  Mongoose                    │
│                      │                       │
└──────────────────────┼───────────────────────┘
                       │
                       ▼
                MongoDB Atlas
```

The Express server serves the React SPA while also exposing the backend API.

The intended API structure is:

```text
/api
 ├── /auth
 ├── /courses
 ├── /lectures
 ├── /progress
 ├── /certificate
 └── /admin
```

---

# 0.1 Repository Structure

The project is organized into a frontend/client application and backend/server application.

A simplified structure is:

```text
RockTheIT/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── ...
│   │
│   ├── public/
│   ├── .env
│   ├── package.json
│   └── vite.config.*
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── ...
│   │
│   ├── data/
│   ├── uploads/
│   ├── package.json
│   └── ...
│
├── docs/
│   └── reference/
│
├── .gitignore
├── README / project documentation
└── deployment configuration
```

> The exact filenames and subdirectories should be treated as implementation details. When making fixes, inspect the actual repository rather than inventing files.

---

# 0.2 Frontend Structure

The React application is responsible for presentation, navigation, user interaction, API calls, and client-side state.

### `client/src/components/`

Reusable UI pieces such as:

- navigation
- course cards
- instructor cards
- search/filter UI
- loading states
- error states
- enrollment controls
- video player
- lesson playlist
- progress UI
- resources
- certificate UI

The goal is to keep reusable UI logic separate from page-level logic.

### `client/src/pages/`

Page-level screens such as:

```text
Home
Courses
Course Details
Learning
Login
Register
Profile / User-related screens
```

The page components compose the reusable components and services.

### `client/src/services/`

Centralized API communication.

A key file is:

```text
client/src/services/api.js
```

This creates the Axios client.

Other services handle areas such as:

```text
courses
auth
lectures
progress
certificate
```

The centralized API client is important because changing its `baseURL` can correct the API prefix for many endpoints at once.

### `client/src/context/`

Application-wide React state/context such as:

- authentication
- theme
- other shared UI state

### `client/src/hooks/`

Reusable React hooks for functionality such as:

- course data
- authentication
- progress
- other shared application logic

---

# 0.3 Backend Structure

The Express backend is responsible for API routing, authentication, business logic, database operations, media access, and server-side validation.

### `server/src/routes/`

Defines API endpoints.

The important pattern is:

```text
/api/*
```

For example:

```text
GET  /api/courses
GET  /api/courses/:id
POST /api/courses/:id/enroll
GET  /api/lectures/:id
POST /api/progress
GET  /api/progress/:courseId
GET  /api/certificate/:courseId
```

### `server/src/controllers/`

Handles HTTP-level operations:

```text
request
   ↓
controller
   ↓
service
   ↓
database
```

Controllers should remain relatively focused on request/response handling.

### `server/src/services/`

Contains business logic and data transformation.

For example, the course service is responsible for retrieving courses and shaping database results into API-friendly objects.

This layer is especially relevant to the lecture-resource issue identified in the audit.

### `server/src/models/`

Mongoose models represent MongoDB collections/entities such as:

```text
User
Course
Lecture
Progress
Certificate
```

The exact models should be inspected before modifying schemas.

### `server/src/middleware/`

Handles cross-cutting concerns such as:

- JWT authentication
- optional authentication
- admin authentication
- request validation
- error handling
- security middleware

### `server/src/config/`

Configuration such as:

- MongoDB connection
- environment settings
- server configuration

---

# 0.4 Data Flow

## Course Catalog

The intended data flow is:

```text
React Courses Page
       │
       │ GET /api/courses
       ▼
Express Route
       │
       ▼
Course Controller
       │
       ▼
Course Service
       │
       ▼
Mongoose
       │
       ▼
MongoDB Atlas
       │
       ▼
JSON response
       │
       ▼
React course cards
```

The live test proved that this backend/data path is currently working.

---

## Course Details

```text
React Course Detail Page
       │
       │ GET /api/courses/:id-or-slug
       ▼
Express
       │
       ▼
Course Service
       │
       ▼
MongoDB Atlas
       │
       ▼
Course + instructor + lectures
```

The project supports lookup by either ObjectId or slug.

Example:

```text
/courses/react-foundations
```

---

## Enrollment

The intended architecture is:

```text
User
 ↓
Login / JWT
 ↓
Enroll button
 ↓
POST /api/courses/:id/enroll
 ↓
Express
 ↓
MongoDB
 ↓
User enrolledCourses
```

The current frontend behavior does not fully follow this architecture and is therefore listed as a fix.

---

## Progress

The intended architecture is:

```text
Video / Lesson completion
          ↓
POST /api/progress
          ↓
MongoDB Atlas
          ↓
User progress
          ↓
Resume course later
```

The current Learning page relies too heavily on localStorage and should be connected to the backend progress system.

---

## Resources

The intended architecture is:

```text
Lecture
 ↓
Lecture resources
 ↓
Course API response
 ↓
Learning page
 ↓
Download / open document
```

The current course service does not consistently pass the resources through, which is why this is a high-priority fix.

---

## Video

The intended architecture is:

```text
Learning Page
      ↓
Video URL
      ↓
Railway video endpoint / secure storage
      ↓
Video file
```

The current project needs an audit of video storage paths and authentication before the video system can be considered production/demo safe.

---

# 0.5 Current Functional Course

The current seeded data includes a real course:

```text
Title: React Foundations
Slug: react-foundations
Category: Development
Instructor: Sara Mendez
```

This should be treated as the primary functional demo course unless the project requirements are intentionally changed.

The homepage's lesson CTA should therefore target:

```text
/courses/react-foundations
```

rather than a non-existent `/courses/demo` route.

---

# 0.6 Current API / Database Status

The most important verified fact from the live deployment is:

```text
GET https://rocktheit.up.railway.app/api/courses
```

returns real course data.

The response contains:

```text
success: true
data.items: 6 courses
data.total: 6
```

This proves:

```text
Railway
  ↓
Express
  ↓
Mongoose
  ↓
MongoDB Atlas
```

is operational for the course catalog.

The current major failure occurs before this API is reached by the frontend when the frontend uses `/courses` instead of `/api/courses`.

---

# 0.7 Design / Product Goals

The project should feel like a polished educational product rather than a raw CRUD application.

Important UX goals:

- clean LMS-style navigation
- clear course cards
- understandable course metadata
- easy course discovery
- clear lesson progression
- usable video player
- accessible downloadable resources
- visible progress
- meaningful completion state
- professional authentication screens
- responsive mobile design
- light/dark theme support
- useful loading and error states

Do not sacrifice these UX goals while fixing backend/API issues.

---

# 0.8 Engineering Principles for Fixes

When correcting the project:

1. Prefer targeted fixes.
2. Preserve working functionality.
3. Do not rewrite the entire application.
4. Do not replace MongoDB Atlas unnecessarily.
5. Do not duplicate API URL logic across components.
6. Keep API communication centralized.
7. Never expose admin secrets to the browser.
8. Keep authentication boundaries clear.
9. Make demo behavior truthful.
10. Test the complete user journey after integration fixes.

---

# RockTheIT Website --- Demo Audit & Priority Fix Plan

## 1. Project Context

**Project:** RockTheIT Website / LMS Demo\
**Deployment:** Railway\
**Frontend:** React + Vite\
**Backend:** Node.js + Express\
**Database:** MongoDB Atlas + Mongoose\
**Authentication:** JWT-based backend authentication\
**Purpose:** A functional educational/LMS demo with course catalog,
course details, lessons, video playback, enrollment, progress tracking,
downloadable resources/documents, certificates, and light/dark theme
support.

The project is deployed as a combined frontend/backend application on
Railway. The backend exposes `/api/*` routes while the React application
is served as the SPA.

The uploaded project backup was audited together with live Railway
browser Network/API evidence.

------------------------------------------------------------------------

# 2. Important Finding

## MongoDB Atlas is NOT the primary problem

The live endpoint:

`GET /api/courses`

was tested successfully and returned:

-   `success: true`
-   6 courses
-   course metadata
-   instructors
-   categories
-   ratings
-   student counts
-   lecture counts
-   pagination information

Therefore the following chain is working:

**Railway → Express → Mongoose → MongoDB Atlas → Course Data**

Do **not** replace or unnecessarily modify the Atlas configuration while
fixing the current course-loading problem.

------------------------------------------------------------------------

# 3. Priority Fix List

## 🔴 PRIORITY 0 --- Fix the Production API Base URL

### Problem

`client/src/services/api.js` currently uses:

``` js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

The local `.env` contains a development value similar to:

``` env
VITE_API_URL=http://localhost:5000/api
```

On Railway, if `VITE_API_URL` is not present during the Vite build, the
fallback becomes an empty string.

Therefore:

``` js
api.get('/courses')
```

becomes:

``` text
https://rocktheit.up.railway.app/courses
```

instead of:

``` text
https://rocktheit.up.railway.app/api/courses
```

The `/courses` request returns the React `index.html` with HTTP 200,
which makes it look successful even though it is not returning course
JSON.

### Correct fix

Change the API client to:

``` js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

This gives:

-   Local development: `http://localhost:5000/api`
-   Railway production fallback: `/api`

### Verification

After rebuilding/redeploying Railway, DevTools → Network should show:

``` text
https://rocktheit.up.railway.app/api/courses
```

and its response should be JSON containing:

``` json
{
  "success": true,
  "data": {
    "items": [...]
  }
}
```

Do not consider the fix complete until the live frontend request is
visibly using `/api/courses`.

------------------------------------------------------------------------

# 🔴 PRIORITY 1 --- Fix the "Try a Lesson" CTA

### Problem

The home page currently points the CTA toward:

``` text
/courses/demo
```

but the actual seeded course that exists is:

``` text
/courses/react-foundations
```

The backend therefore cannot find the `demo` course.

### Correct fix

Change the CTA to:

``` text
/courses/react-foundations
```

Do not invent a fake course unless the project intentionally seeds one.

### Verification

Click **Try a Lesson** from the home page and confirm it opens the real
React Foundations course detail page.

------------------------------------------------------------------------

# 🔴 PRIORITY 2 --- Fix Lecture Resources/Documents

### Requirement

The LMS must provide downloadable resources/documents for the functional
course.

### Problem

The backend/data model supports lecture resources, but the course detail
service does not appear to pass the resource information through to the
Learning page.

The Learning page checks:

``` js
const resources = currentLecture?.resources ?? [];
```

but the course lecture objects returned by the course service do not
consistently contain the resources.

This can result in:

``` text
No resources for this lecture.
```

even when resources exist in the database.

### Correct fix

When shaping lectures in the course service, include resource
information, for example:

``` js
resources: (lec.resources || []).map((r) => ({
  id: String(r._id),
  title: r.title,
  description: r.description,
  fileUrl: r.fileUrl,
  type: r.type,
})),
```

Adapt this to the project's actual resource schema instead of blindly
copying the example.

### Verification

Open the functional course → open a lecture → verify the
resource/document section displays real resources → click each
downloadable resource and verify it works.

------------------------------------------------------------------------

# 🔴 PRIORITY 3 --- Fix Video Storage and Playback

### Problem

There is a potential mismatch between video locations referenced by the
repository and the path used by the server.

The repository contains video files under a path resembling:

``` text
server/uploads/videos/
```

while the current server video endpoint appears to read from:

``` text
server/data/videos/
```

The database also contains URLs such as:

``` text
/api/videos/react-usestate.mp4
```

This needs to be made consistent.

### Required approach

Determine the single intended production video storage strategy.

For a demo, use one of:

1.  Videos committed into a reliable non-secret location that is
    actually available in the Railway deployment.
2.  A proper object/file storage service.
3.  Another reliable production-compatible video host.

Do not depend on a local developer-only path.

### Verification

Test every functional-course video directly in the deployed Railway
application:

-   video loads
-   playback starts
-   seeking works
-   no 401/403/404/500 response
-   video does not depend on a development-only file path

------------------------------------------------------------------------

# 🔴 PRIORITY 4 --- Fix Video Authentication Architecture

### Problem

The video endpoint currently uses admin authentication:

``` text
GET /api/videos/:filename
```

with `requireAdmin`.

A normal browser `<video src="...">` request does not automatically send
a custom admin header such as:

``` text
X-Admin-Key
```

Therefore videos can fail with unauthorized responses.

### Important security rule

**Never put the admin token/key into the React frontend.**

That would expose the secret to every visitor.

### Appropriate fix

Use an architecture appropriate for the demo, such as:

-   authenticated user access using the user's JWT;
-   signed/temporary video URLs;
-   a public demo-video route for non-sensitive demo content;
-   proper object storage with controlled access.

Choose the least complex secure solution that fits the project.

### Verification

Open DevTools → Network while playing a lesson and verify the video
request returns a successful media response without exposing any admin
secret.

------------------------------------------------------------------------

# 🔴 PRIORITY 5 --- Make the Functional Course Actually Progress Through Lessons

### Problem

The backend supports lecture locking/progression based on user state.

However, the anonymous/demo flow can result in:

``` text
Lecture 1 → unlocked
Lecture 2 → locked
Lecture 3 → locked
Lecture 4 → locked
Lecture 5 → locked
```

The Learning page can therefore start at Lecture 1 but fail to progress
to the remaining lessons.

This conflicts with the requirement that at least one course be fully
functional.

### Correct fix

Choose one coherent demo architecture.

Preferred:

``` text
Login/Register
    ↓
JWT user
    ↓
Enrollment
    ↓
Progress API
    ↓
Unlock next lecture
```

If the demo must remain anonymous, implement an explicit demo mode that
does not falsely enforce authenticated lecture locking.

Do not simply remove all security checks from a production-style
authenticated LMS without considering the intended access model.

### Verification

As a demo user:

1.  Open the functional course.
2.  Start Lecture 1.
3.  Complete Lecture 1.
4.  Verify Lecture 2 becomes available.
5.  Continue through all lessons.
6.  Verify progress persists appropriately.

------------------------------------------------------------------------

# 🟠 PRIORITY 6 --- Make Enrollment Real or Rename the CTA

### Problem

The backend contains an enrollment endpoint:

``` text
POST /api/courses/:id/enroll
```

and it can update the user's enrolled courses.

However, the current frontend `EnrollButton` appears to update local
React state and navigate to the Learning page without actually calling
the backend enrollment endpoint.

That means:

``` text
Click Enroll
    ↓
local state = enrolled
    ↓
navigate to Learning
```

rather than:

``` text
Click Enroll
    ↓
POST /api/courses/:id/enroll
    ↓
MongoDB
    ↓
user enrolled
    ↓
Learning page
```

### Correct fix

Preferred:

-   Require/handle authentication.
-   Call the real enrollment API.
-   Handle success, loading, and failure states.
-   Update the UI from the server response.

If the project intentionally uses an anonymous demo, rename the button
to something truthful such as:

``` text
Start Learning
```

Do not claim enrollment happened if it was not persisted.

------------------------------------------------------------------------

# 🟠 PRIORITY 7 --- Connect Progress Tracking to the Backend

### Problem

A backend progress system exists:

``` text
POST /api/progress
GET /api/progress/:courseId
```

and a progress hook/service exists.

However, the Learning page currently appears to rely on `localStorage`
for progress.

That means progress is browser-local instead of being persisted to the
user's account.

### Correct architecture

Preferred:

``` text
Video completion
    ↓
Progress API
    ↓
MongoDB Atlas
    ↓
User progress
```

Use `localStorage` only for temporary UI state or as a deliberate
offline fallback.

### Verification

1.  Complete a lesson.
2.  Refresh the page.
3.  Verify progress remains.
4.  If authenticated, verify progress is tied to the user.
5.  Navigate away and return.
6.  Verify the course resumes correctly.

------------------------------------------------------------------------

# 🟠 PRIORITY 8 --- Implement the Light/Dark Theme Switcher

### Requirement

The project previously requested a light/dark theme changer.

### Problem

The current theme context appears to hard-code:

``` js
const value = useMemo(() => ({ theme: 'dark' }), []);
```

There is no functional theme toggle.

### Correct implementation

Add:

-   Light mode
-   Dark mode
-   Toggle control
-   Persistent preference using `localStorage`
-   Respect for system preference if desired
-   Proper styling across all pages/components

The theme should not break:

-   cards
-   navigation
-   video player
-   course pages
-   forms
-   resource panels
-   dialogs
-   mobile layout

### Verification

Toggle:

``` text
Dark → Light → Dark
```

and reload the page to verify the selected theme persists.

------------------------------------------------------------------------

# 🟠 PRIORITY 9 --- Improve Misleading Error Messages

### Problem

The course page contains messaging that refers to a "mock backend".

The deployed application is intended to use:

``` text
Railway
Express
MongoDB Atlas
```

Calling it a mock backend is confusing and makes the finished project
look incomplete.

### Correct fix

Use a neutral production message:

``` text
We couldn't load the courses right now. Please try again.
```

Do not expose implementation details to normal users.

------------------------------------------------------------------------

# 🟡 PRIORITY 10 --- Clean Stale Documentation and File Paths

There are inconsistencies between old documentation/reference material
and the current implementation, especially around video storage paths.

Clean up:

-   stale setup instructions
-   old video directory references
-   obsolete mock-backend references
-   outdated architecture notes
-   duplicated reference assets where unnecessary

Do not delete useful reference material blindly; only remove or update
material that is demonstrably obsolete.

------------------------------------------------------------------------

# 🟡 PRIORITY 11 --- Verify Pagination Parameters

The frontend request observed during testing used:

``` text
limit=6
```

while the live API response reported:

``` text
limit=12
```

The API returned all 6 courses, so this is not currently blocking the
demo.

However, verify that:

-   frontend pagination state
-   API query parsing
-   API defaults
-   response metadata
-   displayed pagination controls

all agree.

------------------------------------------------------------------------

# 4. End-to-End Acceptance Test

After implementing the fixes, do not stop at a successful build.

Run this exact test on the Railway deployment.

## Home

-   [ ] Homepage loads.
-   [ ] No red console errors.
-   [ ] Course cards appear.
-   [ ] Course thumbnails load.
-   [ ] Search UI works.
-   [ ] Category filters work.
-   [ ] "Try a Lesson" opens React Foundations.
-   [ ] Light/dark theme toggle works.

## Course Catalog

-   [ ] `/courses` loads real Atlas data.
-   [ ] Network request uses `/api/courses`.
-   [ ] Response is JSON, not `index.html`.
-   [ ] Search works.
-   [ ] Category filtering works.
-   [ ] Pagination works if displayed.
-   [ ] Empty state works.

## Course Details

-   [ ] React Foundations opens.
-   [ ] Course information loads.
-   [ ] Instructor information loads.
-   [ ] Lecture list loads.
-   [ ] Lecture count is correct.
-   [ ] Enrollment/start-learning action works.
-   [ ] No 404 for the course.

## Learning

-   [ ] Video loads.
-   [ ] Video plays.
-   [ ] Video seeking works.
-   [ ] Lecture navigation works.
-   [ ] Next lesson unlocks appropriately.
-   [ ] Progress updates.
-   [ ] Refresh does not unexpectedly erase progress.
-   [ ] Resources appear.
-   [ ] Resources can be downloaded/opened.
-   [ ] Course completion works.

## Authentication

-   [ ] Register works.
-   [ ] Login works.
-   [ ] Invalid credentials show a useful error.
-   [ ] Logout works.
-   [ ] Protected routes behave correctly.
-   [ ] Authenticated state survives page refresh where intended.

## Certificate

-   [ ] Certificate appears only after the intended completion
    condition.
-   [ ] Certificate generation/download works.
-   [ ] No broken asset or API request occurs.

## Mobile/Responsive

Test at approximately:

-   [ ] 375px wide
-   [ ] 768px wide
-   [ ] Desktop width

Check:

-   [ ] navigation
-   [ ] course cards
-   [ ] video player
-   [ ] lesson sidebar
-   [ ] resource panel
-   [ ] buttons
-   [ ] forms

------------------------------------------------------------------------

# 5. What Must NOT Be Changed Unnecessarily

Do not make broad architectural changes just because the demo has bugs.

The following parts are already fundamentally useful:

-   Express API structure
-   `/api` route organization
-   MongoDB Atlas integration
-   Mongoose models
-   JWT infrastructure
-   course API
-   course detail API
-   progress API
-   enrollment API
-   React component structure
-   centralized Axios service
-   Railway deployment architecture

Fix the integration problems first.

------------------------------------------------------------------------

# 6. Master AI Coding Prompt

Use the following prompt with an AI coding agent when making the
corrections.

------------------------------------------------------------------------

## PROMPT START

You are working on the **RockTheIT Website**, a MERN-stack educational
LMS/demo project.

The project is deployed on **Railway** and uses:

-   React
-   Vite
-   Node.js
-   Express
-   MongoDB Atlas
-   Mongoose
-   JWT authentication
-   Axios
-   React Router

The project is intended to demonstrate a real LMS experience.

### Core requirements

The website should provide:

1.  Professional LMS landing page
2.  Course catalog
3.  Course search/filtering
4.  Course details
5.  Course enrollment
6.  At least one fully functional course
7.  Chapters/lessons
8.  Video player
9.  Lesson progression
10. Downloadable resources/documents
11. Progress tracking
12. Authentication
13. Certificate generation
14. Responsive UI
15. Light/dark theme switcher

### Important known fact

MongoDB Atlas is working.

The live endpoint:

`/api/courses`

successfully returns:

``` json
{
  "success": true,
  "data": {
    "items": [
      "...courses..."
    ],
    "total": 6
  }
}
```

Therefore, **do not replace, disable, or unnecessarily modify the
MongoDB Atlas connection.**

The main initial production bug is caused by the frontend requesting:

``` text
/courses
```

instead of:

``` text
/api/courses
```

The `/courses` request receives the React SPA `index.html` with HTTP
200, so it looks successful while returning no course JSON.

### First fix

Inspect:

`client/src/services/api.js`

It currently uses a pattern equivalent to:

``` js
baseURL: import.meta.env.VITE_API_URL ?? ''
```

Change it appropriately so production has a safe fallback:

``` js
baseURL: import.meta.env.VITE_API_URL || '/api'
```

Do not hard-code localhost into production.

Make sure local development still supports:

``` text
http://localhost:5000/api
```

and Railway production supports:

``` text
/api
```

After the fix, course requests must become:

``` text
https://rocktheit.up.railway.app/api/courses
```

not:

``` text
https://rocktheit.up.railway.app/courses
```

### Then fix the following issues in priority order

#### Priority 1 --- Try a Lesson CTA

The homepage currently points to:

``` text
/courses/demo
```

but the actual seeded course is:

``` text
/courses/react-foundations
```

Update the CTA to the real course unless a deliberate demo course is
created.

#### Priority 2 --- Lecture resources

The backend/database supports lecture resources, but the course service
does not consistently include them in the lecture response consumed by
the Learning page.

Ensure each lecture can provide resource metadata such as:

``` text
id
title
description
fileUrl
type
```

using the actual project schema.

Make resources visible and downloadable in the Learning page.

#### Priority 3 --- Video storage

Audit the discrepancy between:

``` text
server/uploads/videos/
```

and:

``` text
server/data/videos/
```

and determine which location the production backend actually uses.

Make video storage consistent.

Do not rely on a local-development-only path.

#### Priority 4 --- Video authentication

The current video endpoint appears to require an admin key while the
browser video element does not provide that key.

Do not put the admin key into frontend JavaScript.

Implement an appropriate secure approach such as:

-   authenticated user JWT access,
-   signed URLs,
-   secure demo video access,
-   or another appropriate production-safe mechanism.

Test actual playback on Railway.

#### Priority 5 --- Functional lesson progression

The backend has lecture locking/progression, but anonymous/demo users
can become stuck after Lecture 1.

Ensure the functional course can actually be completed.

Preferred architecture:

``` text
Login/Register
→ JWT
→ Enrollment
→ Progress API
→ Next lesson unlock
```

If an anonymous demo mode is intentionally retained, make it explicit
and implement safe demo progression without falsely claiming
authenticated enrollment.

#### Priority 6 --- Enrollment

The backend has an enrollment endpoint, but the frontend enrollment
button appears to update local state and navigate without persisting
enrollment.

Make enrollment call the actual backend API when authenticated.

Handle:

-   loading
-   success
-   already enrolled
-   unauthorized
-   API failure

If anonymous enrollment is intentionally not supported, use truthful
wording such as "Start Learning" instead of pretending the user was
enrolled.

#### Priority 7 --- Backend progress

A backend progress API exists, but the Learning page currently relies
heavily on localStorage.

Connect lesson/course progress to the backend for authenticated users.

Progress should survive:

-   page refresh
-   navigation
-   logout/login where appropriate
-   returning to the course

Do not remove localStorage unless it is no longer needed; it can remain
as temporary UI state or a deliberate fallback.

#### Priority 8 --- Theme switcher

Implement the requested Light/Dark theme switcher.

Requirements:

-   functional toggle
-   persistent preference
-   no broken styles
-   good contrast
-   works on all major pages
-   works on mobile
-   does not break video/resources/forms

#### Priority 9 --- Error messages

Replace misleading "mock backend" wording with user-facing
production-quality errors.

Example:

``` text
We couldn't load the courses right now. Please try again.
```

Do not expose internal architecture details.

#### Priority 10 --- Documentation/path cleanup

Audit stale references to old video directories, mock APIs, and outdated
setup instructions.

Update them to reflect the actual current architecture.

#### Priority 11 --- Pagination

Audit the discrepancy between frontend `limit=6` and API response
`limit=12`.

Ensure frontend and backend pagination behavior is consistent.

------------------------------------------------------------------------

# Implementation Rules

1.  Do not rewrite the entire application.
2.  Do not change the MongoDB Atlas architecture unnecessarily.
3.  Preserve existing working API routes.
4.  Reuse the existing centralized Axios service.
5.  Reuse existing backend services/controllers where possible.
6.  Do not expose admin secrets to the frontend.
7.  Do not hard-code localhost into production.
8.  Do not create fake data if real Atlas data already exists.
9.  Keep the existing visual design unless a change is necessary.
10. Keep changes modular and maintainable.
11. Do not silently swallow API errors.
12. Use proper loading/error/empty states.
13. Preserve responsive behavior.
14. Avoid breaking authentication while fixing the demo flow.
15. Prefer small targeted fixes over a full rewrite.

------------------------------------------------------------------------

# Testing Requirements

After changes, run the application and test:

### API

``` text
GET /api/courses
GET /api/courses/react-foundations
```

Verify JSON responses.

### Frontend Network

Verify that frontend calls use:

``` text
/api/courses
```

and never accidentally:

``` text
/courses
```

for API requests.

### Course flow

Test:

``` text
Home
→ Courses
→ React Foundations
→ Enrollment/Start Learning
→ Lecture 1
→ Video
→ Resource
→ Complete lesson
→ Lecture 2
→ Continue through all lessons
→ Course completion
→ Certificate
```

### Authentication

Test:

``` text
Register
→ Login
→ Protected functionality
→ Enrollment
→ Progress
→ Logout
```

### Theme

Test:

``` text
Dark
→ Light
→ Refresh
→ Preference persists
```

### Responsive

Test desktop, tablet, and mobile widths.

------------------------------------------------------------------------

# Final Verification Standard

Do not say the project is fixed merely because it builds successfully.

The project is considered fixed only when:

-   Railway frontend loads
-   `/api/courses` returns real Atlas data
-   Course cards render
-   React Foundations opens
-   lesson data loads
-   video plays
-   resources appear and download
-   lesson progression works
-   enrollment behaves truthfully and/or persists
-   progress persists appropriately
-   certificate flow works
-   authentication works
-   theme switching works
-   no major console/network errors remain
-   no secrets are exposed
-   mobile layout remains usable

At the end, provide a concise report containing:

1.  Files changed
2.  Changes made
3.  Bugs fixed
4.  Tests performed
5.  Any remaining issues
6.  Exact Railway environment variables required
7.  Exact deployment/rebuild instructions

Do not claim a test passed unless it was actually performed.

## PROMPT END

------------------------------------------------------------------------

# 7. Final Priority Summary

  Priority   Issue                                           Severity
  ---------- ----------------------------------------------- -------------
  P0         Production API fallback `/api`                  🔴 Critical
  P1         Broken `/courses/demo` CTA                      🔴 High
  P2         Lecture resources not passed through            🔴 High
  P3         Video storage path mismatch                     🔴 High
  P4         Video authentication architecture               🔴 High
  P5         Lecture progression/locking                     🔴 High
  P6         Enrollment not persisted                        🟠 Medium
  P7         Progress uses localStorage instead of backend   🟠 Medium
  P8         Light/dark switcher missing                     🟠 Medium
  P9         Misleading mock-backend error messages          🟡 Low
  P10        Stale docs/file paths                           🟡 Low
  P11        Pagination limit mismatch                       🟡 Low

**Recommended approach:** Fix P0--P5 before spending time polishing
visuals. Those are the issues most likely to affect whether the LMS demo
can actually be demonstrated end-to-end.
