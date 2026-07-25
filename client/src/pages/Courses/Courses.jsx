import { useEffect, useState } from 'react';
import Loader from '../../components/common/Loader/Loader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import { listCourses } from '../../services/courses';

/**
 * Placeholder browse page. Dev 2 owns the real course grid + filters.
 * This page exists so the route works and the demo API service layer
 * is exercised on first load.
 */
export default function Courses() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  useEffect(() => {
    let alive = true;
    listCourses()
      .then((data) => alive && setState({ loading: false, error: null, items: data?.items ?? [] }))
      .catch((err) => alive && setState({ loading: false, error: err, items: [] }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="container-shell py-16 flex items-center justify-center">
        <Loader size="large" label="Loading courses" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container-shell py-16">
        <ErrorState
          title="Could not load courses"
          description="The backend is offline. Once Dev 2's server is running, this page will fill with the catalogue."
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <section className="container-shell py-16">
      <h1 className="font-heading text-h1 text-ink">Browse Courses</h1>
      <p className="mt-2 text-body text-ink-muted">
        Course grid coming from the backend. Currently showing: {state.items.length} items.
      </p>
    </section>
  );
}
