import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

const variantClasses = {
  primary:
    'bg-primary text-ink hover:bg-primary-hover shadow-medium hover:shadow-large',
  secondary:
    'bg-transparent text-ink border border-line/40 hover:bg-hover',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-hover hover:text-ink',
  danger:
    'bg-danger text-ink hover:brightness-110 shadow-medium',
};

const sizeClasses = {
  sm: 'h-10 px-4 text-small',
  md: 'h-12 px-6 text-body',
  lg: 'h-14 px-8 text-body-lg',
};

/**
 * PrimaryButton
 * The main CTA button used across Learnify.
 * Variants: primary | secondary | ghost | danger
 * States:   default | hover | active | disabled | loading
 *
 * Per COMPONENT_CONTRACT.md:
 *   label, variant, icon, disabled, loading, onClick
 */
export default function PrimaryButton({
  label,
  variant = 'primary',
  icon: Icon,
  disabled = false,
  loading = false,
  onClick,
  size = 'md',
  type = 'button',
  className,
  ariaLabel,
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel || label}
      aria-busy={loading || undefined}
      whileHover={isDisabled ? undefined : { y: -2 }}
      whileTap={isDisabled ? undefined : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-btn font-medium select-none',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size],
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="h-5 w-5" aria-hidden="true" />
      ) : null}
      <span>{label}</span>
    </motion.button>
  );
}
