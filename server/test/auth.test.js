import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/index.js';
import { startDb, stopDb, clearDb } from './helpers.js';
import User from '../src/models/User.js';

let app;

before(async () => {
  await startDb();
  app = await createApp();
});

after(async () => {
  await stopDb();
});

beforeEach(async () => {
  await clearDb();
});

test('register creates student and returns token', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'a@x.com', password: 'secret1' });
  assert.equal(r.status, 201);
  assert.ok(r.body.success);
  assert.ok(r.body.data.token);
  assert.equal(r.body.data.user.role, 'student');
  const u = await User.findOne({ email: 'a@x.com' });
  assert.ok(u);
  assert.equal(u.role, 'student');
});

test('register rejects duplicate email', async () => {
  await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'a@x.com', password: 'secret1' });
  const r = await request(app).post('/api/auth/register').send({ name: 'Bob', email: 'a@x.com', password: 'secret2' });
  assert.equal(r.status, 409);
  assert.equal(r.body.error.code, 'CONFLICT');
});

test('register rejects short password', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'a@x.com', password: '123' });
  assert.equal(r.status, 400);
});

test('login returns token for valid credentials', async () => {
  await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'a@x.com', password: 'secret1' });
  const r = await request(app).post('/api/auth/login').send({ email: 'a@x.com', password: 'secret1' });
  assert.equal(r.status, 200);
  assert.ok(r.body.data.token);
  assert.equal(r.body.data.user.email, 'a@x.com');
});

test('login rejects bad password', async () => {
  await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'a@x.com', password: 'secret1' });
  const r = await request(app).post('/api/auth/login').send({ email: 'a@x.com', password: 'wrong' });
  assert.equal(r.status, 401);
});

test('disabled user cannot login-derived access (token rejected)', async () => {
  await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'a@x.com', password: 'secret1' });
  await User.updateOne({ email: 'a@x.com' }, { $set: { disabled: true } });
  // issue token manually by login first impossible; login still returns token, but protected route rejects
  const login = await request(app).post('/api/auth/login').send({ email: 'a@x.com', password: 'secret1' });
  const token = login.body.data.token;
  const r = await request(app).get('/api/courses').set('Authorization', `Bearer ${token}`);
  // courses optional auth passes; use a protected endpoint instead
  const r2 = await request(app).get('/api/progress/000000000000000000000000').set('Authorization', `Bearer ${token}`);
  assert.equal(r2.status, 403);
});
