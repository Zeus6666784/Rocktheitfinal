/**
 * Mock catalog. Lets the client run end-to-end without the backend.
 * Shape mirrors docs/API.md + docs/DATABASE.md.
 *
 * Course document:
 *   { _id, title, slug, description, thumbnail, instructor, category,
 *     duration, rating, students, lectures: [ref], price, level, createdAt }
 *
 * Lecture document:
 *   { _id, courseId, title, videoUrl, duration, order, resources, locked }
 */

const SAMPLE_THUMBNAIL_PRIMARY =
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1280&q=70';
const SAMPLE_THUMBNAIL_FOCUS =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1280&q=70';
const SAMPLE_THUMBNAIL_DESIGN =
  'https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&w=1280&q=70';
const SAMPLE_THUMBNAIL_DATA =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1280&q=70';
const SAMPLE_THUMBNAIL_WRITING =
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1280&q=70';
const SAMPLE_THUMBNAIL_ML =
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1280&q=70';

const SAMPLE_AVATAR_SARA = 'https://i.pravatar.cc/160?img=47';
const SAMPLE_AVATAR_RAHUL = 'https://i.pravatar.cc/160?img=12';
const SAMPLE_AVATAR_MIRA = 'https://i.pravatar.cc/160?img=32';
const SAMPLE_AVATAR_DANIEL = 'https://i.pravatar.cc/160?img=8';
const SAMPLE_AVATAR_ANITA = 'https://i.pravatar.cc/160?img=49';
const SAMPLE_AVATAR_KAI = 'https://i.pravatar.cc/160?img=15';

export const INSTRUCTORS = [
  {
    id: 'i1',
    name: 'Sara Mendez',
    avatar: SAMPLE_AVATAR_SARA,
    bio: 'Frontend engineer turned educator. 10+ years shipping React at scale.',
    rating: 4.9,
    courses: 6,
    students: 28400,
  },
  {
    id: 'i2',
    name: 'Rahul Verma',
    avatar: SAMPLE_AVATAR_RAHUL,
    bio: 'Product designer focusing on calm, focused interfaces.',
    rating: 4.8,
    courses: 4,
    students: 14200,
  },
  {
    id: 'i3',
    name: 'Mira Okafor',
    avatar: SAMPLE_AVATAR_MIRA,
    bio: 'Data engineer & tutor. Loves clean query pipelines.',
    rating: 4.7,
    courses: 5,
    students: 19800,
  },
  {
    id: 'i4',
    name: 'Daniel Park',
    avatar: SAMPLE_AVATAR_DANIEL,
    bio: 'Author and writing coach. Helps students find their voice.',
    rating: 4.9,
    courses: 3,
    students: 9200,
  },
  {
    id: 'i5',
    name: 'Anita Rao',
    avatar: SAMPLE_AVATAR_ANITA,
    bio: 'ML researcher simplifying the math behind models.',
    rating: 4.8,
    courses: 7,
    students: 35100,
  },
  {
    id: 'i6',
    name: 'Kai Tanaka',
    avatar: SAMPLE_AVATAR_KAI,
    bio: 'Indie developer. Teaches backend basics without the jargon.',
    rating: 4.6,
    courses: 4,
    students: 7600,
  },
];

const LECTURE_VIDEO = 'https://www.youtube.com/watch?v=Ke90Tje7VS0';

function makeLectures(courseId, titles) {
  return titles.map((t, idx) => ({
    _id: `${courseId}-l${idx + 1}`,
    courseId,
    title: t.title,
    videoUrl: LECTURE_VIDEO,
    duration: t.duration,
    order: idx + 1,
    resources: [
      {
        id: `${courseId}-r${idx + 1}`,
        title: `${t.title} - slides`,
        description: 'PDF companion for this lecture',
        fileUrl: '#',
        type: 'pdf',
      },
    ],
    locked: idx > 0,
  }));
}

export const COURSES = [
  {
    _id: 'demo',
    title: 'React Foundations',
    slug: 'react-foundations',
    description:
      'A calm, focused intro to React. Components, hooks, state, and shipping your first app end-to-end.',
    thumbnail: SAMPLE_THUMBNAIL_PRIMARY,
    coverImage: SAMPLE_THUMBNAIL_PRIMARY,
    instructor: INSTRUCTORS[0],
    category: 'Development',
    duration: '6h 40m',
    rating: 4.9,
    students: 28400,
    price: 0,
    level: 'Beginner',
    createdAt: '2026-04-12',
    lectures: makeLectures('demo', [
      { title: 'Welcome to React', duration: '4:12' },
      { title: 'Components & JSX', duration: '9:48' },
      { title: 'Hooks in depth', duration: '14:05' },
      { title: 'State management', duration: '12:30' },
      { title: 'Building your first app', duration: '18:22' },
    ]),
  },
  {
    _id: 'focus',
    title: 'Deep Focus for Builders',
    slug: 'deep-focus',
    description:
      'Practical focus rituals, environment design, and routines used by indie developers and designers.',
    thumbnail: SAMPLE_THUMBNAIL_FOCUS,
    coverImage: SAMPLE_THUMBNAIL_FOCUS,
    instructor: INSTRUCTORS[1],
    category: 'Productivity',
    duration: '3h 20m',
    rating: 4.8,
    students: 14200,
    price: 19,
    level: 'All levels',
    createdAt: '2026-03-02',
    lectures: makeLectures('focus', [
      { title: 'Why focus is a skill', duration: '6:10' },
      { title: 'Designing your environment', duration: '11:42' },
      { title: 'Rituals that survive bad days', duration: '9:18' },
      { title: 'Recovering when you slip', duration: '7:55' },
    ]),
  },
  {
    _id: 'design',
    title: 'Calm UI Design',
    slug: 'calm-ui',
    description:
      'Design interfaces that feel quiet. Type, color, motion, and density - the ingredients of a calm UI.',
    thumbnail: SAMPLE_THUMBNAIL_DESIGN,
    coverImage: SAMPLE_THUMBNAIL_DESIGN,
    instructor: INSTRUCTORS[1],
    category: 'Design',
    duration: '5h 10m',
    rating: 4.7,
    students: 8810,
    price: 29,
    level: 'Intermediate',
    createdAt: '2026-02-18',
    lectures: makeLectures('design', [
      { title: 'What calm looks like', duration: '5:40' },
      { title: 'Type and rhythm', duration: '12:00' },
      { title: 'Color without noise', duration: '10:11' },
      { title: 'Motion that helps', duration: '8:48' },
      { title: 'Shipping the system', duration: '14:20' },
    ]),
  },
  {
    _id: 'data',
    title: 'Pragmatic Data Pipelines',
    slug: 'data-pipelines',
    description:
      'Build maintainable, observable data pipelines. From ingestion to modelling, without the hype.',
    thumbnail: SAMPLE_THUMBNAIL_DATA,
    coverImage: SAMPLE_THUMBNAIL_DATA,
    instructor: INSTRUCTORS[2],
    category: 'Data',
    duration: '7h 05m',
    rating: 4.6,
    students: 19800,
    price: 39,
    level: 'Intermediate',
    createdAt: '2026-01-30',
    lectures: makeLectures('data', [
      { title: 'Pipeline shapes', duration: '8:00' },
      { title: 'Ingestion patterns', duration: '13:30' },
      { title: 'Modelling for clarity', duration: '15:10' },
      { title: 'Observability basics', duration: '11:25' },
      { title: 'On-call without panic', duration: '9:55' },
    ]),
  },
  {
    _id: 'writing',
    title: 'Writing for Builders',
    slug: 'writing-for-builders',
    description:
      'Write clearer specs, READMEs, and changelogs. Short lessons, big payoff.',
    thumbnail: SAMPLE_THUMBNAIL_WRITING,
    coverImage: SAMPLE_THUMBNAIL_WRITING,
    instructor: INSTRUCTORS[3],
    category: 'Writing',
    duration: '2h 45m',
    rating: 4.9,
    students: 9200,
    price: 0,
    level: 'Beginner',
    createdAt: '2026-05-21',
    lectures: makeLectures('writing', [
      { title: 'Write to think', duration: '5:20' },
      { title: 'READMEs people read', duration: '9:00' },
      { title: 'Specs that ship', duration: '11:35' },
      { title: 'Editing your own draft', duration: '7:42' },
    ]),
  },
  {
    _id: 'ml',
    title: 'Machine Learning, Calmly',
    slug: 'ml-calmly',
    description:
      'A patient introduction to ML. The math, the intuition, and the code - in that order.',
    thumbnail: SAMPLE_THUMBNAIL_ML,
    coverImage: SAMPLE_THUMBNAIL_ML,
    instructor: INSTRUCTORS[4],
    category: 'AI',
    duration: '9h 30m',
    rating: 4.8,
    students: 35100,
    price: 49,
    level: 'Advanced',
    createdAt: '2026-06-08',
    lectures: makeLectures('ml', [
      { title: 'What a model really is', duration: '12:10' },
      { title: 'Loss, gradients, descent', duration: '18:42' },
      { title: 'From linear to deep', duration: '22:18' },
      { title: 'Evaluating honestly', duration: '16:00' },
      { title: 'Shipping ML features', duration: '19:45' },
    ]),
  },
];

export const CATEGORIES = [
  'Development',
  'Design',
  'Data',
  'Productivity',
  'Writing',
  'AI',
];

/**
 * Tiny in-memory progress store. Survives within a single dev server lifetime.
 * Resets on full reload of the Vite process.
 */
export const progressStore = new Map();

export function getCourseProgress(courseId) {
  return progressStore.get(courseId) || {};
}

export function setCourseProgress(courseId, lectureId, watchPercentage, completed) {
  const current = progressStore.get(courseId) || {};
  const previous = current[lectureId] || { watchPercentage: 0, completed: false };
  const next = {
    watchPercentage: Math.max(previous.watchPercentage, watchPercentage),
    completed: Boolean(completed) || Boolean(previous.completed),
  };
  progressStore.set(courseId, { ...current, [lectureId]: next });
  return next;
}

export function getCertificate(courseId) {
  const current = progressStore.get(courseId) || {};
  const lectures = COURSES.find((c) => c._id === courseId)?.lectures || [];
  if (lectures.length === 0) return null;
  const completed = lectures.filter((l) => current[l._id]?.completed).length;
  const pct = Math.round((completed / lectures.length) * 100);
  if (pct < 90) return null;
  return {
    courseId,
    courseName: COURSES.find((c) => c._id === courseId)?.title,
    userName: 'Lavkush',
    completedAt: new Date().toISOString().slice(0, 10),
    downloadUrl: '#',
  };
}
