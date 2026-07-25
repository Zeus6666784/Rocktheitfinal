import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

const sizeMap = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12',
};

/**
 * Loader
 * Spinner for async states. Uses Lucide Loader2 (allowed per UI_STYLE.md).
 * No business logic. Props: size (small | medium | large).
 */
export default function Loader({ size = 'medium', label = 'Loading', className }) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeMap[size] || sizeMap.medium,
        )}
        aria-hidden="true"
      />
    </motion.div>
  );
}
