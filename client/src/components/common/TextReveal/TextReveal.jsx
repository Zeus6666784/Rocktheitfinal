import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * TextReveal
 * Splits children text into words and fades each one up with a small
 * stagger. Use for hero headings, page titles, anything where a calm,
 * staggered entrance reads better than a single fade.
 *
 *   <TextReveal>Browse Courses</TextReveal>
 *   <TextReveal as="h1" className="text-hero">A modern learning experience</TextReveal>
 *
 * No business logic. No API calls.
 */
const wordVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function TextReveal({
  as: Tag = 'span',
  delay = 0,
  stagger = true,
  className,
  children,
}) {
  const text = typeof children === 'string' ? children : String(children ?? '');
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag className={cn('inline-block', className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-baseline"
          aria-hidden={false}
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={stagger ? wordVariants : wordVariants.visible}
            initial="hidden"
            animate="visible"
            custom={i}
            transition={{ delay }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}