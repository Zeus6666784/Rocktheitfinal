import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CourseDetail() {
  const { id } = useParams();
  return (
    <section className="container-shell py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-card bg-surface border border-line p-8"
      >
        <span className="text-caption uppercase tracking-widest text-ink-muted">
          Course Detail
        </span>
        <h1 className="mt-2 font-heading text-h1 text-ink break-words">
          {id || 'Sample Course'}
        </h1>
        <p className="mt-4 text-body text-ink-muted max-w-2xl">
          Spotify-style course layout, instructor card, and playlist are owned by
          Dev 2. This page is a route target only.
        </p>
      </motion.div>
    </section>
  );
}
