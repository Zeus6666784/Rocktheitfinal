import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import PrimaryButton from '../PrimaryButton/PrimaryButton';

/**
 * EmptyState (Dev 2)
 * Per COMPONENT_CONTRACT.md:
 *   title, description, buttonLabel, buttonAction
 */
export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Try changing the filters or come back later.',
  buttonLabel,
  buttonAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="status"
      className="flex flex-col items-center justify-center text-center gap-4 p-12 rounded-card bg-surface border border-line"
    >
      <div className="h-14 w-14 rounded-full bg-elevated flex items-center justify-center text-ink-muted">
        <Inbox className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="font-heading text-h4 text-ink">{title}</h3>
        <p className="text-body text-ink-muted">{description}</p>
      </div>
      {buttonLabel && buttonAction ? (
        <PrimaryButton label={buttonLabel} variant="primary" onClick={buttonAction} />
      ) : null}
    </motion.div>
  );
}