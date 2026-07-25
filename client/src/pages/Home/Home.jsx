import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import PrimaryButton from '../../components/common/PrimaryButton/PrimaryButton';

export default function Home() {
  return (
    <section className="container-shell py-section-mobile lg:py-section">
      <div className="max-w-3xl space-y-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-badge bg-primary/10 text-primary text-small font-medium">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Learn anything, faster
        </span>
        <h1 className="font-heading text-hero sm:text-h1 text-ink leading-tight">
          A modern learning experience
          <span className="text-primary"> built for focus.</span>
        </h1>
        <p className="text-body-lg text-ink-muted max-w-2xl">
          Premium courses, distraction-free lessons, and a learning path that adapts
          to you. Browse the catalogue or jump into a sample learning session.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/courses">
            <PrimaryButton
              label="Browse Courses"
              variant="primary"
              icon={ArrowRight}
              onClick={() => {}}
            />
          </Link>
          <Link to="/learn/demo">
            <PrimaryButton
              label="Try a Lesson"
              variant="secondary"
              onClick={() => {}}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
