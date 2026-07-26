import { COURSES, getCourseProgress, getCertificate, setCourseProgress } from '../src/mocks/catalog';

/**
 * Vite middleware plugin that responds to /api/* with the mock catalog.
 * Lets the client run end-to-end without the backend server.
 *
 * Routes match docs/API.md envelope: { success, data } or { success:false, error:{code,message}}.
 */
function readJson(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function ok(res, data) {
  send(res, 200, { success: true, data });
}

function fail(res, status, code, message) {
  send(res, status, { success: false, error: { code, message } });
}

export function mockApiPlugin() {
  return {
    name: 'learnify-mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname.replace(/^\/api/, '');
        const params = url.searchParams;

        try {
          if (req.method === 'GET' && path === '/courses') {
            const q = (params.get('q') || '').toLowerCase().trim();
            const category = (params.get('category') || '').trim();
            const page = Math.max(1, parseInt(params.get('page') || '1', 10));
            const limit = Math.max(1, Math.min(50, parseInt(params.get('limit') || '12', 10)));
            const sort = params.get('sort') || 'new';

            let items = COURSES.map((c) => {
              const progress = getCourseProgress(c._id);
              const done = c.lectures.filter((l) => progress[l._id]?.completed).length;
              const pct = c.lectures.length ? Math.round((done / c.lectures.length) * 100) : 0;
              return { ...c, progress: pct };
            });

            if (q) {
              items = items.filter(
                (c) =>
                  c.title.toLowerCase().includes(q) ||
                  c.description.toLowerCase().includes(q) ||
                  c.instructor?.name.toLowerCase().includes(q),
              );
            }
            if (category && category !== 'All') {
              items = items.filter((c) => c.category === category);
            }
            if (sort === 'rating') {
              items.sort((a, b) => b.rating - a.rating);
            } else if (sort === 'popular') {
              items.sort((a, b) => b.students - a.students);
            } else {
              items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
            }

            const total = items.length;
            const start = (page - 1) * limit;
            const slice = items.slice(start, start + limit);

            return ok(res, {
              items: slice.map((c) => ({
                id: c._id,
                title: c.title,
                thumbnail: c.thumbnail,
                instructor: c.instructor?.name,
                duration: c.duration,
                rating: c.rating,
                students: c.students,
                category: c.category,
                progress: c.progress,
              })),
              page,
              limit,
              total,
              totalPages: Math.max(1, Math.ceil(total / limit)),
            });
          }

          if (req.method === 'GET' && path.startsWith('/courses/')) {
            const id = path.slice('/courses/'.length);
            const course = COURSES.find((c) => c._id === id || c.slug === id);
            if (!course) return fail(res, 404, 'COURSE_NOT_FOUND', 'Course not found');
            const progress = getCourseProgress(id);
            const done = course.lectures.filter((l) => progress[l._id]?.completed).length;
            const pct = course.lectures.length ? Math.round((done / course.lectures.length) * 100) : 0;
            return ok(res, { ...course, id: course._id, progress: pct });
          }

          if (req.method === 'GET' && path.startsWith('/lectures/')) {
            const id = path.slice('/lectures/'.length);
            for (const course of COURSES) {
              const lecture = course.lectures.find((l) => l._id === id);
              if (lecture) return ok(res, lecture);
            }
            return fail(res, 404, 'LECTURE_NOT_FOUND', 'Lecture not found');
          }

          if (req.method === 'POST' && path === '/progress') {
            const body = await readJson(req);
            const { courseId, lectureId, watchPercentage, completed } = body || {};
            if (!courseId || !lectureId) {
              return fail(res, 400, 'BAD_REQUEST', 'courseId and lectureId are required');
            }
            const course = COURSES.find((c) => c._id === courseId);
            if (!course) return fail(res, 404, 'COURSE_NOT_FOUND', 'Course not found');
            const lecture = course.lectures.find((l) => l._id === lectureId);
            if (!lecture) return fail(res, 404, 'LECTURE_NOT_FOUND', 'Lecture not found');
            const pct = Math.max(0, Math.min(100, parseInt(watchPercentage ?? 0, 10) || 0));
            const isCompleted = Boolean(completed) || pct >= 90;
            const stored = setCourseProgress(courseId, lectureId, pct, isCompleted);
            return ok(res, { courseId, lectureId, ...stored });
          }

          if (req.method === 'GET' && path.startsWith('/progress/')) {
            const id = path.slice('/progress/'.length);
            const course = COURSES.find((c) => c._id === id);
            if (!course) return fail(res, 404, 'COURSE_NOT_FOUND', 'Course not found');
            const progress = getCourseProgress(id);
            const done = course.lectures.filter((l) => progress[l._id]?.completed).length;
            const pct = course.lectures.length ? Math.round((done / course.lectures.length) * 100) : 0;
            return ok(res, {
              courseId: id,
              lectures: progress,
              progress: pct,
            });
          }

          if (req.method === 'GET' && path.startsWith('/certificate/')) {
            const id = path.slice('/certificate/'.length);
            const cert = getCertificate(id);
            if (!cert) {
              return fail(res, 404, 'NOT_ELIGIBLE', 'Reach 90% to unlock your certificate.');
            }
            return ok(res, cert);
          }

          return fail(res, 404, 'NOT_FOUND', `No mock handler for ${req.method} ${path}`);
        } catch (err) {
          return fail(res, 500, 'INTERNAL', err?.message || 'Mock error');
        }
      });
    },
  };
}
