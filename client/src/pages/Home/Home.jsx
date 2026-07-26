import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '../../components/home/HeroSection/HeroSection';
import CourseCard from '../../components/common/CourseCard/CourseCard';
import Loader from '../../components/common/Loader/Loader';
import { listCourses } from '../../services/courses';

/**
 * Home (demo).
 * Hero + a small "Featured courses" grid sourced from the same
 * catalogue endpoint the Browse page uses. Anonymous — no auth.
 */
export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    listCourses({ limit: 6, sort: 'popular' })
      .then((data) => alive && setItems(data.items ?? []))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <HeroSection
        title="A modern learning experience built for focus."
        subtitle="Premium courses, distraction-free lessons, and a learning path that adapts to you."
        primaryLabel="Browse Courses"
        primaryAction={() => (window.location.href = '/courses')}
        secondaryLabel="Try a Lesson"
        secondaryAction={() => (window.location.href = '/courses/demo')}
      />

      <section className="container-shell pb-section-mobile lg:pb-section space-y-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-caption uppercase tracking-widest text-ink-muted">
              Featured
            </p>
            <h2 className="font-heading text-h2 text-ink mt-1">
              Popular this week
            </h2>
          </div>
          <Link
            to="/courses"
            className="text-small font-medium text-primary hover:underline"
          >
            See all
          </Link>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="large" label="Loading courses" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((c) => (
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
          </motion.div>
        )}
      </section>
    </>
  );
}