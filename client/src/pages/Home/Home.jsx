import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroSection from '../../components/home/HeroSection/HeroSection';
import CourseCard from '../../components/common/CourseCard/CourseCard';
import HoverGlow from '../../components/common/HoverGlow/HoverGlow';
import TextReveal from '../../components/common/TextReveal/TextReveal';
import Loader from '../../components/common/Loader/Loader';
import { listCourses } from '../../services/courses';

/**
 * Home (demo).
 * Hero + a small "Featured courses" grid sourced from the same
 * catalogue endpoint the Browse page uses. Anonymous — no auth.
 *
 * Animations:
 *  - Hero CTAs are MagneticButtons (subtle cursor pull on hover).
 *  - Section title uses TextReveal (staggered fade-up per word).
 *  - Each course card sits inside a HoverGlow (soft purple halo on hover).
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

  const navigate = (path) => () => (window.location.href = path);

  return (
    <>
      <HeroSection
        title="A modern learning experience built for focus."
        subtitle="Premium courses, distraction-free lessons, and a learning path that adapts to you."
        primaryLabel="Browse Courses"
        primaryAction={navigate('/courses')}
        secondaryLabel="Try a Lesson"
        secondaryAction={navigate('/courses/react-foundations')}
        // HeroSection renders PrimaryButtons; wrapping them in
        // MagneticButton would require refactoring HeroSection. Instead
        // we layer animation onto the surrounding card via HoverGlow
        // and rely on HeroSection's existing Framer Motion entrance.
      />

      <section className="container-shell pb-section-mobile lg:pb-section space-y-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-caption uppercase tracking-widest text-ink-muted">
              Featured
            </p>
            <TextReveal
              as="h2"
              className="font-heading text-h2 text-ink mt-1 block"
            >
              Popular this week
            </TextReveal>
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
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((c) => (
              <motion.div
                key={c.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <HoverGlow spread={120} intensity={0.9} className="h-full">
                  <Link to={`/courses/${c.id}`} className="block h-full">
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
                </HoverGlow>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </>
  );
}