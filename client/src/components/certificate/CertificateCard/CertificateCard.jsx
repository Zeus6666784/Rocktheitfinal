import { Award, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

function formatDate(input) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * CertificateCard
 * Completion certificate preview with download action.
 * Per COMPONENT_CONTRACT.md:
 *   courseName, userName, completedDate, download
 */
export default function CertificateCard({
  courseName,
  userName,
  completedDate,
  download,
  className,
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'relative overflow-hidden rounded-card',
        'bg-gradient-to-br from-elevated via-surface to-elevated',
        'border border-line shadow-large p-8 sm:p-10',
        'before:absolute before:inset-0 before:rounded-card',
        'before:bg-gradient-to-br before:from-primary/20 before:via-transparent before:to-accent/20',
        'before:opacity-60 before:-z-10',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-card bg-primary/15 flex items-center justify-center text-primary">
            <Award className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="text-small uppercase tracking-widest text-ink-muted">
            Certificate of Completion
          </span>
        </div>

        {download ? (
          <button
            type="button"
            onClick={download}
            className={cn(
              'inline-flex items-center gap-2 h-10 px-4 rounded-btn',
              'bg-primary text-ink hover:bg-primary-hover',
              'transition-colors duration-200 text-small font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            )}
            aria-label="Download certificate"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download
          </button>
        ) : null}
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-small text-ink-muted">Awarded to</p>
        <h2 className="font-heading text-h1 text-ink break-words">
          {userName || 'Student'}
        </h2>

        <p className="text-small text-ink-muted">for completing</p>
        <h3 className="font-heading text-h2 text-primary break-words">
          {courseName || 'Course'}
        </h3>
      </div>

      <div className="mt-10 pt-6 border-t border-divider flex items-center justify-between flex-wrap gap-2">
        <span className="text-small text-ink-muted">
          Completed on {formatDate(completedDate) || '—'}
        </span>
        <span className="text-caption text-ink-disabled">
          Learnify
        </span>
      </div>
    </motion.article>
  );
}
