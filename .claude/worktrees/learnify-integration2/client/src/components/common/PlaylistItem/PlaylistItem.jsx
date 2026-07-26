import { Play, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * PlaylistItem (Dev 2)
 * One lecture row, Spotify-inspired.
 * Per COMPONENT_CONTRACT.md:
 *   lectureNumber, title, duration, locked, completed, active, onClick
 */
export default function PlaylistItem({
  lectureNumber,
  title,
  duration,
  locked = false,
  completed = false,
  active = false,
  onClick,
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={locked}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-3 rounded-btn text-left transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          active
            ? 'bg-primary/10 border-l-2 border-primary'
            : 'hover:bg-hover border-l-2 border-transparent',
          locked && 'opacity-60 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'h-7 w-7 shrink-0 rounded-full flex items-center justify-center',
            active ? 'bg-primary/20 text-primary' : 'bg-elevated text-ink-muted',
          )}
        >
          {completed ? (
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
          ) : locked ? (
            <Lock className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </span>

        <span className="flex-1 min-w-0">
          <span className="block text-body text-ink truncate">
            {typeof lectureNumber === 'number' ? `${lectureNumber}. ` : ''}
            {title}
          </span>
          {duration ? (
            <span className="block text-caption text-ink-muted">{duration}</span>
          ) : null}
        </span>
      </button>
    </li>
  );
}