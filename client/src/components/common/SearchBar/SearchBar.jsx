import { Search } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * SearchBar (Dev 2)
 * Per COMPONENT_CONTRACT.md:
 *   placeholder, value, onChange, onSearch
 */
export default function SearchBar({
  placeholder = 'Search…',
  value,
  onChange,
  onSearch,
  className,
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSearch) onSearch(value ?? '');
      }}
      className={cn('relative w-full', className)}
    >
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Search"
        className={cn(
          'h-10 w-full pl-10 pr-3 rounded-input bg-surface text-body text-ink',
          'border border-line placeholder:text-ink-disabled',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30',
          'transition-colors',
        )}
      />
    </form>
  );
}