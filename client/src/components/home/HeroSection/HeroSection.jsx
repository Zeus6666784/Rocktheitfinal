import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle } from 'lucide-react';
import PrimaryButton from '../../common/PrimaryButton/PrimaryButton';

/**
 * HeroSection (Dev 2)
 * Landing hero. Per COMPONENT_CONTRACT.md:
 *   title, subtitle, buttonText, buttonAction
 */
export default function HeroSection({
  title = 'A modern learning experience built for focus.',
  subtitle = 'Premium courses, distraction-free lessons, and a learning path that adapts to you.',
  primaryLabel = 'Browse Courses',
  primaryAction,
  secondaryLabel = 'Try a Lesson',
  secondaryAction,
}) {
  const split = title.split('built for focus.');
  const head = split[0];
  const hasAccent = split.length > 1;

  return (
    <section className="container-shell py-section-mobile lg:py-section">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl space-y-6"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-badge bg-primary/10 text-primary text-small font-medium">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Learn anything, faster
        </span>
        <h1 className="font-heading text-hero sm:text-h1 text-ink leading-tight">
          {head}
          {hasAccent ? <span className="text-primary"> built for focus.</span> : null}
        </h1>
        <p className="text-body-lg text-ink-muted max-w-2xl">{subtitle}</p>
        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton
            label={primaryLabel}
            variant="primary"
            icon={ArrowRight}
            onClick={primaryAction}
            magnetic
          />
          <PrimaryButton
            label={secondaryLabel}
            variant="secondary"
            icon={PlayCircle}
            onClick={secondaryAction}
            magnetic
          />
        </div>

        <dl className="grid grid-cols-3 gap-6 pt-8 border-t border-line max-w-xl">
          {[
            { k: '180+', v: 'Courses' },
            { k: '32k', v: 'Learners' },
            { k: '4.8', v: 'Avg. rating' },
          ].map((s) => (
            <div key={s.v}>
              <dt className="font-heading text-h3 text-ink">{s.k}</dt>
              <dd className="text-small text-ink-muted">{s.v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}