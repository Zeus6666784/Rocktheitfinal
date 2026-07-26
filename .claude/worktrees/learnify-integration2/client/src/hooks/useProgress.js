import { useCallback, useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { updateProgress } from '../services/progress';

/**
 * Thin hook that bridges the progress context with the backend service.
 * Components only see `onProgress(lectureId, percent, completed)` and the
 * derived `courseProgress` percentage; persistence and merge logic live
 * here so consumers stay declarative.
 */
export function useCourseProgress() {
  const { course, lectures, recordLectureProgress } = useProgress();

  const onProgress = useCallback(
    async (lectureId, watchPercentage, completed) => {
      if (!course) return;
      recordLectureProgress(lectureId, { watchPercentage, completed });
      try {
        await updateProgress({
          courseId: course.id,
          lectureId,
          watchPercentage,
          completed,
        });
      } catch {
        // Soft-fail: the local context is the source of truth for UI;
        // the server call is best-effort and will be retried on next tick.
      }
    },
    [course, recordLectureProgress],
  );

  const courseProgress = useMemo(() => {
    const entries = Object.values(lectures);
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, l) => acc + (l.watchPercentage || 0), 0);
    return Math.round(sum / entries.length);
  }, [lectures]);

  return { courseProgress, onProgress, lectures };
}
