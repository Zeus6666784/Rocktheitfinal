import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/index.js';
import { startDb, stopDb, clearDb } from './helpers.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Lecture from '../src/models/Lecture.js';
import { env } from '../src/config/env.js';

let app;
before(async () => { await startDb(); app = await createApp(); });
after(async () => { await stopDb(); });
beforeEach(async () => { await clearDb(); });

async function studentToken() {
  const u = await User.create({ name: 'stu', email: 'stu@x.com', password: 'hashed', role: 'student' });
  return { user: u, token: jwt.sign({ sub: String(u._id), role: 'student' }, env.jwtSecret, { expiresIn: '1h' }) };
}

test('student can list and view courses', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  await Lecture.create({ courseId: c._id, title: 'L1', videoUrl: '/api/videos/demo.mp4', duration: 60, order: 1 });
  const { token } = await studentToken();
  const list = await request(app).get('/api/courses').set('Authorization', `Bearer ${token}`);
  assert.equal(list.status, 200);
  const detail = await request(app).get(`/api/courses/${c._id}`).set('Authorization', `Bearer ${token}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.lectures.length, 1);
});

test('student can enroll in a course', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  const { token } = await studentToken();
  const r = await request(app).post(`/api/courses/${c._id}/enroll`).set('Authorization', `Bearer ${token}`);
  assert.ok(r.status === 200 || r.status === 201);
  const repeat = await request(app).post(`/api/courses/${c._id}/enroll`).set('Authorization', `Bearer ${token}`);
  assert.equal(repeat.status, 200);
  const enrolledCourse = await Course.findById(c._id);
  assert.equal(enrolledCourse.students, 1);
});

test('enrolled student can stream a managed lecture with a byte range', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  const lec = await Lecture.create({ courseId: c._id, title: 'L1', videoUrl: '/api/videos/demo.mp4', duration: 60, order: 1 });
  const { token } = await studentToken();
  await request(app).post(`/api/courses/${c._id}/enroll`).set('Authorization', `Bearer ${token}`);
  const stream = await request(app).get(`/api/lectures/${lec._id}/video`).set('Authorization', `Bearer ${token}`).set('Range', 'bytes=0-1');
  assert.equal(stream.status, 206);
  assert.equal(stream.headers['content-range'].startsWith('bytes 0-1/'), true);
});

test('admin can inspect lecture metadata without enrolling', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const admin = await User.create({ name: 'admin', email: 'a@x.com', password: 'hashed', role: 'admin' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  const lec = await Lecture.create({ courseId: c._id, title: 'L1', videoUrl: '/api/videos/demo.mp4', duration: 60, order: 1 });
  const token = jwt.sign({ sub: String(admin._id), role: 'admin' }, env.jwtSecret, { expiresIn: '1h' });
  const detail = await request(app).get(`/api/lectures/${lec._id}`).set('Authorization', `Bearer ${token}`);
  assert.equal(detail.status, 200);
});
test('progress upsert and detail', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  const lec = await Lecture.create({ courseId: c._id, title: 'L1', videoUrl: '/api/videos-public/x.mp4', duration: 60, order: 1 });
  const { token } = await studentToken();
  await request(app).post(`/api/courses/${c._id}/enroll`).set('Authorization', `Bearer ${token}`);
  const up = await request(app).post('/api/progress').set('Authorization', `Bearer ${token}`).send({
    courseId: String(c._id), lectureId: String(lec._id), watchPercentage: 50, completed: false,
  });
  assert.ok(up.status === 200 || up.status === 201);
  const det = await request(app).get(`/api/progress/${c._id}`).set('Authorization', `Bearer ${token}`);
  assert.equal(det.status, 200);
});

test('enrolled student can complete a course and obtain certificate metadata', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  const lec = await Lecture.create({ courseId: c._id, title: 'L1', videoUrl: '/api/videos/demo.mp4', duration: 60, order: 1 });
  const { token } = await studentToken();
  await request(app).post(`/api/courses/${c._id}/enroll`).set('Authorization', `Bearer ${token}`);
  const progress = await request(app).post('/api/progress').set('Authorization', `Bearer ${token}`).send({ courseId: String(c._id), lectureId: String(lec._id), watchPercentage: 100, completed: true });
  assert.equal(progress.status, 200);
  const certificate = await request(app).get(`/api/certificate/${c._id}`).set('Authorization', `Bearer ${token}`);
  assert.equal(certificate.status, 200);
  assert.equal(certificate.body.data.courseName, 'C');
  assert.match(certificate.body.data.certificateNumber, /^LF-/);
});

test('student cannot read or write progress before enrolling', async () => {
  const inst = await User.create({ name: 'inst', email: 'i@x.com', password: 'hashed', role: 'instructor' });
  const c = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id, published: true });
  const lec = await Lecture.create({ courseId: c._id, title: 'L1', videoUrl: '/api/videos-public/demo.mp4', duration: 60, order: 1 });
  const { token } = await studentToken();
  const write = await request(app).post('/api/progress').set('Authorization', `Bearer ${token}`).send({ courseId: String(c._id), lectureId: String(lec._id), watchPercentage: 50 });
  assert.equal(write.status, 403);
  const read = await request(app).get(`/api/progress/${c._id}`).set('Authorization', `Bearer ${token}`);
  assert.equal(read.status, 403);
});

test('certificate endpoint requires auth', async () => {
  const r = await request(app).get('/api/certificate/000000000000000000000000');
  assert.equal(r.status, 401);
});
