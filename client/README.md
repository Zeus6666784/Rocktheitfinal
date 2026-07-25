# Learnify - Client

React + Vite + Tailwind front-end for the Learnify LMS.

## Status

Shared setup + the 7 components Dev 1 owns (per `docs/COMPONENT_CONTRACT.md`).
Backend is owned by Dev 2; the API base URL points at a placeholder until it
lands. All API calls are stubbed in `src/services/` against `docs/API.md`, so
no service-layer changes are required when the backend appears.

## Run

```bash
cd client
cp .env.example .env       # adjust VITE_API_URL if needed
npm install
npm run dev                # http://localhost:5173
npm run build              # production build
```

## Folder Layout

Matches `docs/SYSTEM.md` exactly.

```
src/
  components/
    common/         PrimaryButton, Loader, ErrorState
    learning/       VideoPlayer, ProgressBar, ResourceCard, LearningLayout
    certificate/    CertificateCard
  pages/            Home, Courses, CourseDetail, Learning (Learning demos Dev 1 components)
  services/         Axios instance + API stubs (courses, lectures, progress, certificate)
  context/          Theme, User, Progress
  hooks/            useCourseProgress
  utils/            cn
  index.css         Design tokens (source: docs/UI_STYLE.md)
  App.jsx           Router
  main.jsx          Mount + providers
```

## Design Tokens

All colors, fonts, radius, shadows, and spacing come from `docs/UI_STYLE.md`.
Tailwind is configured to read CSS variables defined in `src/index.css`.
Components must consume the Tailwind classes (`bg-primary`, `text-ink-muted`,
`rounded-card`, etc.) - never raw hex. The single token file is the only
allowed location for primitive color values.

## Component Ownership

| Component        | Owner  |
| ---------------- | ------ |
| PrimaryButton    | Dev 1  |
| Loader           | Dev 1  |
| ErrorState       | Dev 1  |
| VideoPlayer      | Dev 1  |
| ProgressBar      | Dev 1  |
| ResourceCard     | Dev 1  |
| CertificateCard  | Dev 1  |
| LearningLayout   | Dev 1  |
| Others (Navbar, Footer, CourseCard, ...) | Dev 2 |

## Demo

Open `/learn/demo` after `npm run dev` to see all seven Dev 1 components
working together. Sample data is inlined; the actual data flow will come
from the backend once Dev 2's API is live.

## Notes

- API calls will fail at runtime until the backend exists; the `Courses`
  page surfaces this via `ErrorState` with a retry button.
- This client only ever writes to `client/`. No backend, schema, or
  doc changes are made from this side.
