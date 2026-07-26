// Tiny validator using the API.md contract. Returns the parsed payload or throws.
// ponytail: stdlib + manual checks; pulling zod/joi for ~6 endpoints is bloat.
export function requireFields(payload, fields) {
  const missing = fields.filter((f) => payload[f] === undefined || payload[f] === null || payload[f] === '');
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.status = 400;
    err.code = 'BAD_REQUEST';
    throw err;
  }
}

export function intInRange(value, min, max, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) {
    const err = new Error(`${name} must be an integer in [${min}, ${max}]`);
    err.status = 400;
    err.code = 'BAD_REQUEST';
    throw err;
  }
  return n;
}

// Wraps async handlers so thrown errors flow to error.js.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
