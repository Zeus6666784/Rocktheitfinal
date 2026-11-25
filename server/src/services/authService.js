// bcrypt + JWT. Never return password.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

const sign = (user) => jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const sanitize = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  avatar: u.avatar || null,
  role: u.role,
});

export async function register({ name, email, password }) {
  const lower = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: lower });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    err.code = 'CONFLICT';
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: lower, password: hash, role: 'student' });
  return { token: sign(user), user: sanitize(user) };
}

export async function login({ email, password }) {
  const lower = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: lower }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  const okPwd = await bcrypt.compare(password, user.password);
  if (!okPwd) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  if (user.disabled) {
    const err = new Error('Account disabled');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }
  return { token: sign(user), user: sanitize(user) };
}

export async function getSession(userId) {
  const user = await User.findById(userId);
  if (!user || user.disabled) {
    const err = new Error('Account unavailable');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  return { user: sanitize(user) };
}
