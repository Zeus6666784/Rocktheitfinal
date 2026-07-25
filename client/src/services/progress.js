import api from './api';

/**
 * Progress service. Matches docs/API.md.
 *
 * updateProgress expects the body shape:
 *   { courseId, lectureId, watchPercentage, completed }
 *
 *   - watchPercentage: integer 0..100
 *   - completed: true only when watchPercentage >= 90
 */
export async function updateProgress({ courseId, lectureId, watchPercentage, completed }) {
  const { data } = await api.post('/progress', {
    courseId,
    lectureId,
    watchPercentage,
    completed,
  });
  return data;
}

export async function getProgress(courseId) {
  const { data } = await api.get(`/progress/${courseId}`);
  return data;
}
