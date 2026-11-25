import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../../../utils/cn';
import SearchBar from '../../common/SearchBar/SearchBar';
import { useTheme } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UserContext';

/**
 * Navbar (Dev 2)
 * Sticky top nav: logo, primary links, search, profile, responsive menu.
 * Per COMPONENT_CONTRACT.md: receives `user` (optional).
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useUser();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Browse' },
  ];

  return (
    <header className="sticky top-0 z-40 h-[72px] backdrop-blur-lg bg-bg/70 border-b border-line">
      <div className="container-shell h-full flex items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-ink font-heading font-bold text-h4 shrink-0"
          aria-label="Learnify home"
        >
          <span className="h-9 w-9 rounded-btn bg-primary/15 flex items-center justify-center text-primary">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          Learnify
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 rounded-btn text-small font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-ink-muted hover:text-ink hover:bg-hover',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md justify-end">
          <SearchBar placeholder="Search courses…" />
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-10 w-10 rounded-btn bg-surface border border-line text-ink hover:bg-hover flex items-center justify-center transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-small font-medium text-primary">Admin</Link>
              )}
              <Link to="/dashboard" className="text-small font-medium text-ink-muted hover:text-ink">Dashboard</Link>
              <button onClick={signOut} className="text-small font-medium text-ink-muted hover:text-ink">Sign out</button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="text-small font-medium text-ink-muted hover:text-ink"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden h-10 w-10 rounded-btn bg-surface border border-line flex items-center justify-center text-ink"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-line bg-bg overflow-hidden"
          >
            <div className="container-shell py-4 space-y-4">
              <SearchBar placeholder="Search courses…" />
              <nav aria-label="Mobile primary" className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'px-3 py-2 rounded-btn text-small font-medium transition-colors',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-ink-muted hover:text-ink hover:bg-hover',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}