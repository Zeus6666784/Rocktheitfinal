import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, GraduationCap, LogIn } from 'lucide-react';
import PrimaryButton from '../../common/PrimaryButton/PrimaryButton';
import { useAuth } from '../../../context/AuthContext';

/**
 * EnrollButton (Dev 2 - plan §6)
 * Single CTA for enrolling in a course.
 *
 * Behaviour:
 * - Not authenticated → redirects to /courses with a sign-in hint
 *   (Login is a separate flow that can be wired in a future iteration).
 * - Already enrolled → renders a "Continue learning" link to the first lecture.
 * - Otherwise calls POST /api/courses/:id/enroll then navigates to the learning page.
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
      <PrimaryButton
        label={isAuthenticated ? `Enroll in ${user?.name ? `${courseTitle}` : 'course'}` : 'Sign in to enroll'}
        variant="primary"
        icon={isAuthenticated ? CheckCircle2 : LogIn}
        onClick={handleEnroll}
        loading={pending}
      />
      {error ? (
        <p role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
