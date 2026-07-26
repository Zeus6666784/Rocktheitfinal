import { Star, BookOpen, Users } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * InstructorCard (Dev 2)
 * Per COMPONENT_CONTRACT.md:
 *   name, avatar, bio, rating, courses, students
 */
export default function InstructorCard({
  name,
  avatar,
  bio,
  rating,
  courses,
  students,
  className,
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-5 rounded-card bg-surface border border-line',
        className,
      )}
    >
      <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden bg-elevated flex items-center justify-center text-primary font-heading font-semibold text-h4">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          (name?.[0] || '?').toUpperCase()
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <h4 className="font-heading text-h4 text-ink truncate">{name}</h4>
        {bio ? <p className="text-small text-ink-muted line-clamp-2">{bio}</p> : null}

        <div className="flex items-center gap-4 text-small text-ink-muted pt-1">
          {typeof rating === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-highlight fill-highlight" aria-hidden="true" />
              <span className="text-ink">{rating.toFixed(1)}</span>
            </span>
          ) : null}
          {typeof courses === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {courses} courses
            </span>
          ) : null}
          {typeof students === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden="true" />
              {students.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}