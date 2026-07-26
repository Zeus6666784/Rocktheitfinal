import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import CourseBanner from '../../components/course/CourseBanner/CourseBanner';
import PlaylistItem from '../../components/common/PlaylistItem/PlaylistItem';
import InstructorCard from '../../components/common/InstructorCard/InstructorCard';
import Loader from '../../components/common/Loader/Loader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { getCourse } from '../../services/courses';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: null, course: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, error: null, course: null });
    getCourse(id)
      .then((data) => alive && setState({ loading: false, error: null, course: data }))
      .catch((err) => alive && setState({ loading: false, error: err, course: null }));
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.loading) {
    return (
      <div className="container-shell py-16 flex items-center justify-center">
        <Loader size="large" label="Loading course" />
      </div>
    );
  }

  if (state.error || !state.course) {
    return (
      <div className="container-shell py-16">
        <ErrorState
          title="Could not load this course"
          description={state.error?.message || 'Try a different course from the catalogue.'}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  const course = state.course;
  const lectures = course.lectures || [];
  const instructor = course.instructor;
  const isStarted = (course.progress ?? 0) > 0;
  const isComplete = (course.progress ?? 0) >= 90;

  return (
    <div className="space-y-section-mobile lg:space-y-section pb-section-mobile lg:pb-section">
      <section className="container-shell">
        <CourseBanner
          title={course.title}
          description={course.description}
          coverImage={course.coverImage || course.thumbnail}
          rating={course.rating}
          duration={course.duration}
          students={course.students}
          lectures={lectures.length}
          enrolled={isStarted}
          onEnroll={() => navigate(`/learn/${course.id}`)}
        />
      </section>

      <section className="container-shell grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <header className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-h3 text-ink flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              Playlist
            </h2>
            <span className="text-small text-ink-muted">
              {lectures.length} lectures - {course.duration}
            </span>
          </header>
          <ol className="rounded-card bg-surface border border-line overflow-hidden">
            {lectures.map((lecture, idx) => {
              const completed = isComplete;
              const locked = idx > 0 && !isStarted;
              const active = !completed && idx === 0;
              return (
                <li key={lecture._id || lecture.id}>
                  <PlaylistItem
                    title={lecture.title}
                    duration={lecture.duration}
                    lectureNumber={lecture.order || idx + 1}
                    completed={completed}
                    locked={locked}
                    active={active}
                  />
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="space-y-6">
          {instructor ? (
            <section className="space-y-3">
              <h3 className="font-heading text-h4 text-ink">Instructor</h3>
              <InstructorCard
                name={instructor.name}
                avatar={instructor.avatar}
                bio={instructor.bio}
                rating={instructor.rating}
                courses={instructor.courses}
                students={instructor.students}
              />
            </section>
          ) : null}

          <section className="rounded-card bg-surface border border-line p-5 space-y-3">
            <h3 className="font-heading text-h4 text-ink">What you get</h3>
            <ul className="space-y-2 text-small text-ink-muted">
              <li>- {lectures.length} focused lectures</li>
              <li>- Lifetime access on the web</li>
              <li>- Certificate on completion</li>
              <li>- Companion slides and starter code</li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}