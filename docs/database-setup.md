# Database Setup Guide - MongoDB Atlas Free Tier

Step-by-step to stand up the database that powers Learnify on MongoDB Atlas's free tier (M0). Designed to fit inside the free-tier limits (512 MB storage, shared CPU, no backup) while carrying the full schema from `docs/DATABASE.md`.

---

## 1. Prerequisites

- MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas/register
- MongoDB Shell (`mongosh`) or Compass installed locally for verification
- Node.js 18+ (server already requires this)
- `.env` file in `server/` with `MONGODB_URI` set after the cluster is created

---

## 2. Free-Tier Quotas (M0)

| Resource              | Free Tier Limit    | What it means for Learnify                          |
| --------------------- | ------------------ | --------------------------------------------------- |
| Storage               | 512 MB             | Comfortably fits ~5,000 courses + ~50,000 lectures  |
| RAM                   | Shared             | Fine for the demo; aggregation pipelines stay small |
| Connections           | ~100 concurrent    | App pool size: `10`. Headroom: ~90                  |
| Network egress        | Unlimited          | Free                                               |
| Backups               | None               | Handled in §10 (export + cron backup)               |
| Replicas / failover   | None               | Single node - acceptable for the MVP               |

Plan §13 (success criteria) only needs CRUD for courses, lectures, progress, and a one-shot certificate read. The M0 free tier covers all of that with margin.

---

## 3. Create the Cluster

1. Sign in at https://cloud.mongodb.com
2. Click **Database** in the left nav, then **+ Create**
3. Choose **Shared** (free) -> **M0**
4. Provider: **AWS**. Region: pick the closest to your users. For India: `Mumbai (ap-south-1)`.
5. Cluster name: `learnify-cluster`
6. Click **Create Deployment**
7. Atlas prompts you to create a database user. Save these somewhere safe:
   - Username: `learnify_app`
   - Password: 24+ chars, mix of letters/numbers/symbols
8. Atlas also prompts you to whitelist an IP. Click **Allow Access from Anywhere** (`0.0.0.0/0`) for the demo. In production, replace with your server's static IP.
9. Wait ~1-3 minutes for the cluster to provision.

---

## 4. Connection String

Once the cluster is ready:

1. **Database** -> **Connect** -> **Drivers**
2. Driver: **Node.js**, Version: **6.0 or later**
3. Copy the connection string. It looks like:

```
mongodb+srv://learnify_app:<password>@learnify-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=learnify-cluster
```

4. Replace `<password>` with the database user password. URL-encode any special characters (`@` -> `%40`, `:` -> `%3A`, etc.).
5. Append the database name before the `?`:

```
mongodb+srv://learnify_app:<password>@learnify-cluster.xxxxx.mongodb.net/learnify?retryWrites=true&w=majority&appName=learnify-cluster
```

6. Drop the result into `server/.env`:

```
MONGODB_URI=mongodb+srv://learnify_app:<password>@learnify-cluster.xxxxx.mongodb.net/learnify?retryWrites=true&w=majority&appName=learnify-cluster
```

7. Whitelist the IP you'll run the seed script and the server from. Atlas **Database Access** page doesn't do this - use **Network Access**.

---

## 5. Create the Database

Atlas doesn't require a separate "create database" step. The database `learnify` is created on the first write.

To verify the connection from your local machine:

```bash
mongosh "mongodb+srv://learnify_app:<password>@learnify-cluster.xxxxx.mongodb.net/learnify"
```

Expected output: a `learnify>` prompt. Run `show dbs` - you'll see only the system databases until the seed runs.

---

## 6. Install Server Dependencies

The seed script lives in `server/`. From the repo root:

```bash
cd server
npm install mongoose dotenv
```

`server/package.json` is not yet present (the server folder is empty - the plan calls for it but the implementation hasn't shipped). When the server is built, it will need `mongoose` for schema definitions and `dotenv` for `MONGODB_URI`.

---

## 7. Mongoose Schemas

These mirror `docs/DATABASE.md` exactly. Place these in `server/src/models/`.

### `server/src/models/User.js`

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatar: String,
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ enrolledCourses: 1 });
userSchema.index({ completedCourses: 1 });

module.exports = mongoose.model('User', userSchema);
```

### `server/src/models/Course.js`

```js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    coverImage: String,
    category: { type: String, required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true }, // total seconds
    rating: { type: Number, default: 0, min: 0, max: 5 },
    students: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All levels'], default: 'Beginner' },
    published: { type: Boolean, default: false },
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  },
  { timestamps: true },
);

courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
```

### `server/src/models/Lecture.js`

```js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'zip', 'doc', 'ppt'], required: true },
  },
  { _id: true },
);

const lectureSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true }, // seconds
    order: { type: Number, required: true },
    resources: [resourceSchema],
    locked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

lectureSchema.index({ courseId: 1 });
lectureSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
```

### `server/src/models/Progress.js`

```js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
    watchPercentage: { type: Number, default: 0, min: 0, max: 100 },
    certificateGenerated: { type: Boolean, default: false },
    lastWatchedLecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    lastWatchedAt: Date,
    // Per-lecture granular progress (added in plan revision):
    lectures: {
      type: Map,
      of: {
        watchPercentage: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        updatedAt: Date,
      },
    },
  },
  { timestamps: true },
);

progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
```

---

## 8. Seed Script

This populates the cluster from the catalog in `client/src/mocks/catalog.js` so the live server returns the same data the mock backend was returning.

Save as `server/scripts/seed.js`:

```js
/**
 * Seed learnify DB with the mock catalog.
 * Idempotent: re-running upserts by slug.
 *
 * Run from server/:
 *   node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Course = require('../src/models/Course');
const Lecture = require('../src/models/Lecture');
const User = require('../src/models/User');

// Catalog copied verbatim from client/src/mocks/catalog.js
const { INSTRUCTORS, COURSES } = require('../../client/src/mocks/catalog');

const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=Ke90Tje7VS0';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('connected');

  // 1. Instructor users
  const instructorMap = new Map();
  for (const ins of INSTRUCTORS) {
    const user = await User.findOneAndUpdate(
      { email: `${ins.id}@learnify.local` },
      {
        name: ins.name,
        email: `${ins.id}@learnify.local`,
        password: 'SEED-ONLY-NOT-LOGINABLE',
        avatar: ins.avatar,
        role: 'instructor',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    instructorMap.set(ins.id, user._id);
  }
  console.log(`seeded ${instructorMap.size} instructors`);

  // 2. Courses + their lectures
  for (const c of COURSES) {
    const instructorId = instructorMap.get(c.instructor.id);
    if (!instructorId) throw new Error(`Unknown instructor ${c.instructor.id}`);

    // Create lectures first so we can attach refs to the course doc.
    const lectureIds = [];
    for (const lec of c.lectures) {
      const lectureDoc = await Lecture.findOneAndUpdate(
        { courseId: lec.courseId, order: lec.order },
        {
          courseId: lec.courseId, // overwritten below after course insert
          title: lec.title,
          videoUrl: SAMPLE_VIDEO,
          duration: parseDuration(lec.duration),
          order: lec.order,
          resources: lec.resources,
          locked: lec.locked,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      lectureIds.push(lectureDoc._id);
    }

    const course = await Course.findOneAndUpdate(
      { slug: c.slug },
      {
        slug: c.slug,
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
        lectures: lectureIds,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Backfill lecture.courseId now that the course exists.
    await Lecture.updateMany(
      { _id: { $in: lectureIds }, courseId: c._id },
      { $set: { courseId: course._id } },
    );
    console.log(`seeded course ${course.title}`);
  }

  await mongoose.disconnect();
  console.log('done');
}

function parseDuration(s) {
  // '4:12' or '9h 30m' or '6h 40m' -> seconds
  if (typeof s !== 'string') return s;
  if (s.includes('h') || s.includes('m')) {
    const h = /(\d+)h/.exec(s)?.[1] || '0';
    const m = /(\d+)m/.exec(s)?.[1] || '0';
    return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60;
  }
  const [mm, ss] = s.split(':').map((n) => parseInt(n, 10));
  return mm * 60 + ss;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run it:

```bash
cd server
node scripts/seed.js
```

Expected output:

```
connected
seeded 6 instructors
seeded course React Foundations
seeded course Deep Focus for Builders
...
done
```

---

## 9. Verify the Seed

From `mongosh`:

```bash
mongosh "mongodb+srv://learnify_app:<password>@learnify-cluster.xxxxx.mongodb.net/learnify"
```

```js
show collections
db.users.countDocuments()
db.courses.countDocuments()
db.lectures.countDocuments()
db.courses.findOne({ slug: 'react-foundations' })
db.lectures.find({ courseId: <courseId> }).sort({ order: 1 })
```

Expected: 6 users (instructors only), 6 courses, 28 lectures (5 + 4 + 5 + 5 + 4 + 5).

Hit the API once the server is running:

```bash
curl http://localhost:5000/api/courses
curl http://localhost:5000/api/courses/react-foundations
```

The mock catalog served by Vite during dev should match these byte-for-byte.

---

## 10. Backup Strategy (free tier has none)

M0 clusters do not include Atlas Backups. Roll a manual export:

```bash
mongosh "mongodb+srv://learnify_app:<password>@learnify-cluster.xxxxx.mongodb.net/learnify" --eval '
  db.users.find().forEach(d => print(JSON.stringify(d)));
  db.courses.find().forEach(d => print(JSON.stringify(d)));
  db.lectures.find().forEach(d => print(JSON.stringify(d)));
' > backup.jsonl
```

Restore:

```bash
mongosh "mongodb+srv://..." --eval '
  const lines = require("fs").readFileSync("backup.jsonl", "utf8").trim().split("\n");
  for (const line of lines) {
    const doc = JSON.parse(line);
    db.getCollection(doc._id ? "users" : "unknown").insertOne(doc);
  }
'
```

For the MVP a daily cron exporting to a private GitHub repo is enough.

---

## 11. Free-Tier Watch Points

- **Connection storms** - cap the server pool to 10. Mongoose default is 100.
- **Slow queries** - keep the text index. Without it, search falls back to regex and pins CPU.
- **Document size** - 16 MB ceiling per doc. Course lectures are a separate collection (refs), not embedded, so this is a non-issue.
- **Storage growth** - 512 MB is generous for the demo. If progress logs grow, archive completed `progress` docs older than 90 days to a separate `progress_archive` collection.

---

## 12. Production Checklist (when leaving free tier)

- [ ] Move to M10 or higher for backups and a real replica set.
- [ ] Whitelist only the server's static egress IP in Network Access.
- [ ] Rotate the `learnify_app` password; use a separate user per environment.
- [ ] Enable Atlas Performance Advisor + slow query logging.
- [ ] Move uploaded videos/resources to S3 or Cloudinary (per `docs/DATABASE.md` §Storage Layout).

---

## 13. Mapping: Plan §9 endpoints -> collection ops

| Endpoint                                  | MongoDB query                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `GET /api/courses`                        | `Course.find({ published: true, ...filters }).skip().limit().sort()`  |
| `GET /api/courses/:id`                    | `Course.findById(id).populate('instructor lectures')`                  |
| `GET /api/lectures/:id`                   | `Lecture.findById(id)`                                                  |
| `POST /api/progress`                      | `Progress.findOneAndUpdate({ userId, courseId }, { $set, $inc }, { upsert: true })` |
| `GET /api/progress/:courseId`             | `Progress.findOne({ userId, courseId })`                                |
| `GET /api/certificate/:courseId`          | `Progress.findOne({ userId, courseId, watchPercentage: { $gte: 90 } })` |

All five endpoints fit comfortably on a free-tier cluster with the seed above.