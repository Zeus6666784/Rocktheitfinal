// JWT verify -> req.user = { id }.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../utils/response.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return fail(res, 401, 'UNAUTHORIZED', 'Missing bearer token');
  try {
    const decoded = jwt.verify(match[1], env.jwtSecret);
    req.user = { id: decoded.sub };
    next();
  } catch {
    return fail(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match) {
    try {
      const decoded = jwt.verify(match[1], env.jwtSecret);
      req.user = { id: decoded.sub };
    } catch {
      /* ignore — anonymous */
    }
  }
  next();
}
