import { useRef } from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * VideoPlayer
 * Thin wrapper around react-player.
 * Emits progress/complete events; contains no business logic.
 * Per COMPONENT_CONTRACT.md: videoUrl, title, onProgress, onComplete.
 *
 * onProgress(playedFraction: number 0..1)
 * onComplete() - fired when the video reaches the end
 */
export default function VideoPlayer({
  videoUrl,
  title,
  onProgress,
  onComplete,
  className,
}) {
  const completedRef = useRef(false);

  const handleProgress = (state) => {
    if (!onProgress) return;
    onProgress(state.played);
  };

  const handleEnded = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (onComplete) onComplete();
  };

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
      <ReactPlayer
        url={videoUrl}
        width="100%"
        height="100%"
        controls
        playing={false}
        onProgress={handleProgress}
        onEnded={handleEnded}
        config={{ youtube: { playerVars: { modestbranding: 1 } } }}
      />
    </motion.div>
  );
}
