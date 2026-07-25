import { Award, Download, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * LearningLayout
 * Two-column learning dashboard: video/sidebar + 320px playlist/progress sidebar.
 * Children (named slots): video, progress, resources, playlist.
 * Falls back to generic `children` if no slot is provided.
 */
export default function LearningLayout({
  video,
  progress,
  playlist,
  resources,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-shell px-4 sm:px-6 lg:px-8 py-8',
        'grid gap-6 lg:gap-8',
        'grid-cols-1 lg:grid-cols-[1fr_320px]',
        className,
      )}
    >
      <main className="space-y-6 min-w-0">
        {video}
        {progress}
        {resources}
        {children}
      </main>

      <aside className="space-y-6 lg:sticky lg:top-24 self-start">
        {playlist}
      </aside>
    </div>
  );
}
