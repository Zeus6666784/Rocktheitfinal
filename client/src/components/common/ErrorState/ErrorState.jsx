import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PrimaryButton from '../PrimaryButton/PrimaryButton';

/**
 * ErrorState
 * Centered error card with optional retry action.
 * Per COMPONENT_CONTRACT.md: title, description, retry.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  retry,
  retryLabel = 'Try Again',
}) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center text-center gap-4 p-8 rounded-card bg-surface border border-line"
    >
      <div className="h-14 w-14 rounded-full bg-danger/10 flex items-center justify-center">
        <AlertCircle className="h-7 w-7 text-danger" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="font-heading text-h4 text-ink">{title}</h3>
        <p className="text-body text-ink-muted">{description}</p>
      </div>
      {retry ? (
        <PrimaryButton
          label={retryLabel}
          variant="secondary"
          onClick={retry}
          ariaLabel={retryLabel}
        />
      ) : null}
    </motion.div>
  );
}
