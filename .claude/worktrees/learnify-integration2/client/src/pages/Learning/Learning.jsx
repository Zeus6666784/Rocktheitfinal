import { useEffect, useMemo } from 'react';
import { FileText, Play, Lock, CheckCircle2, Sparkles, Download, Award } from 'lucide-react';
import LearningLayout from '../../components/learning/LearningLayout/LearningLayout';
import VideoPlayer from '../../components/learning/VideoPlayer/VideoPlayer';
import ProgressBar from '../../components/learning/ProgressBar/ProgressBar';
import ResourceCard from '../../components/learning/ResourceCard/ResourceCard';
import CertificateCard from '../../components/certificate/CertificateCard/CertificateCard';
import PrimaryButton from '../../components/common/PrimaryButton/PrimaryButton';
import { useProgress } from '../../context/ProgressContext';
import { useCourseProgress } from '../../hooks/useProgress';

/**
 * Learning page - DEMO of the seven components Dev 1 owns.
 * The course data is inlined for now; once Dev 2's backend lands
 * this page will fetch it via services/courses.js + services/lectures.js.
 */

const SAMPLE_COURSE = {
  id: 'demo',
  title: 'React Foundations',
  user: 'Lavkush',
  completedAt: '2026-07-25',
};

const SAMPLE_LECTURES = [
  { id: 'l1', title: 'Welcome to React', duration: '4:12', order: 1 },
  { id: 'l2', title: 'Components & JSX', duration: '9:48', order: 2 },
  { id: 'l3', title: 'Hooks in depth', duration: '14:05', order: 3 },
  { id: 'l4', title: 'State management', duration: '12:30', order: 4 },
  { id: 'l5', title: 'Building your first app', duration: '18:22', order: 5 },
];

const SAMPLE_RESOURCES = [
  {
    id: 'r1',
    title: 'Slides - Components & JSX',
    description: 'PDF companion for lecture 2',
    fileUrl: '#',
    type: 'pdf',
  },
  {
    id: 'r2',
    title: 'Starter code',
    description: 'Zip with the lecture 5 starter project',
    fileUrl: '#',
    type: 'zip',
  },
  {
    id: 'r3',
    title: 'Cheat sheet',
    description: 'Hooks reference (one page)',
    fileUrl: '#',
    type: 'doc',
  },
];

export default function Learning() {
  const { setCourse } = useProgress();
  const { courseProgress, onProgress } = useCourseProgress();

  useEffect(() => {
    setCourse({ id: SAMPLE_COURSE.id, title: SAMPLE_COURSE.title });
  }, [setCourse]);

  const completedCount = useMemo(() => {
    // Demo heuristic: a lecture is "completed" once progress reaches 90%.
    return Math.round((courseProgress / 100) * SAMPLE_LECTURES.length);
  }, [courseProgress]);

  const showCertificate = courseProgress >= 90;

  return (
    <LearningLayout
      video={
        <VideoPlayer
          videoUrl="https://www.youtube.com/watch?v=Ke90Tje7VS0"
          title="Welcome to React"
          onProgress={(played) => onProgress('l1', Math.round(played * 100), played >= 0.9)}
          onComplete={() => onProgress('l1', 100, true)}
        />
      }
      progress={
        <section className="rounded-card bg-surface border border-line p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-caption uppercase tracking-widest text-ink-muted">
                Course progress
              </p>
              <h2 className="font-heading text-h3 text-ink mt-1">
                {SAMPLE_COURSE.title}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-heading text-h2 text-primary">{courseProgress}%</p>
              <p className="text-small text-ink-muted">
                {completedCount} of {SAMPLE_LECTURES.length} lectures
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progress={courseProgress} label="Course progress" />
          </div>
        </section>
      }
      resources={
        <section className="space-y-3">
          <h3 className="font-heading text-h4 text-ink flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" aria-hidden="true" />
            Resources
          </h3>
          <div className="space-y-2">
            {SAMPLE_RESOURCES.map((r) => (
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
        </section>
      }
      playlist={
        <section className="rounded-card bg-surface border border-line p-4">
          <h3 className="font-heading text-h4 text-ink px-2 mb-3">Playlist</h3>
          <ul className="space-y-1">
            {SAMPLE_LECTURES.map((l, idx) => {
              const isCompleted = idx < completedCount;
              const isLocked = idx > completedCount;
              const isCurrent = idx === completedCount;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onProgress(l.id, 100, true)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-btn text-left transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-hover'
                    }`}
                    aria-current={isCurrent ? 'true' : undefined}
                  >
                    <span className="h-7 w-7 rounded-full bg-elevated flex items-center justify-center text-ink-muted text-small">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-body text-ink truncate">{l.title}</span>
                      <span className="block text-caption text-ink-muted">
                        Lecture {l.order} - {l.duration}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {showCertificate ? (
            <div className="mt-4 px-2">
              <PrimaryButton
                label="View Certificate"
                variant="primary"
                icon={Award}
                onClick={() => {
                  const el = document.getElementById('certificate');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
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
      {showCertificate ? (
        <section id="certificate">
          <CertificateCard
            courseName={SAMPLE_COURSE.title}
            userName={SAMPLE_COURSE.user}
            completedDate={SAMPLE_COURSE.completedAt}
            download={() => alert('Certificate download stub - Dev 2 will wire the PDF endpoint.')}
          />
        </section>
      ) : null}
    </LearningLayout>
  );
}
