import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useUser } from '../../context/UserContext.jsx';
import CourseEditor from './CourseEditor.jsx';
import LectureEditor from './LectureEditor.jsx';

const TABS = ['Overview','Courses','Lectures','Students','Enrollments','Categories','Instructors','Video Library','Analytics','Settings'];

export default function AdminDashboard() {
  const { isAdmin, isHydrating } = useUser();
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [coursesForLectures, setCoursesForLectures] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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
  useEffect(() => {
    if (tab === 'Courses') api.get('/admin/instructors').then((response) => setInstructors(response.data.data)).catch(() => setInstructors([]));
    if (tab === 'Lectures') api.get('/admin/courses').then((response) => setCoursesForLectures(response.data.data)).catch(() => setCoursesForLectures([]));
  }, [tab]);

  if (isHydrating) return <div className="container-shell py-8">Checking your session…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const refresh = () => load(tab);
  const openVideo = async (video) => {
    try {
      const response = await api.get(video.fileUrl, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (e) {
      setError(e?.error?.message || 'Unable to open this video.');
    }
  };
  const saveCourse = async (payload, id) => {
    try {
      if (id) await api.patch(`/admin/courses/${id}`, payload);
      else await api.post('/admin/courses', payload);
      setEditingCourse(null);
      refresh();
    } catch (e) { setError(e?.error?.message || 'Unable to save course.'); }
  };
  const saveLecture = async (payload, id) => {
    try {
      if (id) await api.put(`/admin/lectures/${id}`, payload);
      else await api.post('/admin/lectures', payload);
      setEditingLecture(null);
      refresh();
    } catch (e) { setError(e?.error?.message || 'Unable to save lecture.'); }
  };
  const createCategory = async (event) => {
    event.preventDefault();
    try {
      await api.post('/admin/categories', { name: categoryName });
      setCategoryName('');
      refresh();
    } catch (e) { setError(e?.error?.message || 'Unable to create category.'); }
  };
  const uploadVideo = async (event) => {
    event.preventDefault();
    if (!videoFile) return;
    setUploadingVideo(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', videoFile);
      await api.post('/admin/videos', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setVideoFile(null);
      event.currentTarget.reset();
      refresh();
    } catch (e) { setError(e?.error?.message || 'Unable to upload video.'); }
    finally { setUploadingVideo(false); }
  };

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
          <CourseEditor course={editingCourse} instructors={instructors} onCancel={() => setEditingCourse(null)} onSave={saveCourse} />
          {data.map(c => (
            <div key={c.id} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-ink-muted">{c.category} · {c.lectures} lectures · {c.students} students · {c.published?'published':'draft'} · {c.instructor?.name||'—'}</div>
              </div>
              <div className="flex gap-3"><button onClick={() => setEditingCourse(c)} className="text-primary text-sm">Edit</button><button onClick={async()=>{ if(!confirm('Delete course?'))return; await api.delete(`/admin/courses/${c.id}`); refresh(); }} className="text-red-500 text-sm">Delete</button></div>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No courses.</p>}
        </div>
      )}

      {tab === 'Lectures' && Array.isArray(data) && (
        <div className="space-y-3">
          <LectureEditor lecture={editingLecture} courses={coursesForLectures} onCancel={() => setEditingLecture(null)} onSave={saveLecture} />
          {data.map(l => (
            <div key={l.id} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{l.title}</div>
                <div className="text-sm text-ink-muted">course {l.courseId} · order {l.order} · {l.duration}s · {l.locked?'locked':'unlocked'}</div>
              </div>
              <div className="flex gap-3"><button onClick={() => setEditingLecture(l)} className="text-primary text-sm">Edit</button><button onClick={async()=>{ if(!confirm('Delete lecture?'))return; await api.delete(`/admin/lectures/${l.id}`); refresh(); }} className="text-red-500 text-sm">Delete</button></div>
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
            <div key={i} className="p-4 bg-surface border rounded flex justify-between items-center gap-3">
              <div><div className="font-semibold">{e.userName} <span className="text-xs text-ink-muted">({e.userEmail})</span></div><div className="text-sm text-ink-muted">{e.courseTitle}</div></div>
              <button type="button" onClick={async () => { if (!confirm('Remove this enrollment and its progress?')) return; try { await api.delete(`/admin/enrollments/${e.userId}/${e.courseId}`); refresh(); } catch (err) { setError(err?.error?.message || 'Unable to remove enrollment.'); } }} className="text-sm text-red-500">Remove</button>
            </div>
          ))}
          {data.length===0 && <p className="text-ink-muted">No enrollments.</p>}
        </div>
      )}

      {tab === 'Categories' && Array.isArray(data) && (
        <div className="space-y-3">
          <form onSubmit={createCategory} className="flex gap-2 rounded border bg-surface p-3"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required placeholder="New category" className="min-w-0 flex-1 rounded border px-3 py-2" /><button type="submit" className="rounded bg-primary px-3 py-2 text-sm text-white">Add</button></form>
          {data.map(c => (
            <div key={c.name} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div className="font-semibold">{c.name}</div>
              <div className="flex items-center gap-3"><div className="text-sm text-ink-muted">{c.courses} courses</div>{c.courses === 0 && <button type="button" onClick={async () => { try { await api.delete(`/admin/categories/${encodeURIComponent(c.name)}`); refresh(); } catch (err) { setError(err?.error?.message || 'Unable to delete category.'); } }} className="text-sm text-red-500">Delete</button>}</div>
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
          <form onSubmit={uploadVideo} className="flex flex-wrap items-center gap-3 rounded border bg-surface p-3"><input type="file" accept="video/mp4,video/webm,video/quicktime,.m4v" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} required className="text-sm" /><button type="submit" disabled={uploadingVideo} className="rounded bg-primary px-3 py-2 text-sm text-white disabled:opacity-50">{uploadingVideo ? 'Uploading…' : 'Upload video'}</button></form>
          {data.map(v => (
            <div key={v.filename} className="p-4 bg-surface border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{v.filename}</div>
                <div className="text-sm text-ink-muted">{Math.round(v.sizeBytes/1024/1024*100)/100} MB · {v.mtime}</div>
              </div>
              <button type="button" onClick={() => openVideo(v)} className="text-primary text-sm">Open</button>
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
