import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, BookOpen } from 'lucide-react';

/**
 * Footer (Dev 2)
 * No props. Links, socials, copyright.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const sections = [
    {
      title: 'Learn',
      links: [
        { label: 'Browse Courses', to: '/courses' },
        { label: 'Categories', to: '/courses' },
        { label: 'Featured', to: '/courses?sort=rating' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/' },
        { label: 'Careers', to: '/' },
        { label: 'Contact', to: '/' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms', to: '/' },
        { label: 'Privacy', to: '/' },
        { label: 'Cookies', to: '/' },
      ],
    },
  ];

  const socials = [
    { Icon: Github, label: 'GitHub' },
    { Icon: Twitter, label: 'Twitter' },
    { Icon: Linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer className="mt-section-mobile lg:mt-section border-t border-line bg-surface/40">
      <div className="container-shell py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-ink font-heading font-bold text-h4"
          >
            <span className="h-9 w-9 rounded-btn bg-primary/15 flex items-center justify-center text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            Learnify
          </Link>
          <p className="text-small text-ink-muted max-w-xs">
            A premium learning platform built for focus, depth, and craft.
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.title}>
            <h4 className="font-heading text-small uppercase tracking-widest text-ink-muted">
              {s.title}
            </h4>
            <ul className="mt-4 space-y-2">
              {s.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-body text-ink-secondary hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-shell py-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-small text-ink-muted">
            © {year} Learnify. Built with focus.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="h-9 w-9 rounded-btn bg-elevated hover:bg-hover text-ink-muted hover:text-primary flex items-center justify-center transition-colors"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}