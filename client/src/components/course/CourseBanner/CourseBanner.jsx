import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { cn } from '../../../utils/cn';
import PrimaryButton from '../../common/PrimaryButton/PrimaryButton';

/**
 * CourseBanner (Dev 2)
 * Spotify-style top of the Course Detail page.
 * Per COMPONENT_CONTRACT.md:
 *   coverImage, title, description, duration, lectures, rating, students
 */
export default function CourseBanner({
  coverImage,
  title,
  description,
  duration,
  lectures,
  rating,
  students,
  onEnroll,
  enrolled = false,
  className,
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-card border border-line bg-gradient-to-br from-elevated via-surface to-elevated',
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 opacity-30">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover blur-2xl scale-110"
          />
        ) : null}
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6 p-6 sm:p-8">
        <div className="aspect-video md:aspect-square rounded-image overflow-hidden bg-elevated shadow-large">
          {coverImage ? (
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/40 via-elevated to-accent/30" />
          )}
        </div>

        <div className="space-y-4 min-w-0">
          <span className="text-caption uppercase tracking-widest text-ink-muted">
            Course
          </span>
          <h1 className="font-heading text-h1 text-ink break-words">{title}</h1>
          {description ? (
            <p className="text-body text-ink-secondary max-w-2xl">{description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 text-small text-ink-muted">
            {typeof rating === 'number' ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-highlight fill-highlight" aria-hidden="true" />
                <span className="text-ink">{rating.toFixed(1)}</span>
              </span>
            ) : null}
            {typeof students === 'number' ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden="true" />
                {students.toLocaleString()} students
              </span>
            ) : null}
            {duration ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {duration}
              </span>
            ) : null}
            {typeof lectures === 'number' ? (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {lectures} lectures
              </span>
            ) : null}
          </div>

          {onEnroll ? (
            <div className="pt-2">
              <PrimaryButton
                label={enrolled ? 'Continue Learning' : 'Enroll Now'}
                variant="primary"
                onClick={onEnroll}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}