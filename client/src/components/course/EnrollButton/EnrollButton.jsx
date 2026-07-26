import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../../common/PrimaryButton/PrimaryButton';
import ClickSpark from '../../common/ClickSpark/ClickSpark';

/**
 * EnrollButton (demo).
 * No auth — clicking "Enroll" just navigates to the learning page.
 * Wrapped in ClickSpark per the handoff: sparks radiate on click.
 * Reads progress from localStorage to switch labels.
 */
const PROGRESS_KEY = (courseId) => `learnify.progress.${courseId}`;

function readProgress(courseId) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY(courseId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function EnrollButton({ courseId, courseTitle }) {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState(() => Boolean(readProgress(courseId)?.perLecture));
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    setBusy(true);
    // demo: enrollment is implicit the moment the user starts learning
    setEnrolled(true);
    navigate(`/learn/${courseId}`);
  };

  const label = enrolled ? 'Continue learning' : 'Enroll now';
  const Icon = enrolled ? Play : Sparkles;

  return (
    <ClickSpark
      sparkColor="#7C5CFC"
      sparkSize={8}
      sparkRadius={18}
      sparkCount={8}
      duration={420}
      className="w-full"
    >
      <PrimaryButton
        label={label}
        variant="primary"
        icon={Icon}
        loading={busy}
        onClick={handleClick}
        className="w-full"
      />
      {enrolled ? (
        <p className="mt-2 inline-flex items-center gap-1 text-small text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          You're enrolled in {courseTitle || 'this course'}
        </p>
      ) : null}
    </ClickSpark>
  );
}