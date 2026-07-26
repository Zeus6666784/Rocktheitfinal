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
  // ponytail: avoid leaking internals; surface a generic 500.
  // eslint-disable-next-line no-console
  console.error('[server]', err);
  return fail(res, 500, 'SERVER_ERROR', 'Internal server error');
}
