import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * CategoryChip (Dev 2)
 * Per COMPONENT_CONTRACT.md: label, selected, onClick.
 */
export default function CategoryChip({ label, selected = false, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center px-4 h-9 rounded-badge text-small font-medium',
        'border transition-colors duration-200',
        selected
          ? 'bg-primary text-ink border-primary shadow-soft'
          : 'bg-surface text-ink-secondary border-line hover:border-primary/40 hover:text-ink',
      )}
      aria-pressed={selected}
    >
      {label}
    </motion.button>
  );
}