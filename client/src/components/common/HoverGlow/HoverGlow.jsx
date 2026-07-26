import { useState } from 'react';
import { cn } from '../../../utils/cn';

/**
 * HoverGlow
 * Wraps children in a positioned container that paints a soft purple
 * glow underneath on hover. Implemented with a sibling element whose
 * opacity fades in/out on hover - keeps it self-contained (no Tailwind
 * plugin needed).
 *
 * Per docs/COMPONENT_CONTRACT.md rule "no business logic" - this is a
 * presentational wrapper with no state of its own, no API calls.
 */
export default function HoverGlow({
  color = 'rgba(124, 92, 252, 0.45)',
  spread = 80,
  intensity = 1,
  className,
  children,
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn('relative isolate', className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
        style={{
          width: spread * 2,
          height: spread * 2,
          background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
          opacity: hover ? intensity : 0,
          filter: 'blur(8px)',
        }}
      />
      {children}
    </div>
  );
}