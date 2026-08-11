import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CategoryChip from '../../components/common/CategoryChip/CategoryChip';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import CourseCard from '../../components/common/CourseCard/CourseCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Loader from '../../components/common/Loader/Loader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import HoverGlow from '../../components/common/HoverGlow/HoverGlow';
import { listCourses } from '../../services/courses';
import { CATEGORIES } from '../../mocks/catalog';

const SORT_OPTIONS = [
  { id: 'new', label: 'Newest' },
  { id: 'rating', label: 'Top rated' },
  { id: 'popular', label: 'Most popular' },
];

const PAGE_SIZE = 12;

export default function Courses() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    listCourses({ q: submittedQuery, category, sort, page, limit: PAGE_SIZE })
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((err) => alive && setState({ loading: false, error: err, data: null }));
    return () => {
      alive = false;
    };
  }, [submittedQuery, category, sort, page]);

  const items = state.data?.items ?? [];
  const totalPages = state.data ? Math.ceil(state.data.total / state.data.limit) : 1;

  const handleSubmit = (value) => {
    setSubmittedQuery(value);
    setPage(1);
  };

  const allCategories = useMemo(() => ['All', ...CATEGORIES], []);

  return (
    <section className="container-shell py-section-mobile lg:py-section space-y-8">
      <header className="space-y-2">
        <p className="text-caption uppercase tracking-widest text-ink-muted">Catalogue</p>
        <h1 className="font-heading text-h1 text-ink">Browse Courses</h1>
        <p className="text-body text-ink-muted max-w-2xl">
          Search by topic or filter by category. Tap a card to see what is inside.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSubmit}
          placeholder="Search courses, instructors, topics"
        />
        <div
          role="radiogroup"
          aria-label="Sort by"
          className="flex items-center gap-2"
        >
          {SORT_OPTIONS.map((opt) => (
            <CategoryChip
              key={opt.id}
              label={opt.label}
              selected={sort === opt.id}
              onClick={() => {
                setSort(opt.id);
                setPage(1);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {allCategories.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            selected={category === cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
          />
        ))}
      </div>

      {state.loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size="large" label="Loading courses" />
        </div>
      ) : state.error ? (
        <ErrorState
          title="Could not load courses"
          description="We couldn't load the courses right now. Please try again."
          retry={() => window.location.reload()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No courses match"
          description="Try clearing your filters or searching for something else."
        />
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
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
                <HoverGlow spread={140} intensity={0.9} className="h-full">
                  <Link key={c.id} to={`/courses/${c.id}`} className="block h-full">
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

          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-btn bg-elevated text-small font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hover"
              >
                Previous
              </button>
              <span className="text-small text-ink-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-btn bg-elevated text-small font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hover"
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}