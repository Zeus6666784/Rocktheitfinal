import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * VideoPlayer
 * Renders a lecture video. Two modes, picked from the URL:
 *   - YouTube (youtube.com / youtu.be)  -> react-player (handles embed + events)
 *   - Anything else (local /uploads/*.mp4 or http(s) mp4) -> HTML5 <video>
 *
 * Emits the same events either way so the rest of the app doesn't care:
 *   onProgress(playedFraction: number 0..1)
 *   onComplete()                            fired once when playback ends
 *
 * Per COMPONENT_CONTRACT.md: videoUrl, title, onProgress, onComplete.
 * No business logic.
 */
const isYouTube = (url) =>
  typeof url === 'string' &&
  (url.includes('youtube.com') || url.includes('youtu.be'));

export default function VideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  className,
}) {
  const completedRef = useRef(false);

  // Reset completion flag whenever the source changes.
  useEffect(() => {
    completedRef.current = false;
  }, [videoUrl]);

  const fireComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (onComplete) onComplete();
  };

  // Native <video> progress handler: throttle to ~every 250ms.
  const handleTimeUpdate = (e) => {
    if (!onProgress) return;
    const v = e.currentTarget;
    if (!Number.isFinite(v.duration) || v.duration <= 0) return;
    const fraction = Math.min(1, Math.max(0, v.currentTime / v.duration));
    onProgress(fraction);
  };

  if (!videoUrl) {
    return (
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-modal bg-elevated',
          'aspect-video flex items-center justify-center text-center px-6',
          className,
        )}
      >
        <div className="space-y-2">
          <PlayCircle className="h-12 w-12 text-ink-disabled mx-auto" aria-hidden="true" />
          <p className="text-small text-ink-muted">
            No video for this lecture yet.
          </p>
          {title ? (
            <p className="text-caption text-ink-disabled">— {title}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative w-full overflow-hidden rounded-modal bg-black shadow-large',
        'aspect-video',
        className,
      )}
    >
      {title ? (
        <span className="sr-only" role="status">
          Now playing: {title}
        </span>
      ) : null}
      {isYouTube(videoUrl) ? (
        <ReactPlayer
          url={videoUrl}
          width="100%"
          height="100%"
          controls
          playing={false}
          onProgress={(state) => onProgress?.(state.played)}
          onEnded={fireComplete}
          config={{ youtube: { playerVars: { modestbranding: 1 } } }}
        />
      ) : (
        <video
          key={videoUrl}
          src={videoUrl}
          width="100%"
          height="100%"
          controls
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={fireComplete}
          className="h-full w-full bg-black"
        >
          <track kind="captions" />
        </video>
      )}
    </motion.div>
  );
}