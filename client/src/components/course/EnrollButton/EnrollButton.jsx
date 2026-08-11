import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../../common/PrimaryButton/PrimaryButton';
import ClickSpark from '../../common/ClickSpark/ClickSpark';
import { getToken } from '../../../services/auth';
import api from '../../../services/api';

/**
 * EnrollButton.
 * - Authenticated: POST /api/courses/:id/enroll, then navigate to Learning.
 * - Anonymous (no token): relabel as "Start Learning" - the demo does not
 *   persist enrollment, so the label must be truthful.
 *   Reads progress from localStorage to switch to "Continue learning" once
 *   the user has started.
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
  const [error, setError] = useState(null);
  const hasToken = Boolean(getToken());

  const handleClick = async () => {
    setBusy(true);
    setError(null);
    try {
      if (hasToken) {
        // ponytail: persist enrollment through the real API. Failures
        // surface a retry message instead of silently navigating.
        await api.post(`/courses/${courseId}/enroll`);
      }
      setEnrolled(true);
      navigate(`/learn/${courseId}`);
    } catch (err) {
      setError(err?.message || 'Could not enroll right now.');
      setBusy(false);
    }
  };

  // ponytail: anonymous demo never persisted enrollment, so the truthful
  // label is "Start learning". Once the learner has watched anything the
  // button switches to "Continue learning" via local progress.
  const label = enrolled ? 'Continue learning' : hasToken ? 'Enroll now' : 'Start learning';
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
      {error ? (
        <p className="mt-2 text-small text-danger">{error}</p>
      ) : enrolled ? (
        <p className="mt-2 inline-flex items-center gap-1 text-small text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          You're enrolled in {courseTitle || 'this course'}
        </p>
      ) : null}
    </ClickSpark>
  );
}