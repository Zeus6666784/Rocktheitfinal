// Thin: validate input, call service, return envelope.
import { ok, fail } from '../utils/response.js';
import * as authService from '../services/authService.js';
import { requireFields } from '../middleware/validate.js';

export async function register(req, res) {
  requireFields(req.body || {}, ['name', 'email', 'password']);
  const { name, email, password } = req.body;
  if (String(password).length < 6) return fail(res, 400, 'BAD_REQUEST', 'Password must be at least 6 characters');
  const result = await authService.register({ name, email, password });
  return ok(res, result, 201);
}

export async function login(req, res) {
  requireFields(req.body || {}, ['email', 'password']);
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return ok(res, result);
}