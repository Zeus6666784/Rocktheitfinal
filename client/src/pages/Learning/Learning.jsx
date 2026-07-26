import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Award, Sparkles } from 'lucide-react';
import LearningLayout from '../../components/learning/LearningLayout/LearningLayout';
import VideoPlayer from '../../components/learning/VideoPlayer/VideoPlayer';
import ProgressBar from '../../components/learning/ProgressBar/ProgressBar';
import ResourceCard from '../../components/learning/ResourceCard/ResourceCard';
import CertificateCard from '../../components/certificate/CertificateCard/CertificateCard';
import ChapterList from '../../components/learning/ChapterList/ChapterList';
import LectureNavigator from '../../components/learning/LectureNavigator/LectureNavigator';
import Loader from '../../components/common/Loader/Loader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { getCourse } from '../../services/courses';
import { getLecture } from '../../services/lectures';
import { getProgress, updateProgress } from '../../services/progress';
import { getCertificate } from '../../services/certificate';

function formatDuration(seconds) {
  if (typeof seconds !== 'number') return seconds;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Learning page.
 * - fetches the course (with lectures + their locked flags) from the server
 * - tracks which lecture is currently selected
 * - real lecture gating: clicking a locked lecture is a no-op (server will also reject)
 * - progress updates on every video tick (debounced at the hook)
 * - certificate unlocks when server progress >= 90
 */
export default function Learning() {
  const { courseId } = useParams();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressState, setProgressState] = useState({
    completedLectures: [],
    watchPercentage: 0,
    totalLectures: 0,
  });
  const [currentLectureId, setCurrentLectureId] = useState(null);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setCourse(null);
    setProgressState({ completedLectures: [], watchPercentage: 0, totalLectures: 0 });
    setCurrentLectureId(null);

    (async () => {
      try {
        const data = await getCourse(courseId);
        if (!alive) return;
        setCourse(data);
        const unlocked = (data.lectures ?? []).find((l) => !l.locked) ?? data.lectures?.[0];
        setCurrentLectureId(unlocked?.id ?? null);
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [courseId]);

  // Load existing progress (if authenticated) so we render the right state.
  useEffect(() => {
    if (!isAuthenticated || !courseId) return undefined;
    let alive = true;
    getProgress(courseId)
      .then((data) => {
        if (!alive) return;
        if (data?.progress) {
          setProgressState({
            completedLectures: data.completedLectures ?? [],
            watchPercentage: data.watchPercentage ?? 0,
            totalLectures: data.totalLectures ?? course?.lectures?.length ?? 0,
          });
        }
      })
      .catch(() => {
        // 404 is fine - no progress yet.
      });
    return () => {
      alive = false;
    };
  }, [courseId, isAuthenticated, course?.lectures?.length]);

  const completedSet = useMemo(
    () => new Set(progressState.completedLectures),
    [progressState.completedLectures],
  );

  const completedMap = useMemo(() => {
    const map = {};
    for (const id of completedSet) map[id] = { completed: true };
    return map;
  }, [completedSet]);

  const currentLecture = useMemo(
    () => (course?.lectures ?? []).find((l) => l.id === currentLectureId) ?? null,
    [course, currentLectureId],
  );

  const orderedLectures = course?.lectures ?? [];
  const currentIndex = orderedLectures.findIndex((l) => l.id === currentLectureId);
  const previousLecture = currentIndex > 0 ? orderedLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex >= 0 ? orderedLectures[currentIndex + 1] : null;

  const handleSelect = useCallback((lecture) => {
    if (lecture.locked) return;
    setCurrentLectureId(lecture.id);
  }, []);

  const handleNext = useCallback(() => {
    if (nextLecture && !nextLecture.locked) {
      setCurrentLectureId(nextLecture.id);
    }
  }, [nextLecture]);

  const handlePrev = useCallback(() => {
    if (previousLecture && !previousLecture.locked) {
      setCurrentLectureId(previousLecture.id);
    }
  }, [previousLecture]);

  const handleProgress = useCallback(
    async (playedFraction) => {
      if (!currentLecture || !isAuthenticated) return;
      const pct = Math.round(playedFraction * 100);
      const completed = pct >= 90;
      try {
        const data = await updateProgress({
          courseId,
          lectureId: currentLecture.id,
          watchPercentage: pct,
          completed,
        });
        if (data) {
          setProgressState({
            completedLectures: data.completedLectures ?? [],
            watchPercentage: data.watchPercentage ?? 0,
            totalLectures: data.totalLectures ?? orderedLectures.length,
          });
          if (completed && nextLecture && !nextLecture.locked) {
            // Auto-advance after completion.
            setCurrentLectureId(nextLecture.id);
          }
        }
      } catch {
        // Soft fail: keep the UI responsive. Server will reconcile on next tick.
      }
    },
    [currentLecture, courseId, isAuthenticated, nextLecture, orderedLectures.length],
  );

  const handleComplete = useCallback(() => {
    if (!currentLecture) return;
    handleProgress(1);
  }, [currentLecture, handleProgress]);

  // Unlock certificate when threshold hits.
  useEffect(() => {
    if (!isAuthenticated || !courseId) return undefined;
    if (progressState.watchPercentage < 90) {
      setCertificate(null);
      return undefined;
    }
    let alive = true;
    getCertificate(courseId)
      .then((data) => {
        if (alive) setCertificate(data);
      })
      .catch(() => {
        if (alive) setCertificate(null);
      });
    return () => {
      alive = false;
    };
  }, [courseId, isAuthenticated, progressState.watchPercentage]);

  if (loading) {
    return (
      <div className="container-shell py-16 flex items-center justify-center">
        <Loader size="large" label="Loading course" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container-shell py-16">
        <ErrorState
          title="Could not load this course"
          description={error?.message || 'Try a different course from the catalogue.'}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  const resources = currentLecture?.resources ?? [];

  return (
    <LearningLayout
      video={
        <div className="space-y-4">
          <VideoPlayer
            key={currentLecture?.id ?? 'none'}
            videoUrl={currentLecture?.videoUrl}
            title={currentLecture?.title}
            onProgress={handleProgress}
            onComplete={handleComplete}
          />
          {currentLecture ? (
            <LectureNavigator
              current={currentLecture}
              previous={previousLecture}
              next={nextLecture}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          ) : null}
        </div>
      }
      progress={
        <section className="rounded-card bg-surface border border-line p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-caption uppercase tracking-widest text-ink-muted">
                Course progress
              </p>
              <h2 className="font-heading text-h3 text-ink mt-1">{course.title}</h2>
            </div>
            <div className="text-right">
              <p className="font-heading text-h2 text-primary">{progressState.watchPercentage}%</p>
              <p className="text-small text-ink-muted">
                {completedSet.size} of {orderedLectures.length} lectures
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progress={progressState.watchPercentage} label="Course progress" />
          </div>
        </section>
      }
      resources={
        <section className="space-y-3">
          <h3 className="font-heading text-h4 text-ink flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" aria-hidden="true" />
            Resources
          </h3>
          {resources.length === 0 ? (
            <p className="text-small text-ink-muted">No resources for this lecture.</p>
          ) : (
            <div className="space-y-2">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  title={r.title}
                  description={r.description}
                  fileUrl={r.fileUrl}
                  type={r.type}
                  icon={FileText}
                />
              ))}
            </div>
          )}
        </section>
      }
      playlist={
        <section className="rounded-card bg-surface border border-line p-4">
          <h3 className="font-heading text-h4 text-ink px-2 mb-3">Playlist</h3>
          <ChapterList
            lectures={orderedLectures}
            completedMap={completedMap}
            currentLectureId={currentLectureId}
            onSelect={handleSelect}
          />
          {progressState.watchPercentage >= 90 ? (
            <div className="mt-4 px-2">
              <a href="#certificate">
                <Award className="inline h-4 w-4 mr-1 text-primary" aria-hidden="true" />
                View Certificate
              </a>
            </div>
          ) : (
            <p className="mt-4 px-2 text-small text-ink-muted flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              Reach 90% to unlock your certificate.
            </p>
          )}
        </section>
      }
    >
      {progressState.watchPercentage >= 90 && certificate ? (
        <section id="certificate">
          <CertificateCard
            courseName={course.title}
            userName={certificate.userName}
            completedDate={certificate.completedDate}
            certificateNumber={certificate.certificateNumber}
          />
        </section>
      ) : null}
    </LearningLayout>
  );
}
