import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/index.js';
import { startDb, stopDb, clearDb } from './helpers.js';
import User from '../src/models/User.js';
import { env } from '../src/config/env.js';
import fs from 'node:fs';
import path from 'node:path';

let app;
before(async () => { await startDb(); app = await createApp(); });
after(async () => { await stopDb(); });
beforeEach(async () => { await clearDb(); });

async function tokenFor(role) {
  const u = await User.create({ name: role, email: `${role}@x.com`, password: 'hashed', role });
  return jwt.sign({ sub: String(u._id), role }, env.jwtSecret, { expiresIn: '1h' });
}

test('only the dedicated demo video can use the public route', async () => {
  const r = await request(app).get('/api/videos-public/nonexistent.mp4');
  assert.equal(r.status, 403);
  const demo = await request(app).get('/api/videos-public/demo.mp4');
  assert.equal(demo.status, 200);
});

test('private video route requires admin auth', async () => {
  const r = await request(app).get('/api/videos/secret.mp4');
  assert.equal(r.status, 401);
});

test('private video route rejects non-admin', async () => {
  const t = await tokenFor('student');
  const r = await request(app).get('/api/videos/secret.mp4').set('Authorization', `Bearer ${t}`);
  assert.equal(r.status, 403);
});

test('path traversal in filename rejected', async () => {
  const t = await tokenFor('admin');
  const r = await request(app).get('/api/videos/..%2F..%2Fetc%2Fpasswd').set('Authorization', `Bearer ${t}`);
  assert.ok(r.status >= 400 && r.status < 500);
});

test('invalid filename characters rejected', async () => {
  const t = await tokenFor('admin');
  const r = await request(app).get('/api/videos/bad%20name.mp4').set('Authorization', `Bearer ${t}`);
  assert.ok(r.status >= 400 && r.status < 500);
});
