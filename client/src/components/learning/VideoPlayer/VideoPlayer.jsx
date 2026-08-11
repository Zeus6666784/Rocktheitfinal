import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

/**
 * VideoPlayer
 *
 * Supports both YouTube URLs and same-origin video files.
 *
 * Contract:
 *   onProgress(playedFraction: number 0..1)
 *   onComplete() - fired once per source
 *
 * A YouTube embed failure falls back to the demo's public MP4 endpoint so a
 * blocked/unavailable external embed never leaves the learner with a dead
 * black player. The fallback can be overridden with fallbackVideoUrl.
 */
const isYouTube = (url) =>
  typeof url === 'string' &&
  /(?:youtube\.com|youtu\.be)/i.test(url);

const DEFAULT_FALLBACK_VIDEO = '/api/videos-public/demo.mp4';

export default function VideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  fallbackVideoUrl = DEFAULT_FALLBACK_VIDEO,
  className,
}) {
  const completedRef = useRef(false);
  const lastNativeProgressRef = useRef(0);
  const [source, setSource] = useState(videoUrl || '');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    completedRef.current = false;
    lastNativeProgressRef.current = 0;
    setUsingFallback(false);
    setSource(videoUrl || '');
  }, [videoUrl]);

  const fireComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  };

  const handleNativeTimeUpdate = (event) => {
    if (!onProgress) return;

    const video = event.currentTarget;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const fraction = Math.min(1, Math.max(0, video.currentTime / video.duration));

    // Avoid excessive React state/localStorage writes while the native player
    // emits timeupdate events. Still update often enough for a smooth progress UI.
    if (fraction - lastNativeProgressRef.current < 0.005 && fraction < 1) return;
    lastNativeProgressRef.current = fraction;
    onProgress(fraction);
  };

  const handleExternalError = () => {
    if (!isYouTube(source) || !fallbackVideoUrl || usingFallback) return;
    completedRef.current = false;
    setUsingFallback(true);
    setSource(fallbackVideoUrl);
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
          <p className="text-small text-ink-muted">No video for this lecture yet.</p>
          {title ? <p className="text-caption text-ink-disabled">— {title}</p> : null}
        </div>
      </div>
    );
  }

  const youtubeSource = isYouTube(source);

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

      {youtubeSource ? (
        <ReactPlayer
          key={source}
          url={source}
          width="100%"
          height="100%"
          controls
          playing={false}
          progressInterval={250}
          onProgress={(state) => {
            if (Number.isFinite(state?.played)) onProgress?.(state.played);
          }}
          onEnded={fireComplete}
          onError={handleExternalError}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
                origin: window.location.origin,
              },
            },
          }}
        />
      ) : (
        <video
          key={source}
          src={source}
          width="100%"
          height="100%"
          controls
          preload="metadata"
          playsInline
          onTimeUpdate={handleNativeTimeUpdate}
          onEnded={fireComplete}
          onError={() => {
            // A fallback video failure should not recurse forever.
            if (!usingFallback && fallbackVideoUrl && source !== fallbackVideoUrl) {
              setUsingFallback(true);
              setSource(fallbackVideoUrl);
            }
          }}
          className="h-full w-full bg-black"
        >
          <track kind="captions" />
        </video>
      )}

      {usingFallback ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
          Fallback video
        </div>
      ) : null}
    </motion.div>
  );
}
