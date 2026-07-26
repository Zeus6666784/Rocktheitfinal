import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { cn } from '../../../utils/cn';

/**
 * MagneticButton
 * Wraps PrimaryButton with a subtle magnetic-pull effect: the button
 * shifts a few pixels toward the cursor on hover. Pure Framer Motion
 * springs, no business logic. Intended for the largest hero CTAs.
 *
 * Usage: same props as PrimaryButton (label, variant, icon, onClick...).
 */
export default function MagneticButton({
  strength = 0.25,
  maxOffset = 12,
  className,
  children,
  ...primaryProps
}) {
  const wrapRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMouseMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(Math.max(-maxOffset, Math.min(maxOffset, relX * 2 * maxOffset * strength * 2)));
    y.set(Math.max(-maxOffset, Math.min(maxOffset, relY * 2 * maxOffset * strength * 2)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: sx, y: sy }}
      className={cn('inline-block', className)}
    >
      <PrimaryButton {...primaryProps}>{children}</PrimaryButton>
    </motion.div>
  );
}