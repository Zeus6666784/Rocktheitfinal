// JWT verify -> req.user = { id, role }.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../utils/response.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return fail(res, 401, 'UNAUTHORIZED', 'Missing bearer token');
  try {
    const decoded = jwt.verify(match[1], env.jwtSecret);
    const user = await User.findById(decoded.sub).select('role disabled');
    if (!user) return fail(res, 401, 'UNAUTHORIZED', 'Account not found');
    if (user.disabled) return fail(res, 403, 'FORBIDDEN', 'Account disabled');
    req.user = { id: String(user._id), role: user.role };
    next();
  } catch {
    return fail(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match) {
    try {
      const decoded = jwt.verify(match[1], env.jwtSecret);
      const user = await User.findById(decoded.sub).select('role disabled');
      if (user && !user.disabled) req.user = { id: String(user._id), role: user.role };
    } catch { /* ignore */ }
  }
  next();
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user?.id) return fail(res, 401, 'UNAUTHORIZED', 'Missing bearer token');
    if (!req.user.role) {
      const u = await User.findById(req.user.id).select('role disabled');
      if (!u || u.disabled) return fail(res, 403, 'FORBIDDEN', 'Account unavailable');
      req.user.role = u.role;
    }
    if (!roles.includes(req.user.role)) return fail(res, 403, 'FORBIDDEN', 'Insufficient permissions');
    next();
  };
}
export const requireAdminJWT = requireRole('admin');
