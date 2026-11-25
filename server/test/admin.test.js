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

async function adminToken() {
  const u = await User.create({ name: 'admin', email: 'admin@x.com', password: 'hashed', role: 'admin' });
  return jwt.sign({ sub: String(u._id), role: 'admin' }, env.jwtSecret, { expiresIn: '1h' });
}

test('admin course CRUD', async () => {
  const t = await adminToken();
  const inst = await User.create({ name: 'inst', email: 'inst@x.com', password: 'hashed', role: 'instructor' });
  const c = await request(app).post('/api/admin/courses').set('Authorization', `Bearer ${t}`).send({
    title: 'C1', slug: 'c1', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructorId: String(inst._id),
  });
  assert.equal(c.status, 201);
  const id = c.body.data.id;
  const l = await request(app).get('/api/admin/courses').set('Authorization', `Bearer ${t}`);
  assert.equal(l.status, 200);
  assert.equal(l.body.data.length, 1);
  const u = await request(app).patch(`/api/admin/courses/${id}`).set('Authorization', `Bearer ${t}`).send({ title: 'C1b' });
  assert.equal(u.status, 200);
  const got = await Course.findById(id);
  assert.equal(got.title, 'C1b');
  const d = await request(app).delete(`/api/admin/courses/${id}`).set('Authorization', `Bearer ${t}`);
  assert.equal(d.status, 200);
  assert.equal(await Course.countDocuments(), 0);
});

test('admin lecture CRUD', async () => {
  const t = await adminToken();
  const inst = await User.create({ name: 'inst', email: 'inst@x.com', password: 'hashed', role: 'instructor' });
  const course = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id });
  const l = await request(app).post('/api/admin/lectures').set('Authorization', `Bearer ${t}`).send({
    courseId: String(course._id), title: 'L1', videoUrl: '/api/videos-public/x.mp4', duration: 60, order: 1,
  });
  assert.equal(l.status, 201);
  const lid = l.body.data.id;
  const list = await request(app).get(`/api/admin/lectures?courseId=${course._id}`).set('Authorization', `Bearer ${t}`);
  assert.equal(list.status, 200);
  assert.equal(list.body.data.length, 1);
  const upd = await request(app).put(`/api/admin/lectures/${lid}`).set('Authorization', `Bearer ${t}`).send({ title: 'L1b' });
  assert.equal(upd.status, 200);
  const del = await request(app).delete(`/api/admin/lectures/${lid}`).set('Authorization', `Bearer ${t}`);
  assert.equal(del.status, 200);
  assert.equal(await Lecture.countDocuments(), 0);
});

test('admin user management', async () => {
  const t = await adminToken();
  const u = await User.create({ name: 'stu', email: 'stu@x.com', password: 'hashed', role: 'student' });
  const list = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${t}`);
  assert.equal(list.status, 200);
  const upd = await request(app).patch(`/api/admin/users/${u._id}`).set('Authorization', `Bearer ${t}`).send({ role: 'instructor' });
  assert.equal(upd.status, 200);
  const got = await User.findById(u._id);
  assert.equal(got.role, 'instructor');
  const dis = await request(app).patch(`/api/admin/users/${u._id}`).set('Authorization', `Bearer ${t}`).send({ disabled: true });
  assert.equal(dis.status, 200);
  const invalidRole = await request(app).patch(`/api/admin/users/${u._id}`).set('Authorization', `Bearer ${t}`).send({ role: 'owner' });
  assert.equal(invalidRole.status, 400);
  const del = await request(app).delete(`/api/admin/users/${u._id}`).set('Authorization', `Bearer ${t}`);
  assert.equal(del.status, 200);
});

test('admin categories, instructors, enrollments, analytics, settings', async () => {
  const t = await adminToken();
  const inst = await User.create({ name: 'inst', email: 'inst@x.com', password: 'hashed', role: 'instructor' });
  const course = await Course.create({ title: 'C', slug: 'c', description: 'd', thumbnail: 't.png', category: 'Cat', duration: 100, instructor: inst._id });
  const student = await User.create({ name: 'student', email: 'student@x.com', password: 'hashed', role: 'student', enrolledCourses: [course._id] });
  const cats = await request(app).get('/api/admin/categories').set('Authorization', `Bearer ${t}`);
  assert.equal(cats.status, 200);
  assert.equal(cats.body.data.length, 1);
  const cc = await request(app).post('/api/admin/categories').set('Authorization', `Bearer ${t}`).send({ name: 'New' });
  assert.equal(cc.status, 201);
  const emptyCategory = await request(app).post('/api/admin/categories').set('Authorization', `Bearer ${t}`).send({ name: 'Unused' });
  assert.equal(emptyCategory.status, 201);
  const deletedCategory = await request(app).delete('/api/admin/categories/Unused').set('Authorization', `Bearer ${t}`);
  assert.equal(deletedCategory.status, 200);
  const ins = await request(app).get('/api/admin/instructors').set('Authorization', `Bearer ${t}`);
  assert.equal(ins.status, 200);
  assert.equal(ins.body.data.length, 1);
  const enr = await request(app).get('/api/admin/enrollments').set('Authorization', `Bearer ${t}`);
  assert.equal(enr.status, 200);
  assert.equal(enr.body.data.length, 1);
  const removedEnrollment = await request(app).delete(`/api/admin/enrollments/${student._id}/${course._id}`).set('Authorization', `Bearer ${t}`);
  assert.equal(removedEnrollment.status, 200);
  const an = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${t}`);
  assert.equal(an.status, 200);
  const st = await request(app).get('/api/admin/settings').set('Authorization', `Bearer ${t}`);
  assert.equal(st.status, 200);
});
