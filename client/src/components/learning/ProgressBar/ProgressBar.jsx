import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * ProgressBar
 * Animated horizontal bar. Single prop: progress (0..100).
 * 8px height, fully rounded, purple fill on dark track.
 */
export default function ProgressBar({ progress = 0, label, className }) {
  const safe = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
      className={cn('w-full', className)}
    >
      <div className="relative h-2 w-full overflow-hidden rounded-badge bg-line/40">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-badge bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${safe}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
