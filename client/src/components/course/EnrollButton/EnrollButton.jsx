import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, GraduationCap, LogIn } from 'lucide-react';
import PrimaryButton from '../../common/PrimaryButton/PrimaryButton';
import ClickSpark from '../../common/ClickSpark/ClickSpark';
import { useAuth } from '../../../context/AuthContext';

/**
 * EnrollButton (Dev 2 - plan §6)
 * Single CTA for enrolling in a course.
 *
 * Behaviour:
 * - Not authenticated → redirects to /login with a `next` query param.
 * - Already enrolled → renders a "Continue learning" link to the learning page.
 * - Otherwise calls POST /api/courses/:id/enroll then navigates to the learning page.
 *
 * Wrapped in ClickSpark so each click on the primary CTA emits a brief
 * spark burst — visual feedback that the call is dispatching.
 */
export default function EnrollButton({ courseId, courseTitle = 'this course' }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [pending, setPending] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState(null);

  async function handleEnroll() {
    setError(null);

    if (!isAuthenticated) {
      const next = encodeURIComponent(`/courses/${courseId}`);
      navigate(`/login?next=${next}`);
      return;
    }

    setPending(true);
    try {
      const token = localStorage.getItem('learnify.token');
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.success) {
        throw new Error(payload?.error?.message || 'Could not enroll. Please try again.');
      }
      setEnrolled(true);
      navigate(`/learn/${courseId}`);
    } catch (err) {
      setError(err.message || 'Could not enroll');
    } finally {
      setPending(false);
    }
  }

  if (enrolled) {
    return (
      <PrimaryButton
        label="Continue learning"
        variant="primary"
        icon={GraduationCap}
        onClick={() => navigate(`/learn/${courseId}`)}
      />
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <ClickSpark
        sparkColor="#a78bfa"
        sparkSize={10}
        sparkRadius={18}
        sparkCount={8}
        duration={420}
        className="rounded-btn"
      >
        <PrimaryButton
          label={isAuthenticated ? `Enroll in ${user?.name ? courseTitle : 'course'}` : 'Sign in to enroll'}
          variant="primary"
          icon={isAuthenticated ? CheckCircle2 : LogIn}
          onClick={handleEnroll}
          loading={pending}
        />
      </ClickSpark>
      {error ? (
        <p role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
