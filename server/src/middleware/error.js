// Catch-all error -> standard envelope. Mongoose CastError => 404 NOT_FOUND.
import { fail } from '../utils/response.js';

export function notFound(_req, res, _next) {
  return fail(res, 404, 'NOT_FOUND', 'Route not found');
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.name === 'CastError') {
    return fail(res, 404, 'NOT_FOUND', 'Resource not found');
  }
  if (err.code === 11000) {
    return fail(res, 409, 'CONFLICT', 'Duplicate resource');
  }
  if (err.name === 'ValidationError') {
    return fail(res, 400, 'BAD_REQUEST', err.message);
  }
  const status = err.status || 500;
  const code = err.code || 'SERVER_ERROR';
  const message = status < 500 ? err.message : 'Internal server error';
  // eslint-disable-next-line no-console
  console.error('[server]', err);
  return fail(res, status, code, message);
}
