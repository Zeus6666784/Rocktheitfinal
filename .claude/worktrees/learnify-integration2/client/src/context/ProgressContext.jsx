import { createContext, useContext, useMemo, useState, useCallback } from 'react';

/**
 * Progress context. Holds the current course + per-lecture watch state
 * for the Learning Dashboard. Components emit progress events; this
 * context stores the latest values and exposes helpers.
 */
const ProgressContext = createContext({
  course: null,
  setCourse: () => {},
  lectures: {},
  recordLectureProgress: () => {},
  reset: () => {},
});

export function ProgressProvider({ children }) {
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState({});

  const recordLectureProgress = useCallback((lectureId, { watchPercentage, completed }) => {
    setLectures((prev) => ({
      ...prev,
      [lectureId]: {
        watchPercentage: Math.max(prev[lectureId]?.watchPercentage ?? 0, watchPercentage ?? 0),
        completed: Boolean(completed) || Boolean(prev[lectureId]?.completed),
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setCourse(null);
    setLectures({});
  }, []);

  const value = useMemo(
    () => ({ course, setCourse, lectures, recordLectureProgress, reset }),
    [course, lectures, recordLectureProgress, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
