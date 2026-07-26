import { motion } from 'framer-motion';
import { Star, Clock, Users } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * CourseCard (Dev 2)
 * Used in the browse grid.
 * Per COMPONENT_CONTRACT.md:
 *   thumbnail, title, instructor, duration, rating, students, category, progress, onClick
 */
export default function CourseCard({
  thumbnail,
  title,
  instructor,
  duration,
  rating,
  students,
  category,
  progress,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group text-left w-full rounded-card overflow-hidden bg-surface',
        'border border-line hover:border-primary/40 hover:shadow-large',
        'transition-all duration-250',
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-card bg-elevated">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-elevated to-accent/20" />
        )}
        {category ? (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-badge bg-bg/80 backdrop-blur-sm text-caption font-medium text-ink">
            {category}
          </span>
        ) : null}
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-heading text-h4 text-ink line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        {instructor ? (
          <p className="text-small text-ink-muted truncate">{instructor}</p>
        ) : null}

        <div className="flex items-center gap-4 text-small text-ink-muted">
          {typeof rating === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-highlight fill-highlight" aria-hidden="true" />
              <span className="text-ink">{rating.toFixed(1)}</span>
            </span>
          ) : null}
          {duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {duration}
            </span>
          ) : null}
          {typeof students === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              {students.toLocaleString()}
            </span>
          ) : null}
        </div>

        {typeof progress === 'number' && progress > 0 ? (
          <div className="pt-2">
            <div className="flex items-center justify-between text-caption text-ink-muted mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-badge bg-line/40 overflow-hidden">
              <div
                className="h-full bg-primary rounded-badge transition-all"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}