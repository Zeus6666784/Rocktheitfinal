/**
 * Seed the learnify DB from the catalog at client/src/mocks/catalog.js.
 * Idempotent: re-running upserts by slug.
 *
 *   node scripts/seed.js
 *
 * Reads MONGODB_URI from server/.env (or .env at the repo root).
 */
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Lecture from '../src/models/Lecture.js';
import User from '../src/models/User.js';

// Catalog is ESM in the client. Resolve relative to repo root so the path is stable.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, '../../client/src/mocks/catalog.js');
const { INSTRUCTORS, COURSES } = await import(pathToFileURL(catalogPath).href);

// Lecture videos live in server/data/videos/ (NOT publicly served).
// Files drop there — see INSTRUCTIONS.md in that folder for the mapping
// + yt-dlp commands. The catalog (client/src/mocks/catalog.js) is the
// source of truth; the seed copies those videoUrls into Mongo.
const VIDEO_DEFAULT = '/api/videos/demo.mp4';
const VIDEO_REACT_USESTATE = '/api/videos/react-usestate.mp4';
const VIDEO_REACT_USEEFFECT = '/api/videos/react-useeffect.mp4';
const VIDEO_DEEP_WORK = '/api/videos/deep-work.mp4';

const COURSE_VIDEOS = {
  demo: [VIDEO_REACT_USESTATE, VIDEO_REACT_USESTATE, VIDEO_REACT_USESTATE, VIDEO_REACT_USEEFFECT, VIDEO_REACT_USEEFFECT],
  focus: VIDEO_DEEP_WORK,
  design: VIDEO_DEFAULT,
  data: VIDEO_DEFAULT,
  writing: VIDEO_DEFAULT,
  ml: VIDEO_DEFAULT,
};

function videoUrlFor(courseId, index) {
  const v = COURSE_VIDEOS[courseId];
  if (Array.isArray(v)) return v[index] ?? VIDEO_DEFAULT;
  if (v) return v;
  return VIDEO_DEFAULT;
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log('connected');

  // 1. Instructor users
  const instructorMap = new Map();
  for (const ins of INSTRUCTORS) {
    const user = await User.findOneAndUpdate(
      { email: `${ins.id}@learnify.local` },
      {
        $set: {
          name: ins.name,
          avatar: ins.avatar,
          role: 'instructor',
        },
        $setOnInsert: {
          email: `${ins.id}@learnify.local`,
          password: 'SEED-ONLY-NOT-LOGINABLE',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    instructorMap.set(ins.id, user._id);
  }
  // eslint-disable-next-line no-console
  console.log(`seeded ${instructorMap.size} instructors`);

  // 2. Courses + their lectures
  for (const c of COURSES) {
    const instructorId = instructorMap.get(c.instructor.id);
    if (!instructorId) throw new Error(`Unknown instructor ${c.instructor.id}`);

    // Upsert course first to get a stable _id; lectures upsert keyed by courseId + order.
    const course = await Course.findOneAndUpdate(
      { slug: c.slug },
      {
        $set: {
          title: c.title,
          description: c.description,
          thumbnail: c.thumbnail,
          coverImage: c.coverImage,
          category: c.category,
          instructor: instructorId,
          duration: parseDuration(c.duration),
          rating: c.rating,
          students: c.students,
          price: c.price ?? 0,
          level: c.level,
          published: true,
        },
        $setOnInsert: { slug: c.slug },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const lectureIds = [];
    for (const [idx, lec] of c.lectures.entries()) {
      const lectureDoc = await Lecture.findOneAndUpdate(
        { courseId: course._id, order: lec.order },
        {
          $set: {
            courseId: course._id,
            title: lec.title,
            videoUrl: videoUrlFor(c._id, idx),
            duration: parseDuration(lec.duration),
            order: lec.order,
            resources: lec.resources || [],
            locked: lec.locked ?? false,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      lectureIds.push(lectureDoc._id);
    }

    // Keep course.lectures in sync with the upserted set.
    await Course.updateOne({ _id: course._id }, { $set: { lectures: lectureIds } });
    // eslint-disable-next-line no-console
    console.log(`seeded course ${course.title} (${lectureIds.length} lectures)`);
  }

  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log('done');
}

function parseDuration(s) {
  if (typeof s !== 'string') return s;
  if (s.includes('h') || s.includes('m')) {
    const hMatch = /(\d+)h/.exec(s);
    const mMatch = /(\d+)m/.exec(s);
    const h = hMatch ? parseInt(hMatch[1], 10) : 0;
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    return h * 3600 + m * 60;
  }
  const [mm, ss] = s.split(':').map((n) => parseInt(n, 10));
  return (mm || 0) * 60 + (ss || 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});