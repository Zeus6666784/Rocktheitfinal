import PlaylistItem from '../../common/PlaylistItem/PlaylistItem';

/**
 * ChapterList (Dev 2 - plan §6 / docs/DESIGN.md §Learning)
 * Groups lectures by their `chapter` field. If the data has no chapter
 * metadata, the whole list falls under a single "All lectures" section.
 *
 * Per-row state comes from the parent's completed map. onSelect(lecture)
 * is fired for unlocked items; locked rows don't fire it.
 */
export default function ChapterList({
  lectures = [],
  completedMap = {},
  currentLectureId = null,
  onSelect,
  className,
}) {
  const groups = groupLectures(lectures);

  return (
    <ol className={`space-y-6 ${className ?? ''}`}>
      {groups.map((group) => (
        <li key={group.title}>
          <header className="px-1 mb-2 flex items-center justify-between gap-2">
            <h3 className="font-heading text-small uppercase tracking-widest text-ink-muted">
              {group.title}
            </h3>
            <span className="text-caption text-ink-disabled">
              {group.items.length} {group.items.length === 1 ? 'lecture' : 'lectures'}
            </span>
          </header>
          <div className="rounded-card bg-surface border border-line overflow-hidden">
            <ul className="divide-y divide-line/40">
              {group.items.map((lecture) => {
                const completed = Boolean(completedMap[lecture.id]);
                const active = lecture.id === currentLectureId;
                return (
                  <PlaylistItem
                    key={lecture.id}
                    lectureNumber={lecture.order}
                    title={lecture.title}
                    duration={formatDuration(lecture.duration)}
                    completed={completed}
                    locked={Boolean(lecture.locked)}
                    active={active}
                    onClick={
                      lecture.locked
                        ? undefined
                        : () => onSelect?.(lecture)
                    }
                  />
                );
              })}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

function groupLectures(lectures) {
  if (!lectures.length) return [];
  const hasChapters = lectures.some((l) => l.chapter);
  if (!hasChapters) {
    return [{ title: 'All lectures', items: sortByOrder(lectures) }];
  }
  const buckets = new Map();
  for (const lecture of lectures) {
    const key = lecture.chapter || 'General';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(lecture);
  }
  return Array.from(buckets.entries()).map(([title, items]) => ({
    title,
    items: sortByOrder(items),
  }));
}

function sortByOrder(items) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function formatDuration(value) {
  if (typeof value === 'number') {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return value ?? '';
}
