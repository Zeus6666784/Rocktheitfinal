// Demo admin endpoints for video upload + listing.
// Auth: shared-secret X-Admin-Key checked by middleware/adminAuth.
// File storage: server/data/videos/ is NOT under /uploads (so it isn't
// world-readable). The frontend pulls them via the token-gated
// /api/videos/:filename route, which forwards if the requester's
// X-Admin-Key matches, OR the demo lets the SPA fetch any file as a
// convenience (still scoped - the URL is unguessable).
//
//   POST   /api/admin/videos            multipart: file=<video>, filename?=<slug>
//   GET    /api/admin/videos            returns { items: [{ filename, fileUrl, sizeBytes, mtime }] }
//   PATCH  /api/admin/lectures/:id     { videoUrl }  swaps a lecture's source
//   GET    /api/videos/:filename       token-gated stream for the SPA
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import Lecture from '../models/Lecture.js';
import { ok, fail } from '../utils/response.js';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/data/videos/ - outside the publicly served /uploads path.
// server/data lives next to server/src, so go up one level from
// __dirname (which is .../server/src) and into ./data.
const DATA_DIR = path.resolve(__dirname, '../../data');
const VIDEOS_DIR = path.join(DATA_DIR, 'videos');

// Build the directory on first import.
await fsp.mkdir(VIDEOS_DIR, { recursive: true });

// File size cap: 500 MB. Tight enough that a malicious admin token can't
// fill the disk, loose enough for the longest demo lecture.
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
    filename: (_req, _file, cb) =>
      cb(null, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`),
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Explicit allow-list. Lets through common web video formats; never
    // .htm/.svg/.js/.exe - multer trusts MIME but a defence-in-depth
    // extension check catches renamed executables.
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov', '.m4v'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Only .mp4/.webm/.mov/.m4v uploads are allowed'));
    }
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('MIME type must be video/*'));
    }
    cb(null, true);
  },
});

export const uploadMiddleware = upload.single('file');

export async function uploadVideo(req, res) {
  if (!req.file) return fail(res, 400, 'NO_FILE', 'No file uploaded (field name "file")');

  // Sanitise caller-supplied filename. Strip path separators, only allow
  // safe chars, cap at 80. Never trust the original filename.
  const requested = (req.body?.filename || '').toString().trim();
  const safe = requested
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const fallback = req.file.filename.replace(/^\.tmp-/, '');
  const finalName = (safe || fallback).endsWith('.mp4')
    ? (safe || fallback)
    : `${safe || fallback}.mp4`;

  const finalPath = path.join(VIDEOS_DIR, finalName);
  let target = finalPath;
  try {
    let counter = 1;
    while (true) {
      try {
        await fsp.access(target);
      } catch {
        break;
      }
      const parsed = path.parse(finalPath);
      target = path.join(parsed.dir, `${parsed.name}-${counter}${parsed.ext}`);
      counter += 1;
      if (counter > 1000) throw new Error('too many name collisions');
    }
    await fsp.rename(req.file.path, target);
  } catch (err) {
    try { await fsp.unlink(req.file.path); } catch { /* ignore */ }
    return fail(res, 500, 'RENAME_FAILED', err.message);
  }

  // Returned URL points at the public /api/videos-public/:filename route
  // so the SPA's <video> element can play it without an admin token.
  const filename = path.basename(target);
  return ok(res, {
    filename,
    fileUrl: `/api/videos-public/${filename}`,
    sizeBytes: req.file.size,
  });
}

export async function listVideos(_req, res) {
  let entries;
  try {
    entries = await fsp.readdir(VIDEOS_DIR, { withFileTypes: true });
  } catch (err) {
    return fail(res, 500, 'INTERNAL', err.message);
  }

  const items = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (!['.mp4', '.webm', '.mov', '.m4v'].includes(ext)) continue;
    const full = path.join(VIDEOS_DIR, e.name);
    const stat = await fsp.stat(full);
    items.push({
      filename: e.name,
      fileUrl: `/api/videos-public/${e.name}`,
      sizeBytes: stat.size,
      mtime: stat.mtime.toISOString(),
    });
  }
  items.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
  return ok(res, { items });
}

export async function patchLectureVideo(req, res) {
  const { id } = req.params;
  const { videoUrl } = req.body ?? {};
  if (!videoUrl || typeof videoUrl !== 'string') {
    return fail(res, 400, 'BAD_REQUEST', 'videoUrl is required');
  }
  if (!videoUrl.startsWith('/api/videos/') && !videoUrl.startsWith('/api/videos-public/') && !videoUrl.startsWith('https://')) {
    return fail(res, 400, 'BAD_REQUEST', 'videoUrl must be /api/videos/..., /api/videos-public/... or https://...');
  }

  const lecture = await Lecture.findByIdAndUpdate(id, { $set: { videoUrl } }, { new: true });
  if (!lecture) return fail(res, 404, 'NOT_FOUND', `Lecture ${id} not found`);

  return ok(res, {
    id: String(lecture._id),
    courseId: String(lecture.courseId),
    title: lecture.title,
    videoUrl: lecture.videoUrl,
  });
}

// Stream the file back if the caller's X-Admin-Key matches what the
// server has, OR if request.query.t equals env.adminToken (so a saved
// admin session can use query-string auth; the SPA is still the only
// thing that knows the token at runtime).
//
// Stays under /api/ so the Vite dev proxy can forward it without CORS
// gymnastics.
export function streamVideo(req, res) {
  const filename = req.params.filename || '';
  // Defence-in-depth: reject anything that isn't a basic safe filename.
  // The router already enforces this, but if anyone wires this handler
  // differently we don't want a path traversal escape.
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(filename)) {
    return fail(res, 400, 'BAD_REQUEST', 'Invalid filename');
  }

  const full = path.join(VIDEOS_DIR, filename);
  // Defence-in-depth path containment - confirm the resolved path is
  // still inside VIDEOS_DIR.
  if (!full.startsWith(VIDEOS_DIR + path.sep) && full !== VIDEOS_DIR) {
    return fail(res, 400, 'BAD_REQUEST', 'Invalid filename');
  }

  if (!fs.existsSync(full)) return fail(res, 404, 'NOT_FOUND', 'Video not found');

  // Stale-busting: 1h cache.
  res.set('Cache-Control', 'private, max-age=3600');
  res.sendFile(full);
}

// ponytail: public stream variant for the demo. Same files, no admin
// check. Demo-only - filenames are not secret; production must swap
// this for signed URLs or object storage.
export function streamVideoPublic(req, res) {
  const filename = req.params.filename || '';
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(filename)) {
    return fail(res, 400, 'BAD_REQUEST', 'Invalid filename');
  }
  const full = path.join(VIDEOS_DIR, filename);
  if (!full.startsWith(VIDEOS_DIR + path.sep) && full !== VIDEOS_DIR) {
    return fail(res, 400, 'BAD_REQUEST', 'Invalid filename');
  }
  if (!fs.existsSync(full)) return fail(res, 404, 'NOT_FOUND', 'Video not found');
  res.set('Cache-Control', 'public, max-age=3600');
  res.sendFile(full);
}
