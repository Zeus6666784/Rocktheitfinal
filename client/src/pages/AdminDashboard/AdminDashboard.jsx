import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useUser } from '../../context/UserContext.jsx';

const TABS = ['Overview','Courses','Lectures','Students','Enrollments','Categories','Instructors','Video Library','Analytics','Settings'];

export default function AdminDashboard() {
  const { isAdmin } = useUser();
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (t) => {
    setLoading(true); setError(''); setData(null);
    try {
      const map = {
        'Overview': '/admin/stats',
        'Courses': '/admin/courses',
        'Lectures': '/admin/lectures',
        'Students': '/admin/users',
        'Enrollments': '/admin/enrollments',
        'Categories': '/admin/categories',
        'Instructors': '/admin/instructors',
        'Video Library': '/admin/videos',
        'Analytics': '/admin/analytics',
        'Settings': '/admin/settings',
      };
      const r = await api.get(map[t]);
      setData(r.data.data);
    } catch (e) { setError(e?.error?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(tab); }, [tab]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const refresh = () => load(tab);

  return (
    <div className="container-shell py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 rounded text-sm ${tab===t?'bg-primary text-white':'bg-surface border'}`}>{t}</button>
        ))}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-ink-muted mb-4">Loading…</p>}

      {tab === 'Overview' && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['Users',data.users],['Students',data.students],['Instructors',data.instructors],['Admins',data.admins],['Courses',data.courses],['Published',data.publishedCourses],['Lectures',data.lectures],['Progress',data.progress],['Enrollments',data.enrollments]].map(([k,v])=>(
            <div key={k} className="p-4 bg-surface border rounded"><div className="text-2xl font-bold">{v}</div><div className="text-sm text-ink-muted">{k}</div></div>
          ))}
        </div>
      )}

      {tab === 'Courses' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map(c => (
            <div key={c.id} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-ink-muted">{c.category} · {c.lectures} lectures · {c.students} students · {c.published?'published':'draft'} · {c.instructor?.name||'—'}</div>
              </div>
              <button onClick={async()=>{ if(!confirm('Delete course?'))return; await api.delete(`/admin/courses/${c.id}`); refresh(); }} className="text-red-500 text-sm">Delete</button>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No courses.</p>}
        </div>
      )}

      {tab === 'Lectures' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map(l => (
            <div key={l.id} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{l.title}</div>
                <div className="text-sm text-ink-muted">course {l.courseId} · order {l.order} · {l.duration}s · {l.locked?'locked':'unlocked'}</div>
              </div>
              <button onClick={async()=>{ if(!confirm('Delete lecture?'))return; await api.delete(`/admin/lectures/${l.id}`); refresh(); }} className="text-red-500 text-sm">Delete</button>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No lectures.</p>}
        </div>
      )}

      {tab === 'Students' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map(u => (
            <div key={u.id} className="p-4 bg-surface border rounded flex justify-between items-center flex-wrap gap-2">
              <div>
                <div className="font-semibold">{u.name} <span className="text-xs text-ink-muted">({u.email})</span></div>
                <div className="text-sm text-ink-muted">{u.role} · enrolled {u.enrolled} · {u.disabled?'disabled':'active'}</div>
              </div>
              <div className="flex gap-2">
                <select value={u.role} onChange={async e=>{ await api.patch(`/admin/users/${u.id}`,{role:e.target.value}); refresh(); }} className="border rounded px-2 py-1 text-sm">
                  <option value="student">student</option>
                  <option value="instructor">instructor</option>
                  <option value="admin">admin</option>
                </select>
                <button onClick={async()=>{ await api.patch(`/admin/users/${u.id}`,{disabled:!u.disabled}); refresh(); }} className="text-sm px-2 py-1 border rounded">{u.disabled?'Enable':'Disable'}</button>
                <button onClick={async()=>{ if(!confirm('Delete user?'))return; await api.delete(`/admin/users/${u.id}`); refresh(); }} className="text-red-500 text-sm">Delete</button>
              </div>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No users.</p>}
        </div>
      )}

      {tab === 'Enrollments' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map((e,i) => (
            <div key={i} className="p-4 bg-surface border rounded">
              <div className="font-semibold">{e.userName} <span className="text-xs text-ink-muted">({e.userEmail})</span></div>
              <div className="text-sm text-ink-muted">{e.courseTitle}</div>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No enrollments.</p>}
        </div>
      )}

      {tab === 'Categories' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map(c => (
            <div key={c.name} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-ink-muted">{c.courses} courses</div>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No categories.</p>}
        </div>
      )}

      {tab === 'Instructors' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map(u => (
            <div key={u.id} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-sm text-ink-muted">{u.email} · {u.disabled?'disabled':'active'}</div>
              </div>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No instructors.</p>}
        </div>
      )}

      {tab === 'Video Library' && Array.isArray(data) && (
        <div className="space-y-3">
          {data.map(v => (
            <div key={v.filename} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{v.filename}</div>
                <div className="text-sm text-ink-muted">{Math.round(v.sizeBytes/1024/1024*100)/100} MB · {v.mtime}</div>
              </div>
              <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-primary text-sm">Open</a>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No videos.</p>}
        </div>
      )}

      {tab === 'Analytics' && data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface border rounded"><div className="text-2xl font-bold">{data.avgWatchPercentage}%</div><div className="text-sm text-ink-muted">Avg watch</div></div>
            <div className="p-4 bg-surface border rounded"><div className="text-2xl font-bold">{data.completedProgressRows}</div><div className="text-sm text-ink-muted">Completed rows</div></div>
            <div className="p-4 bg-surface border rounded"><div className="text-2xl font-bold">{data.certificateEligible}</div><div className="text-sm text-ink-muted">Cert eligible</div></div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Top courses</h3>
            {data.topCourses.map((c,i)=>(
              <div key={i} className="p-3 bg-surface border rounded flex justify-between">
                <span>{c.title}</span><span className="text-sm text-ink-muted">{c.students} students · {c.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Settings' && data && (
        <div className="space-y-2">
          {Object.entries(data).map(([k,v]) => (
            <div key={k} className="p-3 bg-surface border rounded flex justify-between">
              <span className="font-medium">{k}</span><span className="text-ink-muted">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}