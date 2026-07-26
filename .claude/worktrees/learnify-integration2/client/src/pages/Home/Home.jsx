import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../../components/home/HeroSection/HeroSection';
import CourseCard from '../../components/common/CourseCard/CourseCard';
import Loader from '../../components/common/Loader/Loader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { listCourses } from '../../services/courses';

export default function Home() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  useEffect(() => {
    let alive = true;
    listCourses({ limit: 6, sort: 'rating' })
      .then((data) => alive && setState({ loading: false, error: null, items: data?.items ?? [] }))
      .catch((err) => alive && setState({ loading: false, error: err, items: [] }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <HeroSection />

      <section className="container-shell py-section-mobile lg:py-section">
        <header className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-caption uppercase tracking-widest text-ink-muted">
              Top rated
            </p>
            <h2 className="font-heading text-h2 text-ink mt-1">
              Featured courses
            </h2>
          </div>
          <Link
            to="/courses"
            className="text-small font-medium text-primary hover:underline"
          >
            Browse all courses
          </Link>
        </header>

        {state.loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size="large" label="Loading featured courses" />
          </div>
        ) : state.error ? (
          <ErrorState
            title="Could not load courses"
            description="The mock backend isn't responding. Restart the dev server if this persists."
            retry={() => window.location.reload()}
          />
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {state.items.map((c) => (
              <Link key={c.id} to={`/courses/${c.id}`} className="block">
                <CourseCard
                  thumbnail={c.thumbnail}
                  title={c.title}
                  instructor={c.instructor}
                  duration={c.duration}
                  rating={c.rating}
                  students={c.students}
                  category={c.category}
                  progress={c.progress}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}