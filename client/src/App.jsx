import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learning from './pages/Learning';

/**
 * Top-level app shell. Skeleton Navbar (Dev 2 owns the real one) plus
 * the four route targets from SYSTEM.md. Pages are placeholders that
 * demo the components Dev 1 owns.
 */
function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
  ];
  return (
    <header className="sticky top-0 z-40 h-[72px] backdrop-blur-lg bg-bg/70 border-b border-line">
      <div className="container-shell h-full flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 text-ink font-heading font-bold text-h4">
          <span className="h-8 w-8 rounded-btn bg-primary/15 flex items-center justify-center text-primary">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          Learnify
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-4">
          {links.map((l) => {
            const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-btn text-small font-medium transition-colors ${
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-ink-muted hover:text-ink hover:bg-hover'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/learn/:courseId" element={<Learning />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
