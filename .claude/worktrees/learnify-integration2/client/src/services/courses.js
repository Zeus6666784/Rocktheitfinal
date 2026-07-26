import api from './api';

/**
 * Courses service. Stubs against docs/API.md.
 * Each call returns the unwrapped `data` field on success and throws
 * the normalized error from api.js on failure.
 */

export async function listCourses({ q, category, page = 1, limit = 12, sort = 'new' } = {}) {
  const { data } = await api.get('/courses', {
    params: { q, category, page, limit, sort },
  });
  return data;
}

export async function getCourse(id) {
  const { data } = await api.get(`/courses/${id}`);
  return data;
}
