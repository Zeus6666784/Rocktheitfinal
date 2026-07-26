import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * LectureNavigator (Dev 2 - plan §6 / docs/DESIGN.md §Learning "Next Lecture")
 * Previous / Next buttons + lecture title for the current item.
 */
export default function LectureNavigator({
  current,
  previous,
  next,
  onPrev,
  onNext,
  className,
}) {
  return (
    <motion.nav
      aria-label="Lecture navigation"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-card bg-surface border border-line px-4 py-3',
        'flex items-center justify-between gap-3',
        className,
      )}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!previous || previous.locked}
        className={cn(
          'inline-flex items-center gap-2 h-10 px-3 rounded-btn text-small font-medium',
          'text-ink-muted hover:text-ink hover:bg-hover transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>

      <div className="flex-1 min-w-0 text-center px-2">
        <p className="text-caption uppercase tracking-widest text-ink-muted">
          {current?.order ? `Lecture ${current.order}` : 'Now playing'}
        </p>
        <p className="truncate text-small text-ink font-medium">
          {current?.title ?? 'No lecture selected'}
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!next || next.locked}
        className={cn(
          'inline-flex items-center gap-2 h-10 px-3 rounded-btn text-small font-medium',
          next && !next.locked
            ? 'bg-primary text-ink hover:bg-primary-hover'
            : 'bg-elevated text-ink-disabled',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        {next?.locked ? <Lock className="h-4 w-4" aria-hidden="true" /> : null}
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.nav>
  );
}
