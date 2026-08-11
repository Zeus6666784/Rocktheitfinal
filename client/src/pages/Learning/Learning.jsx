import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Award, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import LearningLayout from '../../components/learning/LearningLayout/LearningLayout';
import VideoPlayer from '../../components/learning/VideoPlayer/VideoPlayer';
import ProgressBar from '../../components/learning/ProgressBar/ProgressBar';
import ResourceCard from '../../components/learning/ResourceCard/ResourceCard';
import CertificateCard from '../../components/certificate/CertificateCard/CertificateCard';
import ChapterList from '../../components/learning/ChapterList/ChapterList';
import LectureNavigator from '../../components/learning/LectureNavigator/LectureNavigator';
import HoverGlow from '../../components/common/HoverGlow/HoverGlow';
import Loader from '../../components/common/Loader/Loader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { getCourse } from '../../services/courses';
import { getToken } from '../../services/auth';
import { updateProgress } from '../../services/progress';

// ponytail: localStorage progress keeps the demo self-contained — no auth
// required, progress survives a refresh. Keyed per course.
const PROGRESS_KEY = (courseId) => `learnify.progress.${courseId}`;

function readLocalProgress(courseId) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY(courseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalProgress(courseId, data) {
  try {
    localStorage.setItem(PROGRESS_KEY(courseId), JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private mode, quota); ignore.
  }
}

// ponytail: in-browser PDF so the demo can hand the learner a real file
// without needing the auth-gated /api/certificate/:courseId endpoint.
function generateCertificatePdf({ courseName, userName, completedDate, certificateNumber }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(124, 92, 252);
  doc.setLineWidth(3);
  doc.rect(20, 20, w - 40, h - 40);
  doc.setLineWidth(1);
  doc.rect(30, 30, w - 60, h - 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(124, 92, 252);
  doc.text('Learnify', w / 2, 100, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(70, 70, 70);
  doc.text('Certificate of Completion', w / 2, 130, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(90, 90, 90);
  doc.text('This certifies that', w / 2, 180, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(20, 20, 20);
  doc.text(userName || 'Student', w / 2, 215, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(90, 90, 90);
  doc.text('has successfully completed', w / 2, 245, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(124, 92, 252);
  doc.text(courseName || 'Course', w / 2, 280, { align: 'center' });

  const dateStr = completedDate
    ? new Date(completedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(`Issued on ${dateStr}`, w / 2, h - 70, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(140, 140, 140);
  doc.text(`Certificate ID: ${certificateNumber}`, w / 2, h - 55, { align: 'center' });

  return doc;
}

function aggregateWatchPercentage(perLecture, lectureIds = []) {
  const ids = Array.isArray(lectureIds) ? lectureIds.map(String) : [];
  if (!ids.length) return 0;

  // Always divide by the total number of lectures, including lectures that
  // have never been watched. This prevents one watched lecture from making
  // the whole course appear complete.
  const sum = ids.reduce((total, id) => {
    const value = Number(perLecture?.[id] ?? 0);
    return total + Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  }, 0);

  return Math.round(sum / ids.length);
}

/**
 * Learning page (demo).
 * - Fetches the course from the server (anonymous).
 * - Tracks the selected lecture; respects the server's locked flags.
 * - Persists per-lecture watch percentage to localStorage so the demo
 *   keeps state across reloads without needing auth.
 * - Certificate card unlocks once average watchPercentage >= 90.
 */
export default function Learning() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perLecture, setPerLecture] = useState({});
  const lastSyncedPercentRef = useRef({});
  const [currentLectureId, setCurrentLectureId] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setCourse(null);
    setCurrentLectureId(null);
    setPerLecture({});
    lastSyncedPercentRef.current = {};

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

  useEffect(() => {
    if (!courseId || !course) return;

    const lectureIds = (course.lectures ?? []).map((lecture) => String(lecture.id));
    const saved = readLocalProgress(courseId);
    const savedProgress = saved?.perLecture && typeof saved.perLecture === 'object'
      ? saved.perLecture
      : {};

    // Keep only progress belonging to this course and initialise every lecture
    // to 0 so the aggregate denominator is stable across refreshes.
    const normalized = Object.fromEntries(
      lectureIds.map((id) => {
        const value = Number(savedProgress[id] ?? 0);
        return [id, Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0];
      }),
    );

    setPerLecture(normalized);
  }, [courseId, course]);

  const lectureIds = useMemo(
    () => (course?.lectures ?? []).map((lecture) => String(lecture.id)),
    [course],
  );

  const watchPercentage = useMemo(
    () => aggregateWatchPercentage(perLecture, lectureIds),
    [perLecture, lectureIds],
  );

  const completedSet = useMemo(() => {
    const set = new Set();
    for (const [id, pct] of Object.entries(perLecture)) {
      if (pct >= 90) set.add(id);
    }
    return set;
  }, [perLecture]);

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
    (playedFraction) => {
      if (!currentLecture) return;
      const pct = Math.round(playedFraction * 100);

      setPerLecture((prev) => {
        const existing = Number(prev[currentLecture.id] ?? 0);
        const next = {
          ...prev,
          [currentLecture.id]: Math.max(existing, pct),
        };
        const overall = aggregateWatchPercentage(next, lectureIds);
        writeLocalProgress(courseId, { perLecture: next, watchPercentage: overall });
        return next;
      });

      // Sync authenticated progress only when the percentage actually changes
      // by a useful amount. This avoids a request on every player progress tick.
      if (getToken()) {
        const lastSynced = lastSyncedPercentRef.current[currentLecture.id] ?? -1;
        const shouldSync = pct >= 90 || pct === 0 || pct - lastSynced >= 5;

        if (shouldSync) {
          lastSyncedPercentRef.current[currentLecture.id] = pct;
          updateProgress({
            courseId,
            lectureId: currentLecture.id,
            watchPercentage: pct,
            completed: pct >= 90,
          }).catch(() => {
            // Local progress remains the demo fallback if the API is unavailable.
          });
        }
      }

      if (pct >= 90 && nextLecture && !nextLecture.locked) {
        setCurrentLectureId(nextLecture.id);
      }
    },
    [currentLecture, nextLecture, courseId, lectureIds],
  );

  const handleComplete = useCallback(() => {
    if (!currentLecture) return;
    handleProgress(1);
  }, [currentLecture, handleProgress]);

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
  const certificateEligible = watchPercentage >= 90;

  // ponytail: demo certificate is generated in-browser; no auth required.
  const handleDownloadCertificate = () => {
    const completedDate = new Date().toISOString();
    const certificateNumber = `LF-DEMO-${String(course.id ?? courseId).slice(-6).toUpperCase()}`;
    const doc = generateCertificatePdf({
      courseName: course.title,
      userName: 'Student',
      completedDate,
      certificateNumber,
    });
    doc.save(`${certificateNumber}.pdf`);
  };

  return (
    <LearningLayout
      video={
        <div className="space-y-4">
          <VideoPlayer
            key={currentLecture?.id ?? 'none'}
            videoUrl={currentLecture?.videoUrl}
            fallbackVideoUrl={currentLecture?.fallbackVideoUrl}
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
              <p className="font-heading text-h2 text-primary">{watchPercentage}%</p>
              <p className="text-small text-ink-muted">
                {completedSet.size} of {orderedLectures.length} lectures
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progress={watchPercentage} label="Course progress" />
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
          {certificateEligible ? (
            <div className="mt-4 px-2">
              <a href="#certificate" className="inline-flex items-center text-small text-primary hover:underline">
                <Award className="h-4 w-4 mr-1" aria-hidden="true" />
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
      {certificateEligible ? (
        <motion.section
          id="certificate"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <HoverGlow spread={200} intensity={0.6}>
            <CertificateCard
              courseName={course.title}
              userName="Student"
              completedDate={new Date().toISOString()}
              certificateNumber={`LF-DEMO-${String(course.id ?? courseId).slice(-6).toUpperCase()}`}
              download={handleDownloadCertificate}
            />
          </HoverGlow>
        </motion.section>
      ) : null}
    </LearningLayout>
  );
}