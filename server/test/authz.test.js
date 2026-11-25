import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/index.js';
import { startDb, stopDb, clearDb } from './helpers.js';
import User from '../src/models/User.js';
import { env } from '../src/config/env.js';

let app;
before(async () => { await startDb(); app = await createApp(); });
after(async () => { await stopDb(); });
beforeEach(async () => { await clearDb(); });

async function makeUser(role, email = `${role}@x.com`) {
  return User.create({ name: role, email, password: 'hashed', role });
}
async function tokenFor(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

test('student cannot access admin stats', async () => {
  const u = await makeUser('student');
  const t = await tokenFor(u);
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 403);
});
test('instructor cannot access admin stats', async () => {
  const u = await makeUser('instructor');
  const t = await tokenFor(u);
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 403);
});
test('admin can access admin stats', async () => {
  const u = await makeUser('admin');
  const t = await tokenFor(u);
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 200);
  assert.ok(r.body.success);
});
test('expired JWT rejected', async () => {
  const u = await makeUser('admin');
  const t = jwt.sign({ sub: String(u._id), role: u.role }, env.jwtSecret, { expiresIn: '-1s' });
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 401);
});
test('tampered JWT rejected', async () => {
  const u = await makeUser('admin');
  const t = jwt.sign({ sub: String(u._id), role: u.role }, 'wrong-secret-xxxxxxxxxxxxxxxxxxxxxxxx', { expiresIn: '1h' });
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 401);
});
test('deleted user rejected', async () => {
  const u = await makeUser('admin');
  const t = await tokenFor(u);
  await User.deleteOne({ _id: u._id });
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 401);
});
test('disabled user rejected', async () => {
  const u = await makeUser('admin');
  const t = await tokenFor(u);
  await User.updateOne({ _id: u._id }, { $set: { disabled: true } });
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 403);
});
test('admin demotion immediately removes admin access', async () => {
  const u = await makeUser('admin');
  const t = await tokenFor(u);
  await User.updateOne({ _id: u._id }, { $set: { role: 'student' } });
  const r = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 403);
});
