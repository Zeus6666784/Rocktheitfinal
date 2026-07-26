# rocktheit-original/

An earlier, full implementation of Learnify that was merged in alongside
three other contributors' work. Kept here as a **read-only reference** —
not part of the live app.

What you can learn from it:
- `backend/utils/generateCertificatePdf.js` — server-side pdfkit approach
  to certificate generation (we use jspdf client-side instead; the demo
  doesn't need the auth-gated server endpoint)
- `backend/controllers/enrollmentController.js` — the `maxWatchedSeconds`
  watermark pattern, which blocks scrub-to-skip attempts server-side. Our
  demo uses an unauthenticated localStorage approach for progress.
- `frontend/src/pages/CoursePlayer.js` — the `<video>` player pattern with
  periodic `watch-time` reporting. Our `VideoPlayer` uses the same shape
  with `onTimeUpdate` but skips the server-side reporting.
- `frontend/src/pages/CourseDetail.js` + `Dashboard.js` — how an enrolled
  user is handled (vs. our anonymous demo).

**Do not import or wire any of this into the current app.** The current
Learnify is the canonical version. If you want to bring a pattern across,
copy the idea into the current code path first.